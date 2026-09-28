import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

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

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    try {
      const result = await login(
        username.trim(),
        password,
      );

      saveAuth(result.access_token, {
        username: result.username,
        role: result.role,
      });

      navigate({ to: "/employees" });
    } catch (error) {
      console.error(error);
      setError("Invalid username or password");
    }
  }

  const hasError = Boolean(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Employee Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className={hasError ? "text-red-600" : ""}
            >
              Username
            </label>

            <input
              id="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              placeholder="Enter username"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ${
                hasError
                  ? "border-red-500 focus:border-red-500"
                  : "border-input"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className={hasError ? "text-red-600" : ""}
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-16 text-sm outline-none ${
                  hasError
                    ? "border-red-500 focus:border-red-500"
                    : "border-input"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => navigate({ to: "/register" })}
            className="h-10 w-full rounded-md border px-4 py-2 text-sm font-medium"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
}
