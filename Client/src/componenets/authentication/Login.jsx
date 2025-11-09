import "./login.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import Header from "../resume/Header";
import Footer from "../resume/Footer";
import { Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const benefits = [
  "Unlock AI-powered resume insights",
  "Practice tailored mock interviews",
  "Review curated question banks"
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const navigate = useNavigate();
  function handleSubmit(event) { 
    event.preventDefault();
    console.log("Logging in with:", form);
    fetch("http://localhost:5197/api/User/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Login successful:", data);
      setToken(data.token); 
      navigate("/");
    })
    .catch(error => {
      console.error("Login error:", error);
    });
  }
  sessionStorage.setItem("authToken", token);
  return (
    <>
      <Header isLoggedIn={false} />
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-card__copy">
            <span className="auth-badge">Welcome back</span>
            <h1 className="auth-title">Log in to continue your AI-powered prep</h1>
            <p className="auth-subtitle">
              Access your personalised dashboard to track progress, iterate on your resume, and stay ready for the next interview.
            </p>
            <ul className="auth-benefits">
              {benefits.map((text) => (
                <li key={text}>
                  <FiCheckCircle />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__header">
              <h2>Sign in</h2>
              <p>Use your registered email and password.</p>
            </div>

            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="name@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="auth-toggle"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit">Log in</button>
            <p className="auth-switch">
              Don't have an account?
              <Link to="/signup"> Create one</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

