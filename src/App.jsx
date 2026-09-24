import { useState, useEffect } from "react";
import { z } from "zod";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./api";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";

const employeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),

  department: z
    .string()
    .min(1, "Please select a department"),

  salary: z
    .coerce
    .number()
    .int("Salary must be a whole number")
    .min(1, "Salary must be a positive number"),
});

const emptyForm = {
  id: "",
  name: "",
  department: "",
  salary: "",
};

function EmployeeList({ employees, setEmployees }) {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);

      setEmployees(
        employees.filter((employee) => employee.id !== id)
      );
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee. Please try again.");
    }
  };

  return (
    <div className="w-[90%] max-w-[1000px] mx-auto my-10 font-sans">
      <h1 className="text-center mb-[30px] text-3xl font-bold">
        Employee Management
      </h1>

      <button
        className="px-4 py-2 mr-2 border-0 rounded-full bg-green-500 text-white cursor-pointer hover:bg-green-600 transition"
        onClick={() => navigate("/employees/add")}
      >
        + Add Employee
      </button>

      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse bg-blue-100 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">
                Employee ID
              </th>

              <th className="px-4 py-2 text-left border-b">
                Name
              </th>

              <th className="px-4 py-2 text-left border-b">
                Department
              </th>

              <th className="px-4 py-2 text-left border-b">
                Salary
              </th>

              <th className="px-4 py-2 text-left border-b">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="border border-gray-300 p-3">
                  {employee.id}
                </td>

                <td className="border border-gray-300 p-3">
                  {employee.name}
                </td>

                <td className="border border-gray-300 p-3">
                  {employee.department}
                </td>

                <td className="border border-gray-300 p-3">
                  ₹{Number(employee.salary).toLocaleString("en-IN")}
                </td>

                <td className="border border-gray-300 p-3">
                  <button
                    className="px-4 py-2 mr-2 border-0 rounded-full bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition"
                    onClick={() =>
                      navigate("/employees/edit/" + employee.id)
                    }
                  >
                    Update
                  </button>

                  <button
                    className="px-4 py-2 border-0 rounded-full bg-red-400 text-white cursor-pointer hover:bg-red-500 transition"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeForm({ employees, setEmployees, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const employeeToEdit = employees.find(
    (employee) => employee.id === id
  );

  const [formData, setFormData] = useState(
    mode === "edit" && employeeToEdit
      ? { ...employeeToEdit }
      : { ...emptyForm }
  );

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const result = employeeSchema.safeParse(formData);

    if (!result.success) {
      const newErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        newErrors[field] = issue.message;
      });

      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      return;
    }

    const duplicate = employees.some(
      (employee) => employee.id === formData.id
    );

    if (duplicate) {
      setErrors({
        id: "Employee ID already exists",
      });

      alert("Employee ID already exists");
      return;
    }

    try {
      const newEmployee = await createEmployee({
        id: formData.id,
        name: formData.name,
        department: formData.department,
        salary: Number(formData.salary),
      });

      setEmployees([...employees, newEmployee]);

      navigate("/employees");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee. Please try again.");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updatedEmployee = await updateEmployee(id, {
        id: formData.id,
        name: formData.name,
        department: formData.department,
        salary: Number(formData.salary),
      });

      setEmployees(
        employees.map((employee) =>
          employee.id === id ? updatedEmployee : employee
        )
      );

      navigate("/employees");
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee. Please try again.");
    }
  };

  const validId = formData.id.trim() !== "";

  const validName =
    formData.name.trim() !== "" &&
    formData.name.length >= 2 &&
    /^[A-Za-z ]+$/.test(formData.name);

  const validDepartment = formData.department !== "";

  const validSalary =
    formData.salary !== "" &&
    Number.isInteger(Number(formData.salary)) &&
    Number(formData.salary) >= 1 &&
    Number(formData.salary) <= 1000000;

  if (mode === "edit" && !employeeToEdit) {
    return (
      <div className="w-[90%] max-w-[1000px] mx-auto my-10 font-sans">
        <h2 className="text-2xl font-bold">
          Employee Not Found
        </h2>

        <button
          className="mt-5 px-5 py-2.5 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition cursor-pointer"
          onClick={() => navigate("/employees")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-[1000px] mx-auto my-10 font-sans">
      <div className="w-full max-w-[600px] mx-auto p-8 box-border bg-blue-100 border border-gray-200 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.08)]">

        <h2 className="mt-0 mb-[30px] text-center text-[26px] font-bold">
          {mode === "edit" ? "Update Employee" : "Add Employee"}
        </h2>

        <label className="block mt-5 mb-2 text-[15px] font-semibold">
          Employee ID
        </label>

        <input
          type="text"
          name="id"
          placeholder="Employee ID"
          value={formData.id}
          onChange={handleChange}
          disabled={mode === "edit"}
          className="w-full h-[42px] px-3 box-border border border-gray-300 rounded-full bg-white text-[15px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        />

        {errors.id && (
          <p className="mt-1.5 text-red-600 text-[13px] font-medium">
            {errors.id}
          </p>
        )}

        <label className="block mt-5 mb-2 text-[15px] font-semibold">
          Name
        </label>

        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full h-[42px] px-3 box-border border border-gray-300 rounded-full bg-white text-[15px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        {errors.name && (
          <p className="mt-1.5 text-red-600 text-[13px] font-medium">
            {errors.name}
          </p>
        )}

        <label className="block mt-5 mb-2 text-[15px] font-semibold">
          Department
        </label>

        <div className="flex gap-[25px] mt-2">

          <label className="flex items-center gap-1.5 m-0 font-normal cursor-pointer">
            <input
              type="radio"
              name="department"
              value="Frontend"
              checked={formData.department === "Frontend"}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            Frontend
          </label>

          <label className="flex items-center gap-1.5 m-0 font-normal cursor-pointer">
            <input
              type="radio"
              name="department"
              value="Backend"
              checked={formData.department === "Backend"}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            Backend
          </label>

          <label className="flex items-center gap-1.5 m-0 font-normal cursor-pointer">
            <input
              type="radio"
              name="department"
              value="Other"
              checked={formData.department === "Other"}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            Other
          </label>

        </div>

        {errors.department && (
          <p className="mt-1.5 text-red-600 text-[13px] font-medium">
            {errors.department}
          </p>
        )}

        <label className="block mt-5 mb-2 text-[15px] font-semibold">
          Salary
        </label>

        <input
          type="number"
          name="salary"
          placeholder="₹ in rupees"
          value={formData.salary}
          onChange={handleChange}
          min="1"
          step="1"
          className="w-full h-[42px] px-3 box-border border border-gray-300 rounded-full bg-white text-[15px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        {errors.salary && (
          <p className="mt-1.5 text-red-600 text-[13px] font-medium">
            {errors.salary}
          </p>
        )}

        <h3 className="mt-6 text-lg font-bold text-gray-800">
          Validation Status
        </h3>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">

          <div className="flex items-center gap-2.5 my-2.5">
            <input
              type="checkbox"
              checked={validId}
              readOnly
              className="w-[17px] h-[17px]"
            />

            <span>Employee ID</span>

            <span
              className={
                validId
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {validId ? "✓" : "✗"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 my-2.5">
            <input
              type="checkbox"
              checked={validName}
              readOnly
              className="w-[17px] h-[17px]"
            />

            <span>Name</span>

            <span
              className={
                validName
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {validName ? "✓" : "✗"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 my-2.5">
            <input
              type="checkbox"
              checked={validDepartment}
              readOnly
              className="w-[17px] h-[17px]"
            />

            <span>Department</span>

            <span
              className={
                validDepartment
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {validDepartment ? "✓" : "✗"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 my-2.5">
            <input
              type="checkbox"
              checked={validSalary}
              readOnly
              className="w-[17px] h-[17px]"
            />

            <span>Salary</span>

            <span
              className={
                validSalary
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {validSalary ? "✓" : "✗"}
            </span>
          </div>

        </div>

        {mode === "edit" ? (
          <button
            className="mt-[25px] px-5 py-3 rounded-full text-[15px] text-white bg-blue-500 hover:bg-blue-600 transition cursor-pointer"
            onClick={handleUpdate}
          >
            Save Update
          </button>
        ) : (
          <button
            className="mt-[25px] px-5 py-3 rounded-full text-[15px] text-white bg-green-500 hover:bg-green-600 transition cursor-pointer"
            onClick={handleAdd}
          >
            Add Employee
          </button>
        )}

        <button
          className="mt-[25px] ml-2 px-5 py-3 rounded-full text-[15px] text-white bg-[#e97575] hover:bg-[#c14a4a] transition cursor-pointer"
          onClick={() => navigate("/employees")}
        >
          Cancel
        </button>

      </div>
    </div>
  );
}

function App() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  }

  return (
    <BrowserRouter>
      <Routes>

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
              mode="add"
            />
          }
        />

        <Route
          path="/employees/edit/:id"
          element={
            <EmployeeForm
              employees={employees}
              setEmployees={setEmployees}
              mode="edit"
            />
          }
        />

        <Route
          path="*"
          element={
            <EmployeeList
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