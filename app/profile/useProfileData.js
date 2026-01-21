import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { fetchProfileData } from "./fetchdata";
import { sanitizeTokenString } from "../token-utils";

export function useProfileData() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwt");
    router.push("/");
  }, [router]);

  const loadProfile = useCallback(async (currentToken, currentUserId) => {
    if (!currentToken || !Number.isFinite(currentUserId)) {
      setError("Missing session information.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchProfileData(currentToken, currentUserId);
      setProfileData(data);
    } catch (err) {
      console.error("GraphQL error:", err);
      setError(err.message || "Unable to load your profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const jwt = sanitizeTokenString(localStorage.getItem("jwt"));
    if (!jwt) {
      router.push("/");
      return;
    }

    try {
      const decoded = jwtDecode(jwt);
      const claimId =
        Number(decoded?.sub) || Number(decoded?.userId) || Number(decoded?.id);

      if (!claimId) {
        throw new Error("JWT is missing the user id claim.");
      }

      setToken(jwt);
      setUserId(claimId);
      loadProfile(jwt, claimId);
    } catch (err) {
      console.error("Failed to decode JWT:", err);
      handleLogout();
    }
  }, [handleLogout, loadProfile, router]);

  const handleRefresh = useCallback(() => {
    if (token && Number.isFinite(userId)) {
      loadProfile(token, userId);
    }
  }, [loadProfile, token, userId]);

  const isInitialLoad = loading && !profileData && !error;
  const isSyncing = loading && Boolean(profileData);

  return {
    profileData,
    loading,
    error,
    handleLogout,
    handleRefresh,
    isInitialLoad,
    isSyncing,
  };
}
