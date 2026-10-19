import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import PageLoader from "./components/PageLoader";
import AuthView from "./components/AuthView";

// Helper to simulate network latency on localhost so Suspense PageLoader fallback is clearly visible
const lazyWithDelay = (importFn, delayMs = 600) =>
  lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, delayMs))
    ]).then(([module]) => module)
  );

// Lazy loading route-based components
const Home = lazyWithDelay(() => import("./pages/Home"), 600);
const Projects = lazyWithDelay(() => import("./pages/Projects"), 600);
const Contact = lazyWithDelay(() => import("./pages/Contact"), 600);
const NotFound = lazyWithDelay(() => import("./pages/NotFound"), 600);

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Auth form state
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsAuthLoading(true);

    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${authMode === "register" ? "Registration" : "Login"} failed`);
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuthSuccess(data.message || "Success!");
      setAuthForm({ name: "", email: "", password: "" });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python",
    "Git",
    "AI & ML",
    "Data Science",
    "Machine Learning",
    "Project Building"
  ];

  // If user is NOT logged in, show the standalone Login / Registration landing page
  if (!token) {
    return (
      <div className="auth-landing-page">
        <div className="auth-landing-header">
          <span className="eyebrow">Student Portfolio Access</span>
          <p className="subtitle">Sign in or register your account to enter the portfolio</p>
        </div>

        <AuthView
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          handleAuthChange={handleAuthChange}
          handleAuthSubmit={handleAuthSubmit}
          authError={authError}
          authSuccess={authSuccess}
          isAuthLoading={isAuthLoading}
          setAuthError={setAuthError}
          setAuthSuccess={setAuthSuccess}
        />
      </div>
    );
  }

  // Once authenticated, enter the full portfolio app
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header name="Chandni Kothari" user={user} handleLogout={handleLogout} />
        <NavBar />

        <div className="content-body">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home skills={skills} />} />
              <Route path="/projects" element={<Projects token={token} handleLogout={handleLogout} />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>

        <Footer email="chandni12@gmail.com" />
      </div>
    </BrowserRouter>
  );
}

export default App;
