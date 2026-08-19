"use client";

import { Search, ShoppingCart, Heart, CircleUserRound } from "lucide-react";

import Link from "next/link";
import Image from "next/image";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { searchProducts } from "@/services/productService";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishListContext";

export default function Navbar() {
  // ==========================================================
  // CART / WISHLIST
  // ==========================================================

  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const wishlistCount = wishlistItems.length;

  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // ==========================================================
  // LOGIN / PROFILE / LOGOUT STATE
  // ==========================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Profile dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Logout confirmation popup
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const selectingResult = useRef(false);

  // ==========================================================
  // ROUTER
  // ==========================================================

  const router = useRouter();

  // ==========================================================
  // CHECK LOGIN
  // ==========================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    setIsLoggedIn(!!token);
  }, []);

  // ==========================================================
  // LIVE SEARCH
  // ==========================================================

  useEffect(() => {
    if (!searchText || searchText.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // If user selected a result,
    // don't perform another search
    if (selectingResult.current) {
      selectingResult.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchProducts(searchText.trim());

        setSearchResults(results);

        // Show results while typing
        setShowResults(true);
      } catch (error) {
        console.error("Live search error:", error);

        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // ==========================================================
  // SEARCH SUBMIT
  // ==========================================================

  function handleSearch(event) {
    event.preventDefault();

    if (!searchText.trim()) {
      return;
    }

    setShowResults(false);

    router.push(
      `/search?query=${encodeURIComponent(searchText.trim())}`
    );
  }

  // ==========================================================
  // PROFILE NAVIGATION
  // ==========================================================

  async function handleProfileClick() {
    try {
      // Get JWT token stored during login
      const token = localStorage.getItem("access_token");

      // User is not logged in
      if (!token) {
        router.push("/login");
        return;
      }

      // Get logged-in user
      const response = await fetch(
        "http://127.0.0.1:8000/users/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const user = await response.json();

      console.log("Profile User:", user);

      // Check user role
      if (user.role === "admin") {
        // Admin → Admin Dashboard
        router.push("/admin");
      } else {
        // Customer → User Profile
        router.push("/profile");
      }
    } catch (error) {
      console.error("Profile navigation error:", error);

      router.push("/login");
    }
  }

  // ==========================================================
  // SEARCH RESULT CLICK
  // ==========================================================

  function handleSearchResultClick(product) {
    selectingResult.current = true;

    setSearchText(product.name || "");

    setSearchResults([]);

    setShowResults(false);
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {
    localStorage.removeItem("access_token");

    setShowLogoutPopup(false);

    setShowProfileMenu(false);

    setIsLoggedIn(false);

    router.push("/login");
  }

  // ==========================================================
  // NAVBAR
  // ==========================================================

  return (
    <nav
      className="
        w-full
        bg-blue-400
        shadow-sm
        px-3
        sm:px-4
        md:px-5
        lg:px-5
        xl:px-8
        py-1
        sm:py-1.5
      "
    >
      <div
        className="
          w-full
          grid

          /* Mobile */
          grid-cols-[1fr_auto]

          items-center
          gap-2

          /* Desktop */
          md:grid-cols-[1fr_auto_1fr]
          md:gap-4
        "
      >
        {/* ====================================================
            LOGO
        ===================================================== */}

        <Link
          href="/"
          className="
            shrink-0
            justify-self-start
            flex
            items-center
          "
        >
          <div className="flex items-center">
            <Image
              src="/onecart_badge_logo.webp"
              alt="OneCart Logo"
              width="180"
              height="120"
              priority
              className="
                w-20
                sm:w-32
                md:w-36
                lg:w-40

                h-12
                sm:h-10
                md:h-11
                lg:h-13

                object-contain

                hover:scale-105
                transition-transform
                duration-300
              "
            />
          </div>
        </Link>

        {/* ====================================================
            SEARCH BAR
        ===================================================== */}

        <form
          onSubmit={handleSearch}
          className="
            relative

            /* Mobile */
            col-span-2
            row-start-2
            w-full

            /* Desktop */
            md:col-span-1
            md:row-start-auto
            md:w-full
            
           lg:w-125
           xl:w-160
            md:justify-self-center
          "
        >
          <div className="relative">
            {/* Search Icon */}

            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2

                w-5
                h-5

                text-gray-400

                pointer-events-none
              "
            />

            {/* Search Input */}

            <input
              type="text"
              placeholder="Search for products..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="
                w-full

                pl-10
                pr-4

                py-1.5
                sm:py-2.5

                bg-white

                border
                border-orange-300

                rounded-lg

                focus:outline-none
                focus:ring-2
                focus:ring-blue-500

                placeholder:text-black

                text-black

                text-sm
                sm:text-base
              "
            />

            {/* =================================================
                LIVE SEARCH RESULTS
            ================================================== */}

            {showResults && searchResults.length > 0 && (
              <div
                className="
                  absolute

                  top-full
                  left-0
                  right-0

                  mt-2

                  bg-white

                  border
                  border-amber-200

                  rounded-lg

                  shadow-lg

                  z-50

                  overflow-hidden

                  max-h-72
                  overflow-y-auto
                "
              >
                {searchResults.slice(0, 5).map((product) => (
                  <Link
                    key={product.productUuid}
                    onClick={() =>
                      handleSearchResultClick(product)
                    }
                    href={`/products/${product.productUuid}`}
                    className="
                      flex
                      items-center
                      gap-3

                      px-4
                      py-3

                      hover:bg-gray-100

                      transition

                      border-b
                      border-gray-100

                      last:border-b-0
                    "
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-black truncate">
                        {product.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* ====================================================
            RIGHT SECTION
        ===================================================== */}

        <div
          className="
            justify-self-end

            flex
            items-center

            gap-0
            sm:gap-1
            md:gap-2
            lg:gap-3

            shrink-0
          "
        >
          {/* ==================================================
              WISHLIST
          =================================================== */}

          <Link href="/wishlist">
            <button
              aria-label="Wishlist"
              className="
                flex
                items-center
                justify-center

                gap-2

                px-1.5
                sm:px-3
                md:px-4

                py-2

                rounded-lg

                text-white

                hover:bg-yellow-500
                hover:text-black

                transition
                duration-300

                cursor-pointer
              "
            >
              <div className="relative">
                <Heart className="w-4 h-4" />

                {wishlistCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-2
                      -right-2

                      min-w-4
                      h-4
                      px-1

                      flex
                      items-center
                      justify-center

                      bg-red-500
                      text-white

                      text-[10px]
                      font-bold

                      rounded-full

                      border-2
                      border-blue-400
                    "
                  >
                    {wishlistCount}
                  </span>
                )}
              </div>

              <span className="hidden lg:inline">
                Wishlist
              </span>
            </button>
          </Link>

          {/* ==================================================
              CART
          =================================================== */}

          <Link href="/cart">
            <button
              aria-label="Cart"
              className="
                flex
                items-center
                justify-center

                gap-2

                px-1
                sm:px-3
                md:px-4

                py-2

                rounded-lg

                text-white

                hover:bg-yellow-500
                hover:text-black

                transition
                duration-300

                cursor-pointer
              "
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-2
                      -right-2

                      min-w-4
                      h-4
                      px-1

                      flex
                      items-center
                      justify-center

                      bg-red-500
                      text-white

                      text-[10px]
                      font-bold

                      rounded-full

                      border-2
                      border-blue-400
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </div>

              <span className="hidden md:inline">
                Cart
              </span>
            </button>
          </Link>

          {/* ==================================================
              PROFILE + PROFILE MENU
          =================================================== */}

          <div className="relative">
            {/* Profile Button */}

            <button
              onClick={() =>
                setShowProfileMenu((previous) => !previous)
              }
              aria-label="Profile"
              className="
                flex
                items-center
                justify-center

                gap-2

                px-1.5
                sm:px-3
                md:px-4

                py-2

                rounded-lg

                text-white

                hover:bg-yellow-500
                hover:text-black

                transition
                duration-300

                cursor-pointer
              "
            >
              <div className="relative">
                <CircleUserRound className="w-5 h-5" />

                {isLoggedIn && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1

                      w-2.5
                      h-2.5

                      bg-green-500

                      border-2
                      border-black

                      rounded-full
                    "
                  />
                )}
              </div>

              <span className="hidden md:inline">
                Profile
              </span>
            </button>

            {/* ==================================================
                PROFILE DROPDOWN
            =================================================== */}

            {showProfileMenu && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-2

                  w-48

                  bg-white

                  rounded-lg

                  shadow-lg

                  border
                  border-gray-200

                  z-60

                  overflow-hidden
                "
              >
                {/* Profile / Admin Dashboard */}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleProfileClick();
                  }}
                  className="
                    w-full

                    text-left

                    px-4
                    py-3

                    text-gray-700

                    hover:bg-gray-100

                    transition

                    cursor-pointer
                  "
                >
                  Profile
                </button>

                {/* Logout */}

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutPopup(true);
                    }}
                    className="
                      w-full

                      text-left

                      px-4
                      py-3

                      text-red-600

                      hover:bg-red-50

                      transition

                      cursor-pointer
                    "
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================================
          LOGOUT CONFIRMATION POPUP
      ========================================================== */}

      {showLogoutPopup && (
        <div
          className="
            fixed
            inset-0

            z-100

            flex
            items-center
            justify-center

            bg-black/50

            px-4
          "
        >
          <div
            className="
              w-full
              max-w-sm

              bg-white

              rounded-xl

              shadow-2xl

              p-6
            "
          >
            {/* Title */}

            <h2 className="text-xl font-bold text-gray-800">
              Logout
            </h2>

            {/* Message */}

            <p className="mt-2 text-gray-600">
              Are you sure you want to logout?
            </p>

            {/* Buttons */}

            <div className="flex gap-3 mt-6">
              {/* Cancel */}

              <button
                onClick={() => setShowLogoutPopup(false)}
                className="
                  flex-1

                  px-4
                  py-2.5

                  rounded-lg

                  border
                  border-gray-300

                  text-gray-700

                  hover:bg-gray-100

                  transition

                  cursor-pointer
                "
              >
                Cancel
              </button>

              {/* Confirm Logout */}

              <button
                onClick={handleLogout}
                className="
                  flex-1

                  px-4
                  py-2.5

                  rounded-lg

                  bg-red-500

                  text-white

                  hover:bg-red-600

                  transition

                  cursor-pointer
                "
              >
                Logout
              </button>
              
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}