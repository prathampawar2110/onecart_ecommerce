"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* ========================================================== */}
      {/* Main Footer */} 
      {/* ========================================================== */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-5
          sm:px-6
          lg:px-8
          py-10
          sm:py-12

          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4

          gap-8
          sm:gap-10
        "
      >
        {/* ======================================================== */}
        {/* Company */}
        {/* ======================================================== */}

        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">OneCart</h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Your one stop destination for all your shopping needs.
          </p>
        </div>

        {/* ======================================================== */}
        {/* Customer Service */}
        {/* ======================================================== */}

        <div>
          <h3 className="font-semibold text-lg mb-4">Customer Service</h3>

          <ul className="space-y-3 text-gray-400 text-sm sm:text-base">
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact Us
              </Link>
            </li>

            <li>
              <Link href="/returns" className="hover:text-white transition">
                Returns
              </Link>
            </li>

            <li>
              <Link href="/shipping" className="hover:text-white transition">
                Shipping Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* ======================================================== */}
        {/* Quick Links */}
        {/* ======================================================== */}

        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>

          <ul className="space-y-3 text-gray-400 text-sm sm:text-base">
            <li>
              <Link href="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>

            <li>
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link href="/terms" className="hover:text-white transition">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* ======================================================== */}
        {/* Social */}
        {/* ======================================================== */}

        <div>
          <h3 className="font-semibold text-lg mb-4">Follow Us</h3>

          <ul className="space-y-3 text-gray-400 text-sm sm:text-base">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Instagram
              </a>
            </li>

            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Facebook
              </a>
            </li>

            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ========================================================== */}
      {/* Copyright */}
      {/* ========================================================== */}

      <div
        className="
          border-t
          border-gray-700
          px-5
          py-4
          text-center
          text-gray-400
          text-sm
        "
      >
        © 2026 OneCart. All rights reserved.
      </div>
    </footer>
  );
}

// "use client"
// export default function Footer() {
//   return (
//     <footer className="bg-gray-900 text-white mt-10">

//       <div className="px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

//         {/* Company */}
//         <div>
//           <h2 className="text-xl font-bold mb-4">
//             OneCart
//           </h2>

//           <p className="text-gray-400">
//             Your one stop destination for all your shopping needs.
//           </p>
//         </div>

//         {/* Customer Service */}
//         <div>
//           <h3 className="font-semibold mb-4">
//             Customer Service
//           </h3>

//           <ul className="space-y-2 text-gray-400">
//             <li className="hover:text-white cursor-pointer">
//               Contact Us
//             </li>

//             <li className="hover:text-white cursor-pointer">
//               Returns
//             </li>

//             <li className="hover:text-white cursor-pointer">
//               Shipping Policy
//             </li>
//           </ul>
//         </div>

//         {/* Quick Links */}
//         <div>
//           <h3 className="font-semibold mb-4">
//             Quick Links
//           </h3>

//           <ul className="space-y-2 text-gray-400">
//             <li className="hover:text-white cursor-pointer">
//               About Us
//             </li>

//             <li className="hover:text-white cursor-pointer">
//               Privacy Policy
//             </li>

//             <li className="hover:text-white cursor-pointer">
//               Terms & Conditions
//             </li>
//           </ul>
//         </div>

//         {/* Social */}
//         <div>
//           <h3 className="font-semibold mb-4">
//             Follow Us
//           </h3>

//           <ul className="space-y-2 text-gray-400">
//             <li className="hover:text-white cursor-pointer" onClick={() => window.open("https://instagram.com", "_blank")}>
//               Instagram
//             </li>

//             <li className="hover:text-white cursor-pointer" onClick={() => window.open("https://facebook.com", "_blank")}>
//               Facebook
//             </li>

//             <li className="hover:text-white cursor-pointer" onClick={() => window.open("https://twitter.com", "_blank")}>
//               Twitter
//             </li>
//           </ul>
//         </div>

//       </div>

//       {/* Bottom Copyright */}
//       <div className="border-t border-gray-700 py-4 text-center text-gray-400">
//         © 2026 OneCart. All rights reserved.
//       </div>

//     </footer>
//   );
// }
