"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { registerUser } from "@/services/authServices";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    // Check empty fields
    if (
      !name.trim() &&
      !email.trim() &&
      !password.trim() &&
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password.");
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const data = await registerUser({
        name: name,
        email: email,
        password: password,
      });

      console.log("Signup successful:", data);

      setMessage("Account created successfully!");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* left side */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white p-10">
        <Image
          src="/final_logo.webp"
          alt="OneCart logo"
          width={150}
          height={550}
        />

        <p className="text-xl mt-4 text-center">Everthing At One Place</p>

        <p className="mt-4 text-center text-white max-w-sm">
          Create your account and start shopping from thousands of products.
        </p>
      </div>

      {/* right section */}
      <div className="flex justify-center items-center bg-gray-100 px-4 sm:px-6 py-8 sm:py-0 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Create Account
          </h2>

          <p className="text-center text-gray-500 mt-2">Join OneCart today</p>

          {message && (
            <p className="text-green-600 text-center mt-4">{message}</p>
          )}

          {error && <p className="text-red-600 text-center mt-4">{error}</p>}

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            {/* Name */}

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={name}
                required
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter Your Email Id"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="create password"
                value={password}
                required
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                required
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-600 text-white py-3 rounded-lg
                            hover:bg-amber-400 transition font-semibold"
            >
              Create Account
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>

          <Link
            href={"/"}
            className="flex justify-center items-center text-xs text-black mt-1"
          >
            {/* <MoveLeft className="w-5 h-5"/> */}
            <span>Continue as Guest</span>
          </Link>
        </div>
      </div>
    </div>
  );
}