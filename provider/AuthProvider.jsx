"use client";

import { createContext, useState, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import config from "../config";
import { trackEvent } from "../lib/trackEvent";
export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // ✅ Lazy init (no setState in useEffect)
  const [loginData, setLoginData] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("loginData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // ✅ Login
  const login = useCallback(async (credentials, tenantId) => {
    setLoading(true);
    setError("");

    try {
      if (!credentials?.email || !credentials?.password || !tenantId) {
        throw new Error("Email, password and tenant ID are required");
      }

      const response = await fetch(`${config.API_BASE_URL}api/EcomToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          TenantId: tenantId,
        },
        body: JSON.stringify({
          Email: credentials.email,
          Password: credentials.password,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }

      const data = await response.json();
      if (!data?.accessToken || !data?.userData) {
        throw new Error("Invalid response format");
      }

      const updatedLoginData = {
        ...data.userData,
        tenantId,
      };

      // Cookie options
      const cookieOptions = {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7,
      };

      const cookieString = Object.entries(cookieOptions)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");

      // Set cookies
      document.cookie = `authToken=${data.accessToken}; ${cookieString}`;
      document.cookie = `loginData=${encodeURIComponent(
        JSON.stringify(updatedLoginData)
      )}; ${cookieString}`;

      // Save state
      setLoginData(updatedLoginData);
      localStorage.setItem("loginData", JSON.stringify(updatedLoginData));

      trackEvent('login', {
        email: updatedLoginData.Email,
        phone: updatedLoginData.Phone,
        name: updatedLoginData.Name,
        country: updatedLoginData.Country,
        district: updatedLoginData.District,
        city: updatedLoginData.City,
        zip: updatedLoginData.ZipCode,
        dateOfBirth: updatedLoginData.DateOfBirth,
        gender: updatedLoginData.Gender,
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Social login (Google / Facebook)
  const socialLogin = useCallback(async (provider, credential, tenantId) => {
    setLoading(true);
    setError("");

    try {
      if (!provider || !credential || !tenantId) {
        throw new Error("Missing social login credential");
      }

      const response = await fetch(`${config.API_BASE_URL}api/EcomToken/social`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          TenantId: tenantId,
        },
        body: JSON.stringify({
          Provider: provider,
          Credential: credential,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.title || (typeof err === "string" ? err : "Social login failed"));
      }

      const data = await response.json();
      if (!data?.accessToken || !data?.userData) {
        throw new Error("Invalid response format");
      }

      const updatedLoginData = {
        ...data.userData,
        tenantId,
      };

      const cookieOptions = {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7,
      };

      const cookieString = Object.entries(cookieOptions)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");

      document.cookie = `authToken=${data.accessToken}; ${cookieString}`;
      document.cookie = `loginData=${encodeURIComponent(
        JSON.stringify(updatedLoginData)
      )}; ${cookieString}`;

      setLoginData(updatedLoginData);
      localStorage.setItem("loginData", JSON.stringify(updatedLoginData));

      trackEvent('login', {
        email: updatedLoginData.Email,
        phone: updatedLoginData.Phone,
        name: updatedLoginData.Name,
        country: updatedLoginData.Country,
        district: updatedLoginData.District,
        city: updatedLoginData.City,
        zip: updatedLoginData.ZipCode,
        dateOfBirth: updatedLoginData.DateOfBirth,
        gender: updatedLoginData.Gender,
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Social login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Logout
  const logout = useCallback(() => {
    setLoginData(null);
    localStorage.removeItem("loginData");
    document.cookie =
      "authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "loginData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        loginData,
        login,
        socialLogin,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
