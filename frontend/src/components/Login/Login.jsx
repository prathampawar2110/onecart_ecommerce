"use client"

import Link from "next/link"
import Image from "next/image";
import { useState } from "react";
import { loginUser } from "@/services/authServices";
// import { Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";

export default function Login() {
    const [ email , setEmail ] = useState("");
    const [ password , setPassword ] = useState("");

    const [ message , setMessage ] = useState("");
    const [ error , setError ] = useState("");

    const router = useRouter();
    
// ---------------------------------------------------------------------------------------------------------------------------------
    async function handleLogin (event) {
        event.preventDefault();

        setMessage("");
        setError("");

        try{
            // Login
            const data = await loginUser(
                {
                    email : email,
                    password : password
                }
            );
            console.log("Login Successful : " ,data);

            //We store the JWT after login so we can reuse it for protected operations like Cart, Wishlist, Orders, and Profile.
            localStorage.setItem( "access_token" , data.access_token );      
            
            // This tells both: CartContext WishlistContext that a new user has logged in.
            window.dispatchEvent(new Event("auth-change"));

            // Get Logged-in user
            const response = await fetch(
                "http://127.0.0.1:8000/users/me" , 
                {
                    method : "GET",
                    headers : {
                        Authorization : `Bearer ${data.access_token}`
                    }
                }
            );

            if ( !response.ok ) {
                throw new Error("Failed to Get User Information")
            }

            const user = await response.json();
            console.log("Logged User : ",user);

            // Check User Role
            if ( user.role === "admin") {
                //Admin -> Admin Dashboard
                router.push("/admin");
            } else {
                // Customer -> Home Page
                router.push("/");
            }

            setMessage("Login Successful : ");                                                            
        }
        catch (error) {
            console.error("Login error : ",error);
            // setError(error.message);
            if (error.message === "Invalid email or password") {
              setError("Wrong email or password.");
            } else if (error.message === "Failed to fetch") {
              setError("Unable to connect to server. Please try again.");
            } else {
              setError(error.message || "Login failed.");
            }
        }
    }

    // ---------------------------------------------------------------------------------------------------------------------------------

    return(
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

            {/* left section */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white p-10">
                    <Image
                        src="/final_logo.webp"
                        alt="OneCart logo"
                        height={550}
                        width={150}
                        className="mb-1"
                    />

                    <p className="text-xl mt-2 text-center">
                        Everthing At One Place
                    </p>

                    <p className="mt-7 text-center text-blue-100 max-w-sm">
                        Discover thousands of products with secure shopping,
                        fast delivery, and the best prices all in one place.
                    </p>

            </div>

            {/* right section */}
            <div className="flex justify-center items-center bg-gray-100 px-4 sm:px-6 md:px-8 sm:py-0 min-h-screen lg:min-h-0">

                <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">

                    <h2 className="text-3xl font-bold text-center text-gray-800">
                        Welcome Back
                    </h2>

                    <p className="text-center text-gray-500 mt-2">
                        Login to Your OneCart Account
                    </p>

                    {message && (
                        <p className="text-green-600 text-center mt-4">
                            {message}
                            </p>
                        )}
                        {error && (
                            <p className="text-red-600 text-center mt-4">
                                {error}
                            </p>
                        )}

                    <form onSubmit={handleLogin} className="mt-8 space-y-5">

                        {/* email */}
                        <div>
                            <label className="block mt-2 font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter Your Email"
                                value={email} onChange={ (event) => setEmail(event.target.value) }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>

                        {/* password */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter Your Password"
                                value={password} onChange={ (event) => setPassword(event.target.value) }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                             />
                        </div>

                        <button
                            type="submit" 
                            className="w-full bg-blue-600 text-white py-3 rounded-lg
                            hover:bg-amber-400 transition font-semibold cursor-pointer
                            ">
                            Login
                        </button>

                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        Don't have an account?
                        <Link 
                            href="/signup"
                            className="text-blue-600 font-semibold">
                            Sign Up
                        </Link>
                    </p>

                    <Link href={"/"} className="flex justify-center items-center text-xs text-black mt-1">
                        {/* <MoveLeft className="w-5 h-5"/> */}
                        <span>Continue as Guest</span>
                    </Link>

                </div>

            </div>

        </div>
    );
}