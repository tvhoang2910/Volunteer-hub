import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OAuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState("Processing Google sign-in...");

  useEffect(() => {
    if (!router.isReady) return;

    const { token, error } = router.query;

    if (typeof token === "string" && token) {
      login(token);
      setStatus("Login successful. Redirecting...");

      // Redirect to dashboard after we persist the token
      const timer = setTimeout(() => {
        router.replace("/user/dashboard");
      }, 600);

      return () => clearTimeout(timer);
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
