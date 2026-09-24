import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "@/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  component: EmployeeManagement,
});

type Employee = {
  id: string;
  name: string;
  department: string;
  salary: number;
};

type FormData = {
  id: string;
  name: string;
  department: string;
  salary: string;
};

type FormErrors = {
  id?: string;
  name?: string;
  department?: string;
  salary?: string;
};

const emptyForm: FormData = {
  id: "",
  name: "",
  department: "",
  salary: "",
};

function EmployeeManagement() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const employeesQuery = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const employees = employeesQuery.data ?? [];

  console.log("TANSTACK QUERY:", {
    data: employeesQuery.data,
    employees,
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    error: employeesQuery.error,
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      employee,
    }: {
      id: string;
      employee: Employee;
    }) => updateEmployee(id, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const filteredEmployees = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.id.toLowerCase().includes(value) ||
        employee.name.toLowerCase().includes(value) ||
        employee.department.toLowerCase().includes(value),
    );
  }, [employees, search]);

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingId(employee.id);
    setFormData({
      id: employee.id,
      name: employee.name,
      department: employee.department,
      salary: String(employee.salary),
    });
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = "Employee ID is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[A-Za-z ]+$/.test(formData.name.trim())) {
      newErrors.name = "Name must contain only letters";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department";
    }

    const salary = Number(formData.salary);

    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (!Number.isInteger(salary) || salary < 1) {
      newErrors.salary = "Salary must be a positive whole number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const employee: Employee = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      department: formData.department,
      salary: Number(formData.salary),
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        employee,
      });
    } else {
      const duplicate = employees.some(
        (existing) => existing.id === employee.id,
      );

      if (duplicate) {
        setErrors({
          id: "Employee ID already exists",
        });
        return;
      }

      createMutation.mutate(employee);
    }
  }

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(id);
  }

  const validId = formData.id.trim() !== "";

  const validName =
    formData.name.trim().length >= 2 &&
    /^[A-Za-z ]+$/.test(formData.name.trim());

  const validDepartment = formData.department !== "";

  const validSalary =
    formData.salary !== "" &&
    Number.isInteger(Number(formData.salary)) &&
    Number(formData.salary) >= 1;

  const saving =
    createMutation.isPending || updateMutation.isPending;

  return (
    <main className="min-h-screen bg-muted/30 py-10">
      <div className="mx-auto w-[90%] max-w-[1000px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your employee records.
          </p>
        </div>

        {!showForm && (
          <>
            <div className="mb-6">
              <Button onClick={openAddForm}>
                + Add Employee
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Employee Records</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="mb-5">
                  <Label htmlFor="employee-search">
                    Search Employees
                  </Label>

                  <Input
                    id="employee-search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search by ID, name, or department..."
                    className="mt-2"
                  />
                </div>

                {employeesQuery.isLoading && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Loading employees...
                  </p>
                )}

                {employeesQuery.isError && (
                  <p className="py-8 text-center text-sm text-destructive">
                    Failed to load employees.
                  </p>
                )}

                {!employeesQuery.isLoading &&
                  !employeesQuery.isError && (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Salary</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredEmployees.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                              >
                                {search
                                  ? "No employees found."
                                  : "No employees available."}
                              </TableCell>
                            </TableRow>
                          )}

                          {filteredEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                              <TableCell className="font-medium">
                                {employee.id}
                              </TableCell>

                              <TableCell>
                                {employee.name}
                              </TableCell>

                              <TableCell>
                                <Badge variant="secondary">
                                  {employee.department}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                ₹
                                {Number(
                                  employee.salary,
                                ).toLocaleString("en-IN")}
                              </TableCell>

                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openEditForm(employee)
                                    }
                                  >
                                    Update
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDelete(employee.id)
                                    }
                                    disabled={
                                      deleteMutation.isPending
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
              </CardContent>
            </Card>
          </>
        )}

        {showForm && (
          <div>
            <div className="mb-5">
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                className="px-0"
              >
                ← Back to Employees
              </Button>
            </div>

            <Card className="mx-auto w-full max-w-[600px]">
              <CardHeader>
                <CardTitle>
                {editingId
                  ? "Update Employee"
                  : "Add Employee"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <Label htmlFor="employee-id">
                    Employee ID
                  </Label>

                  <Input
                    id="employee-id"
                    value={formData.id}
                    disabled={Boolean(editingId)}
                    placeholder="Employee ID"
                    onChange={(event) =>
                      updateField("id", event.target.value)
                    }
                    className="mt-2"
                  />

                  {errors.id && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.id}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employee-name">
                    Name
                  </Label>

                  <Input
                    id="employee-name"
                    value={formData.name}
                    placeholder="Employee Name"
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className="mt-2"
                  />

                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Department</Label>

                  <div className="mt-3 flex gap-6">
                    {["Frontend", "Backend", "Other"].map(
                      (department) => (
                        <label
                          key={department}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="radio"
                            name="department"
                            value={department}
                            checked={
                              formData.department === department
                            }
                            onChange={(event) =>
                              updateField(
                                "department",
                                event.target.value,
                              )
                            }
                          />
                          {department}
                        </label>
                      ),
                    )}
                  </div>

                  {errors.department && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employee-salary">
                    Salary
                  </Label>

                  <Input
                    id="employee-salary"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.salary}
                    placeholder="₹ in rupees"
                    onChange={(event) =>
                      updateField("salary", event.target.value)
                    }
                    className="mt-2"
                  />

                  {errors.salary && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.salary}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    Validation Status
                  </h3>

                  <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                    <ValidationRow
                      label="Employee ID"
                      valid={validId}
                    />

                    <ValidationRow
                      label="Name"
                      valid={validName}
                    />

                    <ValidationRow
                      label="Department"
                      valid={validDepartment}
                    />

                    <ValidationRow
                      label="Salary"
                      valid={validSalary}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Update"
                        : "Add Employee"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

function ValidationRow({
  label,
  valid,
}: {
  label: string;
  valid: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={valid}
        readOnly
        className="h-4 w-4"
      />

      <span>{label}</span>

      <span
        className={
          valid
            ? "font-bold text-green-600"
            : "font-bold text-red-600"
        }
      >
        {valid ? "✓" : "✗"}
      </span>
    </div>
  );
}
