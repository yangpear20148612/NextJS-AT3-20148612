import api from "./api";

// Handle user authentication and store the returned bearer token.
export async function login(email, password) {
  // Send the user's credentials to the Laravel API login endpoint.
  const response = await api.post("/auth/login", {
    email,
    password,
    workspace_type: "project_management",
  });

  // Extract the authentication token from the API response.
  const token = response.data.token;

  // Store the token in sessionStorage so it can be used by subsequent API requests.
  sessionStorage.setItem("workspace_token", token);

  // Return the full response data so the calling component can access other information.
  return response.data;
}

// Retrieve the authentication token stored in the browser session.
export function getToken() {
  return sessionStorage.getItem("workspace_token");
}

// Log the user out by removing their stored authentication token.
export function logout() {
  sessionStorage.removeItem("workspace_token");
}
