"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { loginUser } from "@/services/authServices";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginUser({
        email: email.trim(),
        password: password,
      });

      localStorage.setItem("access_token", data.access_token);
      window.dispatchEvent(new Event("auth-change"));

      const response = await fetch("http://127.0.0.1:8000/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve user profile");
      }

      const user = await response.json();

      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message === "Invalid email or password") {
        setError("Incorrect email or password. Please try again.");
      } else if (err.message === "Failed to fetch") {
        setError("Unable to connect to server. Please check backend status.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Left Promotional Banner (Large screens) */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-blue-600 to-indigo-800 text-white p-12">
        <div>
          <Link href="/">
            {/* <Image
              src="/final_logo.webp"
              alt="OneCart logo"
              height={48}
              width={160}
              className="h-10 w-auto object-contain brightness-110"
            /> */}
          </Link>
        </div>

        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-blue-100">
            <ShieldCheck className="w-4 h-4 text-yellow-200" />
            <span>Trusted by thousands of shoppers</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Everything You Need, All In One Cart.
          </h1>
          <p className="text-blue-100 text-base leading-relaxed">
            Sign in to access your saved wishlist, track recent orders, and enjoy
            personalized recommendations.
          </p>
        </div>

        <div className="text-xs text-blue-200">
          © {new Date().getFullYear()} OneCart. All rights reserved.
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="lg:hidden inline-block mb-4">
              <Image
                src="/onecart_badge_logo.webp"
                alt="OneCart"
                width={140}
                height={42}
                className="h-9 w-auto mx-auto object-contain"
              />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Feedback message */}
          {message && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer switch */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-500">
              Don&rsquo;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 font-bold hover:underline"
              >
                Create Account
              </Link>
            </p>

            <Link
              href="/"
              className="inline-block text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Back to Shopping (Guest Mode)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}