import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import * as d3 from "d3";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./api";

const employeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[A-Za-z ]+$/, "Name can contain only letters and spaces"),
  department: z.string().min(1, "Department is required"),
  salary: z.coerce
    .number()
    .int("Salary must be a whole number")
    .min(1, "Salary must be greater than 0"),
});

const emptyForm = {
  id: "",
  name: "",
  department: "",
  salary: "",
};

function Dashboard({ employees }) {
  const departmentChartRef = useRef(null);
  const salaryChartRef = useRef(null);

  useEffect(() => {
    // -----------------------------
    // Department chart
    // -----------------------------

    const departmentSvg = d3.select(departmentChartRef.current);

    departmentSvg.selectAll("*").remove();

    const departmentData = Array.from(
      d3.rollup(
        employees,
        (group) => group.length,
        (employee) => employee.department,
      ),
      ([department, count]) => ({
        department,
        count,
      }),
    );

    const departmentWidth = 700;
    const departmentHeight = 350;

    const departmentMargin = {
      top: 30,
      right: 30,
      bottom: 70,
      left: 60,
    };

    const departmentInnerWidth =
      departmentWidth -
      departmentMargin.left -
      departmentMargin.right;

    const departmentInnerHeight =
      departmentHeight -
      departmentMargin.top -
      departmentMargin.bottom;

    const departmentChart = departmentSvg
      .attr("width", departmentWidth)
      .attr("height", departmentHeight);

    const departmentGroup = departmentChart
      .append("g")
      .attr(
        "transform",
        `translate(${departmentMargin.left},${departmentMargin.top})`,
      );

    const xDepartment = d3
      .scaleBand()
      .domain(departmentData.map((item) => item.department))
      .range([0, departmentInnerWidth])
      .padding(0.25);

    const yDepartment = d3
      .scaleLinear()
      .domain([0, d3.max(departmentData, (item) => item.count) || 1])
      .nice()
      .range([departmentInnerHeight, 0]);

    departmentGroup
      .append("g")
      .attr("transform", `translate(0,${departmentInnerHeight})`)
      .call(d3.axisBottom(xDepartment))
      .selectAll("text")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    departmentGroup
      .append("g")
      .call(d3.axisLeft(yDepartment));

    departmentGroup
      .selectAll(".bar")
      .data(departmentData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (item) => xDepartment(item.department) ?? 0)
      .attr("y", (item) => yDepartment(item.count))
      .attr("width", xDepartment.bandwidth())
      .attr(
        "height",
        (item) => departmentInnerHeight - yDepartment(item.count),
      )
      .attr("rx", 6);

    departmentGroup
      .selectAll(".bar-label")
      .data(departmentData)
      .join("text")
      .attr("class", "bar-label")
      .attr(
        "x",
        (item) => (xDepartment(item.department) ?? 0) + xDepartment.bandwidth() / 2,
      )
      .attr("y", (item) => yDepartment(item.count) - 8)
      .attr("text-anchor", "middle")
      .text((item) => item.count);

    // -----------------------------
    // Salary chart
    // -----------------------------

    const salarySvg = d3.select(salaryChartRef.current);

    salarySvg.selectAll("*").remove();

    const salaryData = [...employees]
      .sort((a, b) => Number(b.salary) - Number(a.salary))
      .slice(0, 15);

    const salaryWidth = 700;
    const salaryHeight = 450;

    const salaryMargin = {
      top: 30,
      right: 100,
      bottom: 30,
      left: 150,
    };

    const salaryInnerWidth =
      salaryWidth - salaryMargin.left - salaryMargin.right;

    const salaryInnerHeight =
      salaryHeight - salaryMargin.top - salaryMargin.bottom;

    const salaryChart = salarySvg
      .attr("width", salaryWidth)
      .attr("height", salaryHeight);

    const salaryGroup = salaryChart
      .append("g")
      .attr(
        "transform",
        `translate(${salaryMargin.left},${salaryMargin.top})`,
      );

    const xSalary = d3
      .scaleLinear()
      .domain([0, d3.max(salaryData, (item) => Number(item.salary)) || 1])
      .nice()
      .range([0, salaryInnerWidth]);

    const ySalary = d3
      .scaleBand()
      .domain(salaryData.map((item) => item.name))
      .range([0, salaryInnerHeight])
      .padding(0.2);

    salaryGroup
      .append("g")
      .call(d3.axisLeft(ySalary));

    salaryGroup
      .append("g")
      .attr("transform", `translate(0,${salaryInnerHeight})`)
      .call(d3.axisBottom(xSalary));

    salaryGroup
      .selectAll(".salary-bar")
      .data(salaryData)
      .join("rect")
      .attr("class", "salary-bar")
      .attr("x", 0)
      .attr("y", (item) => ySalary(item.name) ?? 0)
      .attr("width", (item) => xSalary(Number(item.salary)))
      .attr("height", ySalary.bandwidth())
      .attr("rx", 6);

    salaryGroup
      .selectAll(".salary-label")
      .data(salaryData)
      .join("text")
      .attr("class", "salary-label")
      .attr("x", (item) => xSalary(Number(item.salary)) + 8)
      .attr(
        "y",
        (item) => (ySalary(item.name) ?? 0) + ySalary.bandwidth() / 2 + 5,
      )
      .text((item) => `₹${Number(item.salary).toLocaleString("en-IN")}`);
  }, [employees]);

  const totalEmployees = employees.length;

  const departmentCount = new Set(
    employees.map((employee) => employee.department),
  ).size;

  const averageSalary =
    employees.length === 0
      ? 0
      : employees.reduce(
          (total, employee) => total + Number(employee.salary),
          0,
        ) / employees.length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Employee Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Live D3 visualization of your employee data.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Total Employees</p>
            <p className="mt-2 text-3xl font-bold">{totalEmployees}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Departments</p>
            <p className="mt-2 text-3xl font-bold">{departmentCount}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Average Salary</p>
            <p className="mt-2 text-3xl font-bold">
              ₹{Math.round(averageSalary).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">
              Employees by Department
            </h2>

            <svg
              ref={departmentChartRef}
              className="mx-auto max-w-full"
            />
          </div>

          <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">
              Salary by Employee
            </h2>

            {employees.length > 0 ? (
              <svg
                ref={salaryChartRef}
                className="mx-auto max-w-full"
              />
            ) : (
              <p className="py-20 text-center text-slate-500">
                No employee data available.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/employees"
            className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Manage Employees
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmployeeList({ employees, setEmployees }) {
  const navigate = useNavigate();

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);

      setEmployees((currentEmployees) =>
        currentEmployees.filter((employee) => employee.id !== id),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Employee Management
            </h1>

            <p className="mt-1 text-slate-600">
              Create, update and delete employees.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <button
              onClick={() => navigate("/employees/add")}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Add Employee
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Salary</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t">
                  <td className="px-6 py-4">{employee.id}</td>

                  <td className="px-6 py-4">{employee.name}</td>

                  <td className="px-6 py-4">{employee.department}</td>

                  <td className="px-6 py-4">
                    ₹{Number(employee.salary).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/employees/edit/${employee.id}`)
                        }
                        className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="rounded-lg bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <p className="p-8 text-center text-slate-500">
              No employees found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeForm({ employees, setEmployees }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const existingEmployee = employees.find(
    (employee) => employee.id === id,
  );

  const [form, setForm] = useState(
    existingEmployee
      ? {
          id: existingEmployee.id,
          name: existingEmployee.name,
          department: existingEmployee.department,
          salary: existingEmployee.salary,
        }
      : emptyForm,
  );

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const result = employeeSchema.safeParse(form);

    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid form data.");
      return;
    }

    if (
      !editing &&
      employees.some((employee) => employee.id === result.data.id)
    ) {
      setError("Employee ID already exists.");
      return;
    }

    try {
      if (editing) {
        const updatedEmployee = await updateEmployee(
          id,
          result.data,
        );

        setEmployees((currentEmployees) =>
          currentEmployees.map((employee) =>
            employee.id === id ? updatedEmployee : employee,
          ),
        );
      } else {
        const createdEmployee = await createEmployee(result.data);

        setEmployees((currentEmployees) => [
          ...currentEmployees,
          createdEmployee,
        ]);
      }

      navigate("/employees");
    } catch (error) {
      console.error(error);
      setError("Failed to save employee.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            to="/employees"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to employees
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            {editing ? "Update Employee" : "Add Employee"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl bg-white p-6 shadow"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block font-medium">
              Employee ID
            </label>

            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              disabled={editing}
              className="w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100"
              placeholder="E001"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="Employee name"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Department
            </label>

            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="">Select department</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Salary
            </label>

            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="25000"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
            >
              {editing ? "Update Employee" : "Create Employee"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="rounded-lg border border-slate-300 px-5 py-3 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error(error);
        setLoadError("Failed to load employees.");
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading employees...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {loadError}
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard employees={employees} />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard employees={employees} />}
        />

        <Route
          path="/employees"
          element={
            <EmployeeList
              employees={employees}
              setEmployees={setEmployees}
            />
          }
        />

        <Route
          path="/employees/add"
          element={
            <EmployeeForm
              employees={employees}
              setEmployees={setEmployees}
            />
          }
        />

        <Route
          path="/employees/edit/:id"
          element={
            <EmployeeForm
              employees={employees}
              setEmployees={setEmployees}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
