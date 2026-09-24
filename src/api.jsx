const API_URL = "http://127.0.0.1:8000";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API request failed: ${response.status} ${response.statusText} ${errorText}`,
    );
  }

  return response.json();
}

export async function getEmployees() {
  return request(`${API_URL}/employees`, {
    method: "GET",
  });
}

export async function getEmployee(id) {
  return request(`${API_URL}/employees/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function createEmployee(employee) {
  return request(`${API_URL}/employees`, {
    method: "POST",
    body: JSON.stringify(employee),
  });
}

export async function updateEmployee(id, employee) {
  return request(`${API_URL}/employees/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
}

export async function deleteEmployee(id) {
  return request(`${API_URL}/employees/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}