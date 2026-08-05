import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <aside className="auth-showcase" aria-label="CodeAlpha Social">
        <div className="auth-showcase-mark" aria-hidden="true">CA</div>
        <div>
          <strong>CodeAlpha Social</strong>
          <h2>Connect. Share. Discover.</h2>
          <p>A modern space for meaningful ideas and community.</p>
        </div>
        <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
        <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      </aside>
      <div className="auth-card">
      <div className="auth-brand" aria-hidden="true">C</div>
      <p className="auth-eyebrow">Welcome back</p>
      <h1>Welcome back</h1>
      <p className="auth-intro">Sign in to continue connecting with your community.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input autoComplete="email" disabled={loading} id="login-email" name="email" placeholder="you@example.com" type="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input autoComplete="current-password" disabled={loading} id="login-password" name="password" placeholder="Enter your password" type="password" required />
        </div>
        {error && <p className="form-message form-error" role="alert">{error}</p>}
        <button className="button button-block" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
      </div>
    </section>
  );
}

export default Login;
