import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveTokens } from "@/lib/auth";
import {
  Wallet,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingUp,
  PieChart,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import "@/components/LiquidEther.css";
import LiquidEther from "@/components/LiquidEther";

type AuthMode = "login" | "signup";

const BASE_URL = "http://localhost:5000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");

  // login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // signup
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
        return;
      }

      // expects { accessToken, refreshToken }
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (
        !firstName ||
        !lastName ||
        !signupUsername ||
        !signupEmail ||
        !signupPassword
      ) {
        setError("All fields are required");
        return;
      }

      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Signup failed");
        return;
      }

      // after register, auto switch to login
      setMode("login");
      setUsername(signupUsername);
      setPassword(signupPassword);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        {/*  LiquidEther background (white smoke via invert) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 [filter:invert(1)] opacity-90">
            <LiquidEther />
          </div>

          {/*  dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
        </div>

        {/*  Content */}
        <div className="relative z-10 flex flex-col justify-center gap-20 p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-15 h-15 rounded-lg bg-white/10 border border-white/15">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <span className="text-4xl font-semibold text-white">
              ExpenseTracker
            </span>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-light text-white leading-tight">
                Take control of
                <br />
                <span className="font-semibold">your finances.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-md leading-relaxed">
                Track expenses, set budgets, and gain insights into your
                spending habits with our intuitive dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-sm">
                <TrendingUp className="w-4 h-4 text-white" />
                <span>Real-time tracking</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-sm">
                <PieChart className="w-4 h-4 text-white" />
                <span>Visual insights</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-sm">
                <CreditCard className="w-4 h-4 text-white" />
                <span>Budget planning</span>
              </div>
            </div>
          </div>
        </div>

        {/* optional glow */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              ExpenseTracker
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Sign up to start tracking your expenses"}
            </p>
          </div>

          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-12 px-4 rounded-xl border-input bg-background transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-12 px-4 pr-12 rounded-xl border-input bg-background transition-colors focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-muted"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-input bg-background transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-input bg-background transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupUsername" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="signupUsername"
                  type="text"
                  placeholder="johndoe"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                  className="h-12 px-4 rounded-xl border-input bg-background transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="signupEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 px-4 rounded-xl border-input bg-background transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-12 px-4 pr-12 rounded-xl border-input bg-background transition-colors focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-muted"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showSignupPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Button
                variant="link"
                onClick={toggleMode}
                className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
