import { useMemo, useState } from "react";
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

import AppSidebar from "@/components/AppSidebar";
import EmployeeD3Charts from "@/components/EmployeeD3Charts";
import { useEmployees } from "@/hooks/useEmployees";
import { getToken } from "@/utils/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (
      typeof window !== "undefined" &&
      !getToken()
    ) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: DashboardPage,
});

function DashboardPage() {
  const [search, setSearch] = useState("");

  const {
    data: employees = [],
    isLoading,
    isError,
    error,
  } = useEmployees();

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) =>
      [
        employee.id,
        employee.name,
        employee.department,
        String(employee.salary),
      ].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [employees, search]);

  const totalEmployees = employees.length;

  const departments = new Set(
    employees.map((employee) => employee.department),
  ).size;

  const totalSalary = employees.reduce(
    (total, employee) => total + employee.salary,
    0,
  );

  const averageSalary =
    totalEmployees > 0
      ? Math.round(totalSalary / totalEmployees)
      : 0;

  return (
    <main className="min-h-screen bg-muted/30">
      <AppSidebar />

      <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-8 pl-12">
            <p className="text-sm font-medium text-muted-foreground">
              Employee Management
            </p>

            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Dashboard
                </h1>

                <p className="mt-1 text-muted-foreground">
                  Real-time overview of your workforce.
                </p>
              </div>

              <div className="rounded-full border bg-background px-4 py-2 text-sm shadow-sm">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                Live data
              </div>
            </div>
          </header>

          {/* Loading */}
          {isLoading && (
            <div className="rounded-xl border bg-background p-12 text-center shadow-sm">
              <p className="font-medium">
                Loading employee data...
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Connecting to the employee database.
              </p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-xl border bg-background p-8 shadow-sm">
              <h2 className="font-semibold text-destructive">
                Unable to load employee data
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong while loading employees."}
              </p>
            </div>
          )}

          {/* Dashboard */}
          {!isLoading && !isError && (
            <div className="space-y-8">
              {/* KPI cards */}
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Employees
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {totalEmployees}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        People in your database
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xl">
                      👥
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Departments
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {departments}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Active departments
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xl">
                      🏢
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Salary
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        ₹{averageSalary.toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Across all employees
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xl">
                      ₹
                    </div>
                  </div>
                </div>
              </section>

              {/* D3 visualizations */}
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">
                    Workforce Analytics
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Visual representation of your live employee data.
                  </p>
                </div>

                <EmployeeD3Charts
                  employees={employees}
                />
              </section>

              {/* Employee list */}
              <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                <div className="border-b p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        All Employees
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Browse employees stored in the database.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Search employees..."
                        className="h-10 w-full rounded-lg border bg-background px-3 pl-9 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                      />

                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        🔍
                      </span>
                    </div>
                  </div>
                </div>

                {filteredEmployees.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="font-medium">
                      {search
                        ? "No employees found"
                        : "No employees yet"}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {search
                        ? "Try a different search."
                        : "Add employees from the Employees page."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 text-left">
                          <th className="px-6 py-4 font-medium text-muted-foreground">
                            ID
                          </th>

                          <th className="px-6 py-4 font-medium text-muted-foreground">
                            Employee
                          </th>

                          <th className="px-6 py-4 font-medium text-muted-foreground">
                            Department
                          </th>

                          <th className="px-6 py-4 text-right font-medium text-muted-foreground">
                            Salary
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredEmployees.map(
                          (employee) => (
                            <tr
                              key={employee.id}
                              className="border-b last:border-0 hover:bg-muted/20"
                            >
                              <td className="px-6 py-4 font-mono text-xs">
                                {employee.id}
                              </td>

                              <td className="px-6 py-4">
                                <div className="font-medium">
                                  {employee.name}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <span className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
                                  {employee.department}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right font-medium">
                                ₹
                                {employee.salary.toLocaleString()}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="border-t bg-muted/20 px-6 py-4 text-xs text-muted-foreground">
                  Showing {filteredEmployees.length} of{" "}
                  {totalEmployees} employees
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
