import { useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { register } from "@/api/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [success, setSuccess] = useState("");

  function validate(): boolean {
    const newErrors = {
      username: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username =
        "Username must be at least 3 characters";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every(
      (value) => !value,
    );
  }

  function clearError(
    field: keyof typeof errors,
  ) {
    setErrors((current) => ({
      ...current,
      [field]: "",
      general: "",
    }));

    setSuccess("");
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSuccess("");

    if (!validate()) {
      return;
    }

    try {
      await register(
        username.trim(),
        password,
      );

      setSuccess(
        "Account created successfully. Redirecting to login...",
      );

      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1000);
    } catch (error) {
      console.error(error);

      setErrors((current) => ({
        ...current,
        general:
          error instanceof Error
            ? error.message
            : "Unable to create account",
      }));
    }
  }

  const inputClass = (hasError: boolean) =>
    `flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-16 text-sm outline-none ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-input"
    }`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Create Account
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a viewer account
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="username"
              className={
                errors.username
                  ? "text-red-600"
                  : ""
              }
            >
              Username
            </label>

            <input
              id="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                clearError("username");
              }}
              placeholder="Enter username"
              className={inputClass(
                Boolean(errors.username),
              )}
            />

            {errors.username && (
              <p className="text-sm text-red-600">
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className={
                errors.password
                  ? "text-red-600"
                  : ""
              }
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError("password");
                }}
                placeholder="Enter password"
                className={inputClass(
                  Boolean(errors.password),
                )}
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

            {errors.password && (
              <p className="text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className={
                errors.confirmPassword
                  ? "text-red-600"
                  : ""
              }
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value,
                  );
                  clearError("confirmPassword");
                }}
                placeholder="Confirm password"
                className={inputClass(
                  Boolean(
                    errors.confirmPassword,
                  ),
                )}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.general && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Create Account
          </button>

          <button
            type="button"
            onClick={() =>
              navigate({ to: "/login" })
            }
            className="h-10 w-full rounded-md border px-4 text-sm font-medium"
          >
            Back to Login
          </button>
        </form>
      </div>
    </main>
  );
}

export default RegisterPage;
