import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Users, ArrowRight } from "lucide-react";

import { login } from "@/api/auth";
import { saveAuth } from "@/utils/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(username.trim(), password);

      saveAuth(result.access_token, {
        username: result.username,
        role: result.role,
      });

      await navigate({ to: "/employees" });
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <div className="login-orb login-orb-one" aria-hidden="true" />
      <div className="login-orb login-orb-two" aria-hidden="true" />

      <section className="login-layout">
        <div className="login-intro">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Users size={25} strokeWidth={1.8} />
            </div>
            <span>Employee <span className="login-brand-accent">CRUD</span></span>
          </div>

          <div className="login-intro-copy">
            <div className="login-eyebrow">
              <span className="login-status-dot" />
              EMPLOYEE MANAGEMENT SYSTEM
            </div>

            <h1>
              Employee
              <br />
              records<span>.</span>
            </h1>

            <p>
              Sign in to view and manage employee records
              using your assigned account permissions.
            </p>
          </div>

          <div className="login-trust-note">
            <ShieldCheck size={19} />
            <span>Role-based access</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-topline" />

          <div className="login-card-heading">
            <span className="login-small-label">EMPLOYEE CRUD</span>
            <h2>Sign in</h2>
            <p>Enter your account details to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                placeholder="Enter your username"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="login-field">
              <div className="login-password-heading">
                <label htmlFor="password">Password</label>
                <span>Case-sensitive</span>
              </div>

              <div className="login-password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div id="login-error" className="login-error" role="alert">
                <span className="login-error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={18} />}
              {loading && <span className="login-spinner" aria-hidden="true" />}
            </button>

            <div className="login-divider">
              <span>NEW USER?</span>
            </div>

            <button
              type="button"
              className="login-register"
              onClick={() => navigate({ to: "/register" })}
            >
              Create an account
            </button>
          </form>

          <div className="login-card-footer">
            <ShieldCheck size={15} />
            <span>Employee CRUD</span>
          </div>
        </div>
      </section>

      <footer className="login-footer">
        <span>EMPLOYEE CRUD</span>
        <span>Employee management project</span>
      </footer>
    </main>
  );
}
