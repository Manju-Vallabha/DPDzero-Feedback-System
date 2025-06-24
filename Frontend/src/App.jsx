// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ManagerPage from "./pages/ManagerPage";
import EmployeePage from "./pages/EmployeePage";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";
import { Analytics } from "@vercel/analytics/next"

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoginPage />
              </motion.div>
            }
          />
          <Route
            path="/manager"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ManagerPage />
              </motion.div>
            }
          />
          <Route
            path="/employee"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EmployeePage />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
      <Analytics /> {/* ✅ Now correctly rendered */}
    </>
  );
};


const App = () => {
  console.log("App loaded");

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
