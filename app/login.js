import { sanitizeTokenString } from "./token-utils";

export async function handleLogin({
  event,
  identifier,
  password,
  router,
  setError,
  setLoading,
}) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (!identifier || !password) {
      throw new Error("Please fill in both fields.");
    }

    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
    const credentials = `${identifier}:${password}`;
    const basicToken = btoa(credentials);

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? "Invalid username/email or password."
          : `Login failed (status ${response.status}).`
      );
    }

    const rawToken = await response.text();
    const cleanedToken = sanitizeTokenString(rawToken);

    if (
      !cleanedToken ||
      cleanedToken.length < 20 ||
      cleanedToken.split(".").length !== 3
    ) {
      throw new Error("Could not find token in the server response.");
    }

    localStorage.setItem("jwt", cleanedToken);
    router.replace("/profile");
  } catch (err) {
    console.error(err);
    setError(err?.message || "Unexpected error.");
  } finally {
    setLoading(false);
  }
}
