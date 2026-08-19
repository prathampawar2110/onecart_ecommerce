"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------------------------------------------------------
  // Check Admin Authentication
  // -------------------------------------------------------------------

  useEffect(() => {
    async function checkAdmin() {
      const token = localStorage.getItem("access_token");

      // No login
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const user = await response.json();

        console.log("Admin Layout User:", user);

        // -------------------------------------------------------------
        // Check Role
        // -------------------------------------------------------------

        if (user.role !== "admin") {
          router.replace("/");
          return;
        }

        // User is admin
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin Authentication Error:", error);

        localStorage.removeItem("access_token");

        router.replace("/login");
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdmin();
  }, [router]);

  // -------------------------------------------------------------------
  // Checking Admin
  // -------------------------------------------------------------------

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <p className="text-xl text-gray-600">
          Checking admin access...
        </p>
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
    <div className="min-h-screen">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-60">
        <Navbar />
      </div>

      {/* Admin Content Area */}
      <div className="pt-14 sm:pt-16">
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main
            className="
            flex-1
            ml-20
            sm:ml-64
            min-w-0
          "
          >
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <div className="ml-20 sm:ml-64">
        <Footer />
      </div>
    </div>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import Navbar from "@/components/Navbar/Navbar";
// import Footer from "@/components/Footer/Footer";
// import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";

// export default function AdminLayout({ children }) {
//   const router = useRouter();

//   const [checkingAdmin, setCheckingAdmin] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // -------------------------------------------------------------------
//   // Check Admin Authentication
//   // -------------------------------------------------------------------

//   useEffect(() => {
//     async function checkAdmin() {
//       const token = localStorage.getItem("access_token");

//       // No login
//       if (!token) {
//         router.replace("/login");
//         return;
//       }

//       try {
//         const response = await fetch("http://127.0.0.1:8000/users/me", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Authentication failed");
//         }

//         const user = await response.json();

//         console.log("Admin Layout User:", user);

//         // -------------------------------------------------------------
//         // Check Role
//         // -------------------------------------------------------------

//         if (user.role !== "admin") {
//           router.replace("/");
//           return;
//         }

//         // User is admin
//         setIsAdmin(true);
//       } catch (error) {
//         console.error("Admin Authentication Error:", error);

//         localStorage.removeItem("access_token");

//         router.replace("/login");
//       } finally {
//         setCheckingAdmin(false);
//       }
//     }

//     checkAdmin();
//   }, [router]);

//   // -------------------------------------------------------------------
//   // Checking Admin
//   // -------------------------------------------------------------------

//   if (checkingAdmin) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gray-100">
//         <p className="text-xl text-gray-600">
//           Checking admin access...
//         </p>
//       </div>
//     );
//   }

//   // -------------------------------------------------------------------
//   // Not Admin
//   // -------------------------------------------------------------------

//   if (!isAdmin) {
//     return null;
//   }

//   // -------------------------------------------------------------------
//   // Admin Layout
//   // -------------------------------------------------------------------

//   return (
//     <div className="min-h-screen flex flex-col">

//       {/* Navbar */}
//       <div className="fixed top-0 left-0 right-0 z-60">
//         <Navbar />
//       </div>
      

//       {/* Admin Area */}
//       <div className="flex flex-1 pt-14 sm:pt-16">

//         {/* Sidebar */}
//         <AdminSidebar />

//         {/* Admin Page */}
//         <main className="flex-1 ml-20 sm:ml-64">
//           {children}
//         </main>

//       </div>

//       {/* Footer */}
//       <Footer />

//     </div>
//   );
// }