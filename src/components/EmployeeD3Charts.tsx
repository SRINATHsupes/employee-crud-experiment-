import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Employee = {
  id: string;
  name: string;
  department: string;
  salary: number;
};

type EmployeeD3ChartsProps = {
  employees: Employee[];
};

export default function EmployeeD3Charts({
  employees,
}: EmployeeD3ChartsProps) {
  const departmentChartRef = useRef<SVGSVGElement | null>(null);
  const salaryChartRef = useRef<SVGSVGElement | null>(null);

  /*
   * Chart 1:
   * Number of employees in each department.
   */
  useEffect(() => {
    if (!departmentChartRef.current) return;

    const svg = d3.select(departmentChartRef.current);

    svg.selectAll("*").remove();

    const width = 700;
    const height = 350;

    const margin = {
      top: 30,
      right: 30,
      bottom: 60,
      left: 60,
    };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const departmentData = Array.from(
      d3.rollup(
        employees,
        (values) => values.length,
        (employee) => employee.department,
      ),
      ([department, count]) => ({
        department,
        count,
      }),
    );

    const x = d3
      .scaleBand()
      .domain(departmentData.map((item) => item.department))
      .range([0, chartWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(departmentData, (item) => item.count) ?? 1])
      .nice()
      .range([chartHeight, 0]);

    const chart = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "350")
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`,
      );

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    chart
      .append("g")
      .call(d3.axisLeft(y).ticks(5));

    chart
      .selectAll(".bar")
      .data(departmentData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (item) => x(item.department) ?? 0)
      .attr("y", (item) => y(item.count))
      .attr("width", x.bandwidth())
      .attr("height", (item) => chartHeight - y(item.count))
      .attr("rx", 5)
      .append("title")
      .text(
        (item) =>
          `${item.department}: ${item.count} employee${
            item.count === 1 ? "" : "s"
          }`,
      );

    chart
      .selectAll(".value")
      .data(departmentData)
      .join("text")
      .attr("class", "value")
      .attr(
        "x",
        (item) => (x(item.department) ?? 0) + x.bandwidth() / 2,
      )
      .attr("y", (item) => y(item.count) - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("font-weight", 600)
      .text((item) => item.count);
  }, [employees]);

  /*
   * Chart 2:
   * Salary of every employee.
   */
  useEffect(() => {
    if (!salaryChartRef.current) return;

    const svg = d3.select(salaryChartRef.current);

    svg.selectAll("*").remove();

    const width = 700;
    const height = 350;

    const margin = {
      top: 30,
      right: 30,
      bottom: 80,
      left: 80,
    };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const salaryData = [...employees].sort(
      (a, b) => b.salary - a.salary,
    );

    const x = d3
      .scaleBand()
      .domain(salaryData.map((employee) => employee.id))
      .range([0, chartWidth])
      .padding(0.25);

    const maxSalary =
      d3.max(salaryData, (employee) => employee.salary) ?? 1;

    const y = d3
      .scaleLinear()
      .domain([0, maxSalary])
      .nice()
      .range([chartHeight, 0]);

    const chart = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "350")
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`,
      );

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((id) => {
            const employee = salaryData.find(
              (item) => item.id === id,
            );

            return employee?.name ?? id;
          }),
      )
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end");

    chart
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((value) => `₹${Number(value).toLocaleString()}`),
      );

    chart
      .selectAll(".bar")
      .data(salaryData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (employee) => x(employee.id) ?? 0)
      .attr("y", (employee) => y(employee.salary))
      .attr("width", x.bandwidth())
      .attr(
        "height",
        (employee) => chartHeight - y(employee.salary),
      )
      .attr("rx", 5)
      .append("title")
      .text(
        (employee) =>
          `${employee.name}: ₹${employee.salary.toLocaleString()}`,
      );
  }, [employees]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Employees by Department
          </h2>

          <p className="text-sm text-muted-foreground">
            Live employee count from the database.
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
            No employee data available.
          </div>
        ) : (
          <svg
            ref={departmentChartRef}
            className="w-full"
          />
        )}
      </section>

      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Salary by Employee
          </h2>

          <p className="text-sm text-muted-foreground">
            Salary values are read directly from the API.
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
            No employee data available.
          </div>
        ) : (
          <svg
            ref={salaryChartRef}
            className="w-full"
          />
        )}
      </section>
    </div>
  );
}
