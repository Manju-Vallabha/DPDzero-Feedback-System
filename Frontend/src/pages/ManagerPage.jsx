import React, { useState, useRef, useEffect } from "react";
// import { teamMembers } from "/src/pages/data.jsx";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable"; // Ensure you have this package installed

const ManagerDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNoFeedbackModal, setShowNoFeedbackModal] = useState(false);
  const [noFeedbackEmployees, setNoFeedbackEmployees] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalType, setTaskModalType] = useState(""); // "Completed" or "Pending"
  const [showFeedbackRequestsOnly, setShowFeedbackRequestsOnly] =
    useState(false);

  const noFeedbackModalRef = useRef();
  const feedbackModalRef = useRef();
  const editModalRef = useRef();
  const taskModalRef = useRef();
  const commentsModalRef = useRef();

  const { state } = useLocation();
  const mangerData = state?.userData;
  const managerName = mangerData.data.manager_name;
  const managerId = mangerData.data.mang_id;
  const [teamMembers, setteamMembers] = useState([]);
  const [tags, setTags] = useState([]); // Array of selected tags
  const [editTags, setEditTags] = useState([]);

  const navigate = useNavigate();

  const addModalRef = useRef();

  // State variables (add at the top of your component)
  // State variables (add at the top of your component)
  const [showAddModal, setShowAddModal] = useState(false);
  const [strengths, setStrengths] = useState("");
  const [improvement, setImprovement] = useState("");
  const [sentiment, setSentiment] = useState("");

  const allTags = [
    "communication",
    "leadership",
    "problem-solving",
    "teamwork",
    "time management",
    "accountability",
    "creativity",
  ];

  const newFeedback = {
    strengths,
    improvement,
    sentiment,
    tags: tags.join(","), // <- key line: make it a comma-separated string
    date: new Date().toISOString().split("T")[0],
    acknowledged: false,
    comment: "",
  };

  // Populate fields when modal opens
  useEffect(() => {
    if (showAddModal) {
      // Clear form fields when add modal opens
      setStrengths("");
      setImprovement("");
      setSentiment("");
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showEditModal && selectedFeedback) {
      // Populate form fields with selected feedback
      setStrengths(selectedFeedback.strengths || "");
      setImprovement(selectedFeedback.improvement || "");
      setSentiment(selectedFeedback.sentiment || "");
      setEditTags(
        selectedFeedback.tags
          ? selectedFeedback.tags.split(",").map((t) => t.trim())
          : []
      );
    }
  }, [showEditModal, selectedFeedback]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Feedback modal
      if (
        showFeedbackModal &&
        feedbackModalRef.current &&
        !feedbackModalRef.current.contains(event.target)
      ) {
        setShowFeedbackModal(false);
        setSelectedFeedback(null);
        setIsEditable(false);
      }

      // Edit Feedback modal
      if (
        showEditModal &&
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setShowEditModal(false);
        setSelectedFeedback(null);
      }

      // Add Feedback modal (new)
      if (
        showAddModal &&
        addModalRef.current &&
        !addModalRef.current.contains(event.target)
      ) {
        setShowAddModal(false);
        setStrengths("");
        setImprovement("");
        setSentiment("");
        setTags([]);
      }

      // Comments modal
      if (
        showCommentsModal &&
        commentsModalRef.current &&
        !commentsModalRef.current.contains(event.target)
      ) {
        setShowCommentsModal(false);
      }

      // Task modal
      if (
        showTaskModal &&
        taskModalRef.current &&
        !taskModalRef.current.contains(event.target)
      ) {
        setShowTaskModal(false);
      }

      // No Feedback modal
      if (
        showNoFeedbackModal &&
        noFeedbackModalRef.current &&
        !noFeedbackModalRef.current.contains(event.target)
      ) {
        setShowNoFeedbackModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    showFeedbackModal,
    showEditModal,
    showAddModal,
    showCommentsModal,
    showTaskModal,
    showNoFeedbackModal,
  ]);

  useEffect(() => {
    const formatData = (data) => {
      return data.map((emp) => {
        return {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          feedbacks: Array.isArray(emp.feedbacks) ? emp.feedbacks : [],
          tasks: Array.isArray(emp.tasks) ? emp.tasks : [],
          role: emp.role,
          requestfeed: emp.requestfeed === "true" ? true : false,
        };
      });
    };

    const fetchManagerInfo = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/manager_data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: managerId,
            }),
          }
        );
        const data = await response.json();

        const fdata = formatData(data.data);
        setteamMembers(fdata);
      } catch (err) {
        console.error("Error fetching manager info:", err);
      }
    };

    if (managerId) {
      fetchManagerInfo();
    }
  }, [managerId]);

  const addFeedback = async (employeeId, feedbackData, requestfeed) => {
    const payload = {
      mangId: managerId,
      empId: employeeId,
      feedback: feedbackData,
      requestFeedback: requestfeed ? "false" : "true",
    };

    console.log(requestfeed ? "Requesting feedback" : "Adding feedback");
    console.log("Payload for feedback:", payload);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add feedback");
      }

      const result = await response.json();

      toast.success("Feedback added successfully ✅");
      return result;
    } catch (error) {
      console.error("Error adding feedback:", error);
      toast.error("Failed to add feedback ❌");
    }
  };

  const updateFeedback = async (employeeId, feedbackIndex, updatedData) => {
    const payload = {
      mangId: managerId,
      empId: employeeId,
      index: feedbackIndex,
      updatedFeedback: updatedData,
    };

    console.log("Payload for feedback:", payload);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/update_feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      toast.success("Feedback updated successfully ✅");
      return result;
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback ❌");
    }
  };
  // Ensure this is imported if using a module bundler

  const exportToPDF = () => {
    // Validate teamMembers
    if (
      !teamMembers ||
      !Array.isArray(teamMembers) ||
      teamMembers.length === 0
    ) {
      console.error("teamMembers is undefined or empty");
      alert("No team members data to export.");
      return;
    }

    const doc = new jsPDF();

    teamMembers.forEach((emp, index) => {
      try {
        if (index !== 0) doc.addPage();

        // Header bar
        doc.setFillColor(67, 52, 233);
        doc.rect(0, 0, 210, 30, "F");

        // Title
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("Employee Report", 14, 18);

        // Employee info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Employee: ${emp.name || "N/A"}`, 10, 40);
        doc.text(`Email: ${emp.email || "N/A"}`, 10, 48);
        doc.text(`Role: ${emp.role || "N/A"}`, 10, 56);

        let currentY = 66;

        // Feedbacks Table
        if (emp.feedbacks?.length > 0) {
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
                "Acknowledged",
              ],
            ],
            body: emp.feedbacks.map((f, i) => {
              // Debug problematic tags
              if (!Array.isArray(f.tags) && f.tags != null) {
                console.warn(
                  `Invalid tags for feedback ${i} of employee ${
                    emp.name || "unknown"
                  }:`,
                  f.tags
                );
              }
              return [
                f.date ? new Date(f.date).toLocaleDateString() : "N/A",
                f.strengths || "N/A",
                f.improvement || "N/A",
                f.sentiment || "N/A",
                Array.isArray(f.tags) ? f.tags.join(", ") : f.tags || "N/A", // Handle non-array tags
                f.acknowledged ? "Yes" : "No",
              ];
            }),
            theme: "striped",
            styles: {
              fontSize: 10,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [67, 52, 233],
              textColor: 255,
              fontStyle: "bold",
            },
            didDrawPage: (data) => {
              // Update currentY after table is drawn
              currentY = data.cursor.y + 12;
            },
          });
        } else {
          doc.setFontSize(11);
          doc.text("No Feedbacks", 10, currentY);
          currentY += 14;
        }

        // Tasks Table
        if (emp.tasks?.length > 0) {
          doc.setFontSize(13);
          doc.text("Tasks", 10, currentY);
          currentY += 6;

          autoTable(doc, {
            startY: currentY,
            head: [["Task Title", "Status"]],
            body: emp.tasks.map((t) => [t.title || "N/A", t.status || "N/A"]),
            theme: "striped",
            styles: {
              fontSize: 10,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [67, 52, 233],
              textColor: 255,
              fontStyle: "bold",
            },
          });
        } else {
          doc.setFontSize(11);
          doc.text("No Tasks", 10, currentY);
        }
      } catch (error) {
        console.error(
          `Error processing employee ${emp?.name || "unknown"}:`,
          error
        );
      }
    });

    try {
      doc.save("employee_report.pdf");
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to save PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans transition-all duration-300">
      {/* Header */}
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
          <h1 className="text-white text-lg md:text-xl font-semibold">
            Team Feedback Dashboard
          </h1>
        </div>
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-2 rounded-full bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white shadow-sm transition duration-300 hover:shadow-md"
          />
        </div>

        <div className="flex gap-3 flex-wrap justify-end items-center">
          <button
            className="bg-white text-[#4334E9] px-5 py-2 rounded-full font-semibold shadow-sm border border-[#4334E9] transition-all duration-300 ease-in-out hover:bg-[#4334E9] hover:text-white hover:shadow-md hover:scale-105"
            onClick={exportToPDF}
          >
            Export PDF
          </button>

          <button
            className="bg-white text-[#4334E9] px-5 py-2 rounded-full font-semibold shadow-sm border border-[#4334E9] transition-all duration-300 ease-in-out hover:bg-[#4334E9] hover:text-white hover:shadow-md hover:scale-105"
            onClick={() => navigate("/")}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
            Welcome, {managerName}!
          </span>
        </h2>

        {/* Stats */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-500 mb-2">Total Employees</p>
            <p className="text-3xl font-bold text-[#4334E9]">
              {teamMembers.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-500 mb-2">Total Feedbacks</p>
            <p className="text-3xl font-bold text-[#4334E9]">
              {teamMembers.reduce((acc, emp) => acc + emp.feedbacks.length, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-500 mb-2">Acknowledged Feedbacks</p>
            <p className="text-3xl font-bold text-green-600">
              {teamMembers.reduce(
                (acc, emp) =>
                  acc +
                  emp.feedbacks.filter((f) => f.acknowledged === true).length,
                0
              )}
            </p>
          </div>
          <div
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
            onClick={() => {
              setTaskModalType("Completed");
              setShowTaskModal(true);
            }}
          >
            <p className="text-gray-500 mb-2">Tasks Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {teamMembers.reduce(
                (acc, emp) =>
                  acc +
                  (emp.tasks?.filter((t) => t.status === "Completed").length ||
                    0),
                0
              )}
            </p>
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
            onClick={() => {
              setTaskModalType("Pending");
              setShowTaskModal(true);
            }}
          >
            <p className="text-gray-500 mb-2">Tasks Pending</p>
            <p className="text-3xl font-bold text-yellow-500">
              {teamMembers.reduce(
                (acc, emp) =>
                  acc +
                  (emp.tasks?.filter((t) => t.status === "Pending").length ||
                    0),
                0
              )}
            </p>
          </div>

          <div
            onClick={() => {
              const noFeedback = teamMembers.filter(
                (emp) => emp.feedbacks.length === 0
              );
              setNoFeedbackEmployees(noFeedback);
              setShowNoFeedbackModal(true);
            }}
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <p className="text-gray-500 mb-2">Employees with No Feedback</p>
            <p className="text-3xl font-bold text-red-500">
              {teamMembers.filter((emp) => emp.feedbacks.length === 0).length}
            </p>
          </div>

          <div
            onClick={() => setShowCommentsModal(true)}
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <p className="text-gray-500 mb-2">Comments Received</p>
            <p className="text-3xl font-bold text-purple-600">
              {teamMembers.reduce(
                (acc, emp) =>
                  acc + emp.feedbacks.filter((f) => f.comment).length,
                0
              )}
            </p>
          </div>
          <div
            onClick={() => setShowFeedbackRequestsOnly((prev) => !prev)}
            className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <p className="text-gray-500 mb-2">Feedback Requests</p>
            <p className="text-3xl font-bold text-blue-600">
              {teamMembers.filter((emp) => emp.requestfeed === true).length}
            </p>
          </div>
        </div>

        {/* Employee Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.filter(
            (emp) =>
              (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
              (!showFeedbackRequestsOnly || emp.requestfeed === true)
          ).length === 0 && (
            <p className="text-gray-500 text-center col-span-full">
              No employees found.
            </p>
          )}

          {teamMembers
            .filter(
              (emp) =>
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((emp) => {
              return (
                <div
                  key={emp.id}
                  className={`bg-white p-6 rounded-xl shadow-md transition duration-300 hover:shadow-xl hover:scale-[1.01] ${
                    emp.requestfeed ? "border-2 border-blue-500" : ""
                  }`}
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">
                    {emp.name}
                  </h4>
                  <p className="text-sm text-gray-500">{emp.email}</p>
                  <p className="text-sm text-gray-600">
                    Role: <span className="font-medium">{emp.role}</span>
                  </p>

                  {/* Task Assignment Status */}
                  <p className="text-sm text-gray-600">
                    Task Status:{" "}
                    <span
                      className={`font-medium ${
                        emp.tasks && emp.tasks.length > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {emp.tasks && emp.tasks.length > 0
                        ? "Task Assigned"
                        : "No Task Assigned"}
                    </span>
                  </p>

                  {/* Task Completion Status (only if tasks exist) */}
                  {emp.tasks && emp.tasks.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Completion:{" "}
                      <span className="font-medium text-blue-600">
                        {emp.tasks.every((t) => t.status === "Completed")
                          ? "All Completed"
                          : `${
                              emp.tasks.filter((t) => t.status === "Completed")
                                .length
                            } / ${emp.tasks.length} Completed`}
                      </span>
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    Feedbacks:{" "}
                    <span className="font-medium text-[#4334E9]">
                      {emp.feedbackCount}
                    </span>
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowFeedbackModal(true);
                        setShowEditModal(false);
                        setSelectedFeedback(null);
                        setIsEditable(false);
                      }}
                      className="flex-1 border border-[#4334E9] text-[#4334E9] px-4 py-2 rounded-full text-sm hover:bg-[#4334E910] transition-all duration-300"
                    >
                      View Feedbacks
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setStrengths("");
                        setImprovement("");
                        setSentiment("");
                        setShowAddModal(true);
                      }}
                      className="flex-1 bg-[#4334E9] text-white px-4 py-2 rounded-full text-sm hover:bg-[#5A4CF3] transition-all duration-300"
                    >
                      Add Feedback
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* Modals */}
      {/* Feedback Modal */}

      {showFeedbackModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md">
          <div
            ref={feedbackModalRef}
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-1">
              Feedback for {selectedEmployee.name}
            </h3>
            <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium">{selectedEmployee.role}</span>
            </p>

            {selectedEmployee.feedbacks.length > 0 ? (
              selectedEmployee.feedbacks.map((fb, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedFeedback({ ...fb, index: idx });
                    setShowEditModal(true);
                    setIsEditable(false); // view mode initially
                  }}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition duration-300 relative"
                >
                  <p className="absolute top-2 right-3 text-gray-400">✏️</p>
                  <p className="text-sm text-gray-400 mb-2">
                    {new Date(fb.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Strengths:</strong> {fb.strengths}
                  </p>
                  <p>
                    <strong>Areas to Improve:</strong> {fb.improvement}
                  </p>
                  <p>
                    <strong>Sentiment:</strong>{" "}
                    <span
                      className={`${
                        fb.sentiment === "Positive"
                          ? "text-green-600"
                          : fb.sentiment === "Neutral"
                          ? "text-yellow-600"
                          : "text-red-600"
                      } font-medium`}
                    >
                      {fb.sentiment}
                    </span>
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        fb.acknowledged ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {fb.acknowledged ? "Acknowledged" : "Not Acknowledged"}
                    </span>
                  </p>
                  {fb.comment && (
                    <div className="mt-2 text-sm text-gray-700 italic">
                      <strong>Employee Comment:</strong> "{fb.comment}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No feedback found.</p>
            )}

            <button
              type="button"
              onClick={() => {
                setShowAddModal(true);
                setShowFeedbackModal(false);
                setSelectedFeedback(null);
                setStrengths("");
                setImprovement("");
                setSentiment("");
              }}
              className="mt-2 mr-2 bg-[#4334E9] text-white px-4 py-2 rounded-full hover:bg-[#5A4CF3] transition"
            >
              Add Feedback
            </button>

            <button
              type="button"
              onClick={() => {
                setShowFeedbackModal(false);
                setSelectedFeedback(null);
                setIsEditable(false);
              }}
              className="mt-4 bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Feedback Modal */}

      {showAddModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md">
          <div
            ref={addModalRef}
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-2">
              Add Feedback for {selectedEmployee.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Strengths</label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700">Areas to Improve</label>
                <textarea
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Tags
                </label>

                {/* Selected Tags Displayed */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            setTags((prev) => prev.filter((t) => t !== tag))
                          }
                          className="text-indigo-500 hover:text-red-500 focus:outline-none"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown Menu */}
                <select
                  value=""
                  onChange={(e) => {
                    const selectedTag = e.target.value;
                    if (selectedTag && !tags.includes(selectedTag)) {
                      setTags((prev) => [...prev, selectedTag]);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select Tag --</option>
                  {allTags
                    .filter((tag) => !tags.includes(tag)) // Only show unselected tags
                    .map((tag, idx) => (
                      <option key={idx} value={tag}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700">Sentiment</label>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    const newFeedback = {
                      strengths,
                      improvement,
                      sentiment,
                      date: new Date().toISOString().split("T")[0], // "YYYY-MM-DD",
                      tags: tags.join(","),
                      acknowledged: false,
                      comment: "",
                    };

                    setTags(tags);

                    // Send to backend
                    await addFeedback(
                      selectedEmployee.id,
                      newFeedback,
                      selectedEmployee.requestfeed
                    );

                    selectedEmployee.requestfeed = false;
                    // Update local state
                    selectedEmployee.feedbacks.push(newFeedback);

                    // Reset form/modal
                    setShowAddModal(false);
                    setStrengths("");
                    setImprovement("");
                    setSentiment("");
                  }}
                  className="bg-[#4334E9] text-white px-4 py-2 rounded-full hover:bg-[#5A4CF3] transition"
                >
                  Submit
                </button>

                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setStrengths("");
                    setImprovement("");
                    setSentiment("");
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Feedback Modal */}
      {showEditModal && selectedEmployee && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md">
          <div
            onMouseDown={(e) => e.stopPropagation()}
            ref={editModalRef}
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-2">
              Edit Feedback for {selectedEmployee.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Strengths</label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                    isEditable
                      ? "border-blue-400 focus:ring-blue-500 hover:border-blue-500 hover:shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className="block text-gray-700">Areas to Improve</label>
                <textarea
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                    isEditable
                      ? "border-blue-400 focus:ring-blue-500 hover:border-blue-500 hover:shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Tags
                </label>

                {/* Display Tags */}
                {editTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {tag}
                        {isEditable && (
                          <button
                            onClick={() =>
                              setEditTags((prev) =>
                                prev.filter((t) => t !== tag)
                              )
                            }
                            className="text-indigo-500 hover:text-red-500 focus:outline-none"
                          >
                            <FaTimes size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag dropdown (only if editable) */}
                {isEditable && (
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedTag = e.target.value;
                      if (selectedTag && !editTags.includes(selectedTag)) {
                        setEditTags((prev) => [...prev, selectedTag]);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Tag --</option>
                    {allTags
                      .filter((tag) => !editTags.includes(tag))
                      .map((tag, idx) => (
                        <option key={idx} value={tag}>
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-gray-700">Sentiment</label>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                    isEditable
                      ? "border-blue-400 focus:ring-blue-500 hover:border-blue-500 hover:shadow-sm"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                {!isEditable && (
                  <button
                    onClick={() => setIsEditable(true)}
                    className="bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-yellow-500 transition"
                  >
                    Edit Feedback
                  </button>
                )}

                {isEditable && (
                  <button
                    onClick={async () => {
                      const updatedFeedback = {
                        ...selectedFeedback,
                        strengths,
                        improvement,
                        sentiment,
                        updatedDate: new Date().toISOString().split("T")[0], // ➜ "YYYY-MM-DD"
                        tags: editTags.join(","),
                        acknowledged: false,
                        comment: "",
                      };

                      setTags(editTags); // Ensure tags are updated

                      const index = selectedFeedback.index;

                      await updateFeedback(
                        selectedEmployee.id,
                        index,
                        updatedFeedback
                      );

                      // Update local state (optional)
                      const updated = [...selectedEmployee.feedbacks];
                      updated[index] = updatedFeedback;
                      selectedEmployee.feedbacks = updated;

                      setShowEditModal(false);
                      setSelectedFeedback(null);
                      setIsEditable(false);
                    }}
                    className="bg-[#4334E9] text-white px-4 py-2 rounded-full hover:bg-[#5A4CF3] transition"
                  >
                    Save Changes
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFeedback(null);
                    setIsEditable(false);
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md">
          <div
            ref={commentsModalRef}
            className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4 text-[#4334E9]">
              📝 Feedbacks with Comments
            </h3>
            {teamMembers.some((emp) => emp.feedbacks.some((f) => f.comment)) ? (
              <div className="space-y-4">
                {teamMembers.map((emp) =>
                  emp.feedbacks
                    .map((f, index) => ({ ...f, index }))
                    .filter((f) => f.comment)
                    .map((fb) => (
                      <div
                        key={`${emp.id}-${fb.index}`}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setSelectedFeedback(fb);
                          setIsEditable(false);
                          setShowEditModal(true);
                          setShowCommentsModal(false); // close this modal
                        }}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                      >
                        <p className="text-gray-800 font-semibold">
                          {emp.name}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(fb.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Strengths:</strong> {fb.strengths}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Areas to Improve:</strong> {fb.improvement}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Sentiment:</strong>{" "}
                          <span
                            className={`font-medium ${
                              fb.sentiment === "Positive"
                                ? "text-green-600"
                                : fb.sentiment === "Neutral"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {fb.sentiment}
                          </span>
                        </p>
                        <p className="italic text-gray-700 mt-2">
                          <strong>Employee Comment:</strong> “{fb.comment}”
                        </p>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No comments found in feedbacks.
              </p>
            )}
            <button
              className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition"
              onClick={() => setShowCommentsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md">
          <div
            ref={taskModalRef}
            className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4 text-[#4334E9]">
              {taskModalType} Tasks
            </h3>
            {teamMembers.some((emp) =>
              emp.tasks?.some((t) => t.status === taskModalType)
            ) ? (
              <div className="space-y-4">
                {teamMembers.map((emp) =>
                  emp.tasks
                    ?.filter((t) => t.status === taskModalType)
                    .map((task, idx) => (
                      <div
                        key={`${emp.id}-${idx}`}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100"
                      >
                        <p className="font-semibold text-gray-800">
                          {emp.name}
                        </p>
                        <p className="text-sm text-gray-600">{task.title}</p>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No {taskModalType.toLowerCase()} tasks found.
              </p>
            )}
            <button
              className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition"
              onClick={() => setShowTaskModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showNoFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md">
          <div
            ref={noFeedbackModalRef}
            className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              🛑 Employees with No Feedback
            </h3>

            {noFeedbackEmployees.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                No such employees found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {noFeedbackEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
                  >
                    <p className="text-gray-800 font-semibold">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.email}</p>
                    <p className="text-sm text-gray-600">Role: {emp.role}</p>
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setSelectedFeedback(null);
                        setIsEditable(true);
                        setShowEditModal(true);
                        setShowNoFeedbackModal(false); // close current modal
                      }}
                      className="mt-2 w-full bg-[#4334E9] text-white py-2 px-4 rounded-full hover:bg-[#5A4CF3] transition"
                    >
                      Give Feedback
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowNoFeedbackModal(false)}
              className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit/Add Feedback Modal */}
    </div>
  );
};

export default ManagerDashboard;
