import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function OAuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState("Processing Google sign-in...");

  useEffect(() => {
    if (!router.isReady) return;

    const { token, error } = router.query;

    if (typeof token === "string" && token) {
      // Persist token first
      login(token);
      setStatus("Login successful. Fetching user info...");

      // Fetch current user to determine role-based redirect
      (async () => {
        try {
          // const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          //   headers: {
          //     "Content-Type": "application/json",
          //     Authorization: `Bearer ${token}`,
          //   },
          //   credentials: "include",
          // });
          const res = await axios.get(
              `${API_BASE_URL}/api/auth/me`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
              },
          );

          if (!res.ok) throw new Error(`status ${res.status}`);
          const payload = await res.json();
          const roles = payload?.data?.roles || payload?.roles || [];
          let role = null;
          if (Array.isArray(roles)) {
            const upper = roles.map((r) => String(r).toUpperCase());
            if (upper.find((r) => r.includes("ADMIN"))) role = "ADMIN";
            else if (upper.find((r) => r.includes("MANAGER"))) role = "MANAGER";
            else role = "VOLUNTEER";
          }

          // Update role in context/localStorage via login()
          if (role) {
            login(token, role);
          }

          // Role-based redirect
          if (role === "ADMIN") {
            router.replace("/admin/dashboard");
          } else if (role === "MANAGER") {
            router.replace("/manager/dashboard");
          } else {
            router.replace("/user/dashboard");
          }
        } catch (e) {
          // Fallback redirect
          setStatus("Could not fetch user info. Redirecting...");
          router.replace("/user/dashboard");
        }
      })();

      return;
    }

    const errorMessage =
      typeof error === "string" && error.length > 0
        ? error
        : "Missing token from OAuth callback.";
    setStatus(errorMessage);

    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle>Google Sign-in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-gray-700">{status}</p>
          <Button variant="outline" onClick={() => router.replace("/login")}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
