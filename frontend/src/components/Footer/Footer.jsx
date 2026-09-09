"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="py-7 grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              {/* <Image
                src="/final_logo.webp"
                alt="OneCart"
                width={120}
                height={38}
                className="h-9 w-auto object-contain"
              /> */}
              <h1>OneCart</h1>
            </Link>

            <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-xs">
              Your one-stop destination for genuine products,
              great prices, and reliable delivery across India.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 mt-3">

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-md bg-slate-900 hover:bg-slate-800
                text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 rounded-md bg-slate-900 hover:bg-slate-800
                text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-7 h-7 rounded-md bg-slate-900 hover:bg-slate-800
                text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>

            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Top Categories
            </h4>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-400">
              <Link
                href="/search?category=Smartphones"
                className="hover:text-white transition"
              >
                Smartphones
              </Link>

              <Link
                href="/search?category=Electronics"
                className="hover:text-white transition"
              >
                Electronics
              </Link>

              <Link
                href="/search?category=Fashion"
                className="hover:text-white transition"
              >
                Fashion
              </Link>

              <Link
                href="/search?category=Home%20Appliances"
                className="hover:text-white transition"
              >
                Home Appliances
              </Link>

              <Link
                href="/search?category=Sports"
                className="hover:text-white transition"
              >
                Sports
              </Link>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Customer Care
            </h4>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-400">
              <Link
                href="/profile"
                className="hover:text-white transition"
              >
                Track Orders
              </Link>

              <Link
                href="/cart"
                className="hover:text-white transition"
              >
                Shopping Cart
              </Link>

              <Link
                href="/wishlist"
                className="hover:text-white transition"
              >
                Wishlist
              </Link>

              <Link
                href="/profile"
                className="hover:text-white transition"
              >
                My Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">

          <p>
            © {new Date().getFullYear()} OneCart India. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">
              Privacy
            </span>

            <span className="hover:text-slate-300 cursor-pointer">
              Terms
            </span>

            <span className="hover:text-slate-300 cursor-pointer">
              Security
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}