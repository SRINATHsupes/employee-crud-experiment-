export type LoginResponse = {
  access_token: string;
  token_type: string;
  username: string;
  role: "admin" | "viewer";
};

export type RegisterResponse = {
  message: string;
  username: string;
  role: "admin" | "viewer";
};

const API_URL = "http://127.0.0.1:8000";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Invalid username or password",
    );
  }

  return response.json();
}

export async function register(
  username: string,
  password: string,
): Promise<RegisterResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Make sure the backend is running.",
    );
  }

  if (!response.ok) {
    const errorText = await response.text();

    let message = "Unable to create account";

    try {
      const error = JSON.parse(errorText);
      message = error.detail || message;
    } catch {
      if (errorText) {
        message = errorText;
      }
    }

    throw new Error(message);
  }

  return response.json();
}
