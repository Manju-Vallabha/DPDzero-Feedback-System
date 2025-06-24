import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { toast } from "react-toastify";
import { FaCalendarPlus, FaCalendarCheck } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const empDetals = state?.userData;

  const [employee, setEmployee] = useState(null);
  const [comments, setComments] = useState([]);
  const [readStatus, setReadStatus] = useState([]);
  const [isEditing, setIsEditing] = useState([]);
  const [showInput, setShowInput] = useState([]);

  // Set initial employee from router state
  useEffect(() => {
    if (empDetals) {
      setEmployee(empDetals);
    }
  }, [empDetals]);

  // Fetch latest employee info
  useEffect(() => {
    const empId = empDetals?.data?.empId;
    if (!empId) return;

    const fetchEmployeeInfo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/employee_data`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: empId }),
          }
        );

        const data = await response.json();
        const employeeData = data?.data?.[0];
        if (employeeData) {
          setEmployee(employeeData);
        }
      } catch (err) {
        console.error("Error fetching employee info:", err);
      }
    };

    fetchEmployeeInfo();
  }, [empDetals]);

  // Set feedback-related state once employee data is loaded
  useEffect(() => {
    if (employee?.feedbacks && Array.isArray(employee.feedbacks)) {
      setComments(employee.feedbacks.map((fb) => fb.comment || ""));
      setReadStatus(
        employee.feedbacks.map((fb) =>
          fb.comment ? true : fb.acknowledged || false
        )
      );
      setIsEditing(employee.feedbacks.map(() => false));
      setShowInput(employee.feedbacks.map(() => false));
    }
  }, [employee]);

  const managerName = employee?.manager_name || "Manager";

  const handleCommentChange = (index, value) => {
    const updatedComments = [...comments];
    updatedComments[index] = value;
    setComments(updatedComments);
  };

  const toggleEdit = (index) => {
    const updatedEditing = [...isEditing];
    updatedEditing[index] = !updatedEditing[index];
    setIsEditing(updatedEditing);
  };

  const markAsRead = (index) => {
    const updatedStatus = [...readStatus];
    updatedStatus[index] = true;
    setReadStatus(updatedStatus);
  };

  const handleAddComment = (index) => {
    const updatedShow = [...showInput];
    updatedShow[index] = true;
    setShowInput(updatedShow);
  };

  const submitComment = (index) => {
    const updatedEditing = [...isEditing];
    updatedEditing[index] = false;
    setIsEditing(updatedEditing);

    const updatedShow = [...showInput];
    updatedShow[index] = false;
    setShowInput(updatedShow);

    if (comments[index].trim() !== "") {
      markAsRead(index);
    }
  };

  const handleMarkAsRead = async (index) => {
    const feedback = employee.feedbacks[index];
    const payload = {
      empId: employee.id,
      date: feedback.date,
      acknowledged: true,
    };

    console.log("Marking as read:", payload);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/acknowledge_feedback`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (res.ok) {
        markAsRead(index);
        toast.success("Marked as read successfully!");
      } else {
        throw new Error(result.message || "Failed to mark as read.");
      }
    } catch (err) {
      toast.error("Error marking as read.");
      console.error(err);
    }
  };

  const exportEmployeeFeedback = () => {
    // Validate employee data
    if (!employee || typeof employee !== "object") {
      console.error("Employee data is undefined or invalid");
      alert("No employee data to export.");
      return;
    }

    try {
      const doc = new jsPDF();

      // Header: Solid indigo background
      doc.setFillColor(67, 52, 233); // Indigo
      doc.rect(0, 0, 210, 30, "F");

      // Header title
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("Employee Report", 14, 18);

      // Employee info section
      doc.setTextColor(0, 0, 0); // Reset to black
      doc.setFontSize(12);
      doc.text(`Name: ${employee.name || "-"}`, 10, 40);
      doc.text(`Email: ${employee.email || "-"}`, 10, 48);
      doc.text(`Role: ${employee.role || "-"}`, 10, 56);

      let currentY = 66;

      // Tasks section
      if (employee.tasks?.length > 0) {
        doc.setFontSize(13);
        doc.text("Tasks", 10, currentY);
        currentY += 6;

        autoTable(doc, {
          startY: currentY,
          head: [["Task Title", "Status"]],
          body: employee.tasks.map((t) => [t.title || "-", t.status || "-"]),
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [67, 52, 233],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(11);
        doc.text("No Tasks assigned.", 10, currentY);
        currentY += 10;
      }

      // Feedbacks section
      if (employee.feedbacks?.length > 0) {
        doc.setFontSize(13);
        doc.text("Feedbacks", 10, currentY);
        currentY += 6;

        autoTable(doc, {
          startY: currentY,
          head: [
            [
              "Date",
              "Strengths",
              "Improvement",
              "Sentiment",
              "Tags",
              "Comment",
            ],
          ],
          body: employee.feedbacks.map((f, index) => {
            // Debug invalid tags
            if (!Array.isArray(f.tags) && f.tags != null) {
              console.warn(`Invalid tags for feedback ${index}:`, f.tags);
            }
            return [
              f.date ? new Date(f.date).toLocaleDateString() : "-",
              f.strengths || "-",
              f.improvement || "-",
              f.sentiment || "-",
              Array.isArray(f.tags) ? f.tags.join(", ") : f.tags || "-",
              f.comment || "-",
            ];
          }),
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 3,
            valign: "middle",
          },
          headStyles: {
            fillColor: [67, 52, 233],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
        });
      } else {
        doc.setFontSize(11);
        doc.text("No Feedbacks available.", 10, currentY);
      }

      // Save the PDF
      const safeFileName = (employee.name || "employee").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );
      doc.save(`${safeFileName}_report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  const handleComment = async (index) => {
    const feedback = employee.feedbacks[index];

    const payload = {
      empId: employee.id,
      date: feedback.date,
      comment: comments[index],
      acknowledged: true,
    };

    const isEditing = feedback.comment && feedback.comment.trim().length > 0;
    console.log("Payload to be sent:", payload);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        submitComment(index);

        if (isEditing) {
          toast.success("Comment edited and feedback acknowledged!");
        } else {
          toast.success("New comment submitted and feedback acknowledged!");
        }
      } else {
        throw new Error(result.message || "Failed to submit comment.");
      }
    } catch (err) {
      toast.error("Error submitting comment.");
      console.error(err);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "😊";
      case "Neutral":
        return "😐";
      case "Negative":
        return "😞";
      default:
        return "❓";
    }
  };

  const totalFeedback = employee?.feedbacks?.length || 0;
  const lastFeedbackDate =
    totalFeedback > 0
      ? new Date(
          employee.feedbacks.reduce((latest, fb) =>
            new Date(fb.date) > new Date(latest.date) ? fb : latest
          ).date
        ).toLocaleDateString()
      : "N/A";
  const positiveCount =
    employee?.feedbacks?.filter((f) => f.sentiment === "Positive").length || 0;
  const neutralCount =
    employee?.feedbacks?.filter((f) => f.sentiment === "Neutral").length || 0;
  const negativeCount =
    employee?.feedbacks?.filter((f) => f.sentiment === "Negative").length || 0;
  const acknowledgedCount = readStatus?.filter(Boolean).length || 0;
  const pendingCount = totalFeedback - acknowledgedCount;

  return (
    <div className="min-h-screen bg-gray-100 font-sans transition-all duration-300">
      <header
        className="w-full flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-4 md:gap-0"
        style={{
          background: "linear-gradient(90deg, #5A4CF3 0%, #4334E9 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/logo-2.png"
            alt="Logo"
            className="h-[40px] w-auto object-contain"
          />
          <h1 className="text-white text-lg text-center md:text-xl font-semibold">
            Employee Feedback Portal
          </h1>
        </div>

        <div className="flex gap-3 flex-wrap justify-end items-center">
          <button
            onClick={exportEmployeeFeedback}
            className="bg-white text-[#4334E9] px-5 py-2 rounded-full font-semibold shadow-sm border border-[#4334E9] transition-all duration-300 ease-in-out hover:bg-[#4334E9] hover:text-white hover:shadow-md hover:scale-105"
          >
            Export Feedback
          </button>
          <button
            className="bg-white text-[#4334E9] px-5 py-2 rounded-full font-semibold shadow-sm border border-[#4334E9] transition-all duration-300 ease-in-out hover:bg-[#4334E9] hover:text-white hover:shadow-md hover:scale-105"
            onClick={() => navigate("/")}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
            Welcome, {employee?.name || "Employee"} !
          </span>
        </h2>
        <p className="text-lg mt-2 text-gray-700 font-medium text-center mb-6">
          Manager: {managerName}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <StatCard
            label="Total Feedbacks"
            value={totalFeedback}
            color="blue"
          />
          <StatCard label="Last Feedback Date" value={lastFeedbackDate} />
          <StatCard
            label="😊 Positive"
            value={positiveCount}
            color="green"
            animate
          />
          <StatCard
            label="Acknowledged"
            value={acknowledgedCount}
            color="green"
          />
          <StatCard label="Pending" value={pendingCount} color="red" />
        </div>

        {employee?.feedbacks?.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {employee.feedbacks.map((fb, idx) => (
              <div
                key={idx}
                className={`relative p-6 rounded-xl shadow-md transition duration-300 hover:shadow-xl flex flex-col gap-3 ${
                  fb.sentiment === "Positive"
                    ? "bg-green-50"
                    : fb.sentiment === "Neutral"
                    ? "bg-yellow-50"
                    : "bg-red-50"
                }`}
              >
                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <FaCalendarPlus className="text-blue-500" />
                    <span>
                      <strong>Created Date:</strong>{" "}
                      {new Date(fb.date).toLocaleDateString()}
                    </span>
                  </div>

                  {fb.updatedDate && (
                    <div className="flex items-center gap-2">
                      <FaCalendarCheck className="text-green-500" />
                      <span>
                        <strong>Updated Date:</strong>{" "}
                        {new Date(fb.updatedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                  <FaRegCommentDots className="text-sm" />
                  Feedback Given by {managerName}
                </p>

                <p>
                  <strong>Strengths:</strong> {fb.strengths}
                </p>
                <p>
                  <strong>Areas to Improve:</strong> {fb.improvement}
                </p>

                <p className="mt-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      readStatus[idx] ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {readStatus[idx] ? "Acknowledged" : "Not Acknowledged"}
                  </span>
                </p>

                <div className="absolute top-4 right-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-4xl font-bold shadow-md ${
                      fb.sentiment === "Positive"
                        ? "bg-green-100 text-green-600"
                        : fb.sentiment === "Neutral"
                        ? "bg-yellow-100 text-yellow-500"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {getSentimentEmoji(fb.sentiment)}
                  </div>
                </div>

                {/* Tags Display */}
                {fb.tags && fb.tags.trim() !== "" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fb.tags.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment Area */}
                <div className="mt-4">
                  <label className="block text-gray-600 font-medium mb-1">
                    Comment:
                  </label>

                  {showInput[idx] ? (
                    <>
                      <textarea
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={comments[idx]}
                        onChange={(e) =>
                          handleCommentChange(idx, e.target.value)
                        }
                        rows={2}
                        placeholder="Add a comment..."
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-full shadow-sm"
                          onClick={() => handleComment(idx)}
                        >
                          Submit & Acknowledge
                        </button>
                      </div>
                    </>
                  ) : comments[idx] && comments[idx].trim() !== "" ? (
                    <div className="space-y-2">
                      {!isEditing[idx] && (
                        <div className="bg-gray-100 p-2 rounded flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            {comments[idx]}
                          </span>
                          <button
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                            onClick={() => toggleEdit(idx)}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      )}

                      {isEditing[idx] && (
                        <>
                          <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={comments[idx]}
                            onChange={(e) =>
                              handleCommentChange(idx, e.target.value)
                            }
                            rows={2}
                          />
                          <button
                            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                            onClick={() => handleComment(idx)}
                          >
                            Submit
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <button
                        className="text-sm bg-white text-indigo-600 border border-indigo-600 px-3 py-1 rounded-full transition duration-200 hover:bg-indigo-600 hover:text-white hover:shadow-md"
                        onClick={() => handleAddComment(idx)}
                      >
                        Add Comment
                      </button>

                      {!readStatus[idx] && (
                        <button
                          className="text-sm text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm"
                          onClick={() => handleMarkAsRead(idx)}
                        >
                          <FaCheckCircle /> Mark as Read
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center mt-6">
            No feedback available.
          </p>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color = "gray", animate = false }) => (
  <div className="bg-white p-6 rounded-xl shadow-md text-center">
    <p className="text-gray-500 mb-2">{label}</p>
    <p
      className={`text-3xl font-bold text-${color}-600 ${
        animate ? "animate-pulse" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

export default EmployeeDashboard;
