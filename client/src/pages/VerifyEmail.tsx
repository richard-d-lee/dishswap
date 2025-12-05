import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(searchString);
      const token = params.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setMessage("Your email has been verified successfully!");
        toast.success("Email verified!");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Verification failed");
        toast.error(error.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchString]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✗</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        {status !== "loading" && (
          <CardFooter className="flex flex-col space-y-2">
            {status === "success" && (
              <Button
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Go to Dashboard
              </Button>
            )}
            {status === "error" && (
              <>
                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={async () => {
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    if (user.email) {
                      try {
                        await fetch("/api/auth/resend-verification", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: user.email }),
                        });
                        toast.success("Verification email resent!");
                      } catch {
                        toast.error("Failed to resend email");
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
              </>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
