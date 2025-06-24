import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            role,
          }),
        }
      );

      console.log(
        "Sending login request to:",
        `${import.meta.env.VITE_BACKEND_URL}/login`
      );

      const data = await response.json();
      console.log("Login response:", data);
      if (response.ok) {
        // Wait a moment before redirect

        if (role === "manager") {
          navigate("/manager", { state: { userData: data } });
          toast.success("Login successful!");
        } else if (role === "employee") {
          navigate("/employee", { state: { userData: data } });
          toast.success("Login successful!");
        }
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      {/* Left: Logo Section */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10"
        style={{
          background: "linear-gradient(90deg, #5A4CF3 0%, #4334E9 100%)",
          backgroundBlendMode: "darken",
        }}
      >
        <img
          src="/logo-2.png"
          alt="Company Logo"
          className="w-100  md:w-56 lg:w-64 h-auto transition-transform duration-300 ease-in-out transform hover:scale-110 hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
        />
      </div>

      {/* Right: Login Box */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10">
        <div
          className="w-full max-w-md bg-white p-6 md:p-10 rounded-xl"
          style={{ boxShadow: "0px 4px 30px 0px #00000040" }}
        >
          {/* Gradient Heading */}
          <h2 className="text-2xl py-2 md:text-3xl font-bold text-center mb-6 md:mb-8 bg-gradient-to-r from-[#5A4CF3] to-[#4334E9] text-transparent bg-clip-text">
            Login Page
          </h2>

          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Username
              </label>
              <input
                required
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 font-medium text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 font-medium text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Role
              </label>
              <select
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ appearance: "none" }}
                className="w-full px-6 py-4 border border-gray-300 font-medium text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
              >
                <option value="">-- Select Role --</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-4 rounded-full font-semibold transition duration-300 transform hover:bg-blue-700 hover:scale-105 hover:shadow-lg flex items-center justify-center ${
                loading ? "cursor-not-allowed opacity-70" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3 3-3h-4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
