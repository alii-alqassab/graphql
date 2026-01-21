import {
  GET_AUDIT_RATIO,
  GET_USER_INFO,
  GET_USER_LEVEL,
  GET_USER_PROJECT_XP,
  GET_USER_SKILLS,
  GET_XP_AMOUNT,
} from "./queries";
import { sanitizeTokenString } from "../token-utils";

const DEFAULT_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

function readCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
}

export class GraphQLService {
  constructor(options = {}) {
    const { token = null, apiUrl = DEFAULT_GRAPHQL_URL } = options;
    this.apiUrl = apiUrl;
    this.token = sanitizeTokenString(token);
  }

  setToken(token) {
    this.token = sanitizeTokenString(token);
  }

  #jwt() {
    const authCookie = sanitizeTokenString(readCookie("auth_token"));
    if (authCookie && authCookie.split(".").length === 3) {
      return authCookie;
    }

    const providedToken = this.token;
    if (providedToken && providedToken.split(".").length === 3) {
      return providedToken;
    }

    if (typeof window !== "undefined") {
      const stored = sanitizeTokenString(localStorage.getItem("jwt"));
      if (stored && stored.split(".").length === 3) {
        return stored;
      }
    }

    return "";
  }

  async #fetchData(query, variables = {}) {
    const jwt = this.#jwt();

    if (!jwt || jwt.split(".").length !== 3) {
      return [null, new Error("Invalid token")];
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }

      const result = await response.json();

      if (result.errors?.length) {
        const message = result.errors
          .map((error) => error?.message)
          .filter(Boolean)
          .join(", ");
        throw new Error(`GraphQL Errors: ${message}`);
      }

      return [result.data, null];
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(`An unknown error occurred: ${error}`);
      console.error("Error fetching data:", err.message);
      return [null, err];
    }
  }

  async getUserInfo() {
    const [data, error] = await this.#fetchData(GET_USER_INFO);
    if (error) {
      return [null, error];
    }
    if ("user" in data && Array.isArray(data.user) && data.user.length > 0) {
      return [data.user[0], null];
    }
    return [null, new Error("'user' key not in response")];
  }

  async getAuditRatio() {
    const [data, error] = await this.#fetchData(GET_AUDIT_RATIO);
    if (error) {
      return [null, error];
    }
    if ("user" in data && Array.isArray(data.user)) {
      return [data.user[0] ?? null, null];
    }
    return [null, new Error("'user_audit_ratio' key not in response")];
  }

  async getXpAmount() {
    const [data, error] = await this.#fetchData(GET_XP_AMOUNT);
    if (error) {
      return [null, error];
    }
    if ("transaction_aggregate" in data) {
      return [data.transaction_aggregate, null];
    }
    return [null, new Error("'transaction_aggregate' key not in response")];
  }

  async getUserLevel() {
    const [data, error] = await this.#fetchData(GET_USER_LEVEL);
    if (error) {
      return [null, error];
    }
    if ("transaction" in data && Array.isArray(data.transaction)) {
      return [data.transaction[0] ?? null, null];
    }
    return [null, new Error("'transaction' key not in response")];
  }

  async getUserProjectXp() {
    const [data, error] = await this.#fetchData(GET_USER_PROJECT_XP);
    if (error) {
      return [null, error];
    }
    if ("transaction" in data && Array.isArray(data.transaction)) {
      return [data.transaction, null];
    }
    return [null, new Error("'transaction' key not in response")];
  }

  async getUserSkills() {
    const [data, error] = await this.#fetchData(GET_USER_SKILLS);
    if (error) {
      return [null, error];
    }
    if ("transaction" in data && Array.isArray(data.transaction)) {
      return [data.transaction, null];
    }
    return [null, new Error("'transaction' key not in response")];
  }
}
