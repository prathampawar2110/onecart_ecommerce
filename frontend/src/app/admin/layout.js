// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";

// export default function AdminLayout({ children }) {

//     const router = useRouter();

//     const [checkingAdmin, setCheckingAdmin] = useState(true);
//     const [isAdmin, setIsAdmin] = useState(false);

//     // -------------------------------------------------------------------
//     // Check Admin Authentication
//     // -------------------------------------------------------------------

//     useEffect(() => {

//         async function checkAdmin() {

//             const token = localStorage.getItem("access_token");

//             // No login
//             if (!token) {
//                 router.replace("/login");
//                 return;
//             }

//             try {

//                 const response = await fetch(
//                     "http://127.0.0.1:8000/users/me",
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 if (!response.ok) {
//                     throw new Error("Authentication failed");
//                 }

//                 const user = await response.json();

//                 console.log("Admin Layout User:", user);

//                 // Check Role
//                 if (user.role !== "admin") {
//                     router.replace("/");
//                     return;
//                 }

//                 setIsAdmin(true);

//             } catch (error) {

//                 console.error("Admin Authentication Error:", error);

//                 localStorage.removeItem("access_token");

//                 router.replace("/login");

//             } finally {

//                 setCheckingAdmin(false);

//             }
//         }

//         checkAdmin();

//     }, [router]);


//     // -------------------------------------------------------------------
//     // Checking Admin
//     // -------------------------------------------------------------------

//     if (checkingAdmin) {

//         return (
//             <div className="min-h-screen flex justify-center items-center bg-gray-100">
//                 <p className="text-xl text-gray-600">
//                     Checking admin access...
//                 </p>
//             </div>
//         );
//     }


//     // -------------------------------------------------------------------
//     // Not Admin
//     // -------------------------------------------------------------------

//     if (!isAdmin) {
//         return null;
//     }


//     // -------------------------------------------------------------------
//     // Admin Layout
//     // -------------------------------------------------------------------

//     return (
//     <div className="min-h-screen w-full">

//         {/* Admin Sidebar */}
//         <AdminSidebar />

//         {/* Admin Main Content */}
//         <main
//             className="
//                 ml-16
//                 sm:ml-60

//                 min-w-0
//                 overflow-x-hidden

//                 min-h-screen
//             "
//         >
//             {children}
//         </main>

//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";

export default function AdminLayout({ children }) {

    const router = useRouter();

    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // -------------------------------------------------------------------
    // Check Admin Authentication
    // -------------------------------------------------------------------

    useEffect(() => {

        let isMounted = true;

        async function checkAdmin() {

            const token = localStorage.getItem("access_token");

            // No login
            if (!token) {
                router.replace("/login");
                return;
            }

            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/users/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Authentication failed");
                }

                const user = await response.json();

                // Check Role
                if (user.role !== "admin") {
                    router.replace("/");
                    return;
                }

                if (isMounted) {
                    setIsAdmin(true);
                    setCheckingAdmin(false);
                }

            } catch (error) {

                console.error("Admin Authentication Error:", error);

                localStorage.removeItem("access_token");

                router.replace("/login");
            }
        }

        checkAdmin();

        return () => {
            isMounted = false;
        };

    }, [router]);


    // -------------------------------------------------------------------
    // Checking Admin
    // -------------------------------------------------------------------

    if (checkingAdmin) {

        return (
            <div className="min-h-screen bg-gray-100">
                <div className="fixed left-0 top-0 bottom-0 w-16 sm:w-60 bg-white shadow-lg" />
                <main className="ml-16 sm:ml-60 min-h-screen p-4 sm:p-6 lg:p-8">
                    <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="h-28 rounded-xl bg-white shadow-sm animate-pulse"
                            />
                        ))}
                    </div>
                </main>
            </div>
        );
    }


    // -------------------------------------------------------------------
    // Not Admin
    // -------------------------------------------------------------------

    if (!isAdmin) {
        return null;
    }


    // -------------------------------------------------------------------
    // Admin Layout
    // -------------------------------------------------------------------

    return (
    <div className="min-h-screen w-full">

        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Admin Main Content */}
        <main
            className="
                ml-16
                sm:ml-60

                min-w-0
                overflow-x-hidden

                min-h-screen
            "
        >
            {children}
        </main>

    </div>
  );
}