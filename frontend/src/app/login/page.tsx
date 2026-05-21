'use client'

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEmergencyStore } from "@/store/emergency-store";
import { authAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, KeyRound, User, Mail, ShieldAlert, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useEmergencyStore((state) => state.setAuth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"citizen" | "rescuer" | "government" | "admin">("citizen");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setShowExpiredAlert(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowExpiredAlert(false);

    try {
      if (isLogin) {
        const response = await authAPI.login({ email, password });
        const { user, token } = response.data;
        setAuth(user, token);
        setSuccess("Signed in successfully! Redirecting...");
        
        const redirectPath = searchParams.get("redirect") || (user.role === "citizen" ? "/" : `/${user.role}`);
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        const response = await authAPI.register({ name, email, password, role, phone });
        const { user, token } = response.data;
        setAuth(user, token);
        setSuccess("Account registered successfully! Redirecting...");
        
        const redirectPath = user.role === "citizen" ? "/" : `/${user.role}`;
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: "citizen" | "rescuer" | "government" | "admin") => {
    const demoEmail = `${demoRole}@roadsos.ai`;
    setEmail(demoEmail);
    setPassword("password123");
    setIsLogin(true);
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authAPI.login({ email: demoEmail, password: "password123" });
      const { user, token } = response.data;
      setAuth(user, token);
      setSuccess("Demo account signed in. Redirecting...");
      const redirectPath = user.role === "citizen" ? "/" : `/${user.role}`;
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.response?.data?.error || "Demo login failed. Make sure the Flask backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4 space-y-6">
      {showExpiredAlert && (
        <div className="flex items-center gap-2 p-3 text-xs bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded-lg">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Your session has expired. Please log in again to access secure resources.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs bg-red-950/40 border border-red-500/20 text-red-400 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-xs bg-green-950/40 border border-green-500/20 text-green-400 rounded-lg animate-pulse">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-950/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-3">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-zinc-100">
            {isLogin ? "Sign In to RoadSOS" : "Create System Account"}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            {isLogin 
              ? "Access secure incident queues and intelligence dashboards" 
              : "Register as citizen, rescuer, government, or administrator"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-zinc-950/60 border-zinc-800 focus:border-amber-500/40 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  required
                  placeholder="name@roadsos.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-zinc-950/60 border-zinc-800 focus:border-amber-500/40 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/40 text-sm"
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Phone (Optional)</label>
                  <Input
                    type="text"
                    placeholder="+91-XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/40 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">System Role</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["citizen", "rescuer", "government", "admin"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-1.5 px-1 rounded-md text-[10px] font-bold border transition-all uppercase ${
                          role === r
                            ? "bg-amber-500/10 border-amber-500 text-amber-400"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        {r === "government" ? "Gov" : r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black mt-2">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                isLogin ? "Sign In" : "Register Account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-zinc-400 hover:text-amber-400 underline transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Demo Accounts Grid */}
      <Card className="border-zinc-900 bg-zinc-950/20 backdrop-blur-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Demo logins</h3>
            <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-500 font-bold bg-amber-950/10">
              Evaluation
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: "citizen" as const, color: "hover:border-zinc-700", label: "Citizen Account" },
              { role: "rescuer" as const, color: "hover:border-red-500/40", label: "Rescuer Account" },
              { role: "government" as const, color: "hover:border-blue-500/40", label: "Gov Intel Account" },
              { role: "admin" as const, color: "hover:border-purple-500/40", label: "Admin Account" },
            ].map((demo) => (
              <Button
                key={demo.role}
                variant="outline"
                type="button"
                onClick={() => handleDemoLogin(demo.role)}
                className={`text-[10px] font-bold border-zinc-800 bg-zinc-950/30 text-zinc-300 py-1.5 h-auto justify-start px-2.5 ${demo.color} transition-all`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-ping" />
                {demo.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
