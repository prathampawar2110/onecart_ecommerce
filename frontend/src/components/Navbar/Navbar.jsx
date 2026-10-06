// "use client";

// import {
//   Search,
//   ShoppingCart,
//   Heart,
//   CircleUserRound,
//   X,
//   ArrowRight,
//   LogOut,
//   User,
//   ShieldCheck,
//   Package,
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { searchProducts } from "@/services/productService";
// import { useCart } from "@/context/CartContext";
// import { useWishlist } from "@/context/WishListContext";

// export default function Navbar() {
//   const { cartItems } = useCart();
//   const { wishlistItems } = useWishlist();

//   const cartCount = cartItems.reduce(
//     (total, item) => total + (Number(item.quantity) || 1),
//     0
//   );
//   const wishlistCount = wishlistItems.length;

//   const [searchText, setSearchText] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(-1);
//   const [isSearching, setIsSearching] = useState(false);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [userName, setUserName] = useState("");
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [showLogoutPopup, setShowLogoutPopup] = useState(false);

//   const searchContainerRef = useRef(null);
//   const profileMenuRef = useRef(null);
//   const selectingResult = useRef(false);
//   const router = useRouter();

//   // Check login & user info
//   useEffect(() => {
//     async function checkAuth() {
//       const token = localStorage.getItem("access_token");
//       setIsLoggedIn(!!token);

//       if (token) {
//         try {
//           const res = await fetch("http://127.0.0.1:8000/users/me", {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (res.ok) {
//             const data = await res.json();
//             setUserRole(data.role);
//             setUserName(data.name || "");
//           }
//         } catch {
//           // Token might be invalid or network down
//         }
//       } else {
//         setUserRole(null);
//         setUserName("");
//       }
//     }

//     checkAuth();
//     window.addEventListener("auth-change", checkAuth);
//     return () => window.removeEventListener("auth-change", checkAuth);
//   }, []);

//   // Close dropdowns on outside click
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         searchContainerRef.current &&
//         !searchContainerRef.current.contains(event.target)
//       ) {
//         setShowResults(false);
//       }
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(event.target)
//       ) {
//         setShowProfileMenu(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Live search debounce
//   useEffect(() => {
//     if (!searchText.trim()) {
//       setSearchResults([]);
//       setShowResults(false);
//       setIsSearching(false);
//       return;
//     }

//     if (selectingResult.current) {
//       selectingResult.current = false;
//       return;
//     }

//     setIsSearching(true);
//     const timer = setTimeout(async () => {
//       try {
//         const results = await searchProducts(searchText.trim());
//         setSearchResults(Array.isArray(results) ? results : []);
//         setShowResults(true);
//         setSelectedIndex(-1);
//       } catch (error) {
//         console.error("Live search error:", error);
//         setSearchResults([]);
//         setShowResults(false);
//       } finally {
//         setIsSearching(false);
//       }
//     }, 280);

//     return () => clearTimeout(timer);
//   }, [searchText]);

//   function handleSearch(event) {
//     event.preventDefault();
//     if (!searchText.trim()) return;

//     setShowResults(false);
//     setSelectedIndex(-1);
//     router.push(`/search?query=${encodeURIComponent(searchText.trim())}`);
//   }

//   function handleSearchKeyDown(event) {
//     const visibleResults = searchResults.slice(0, 5);
//     if (!showResults || visibleResults.length === 0) return;

//     if (event.key === "ArrowDown") {
//       event.preventDefault();
//       setSelectedIndex((prev) =>
//         prev < visibleResults.length - 1 ? prev + 1 : 0
//       );
//     } else if (event.key === "ArrowUp") {
//       event.preventDefault();
//       setSelectedIndex((prev) =>
//         prev > 0 ? prev - 1 : visibleResults.length - 1
//       );
//     } else if (event.key === "Escape") {
//       setShowResults(false);
//       setSelectedIndex(-1);
//     } else if (event.key === "Enter" && selectedIndex >= 0) {
//       event.preventDefault();
//       const product = visibleResults[selectedIndex];
//       const uuid = product.productUuid || product._id;
//       if (uuid) {
//         setShowResults(false);
//         setSelectedIndex(-1);
//         router.push(`/products/${uuid}`);
//       }
//     }
//   }

//   function handleSearchResultClick(product) {
//     selectingResult.current = true;
//     setSearchText(product.name || "");
//     setShowResults(false);
//     setSelectedIndex(-1);
//     const uuid = product.productUuid || product._id;
//     if (uuid) {
//       router.push(`/products/${uuid}`);
//     }
//   }

//   function handleClearSearch() {
//     setSearchText("");
//     setSearchResults([]);
//     setShowResults(false);
//     setSelectedIndex(-1);
//   }

//   function handleLogout() {
//     localStorage.removeItem("access_token");
//     window.dispatchEvent(new Event("auth-change"));
//     setShowLogoutPopup(false);
//     setShowProfileMenu(false);
//     setIsLoggedIn(false);
//     setUserRole(null);
//     setUserName("");
//     router.push("/login");
//   }

//   function handleProtectedNavigation(path) {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       router.push("/login");
//       return;
//     }
//     router.push(path);
//   }

//   function formatPrice(val) {
//     return `₹${Number(val || 0).toLocaleString("en-IN")}`;
//   }

//   return (
//   <>
//     <nav
//       className="
//         sticky top-0 z-40
//         w-full
//         bg-blue-400
//         shadow-sm
//         px-3
//         sm:px-2
//         md:px-4
//         lg:px-5
//         xl:px-8
//         py-1
//         sm:py-1.5
//       "
//     >
//       <div
//         className="
//           w-full
//           max-w-[1600px]
//           mx-auto
//         "
//       >
//         {/* =====================================================
//             MAIN NAVBAR
//         ====================================================== */}
//         <div
//           className="
//             grid
//             grid-cols-[1fr_auto]
//             items-center
//             gap-2

//             md:grid-cols-[auto_minmax(300px,1fr)_auto]
//             md:gap-5
//           "
//         >
//           {/* ===================================================
//               LOGO
//           ==================================================== */}
//           <Link
//             href="/"
//             className="
//               shrink-0
//               justify-self-start
//               flex
//               items-center
//               group
//             "
//           >
//             <Image
//               src="/onecart_badge_logo.webp"
//               alt="OneCart"
//               width={180}
//               height={60}
//               priority
//               className="
//                 w-20
//                 sm:w-28
//                 md:w-32
//                 lg:w-36
//                 xl:w-40
//                 h-10
//                 sm:h-10
//                 md:h-11
//                 lg:h-12
//                 object-contain
//                 transition-transform
//                 duration-300
//                 group-hover:scale-105
//               "
//             />
//           </Link>

//           {/* ===================================================
//               DESKTOP SEARCH
//           ==================================================== */}
//           <div
//             ref={searchContainerRef}
//             className="
//               relative
//               hidden
//               md:block
//               w-full
//               max-w-2xl
//               justify-self-center
//             "
//           >
//             <form
//               onSubmit={handleSearch}
//               className="relative w-full"
//             >
//               {/* Search icon */}
//               <Search
//                 className="
//                   absolute
//                   left-3
//                   top-1/2
//                   -translate-y-1/2
//                   w-5
//                   h-5
//                   text-gray-400
//                   pointer-events-none
//                 "
//               />

//               {/* Search input */}
//               <input
//                 type="text"
//                 placeholder="Search for products..."
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 onFocus={() => {
//                   if (searchResults.length > 0) {
//                     setShowResults(true);
//                   }
//                 }}
//                 onKeyDown={handleSearchKeyDown}
//                 aria-label="Search products"
//                 aria-expanded={showResults}
//                 className="
//                   w-full
//                   pl-10
//                   pr-10
//                   py-2
//                   sm:py-2.5

//                   bg-white
//                   border
//                   border-orange-300

//                   rounded-lg

//                   text-sm
//                   sm:text-base
//                   text-black

//                   placeholder:text-gray-500

//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                   focus:border-blue-500

//                   transition
//                 "
//               />

//               {/* Clear search */}
//               {searchText && (
//                 <button
//                   type="button"
//                   onClick={handleClearSearch}
//                   className="
//                     absolute
//                     right-3
//                     top-1/2
//                     -translate-y-1/2

//                     p-1
//                     rounded-full

//                     text-gray-400
//                     hover:text-gray-700
//                     hover:bg-gray-100

//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               )}
//             </form>

//             {/* =================================================
//                 LIVE SEARCH RESULTS
//             ================================================== */}
//             {showResults && searchResults.length > 0 && (
//               <div
//                 className="
//                   absolute
//                   top-full
//                   left-0
//                   right-0
//                   mt-2

//                   bg-white
//                   border
//                   border-gray-200
//                   rounded-lg

//                   shadow-xl
//                   overflow-hidden

//                   z-50
//                 "
//               >
//                 {/* Header */}
//                 <div
//                   className="
//                     px-4
//                     py-2

//                     bg-gray-50
//                     border-b
//                     border-gray-100

//                     flex
//                     items-center
//                     justify-between

//                     text-xs
//                     font-semibold
//                     text-gray-500
//                   "
//                 >
//                   <span>Products found</span>

//                   <span className="hidden sm:inline">
//                     Use ↑ ↓ to navigate
//                   </span>
//                 </div>

//                 {/* Results */}
//                 <div
//                   className="
//                     max-h-72
//                     overflow-y-auto
//                   "
//                 >
//                   {searchResults.slice(0, 5).map((product, index) => {
//                     const uuid =
//                       product.productUuid || product._id;

//                     return (
//                       <div
//                         key={uuid || index}
//                         onClick={() =>
//                           handleSearchResultClick(product)
//                         }
//                         className={`
//                           flex
//                           items-center
//                           gap-3

//                           px-4
//                           py-3

//                           border-b
//                           border-gray-100

//                           cursor-pointer
//                           transition

//                           ${
//                             selectedIndex === index
//                               ? "bg-blue-100"
//                               : "hover:bg-gray-100"
//                           }
//                         `}
//                       >
//                         {/* Product image */}
//                         <div
//                           className="
//                             relative
//                             w-11
//                             h-11
//                             shrink-0

//                             rounded-lg

//                             bg-gray-50
//                             border
//                             border-gray-200

//                             overflow-hidden
//                           "
//                         >
//                           <Image
//                             src={
//                               product.image_url ||
//                               "/products/default.webp"
//                             }
//                             alt={product.name || "Product"}
//                             fill
//                             className="object-contain p-1"
//                           />
//                         </div>

//                         {/* Product information */}
//                         <div className="min-w-0 flex-1">
//                           <p
//                             className="
//                               font-medium
//                               text-black
//                               truncate
//                             "
//                           >
//                             {product.name}
//                           </p>

//                           <div className="flex items-center gap-2 mt-0.5">
//                             <span
//                               className="
//                                 text-xs
//                                 text-gray-400
//                                 truncate
//                               "
//                             >
//                               {product.category || "General"}
//                             </span>

//                             {product.price && (
//                               <span
//                                 className="
//                                   text-xs
//                                   font-bold
//                                   text-blue-600
//                                 "
//                               >
//                                 {formatPrice(product.price)}
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         <ArrowRight
//                           className="
//                             w-4
//                             h-4
//                             text-gray-300
//                             shrink-0
//                           "
//                         />
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* View all */}
//                 <button
//                   type="button"
//                   onClick={handleSearch}
//                   className="
//                     w-full
//                     px-4
//                     py-2.5

//                     bg-gray-50
//                     hover:bg-blue-50

//                     text-blue-600
//                     text-xs
//                     font-semibold

//                     border-t
//                     border-gray-100

//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   View all results for "{searchText}"
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* ===================================================
//               RIGHT SIDE
//           ==================================================== */}
//           <div
//             className="
//               justify-self-end
//               flex
//               items-center

//               gap-0
//               sm:gap-1
//               md:gap-2
//               lg:gap-3

//               shrink-0
//             "
//           >
//             {/* =================================================
//                 WISHLIST
//             ================================================== */}
//             <button
//               type="button"
//               aria-label="Wishlist"
//               onClick={() =>
//                 handleProtectedNavigation("/wishlist")
//               }
//               className="
//                 flex
//                 items-center
//                 justify-center
//                 gap-2

//                 px-1.5
//                 sm:px-3
//                 md:px-4

//                 py-2

//                 rounded-lg

//                 text-white

//                 hover:bg-yellow-500
//                 hover:text-black

//                 transition
//                 duration-300

//                 cursor-pointer
//               "
//             >
//               <div className="relative">
//                 <Heart className="w-5 h-5" />

//                 {wishlistCount > 0 && (
//                   <span
//                     className="
//                       absolute
//                       -top-2
//                       -right-2

//                       min-w-4
//                       h-4
//                       px-1

//                       flex
//                       items-center
//                       justify-center

//                       bg-red-500
//                       text-white

//                       text-[10px]
//                       font-bold

//                       rounded-full

//                       border-2
//                       border-blue-400
//                     "
//                   >
//                     {wishlistCount}
//                   </span>
//                 )}
//               </div>

//               <span className="hidden lg:inline text-sm">
//                 Wishlist
//               </span>
//             </button>

//             {/* =================================================
//                 CART
//             ================================================== */}
//             <button
//               type="button"
//               aria-label="Shopping Cart"
//               onClick={() =>
//                 handleProtectedNavigation("/cart")
//               }
//               className="
//                 flex
//                 items-center
//                 justify-center
//                 gap-2

//                 px-1.5
//                 sm:px-3
//                 md:px-4

//                 py-2

//                 rounded-lg

//                 text-white

//                 hover:bg-yellow-500
//                 hover:text-black

//                 transition
//                 duration-300

//                 cursor-pointer
//               "
//             >
//               <div className="relative">
//                 <ShoppingCart className="w-5 h-5" />

//                 {cartCount > 0 && (
//                   <span
//                     className="
//                       absolute
//                       -top-2
//                       -right-2

//                       min-w-4
//                       h-4
//                       px-1

//                       flex
//                       items-center
//                       justify-center

//                       bg-red-500
//                       text-white

//                       text-[10px]
//                       font-bold

//                       rounded-full

//                       border-2
//                       border-blue-400
//                     "
//                   >
//                     {cartCount}
//                   </span>
//                 )}
//               </div>

//               <span className="hidden md:inline text-sm">
//                 Cart
//               </span>
//             </button>

//             {/* =================================================
//                 PROFILE
//             ================================================== */}
//             <div
//               ref={profileMenuRef}
//               className="relative"
//             >
//               <button
//                 type="button"
//                 aria-label="Account Menu"
//                 onClick={() =>
//                   setShowProfileMenu((prev) => !prev)
//                 }
//                 className="
//                   flex
//                   items-center
//                   justify-center
//                   gap-2

//                   px-1.5
//                   sm:px-3
//                   md:px-4

//                   py-2

//                   rounded-lg

//                   text-white

//                   hover:bg-yellow-500
//                   hover:text-black

//                   transition
//                   duration-300

//                   cursor-pointer
//                 "
//               >
//                 <div className="relative">
//                   <CircleUserRound className="w-5 h-5" />

//                   {isLoggedIn && (
//                     <span
//                       className="
//                         absolute
//                         -top-1
//                         -right-1

//                         w-2.5
//                         h-2.5

//                         bg-green-500

//                         border-2
//                         border-blue-400

//                         rounded-full
//                       "
//                     />
//                   )}
//                 </div>

//                 <span className="hidden md:inline text-sm">
//                   {isLoggedIn && userName
//                     ? userName.split(" ")[0]
//                     : "Profile"}
//                 </span>
//               </button>

//               {/* =================================================
//                   PROFILE DROPDOWN
//               ================================================== */}
//               {showProfileMenu && (
//                 <div
//                   className="
//                     absolute
//                     right-0
//                     top-full
//                     mt-2

//                     w-52

//                     bg-white

//                     rounded-lg

//                     shadow-xl

//                     border
//                     border-gray-200

//                     z-50

//                     overflow-hidden
//                   "
//                 >
//                   {/* User info */}
//                   <div
//                     className="
//                       px-4
//                       py-3

//                       bg-gray-50
//                       border-b
//                       border-gray-100
//                     "
//                   >
//                     <p className="text-xs text-gray-400">
//                       {isLoggedIn
//                         ? "Signed in as"
//                         : "Welcome to OneCart"}
//                     </p>

//                     <p
//                       className="
//                         text-sm
//                         font-bold
//                         text-gray-800
//                         truncate
//                       "
//                     >
//                       {isLoggedIn
//                         ? userName || "My Account"
//                         : "Guest"}
//                     </p>
//                   </div>

//                   {/* Menu */}
//                   <div className="py-1">
//                     {isLoggedIn ? (
//                       <>
//                         {/* Profile */}
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowProfileMenu(false);
//                             router.push("/profile");
//                           }}
//                           className="
//                             w-full
//                             flex
//                             items-center
//                             gap-3

//                             px-4
//                             py-3

//                             text-left
//                             text-sm
//                             text-gray-700

//                             hover:bg-gray-100

//                             transition
//                             cursor-pointer
//                           "
//                         >
//                           <User className="w-4 h-4 text-gray-400" />

//                           My Profile
//                         </button>

//                         {/* Orders */}
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowProfileMenu(false);
//                             router.push("/profile");
//                           }}
//                           className="
//                             w-full
//                             flex
//                             items-center
//                             gap-3

//                             px-4
//                             py-3

//                             text-left
//                             text-sm
//                             text-gray-700

//                             hover:bg-gray-100

//                             transition
//                             cursor-pointer
//                           "
//                         >
//                           <Package className="w-4 h-4 text-gray-400" />

//                           My Orders
//                         </button>

//                         {/* Admin */}
//                         {userRole === "admin" && (
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setShowProfileMenu(false);
//                               router.push("/admin");
//                             }}
//                             className="
//                               w-full
//                               flex
//                               items-center
//                               gap-3

//                               px-4
//                               py-3

//                               text-left
//                               text-sm
//                               font-semibold

//                               text-blue-600

//                               hover:bg-blue-50

//                               transition
//                               cursor-pointer
//                             "
//                           >
//                             <ShieldCheck className="w-4 h-4" />

//                             Admin Dashboard
//                           </button>
//                         )}
//                       </>
//                     ) : (
//                       <>
//                         {/* Sign In */}
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowProfileMenu(false);
//                             router.push("/login");
//                           }}
//                           className="
//                             w-full
//                             flex
//                             items-center
//                             gap-3

//                             px-4
//                             py-3

//                             text-left
//                             text-sm
//                             font-semibold

//                             text-blue-600

//                             hover:bg-blue-50

//                             transition
//                             cursor-pointer
//                           "
//                         >
//                           <User className="w-4 h-4" />

//                           Sign In
//                         </button>

//                         {/* Create Account */}
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowProfileMenu(false);
//                             router.push("/signup");
//                           }}
//                           className="
//                             w-full
//                             flex
//                             items-center
//                             gap-3

//                             px-4
//                             py-3

//                             text-left
//                             text-sm
//                             text-gray-700

//                             hover:bg-gray-100

//                             transition
//                             cursor-pointer
//                           "
//                         >
//                           Create Account
//                         </button>
//                       </>
//                     )}
//                   </div>

//                   {/* Logout */}
//                   {isLoggedIn && (
//                     <div className="border-t border-gray-100 py-1">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setShowProfileMenu(false);
//                           setShowLogoutPopup(true);
//                         }}
//                         className="
//                           w-full
//                           flex
//                           items-center
//                           gap-3

//                           px-4
//                           py-3

//                           text-left
//                           text-sm
//                           font-medium

//                           text-red-600

//                           hover:bg-red-50

//                           transition
//                           cursor-pointer
//                         "
//                       >
//                         <LogOut className="w-4 h-4" />

//                         Log Out
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* =====================================================
//             MOBILE SEARCH
//         ====================================================== */}
//         <div
//           ref={searchContainerRef}
//           className="
//             block
//             md:hidden
//             mt-1
//             pb-1
//             relative
//           "
//         >
//           <form
//             onSubmit={handleSearch}
//             className="relative w-full"
//           >
//             <Search
//               className="
//                 absolute
//                 left-3
//                 top-1/2
//                 -translate-y-1/2

//                 w-5
//                 h-5

//                 text-gray-400
//                 pointer-events-none
//               "
//             />

//             <input
//               type="text"
//               placeholder="Search for products..."
//               value={searchText}
//               onChange={(e) =>
//                 setSearchText(e.target.value)
//               }
//               onFocus={() => {
//                 if (searchResults.length > 0) {
//                   setShowResults(true);
//                 }
//               }}
//               onKeyDown={handleSearchKeyDown}
//               className="
//                 w-full

//                 pl-10
//                 pr-10
//                 py-2

//                 bg-white

//                 border
//                 border-orange-300

//                 rounded-lg

//                 text-sm
//                 text-black

//                 placeholder:text-gray-500

//                 focus:outline-none
//                 focus:ring-2
//                 focus:ring-blue-500

//                 transition
//               "
//             />

//             {searchText && (
//               <button
//                 type="button"
//                 onClick={handleClearSearch}
//                 className="
//                   absolute
//                   right-3
//                   top-1/2
//                   -translate-y-1/2

//                   text-gray-400
//                   hover:text-gray-700

//                   cursor-pointer
//                 "
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             )}
//           </form>

//           {/* Mobile search results */}
//           {showResults && searchResults.length > 0 && (
//             <div
//               className="
//                 absolute
//                 top-full
//                 left-0
//                 right-0
//                 mt-2

//                 bg-white

//                 border
//                 border-gray-200

//                 rounded-lg

//                 shadow-xl

//                 overflow-hidden

//                 z-50
//               "
//             >
//               {searchResults.slice(0, 5).map(
//                 (product, index) => {
//                   const uuid =
//                     product.productUuid ||
//                     product._id;

//                   return (
//                     <div
//                       key={uuid || index}
//                       onClick={() =>
//                         handleSearchResultClick(product)
//                       }
//                       className={`
//                         flex
//                         items-center
//                         gap-3

//                         px-4
//                         py-3

//                         border-b
//                         border-gray-100

//                         cursor-pointer

//                         ${
//                           selectedIndex === index
//                             ? "bg-blue-100"
//                             : "hover:bg-gray-100"
//                         }
//                       `}
//                     >
//                       <div
//                         className="
//                           relative
//                           w-10
//                           h-10
//                           shrink-0

//                           bg-gray-50

//                           rounded-lg

//                           overflow-hidden
//                         "
//                       >
//                         <Image
//                           src={
//                             product.image_url ||
//                             "/products/default.webp"
//                           }
//                           alt={
//                             product.name || "Product"
//                           }
//                           fill
//                           className="object-contain p-1"
//                         />
//                       </div>

//                       <div className="min-w-0">
//                         <p
//                           className="
//                             text-sm
//                             font-medium
//                             text-gray-800
//                             truncate
//                           "
//                         >
//                           {product.name}
//                         </p>

//                         <p
//                           className="
//                             text-xs
//                             text-gray-400
//                           "
//                         >
//                           {product.category ||
//                             "General"}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 }
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>

//     {/* =======================================================
//         LOGOUT CONFIRMATION MODAL
//     ======================================================== */}
//     {showLogoutPopup && (
//       <div
//         className="
//           fixed
//           inset-0
//           z-100

//           flex
//           items-center
//           justify-center

//           bg-black/50
//           backdrop-blur-sm

//           px-4
//         "
//       >
//         <div
//           className="
//             w-full
//             max-w-sm

//             bg-white

//             rounded-xl

//             shadow-2xl

//             p-6
//           "
//         >
//           {/* Icon */}
//           <div
//             className="
//               w-12
//               h-12

//               mx-auto
//               mb-4

//               flex
//               items-center
//               justify-center

//               rounded-full

//               bg-red-100
//               text-red-600
//             "
//           >
//             <LogOut className="w-6 h-6" />
//           </div>

//           {/* Title */}
//           <h3
//             className="
//               text-lg
//               font-bold
//               text-gray-800
//               text-center
//             "
//           >
//             Log out of OneCart?
//           </h3>

//           {/* Message */}
//           <p
//             className="
//               mt-2

//               text-sm
//               text-gray-500
//               text-center
//             "
//           >
//             You can log back in anytime with your
//             credentials.
//           </p>

//           {/* Buttons */}
//           <div className="flex gap-3 mt-6">
//             <button
//               type="button"
//               onClick={() =>
//                 setShowLogoutPopup(false)
//               }
//               className="
//                 flex-1

//                 px-4
//                 py-2.5

//                 rounded-lg

//                 border
//                 border-gray-300

//                 text-gray-700
//                 font-semibold

//                 hover:bg-gray-100

//                 transition

//                 cursor-pointer
//               "
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               onClick={handleLogout}
//               className="
//                 flex-1

//                 px-4
//                 py-2.5

//                 rounded-lg

//                 bg-red-500
//                 text-white

//                 font-semibold

//                 hover:bg-red-600

//                 transition

//                 cursor-pointer
//               "
//             >
//               Log Out
//             </button>
//           </div>
//         </div>
//       </div>
//     )}
//   </>
// );
  
// }

"use client";

import {
  Search,
  ShoppingCart,
  Heart,
  CircleUserRound,
  X,
  ArrowRight,
  LogOut,
  User,
  ShieldCheck,
  Package,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { searchProducts } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishListContext";

export default function Navbar() {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );

  const wishlistCount = wishlistItems.length;

  // =========================================================
  // SEARCH STATES
  // =========================================================

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  // =========================================================
  // AUTH STATES
  // =========================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // =========================================================
  // REFS
  // =========================================================

  // Separate refs for desktop and mobile search
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const profileMenuRef = useRef(null);

  const selectingResult = useRef(false);

  const router = useRouter();

  // =========================================================
  // CHECK LOGIN & USER INFORMATION
  // =========================================================

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("access_token");

      setIsLoggedIn(!!token);

      if (token) {
        try {
          const res = await fetch(
            "http://127.0.0.1:8000/users/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.ok) {
            const data = await res.json();

            setUserRole(data.role);
            setUserName(data.name || "");
          }
        } catch (error) {
          console.error("Auth check error:", error);
        }
      } else {
        setUserRole(null);
        setUserName("");
      }
    }

    checkAuth();

    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  // =========================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideDesktopSearch =
        desktopSearchRef.current?.contains(event.target);

      const clickedInsideMobileSearch =
        mobileSearchRef.current?.contains(event.target);

      const clickedInsideProfile =
        profileMenuRef.current?.contains(event.target);

      if (!clickedInsideDesktopSearch && !clickedInsideMobileSearch) {
        setShowResults(false);
      }

      if (!clickedInsideProfile) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // LIVE SEARCH WITH DEBOUNCE
  // =========================================================

  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    if (selectingResult.current) {
      selectingResult.current = false;
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchProducts(searchText.trim());

        setSearchResults(Array.isArray(results) ? results : []);

        setShowResults(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Live search error:", error);

        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchText]);

  // =========================================================
  // SEARCH SUBMIT
  // =========================================================

  function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) return;

    setShowResults(false);
    setSelectedIndex(-1);

    router.push(`/search?query=${encodeURIComponent(query)}`);
  }

  // =========================================================
  // SEARCH KEYBOARD NAVIGATION
  // =========================================================

  function handleSearchKeyDown(event) {
    const visibleResults = searchResults.slice(0, 5);

    // Escape should always work
    if (event.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
      return;
    }

    if (!showResults || visibleResults.length === 0) {
      return;
    }

    // Arrow Down
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((prev) =>
        prev < visibleResults.length - 1 ? prev + 1 : 0
      );
    }

    // Arrow Up
    else if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : visibleResults.length - 1
      );
    }

    // Enter selected product
    else if (event.key === "Enter" && selectedIndex >= 0) {
      event.preventDefault();

      const product = visibleResults[selectedIndex];

      const uuid = product.productUuid || product._id;

      if (uuid) {
        setShowResults(false);
        setSelectedIndex(-1);

        router.push(`/products/${uuid}`);
      }
    }
  }

  // =========================================================
  // SEARCH RESULT CLICK
  // =========================================================

  function handleSearchResultClick(product) {
    selectingResult.current = true;

    setSearchText(product.name || "");
    setShowResults(false);
    setSelectedIndex(-1);

    const uuid = product.productUuid || product._id;

    if (uuid) {
      router.push(`/products/${uuid}`);
    }
  }

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  function handleClearSearch() {
    setSearchText("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    localStorage.removeItem("access_token");

    window.dispatchEvent(new Event("auth-change"));

    setShowLogoutPopup(false);
    setShowProfileMenu(false);

    setIsLoggedIn(false);
    setUserRole(null);
    setUserName("");

    router.push("/login");
  }

  // =========================================================
  // PROTECTED NAVIGATION
  // =========================================================

  function handleProtectedNavigation(path) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    router.push(path);
  }

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  function formatPrice(val) {
    return `₹${Number(val || 0).toLocaleString("en-IN")}`;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className="
          sticky top-0 z-40
          w-full
          bg-blue-400
          shadow-sm
          px-3
          sm:px-2
          md:px-4
          lg:px-5
          xl:px-8
          py-1
          sm:py-1.5
        "
      >
        <div
          className="
            w-full
            max-w-[1600px]
            mx-auto
          "
        >
          {/* =================================================
              MAIN NAVBAR
          ================================================== */}

          <div
            className="
              grid
              grid-cols-[1fr_auto]
              items-center
              gap-2
              md:grid-cols-[auto_minmax(300px,1fr)_auto]
              md:gap-5
            "
          >
            {/* =================================================
                LOGO
            ================================================== */}

            <Link
              href="/"
              className="
                shrink-0
                justify-self-start
                flex
                items-center
                group
              "
            >
              <Image
                src="/onecart_badge_logo.webp"
                alt="OneCart"
                width={180}
                height={60}
                priority
                className="
                  w-20
                  sm:w-28
                  md:w-32
                  lg:w-36
                  xl:w-40
                  h-10
                  sm:h-10
                  md:h-11
                  lg:h-12
                  object-contain
                  transition-transform
                  duration-300
                  group-hover:scale-105
                "
              />
            </Link>

            {/* =================================================
                DESKTOP SEARCH
            ================================================== */}

            <div
              ref={desktopSearchRef}
              className="
                relative
                hidden
                md:block
                w-full
                max-w-2xl
                justify-self-center
              "
            >
              <form
                onSubmit={handleSearch}
                className="relative w-full"
              >
                
                {/* Search input */}

                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search products"
                  aria-expanded={showResults}
                  className="
                    w-full
                    pl-4
                    pr-20
                    py-2
                    sm:py-2.5
                    bg-white
                    border
                    border-orange-300
                    rounded-lg
                    text-sm
                    sm:text-base
                    text-black
                    placeholder:text-gray-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    transition
                  "
                />

                {/* Clear button */}

                {searchText && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="
                      absolute
                      right-10
                      top-1/2
                      -translate-y-1/2
                      p-1
                      rounded-full
                      text-gray-400
                      hover:text-gray-700
                      hover:bg-gray-100
                      transition
                      cursor-pointer
                    "
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* =================================================
                    SEARCH BUTTON
                    THIS FIXES MOUSE CLICK SEARCH
                ================================================== */}

                <button
                  type="submit"
                  aria-label="Search"
                  className="
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    p-1.5
                    rounded-full
                    text-blue-600
                    hover:bg-blue-100
                    hover:text-blue-800
                    transition
                    cursor-pointer
                  "
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* =================================================
                  DESKTOP LIVE SEARCH RESULTS
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
                    border-gray-200
                    rounded-lg
                    shadow-xl
                    overflow-hidden
                    z-50
                  "
                >
                  {/* Header */}

                  <div
                    className="
                      px-4
                      py-2
                      bg-gray-50
                      border-b
                      border-gray-100
                      flex
                      items-center
                      justify-between
                      text-xs
                      font-semibold
                      text-gray-500
                    "
                  >
                    <span>Products found</span>

                    <span className="hidden sm:inline">
                      Use ↑ ↓ to navigate
                    </span>
                  </div>

                  {/* Results */}

                  <div className="max-h-72 overflow-y-auto">
                    {searchResults
                      .slice(0, 5)
                      .map((product, index) => {
                        const uuid =
                          product.productUuid || product._id;

                        return (
                          <div
                            key={uuid || index}
                            onClick={() =>
                              handleSearchResultClick(product)
                            }
                            className={`
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                              border-b
                              border-gray-100
                              cursor-pointer
                              transition
                              ${
                                selectedIndex === index
                                  ? "bg-blue-100"
                                  : "hover:bg-gray-100"
                              }
                            `}
                          >
                            {/* Product image */}

                            <div
                              className="
                                relative
                                w-11
                                h-11
                                shrink-0
                                rounded-lg
                                bg-gray-50
                                border
                                border-gray-200
                                overflow-hidden
                              "
                            >
                              <Image
                                src={
                                  product.image_url ||
                                  "/products/default.webp"
                                }
                                alt={
                                  product.name || "Product"
                                }
                                fill
                                className="object-contain p-1"
                              />
                            </div>

                            {/* Product information */}

                            <div className="min-w-0 flex-1">
                              <p
                                className="
                                  font-medium
                                  text-black
                                  truncate
                                "
                              >
                                {product.name}
                              </p>

                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className="
                                    text-xs
                                    text-gray-400
                                    truncate
                                  "
                                >
                                  {product.category ||
                                    "General"}
                                </span>

                                {product.price && (
                                  <span
                                    className="
                                      text-xs
                                      font-bold
                                      text-blue-600
                                    "
                                  >
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <ArrowRight
                              className="
                                w-4
                                h-4
                                text-gray-300
                                shrink-0
                              "
                            />
                          </div>
                        );
                      })}
                  </div>

                  {/* View all */}

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="
                      w-full
                      px-4
                      py-2.5
                      bg-gray-50
                      hover:bg-blue-50
                      text-blue-600
                      text-xs
                      font-semibold
                      border-t
                      border-gray-100
                      transition
                      cursor-pointer
                    "
                  >
                    View all results for "{searchText}"
                  </button>
                </div>
              )}
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

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
              {/* =================================================
                  WISHLIST
              ================================================== */}

              <button
                type="button"
                aria-label="Wishlist"
                onClick={() =>
                  handleProtectedNavigation("/wishlist")
                }
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
                  <Heart className="w-5 h-5" />

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

                <span className="hidden lg:inline text-sm">
                  Wishlist
                </span>
              </button>

              {/* =================================================
                  CART
              ================================================== */}

              <button
                type="button"
                aria-label="Shopping Cart"
                onClick={() =>
                  handleProtectedNavigation("/cart")
                }
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

                <span className="hidden md:inline text-sm">
                  Cart
                </span>
              </button>

              {/* =================================================
                  PROFILE
              ================================================== */}

              <div
                ref={profileMenuRef}
                className="relative"
              >
                <button
                  type="button"
                  aria-label="Account Menu"
                  onClick={() =>
                    setShowProfileMenu((prev) => !prev)
                  }
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
                          border-blue-400
                          rounded-full
                        "
                      />
                    )}
                  </div>

                  <span className="hidden md:inline text-sm">
                    {isLoggedIn && userName
                      ? userName.split(" ")[0]
                      : "Profile"}
                  </span>
                </button>

                {/* =================================================
                    PROFILE DROPDOWN
                ================================================== */}

                {showProfileMenu && (
                  <div
                    className="
                      absolute
                      right-0
                      top-full
                      mt-2
                      w-52
                      bg-white
                      rounded-lg
                      shadow-xl
                      border
                      border-gray-200
                      z-50
                      overflow-hidden
                    "
                  >
                    {/* User information */}

                    <div
                      className="
                        px-4
                        py-3
                        bg-gray-50
                        border-b
                        border-gray-100
                      "
                    >
                      <p className="text-xs text-gray-400">
                        {isLoggedIn
                          ? "Signed in as"
                          : "Welcome to OneCart"}
                      </p>

                      <p
                        className="
                          text-sm
                          font-bold
                          text-gray-800
                          truncate
                        "
                      >
                        {isLoggedIn
                          ? userName || "My Account"
                          : "Guest"}
                      </p>
                    </div>

                    {/* Menu */}

                    <div className="py-1">
                      {isLoggedIn ? (
                        <>
                          {/* Profile */}

                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              router.push("/profile");
                            }}
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-left
                              text-sm
                              text-gray-700
                              hover:bg-gray-100
                              transition
                              cursor-pointer
                            "
                          >
                            <User className="w-4 h-4 text-gray-400" />

                            My Profile
                          </button>

                          {/* Orders */}

                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              router.push("/profile");
                            }}
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-left
                              text-sm
                              text-gray-700
                              hover:bg-gray-100
                              transition
                              cursor-pointer
                            "
                          >
                            <Package className="w-4 h-4 text-gray-400" />

                            My Orders
                          </button>

                          {/* Admin */}

                          {userRole === "admin" && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowProfileMenu(false);
                                router.push("/admin");
                              }}
                              className="
                                w-full
                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                text-left
                                text-sm
                                font-semibold
                                text-blue-600
                                hover:bg-blue-50
                                transition
                                cursor-pointer
                              "
                            >
                              <ShieldCheck className="w-4 h-4" />

                              Admin Dashboard
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Sign In */}

                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              router.push("/login");
                            }}
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-left
                              text-sm
                              font-semibold
                              text-blue-600
                              hover:bg-blue-50
                              transition
                              cursor-pointer
                            "
                          >
                            <User className="w-4 h-4" />

                            Sign In
                          </button>

                          {/* Create Account */}

                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              router.push("/signup");
                            }}
                            className="
                              w-full
                              flex
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-left
                              text-sm
                              text-gray-700
                              hover:bg-gray-100
                              transition
                              cursor-pointer
                            "
                          >
                            Create Account
                          </button>
                        </>
                      )}
                    </div>

                    {/* Logout */}

                    {isLoggedIn && (
                      <div className="border-t border-gray-100 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            setShowLogoutPopup(true);
                          }}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            text-left
                            text-sm
                            font-medium
                            text-red-600
                            hover:bg-red-50
                            transition
                            cursor-pointer
                          "
                        >
                          <LogOut className="w-4 h-4" />

                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              MOBILE SEARCH
          ====================================================== */}

          <div
            ref={mobileSearchRef}
            className="
              block
              md:hidden
              mt-1
              pb-1
              relative
            "
          >
            <form
              onSubmit={handleSearch}
              className="relative w-full"
            >
              {/* Search icon */}

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

              {/* Search input */}

              <input
                type="text"
                placeholder="Search for products..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                className="
                  w-full
                  pl-10
                  pr-20
                  py-2
                  bg-white
                  border
                  border-orange-300
                  rounded-lg
                  text-sm
                  text-black
                  placeholder:text-gray-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  transition
                "
              />

              {/* Clear button */}

              {searchText && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="
                    absolute
                    right-10
                    top-1/2
                    -translate-y-1/2
                    p-1
                    rounded-full
                    text-gray-400
                    hover:text-gray-700
                    hover:bg-gray-100
                    transition
                    cursor-pointer
                  "
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* =================================================
                  MOBILE SEARCH BUTTON
              ================================================== */}

              <button
                type="submit"
                aria-label="Search"
                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  p-1.5
                  rounded-full
                  text-blue-600
                  hover:bg-blue-100
                  hover:text-blue-800
                  transition
                  cursor-pointer
                "
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* =================================================
                MOBILE SEARCH RESULTS
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
                  border-gray-200
                  rounded-lg
                  shadow-xl
                  overflow-hidden
                  z-50
                "
              >
                {searchResults.slice(0, 5).map(
                  (product, index) => {
                    const uuid =
                      product.productUuid || product._id;

                    return (
                      <div
                        key={uuid || index}
                        onClick={() =>
                          handleSearchResultClick(product)
                        }
                        className={`
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          border-b
                          border-gray-100
                          cursor-pointer
                          ${
                            selectedIndex === index
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }
                        `}
                      >
                        {/* Product image */}

                        <div
                          className="
                            relative
                            w-10
                            h-10
                            shrink-0
                            bg-gray-50
                            rounded-lg
                            overflow-hidden
                          "
                        >
                          <Image
                            src={
                              product.image_url ||
                              "/products/default.webp"
                            }
                            alt={
                              product.name || "Product"
                            }
                            fill
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Product information */}

                        <div className="min-w-0">
                          <p
                            className="
                              text-sm
                              font-medium
                              text-gray-800
                              truncate
                            "
                          >
                            {product.name}
                          </p>

                          <p
                            className="
                              text-xs
                              text-gray-400
                            "
                          >
                            {product.category ||
                              "General"}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}

                {/* View all results */}

                <button
                  type="button"
                  onClick={handleSearch}
                  className="
                    w-full
                    px-4
                    py-2.5
                    bg-gray-50
                    hover:bg-blue-50
                    text-blue-600
                    text-xs
                    font-semibold
                    border-t
                    border-gray-100
                    transition
                    cursor-pointer
                  "
                >
                  View all results for "{searchText}"
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* =======================================================
          LOGOUT CONFIRMATION MODAL
      ======================================================== */}

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
            backdrop-blur-sm
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
            {/* Icon */}

            <div
              className="
                w-12
                h-12
                mx-auto
                mb-4
                flex
                items-center
                justify-center
                rounded-full
                bg-red-100
                text-red-600
              "
            >
              <LogOut className="w-6 h-6" />
            </div>

            {/* Title */}

            <h3
              className="
                text-lg
                font-bold
                text-gray-800
                text-center
              "
            >
              Log out of OneCart?
            </h3>

            {/* Message */}

            <p
              className="
                mt-2
                text-sm
                text-gray-500
                text-center
              "
            >
              You can log back in anytime with your
              credentials.
            </p>

            {/* Buttons */}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setShowLogoutPopup(false)
                }
                className="
                  flex-1
                  px-4
                  py-2.5
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-700
                  font-semibold
                  hover:bg-gray-100
                  transition
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex-1
                  px-4
                  py-2.5
                  rounded-lg
                  bg-red-500
                  text-white
                  font-semibold
                  hover:bg-red-600
                  transition
                  cursor-pointer
                "
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}