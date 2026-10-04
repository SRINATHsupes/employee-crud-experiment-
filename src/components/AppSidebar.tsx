import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "@tanstack/react-router";

import { getUser, logout } from "@/utils/auth";

export default function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] =
    useState<ReturnType<typeof getUser>>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const isAdmin = user?.role === "admin";

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  function goToDashboard() {
    setOpen(false);

    navigate({
      to: "/dashboard",
    });
  }

  function goToEmployees() {
    setOpen(false);

    navigate({
      to: "/employees",
    });
  }

  function goToHistory() {
    setOpen(false);

    // History route can be added here later.
    console.log("History clicked");
  }

  const dashboardActive =
    location.pathname === "/dashboard";

  const employeesActive =
    location.pathname === "/employees";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border bg-background shadow-sm hover:bg-muted"
        aria-label="Open navigation"
      >
        ☰
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background shadow-xl transition-transform duration-200 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-bold">
              Employee CRUD
            </h2>

            <p className="text-xs text-muted-foreground">
              Management System
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <button
            type="button"
            onClick={goToDashboard}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
              dashboardActive
                ? "bg-secondary font-medium"
                : "hover:bg-muted"
            }`}
          >
            📊 Dashboard
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={goToEmployees}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                  employeesActive
                    ? "bg-secondary font-medium"
                    : "hover:bg-muted"
                }`}
              >
                👥 Employees
              </button>

              <button
                type="button"
                onClick={goToHistory}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              >
                📋 History
              </button>
            </>
          )}
        </nav>

        <div className="border-t p-4">
          <div className="mb-4 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              Signed in as
            </p>

            <p className="mt-1 truncate font-medium">
              {user?.username ?? "Loading..."}
            </p>

            <p className="mt-1 text-xs capitalize text-muted-foreground">
              {user?.role ?? "user"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
