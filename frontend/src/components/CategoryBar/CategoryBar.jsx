"use client";

import {
  ShoppingBag, Smartphone, Laptop, WashingMachine, Shirt, Trophy, BookOpen, Dumbbell, Sparkles, Home, Tag,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCategories } from "@/services/categoryService";

// --------------------------------------------------
// Category Icons
// --------------------------------------------------

function getCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase();

  if (name.includes("smartphone") || name.includes("mobile")) {
    return Smartphone;
  }

  if (
    name.includes("electronics") ||
    name.includes("laptop") ||
    name.includes("computer")
  ) {
    return Laptop;
  }

  if (
    name.includes("home") ||
    name.includes("appliance") ||
    name.includes("washing")
  ) {
    return WashingMachine;
  }

  if (
    name.includes("fashion") ||
    name.includes("shirt") ||
    name.includes("clothing")
  ) {
    return Shirt;
  }

  if (name.includes("sports") || name.includes("sport")) {
    return Trophy;
  }

  if (name.includes("book") || name.includes("books")) {
    return BookOpen;
  }

  if (name.includes("beauty") || name.includes("cosmetic")) {
    return Sparkles;
  }

  if (name.includes("furniture")) {
    return Home;
  }

  // Default icon for unknown categories
  return Tag;
}

// --------------------------------------------------
// Category Bar
// --------------------------------------------------

export default function CategoryBar() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Fetch Categories
  // --------------------------------------------------

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // --------------------------------------------------
  // Handle Category Click
  // --------------------------------------------------

  function handleCategoryClick(categoryName) {
    if (categoryName === "For You") {
      router.push("/");
    } else {
      router.push(`/search?category=${encodeURIComponent(categoryName)}`);
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div
          className="
            flex
            items-center
            justify-center
            gap-2
            sm:gap-3
            md:gap-4

            flex-wrap
            md:flex-nowrap
            md:overflow-x-auto
            md:scrollbar-hide
          "
        >
          {/* ------------------------------------------------ */}
          {/* For You - Fixed Category */}
          {/* ------------------------------------------------ */}

          <button
            type="button"
            onClick={() => handleCategoryClick("For You")}
            className="
              group
              flex
              items-center
              justify-center
              gap-2
              shrink-0
              px-3
              sm:px-4
              md:px-5
              py-2
              sm:py-2.5
              md:py-3
              rounded-lg
              text-sm
              sm:text-base
              bg-white
              text-gray-700
              font-medium
              border
              border-gray-200
              hover:bg-blue-600
              hover:text-white
              hover:border-blue-600
              transition-all
              duration-300
              cursor-pointer
            "
          >
            <ShoppingBag
              className="
                w-4
                h-4
                sm:w-5
                sm:h-5
                text-blue-600
                group-hover:text-white
                transition-colors
                duration-300
                shrink-0
              "
            />

            <span className="whitespace-nowrap">For You</span>
          </button>

          {/* ------------------------------------------------ */}
          {/* Loading */}
          {/* ------------------------------------------------ */}

          {loading && (
            <span className="text-sm text-gray-500 px-3">
              Loading categories...
            </span>
          )}

          {/* ------------------------------------------------ */}
          {/* Backend Categories */}
          {/* ------------------------------------------------ */}

          {!loading &&
            categories.map((category) => {
              const Icon = getCategoryIcon(category.name);

              return (
                <button
                  key={category.categoryUuid}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  className="
                    group
                    flex
                    items-center
                    justify-center
                    gap-2
                    shrink-0
                    px-3
                    sm:px-4
                    md:px-5
                    py-2
                    sm:py-2.5
                    md:py-3
                    rounded-lg
                    text-sm
                    sm:text-base
                    bg-white
                    text-gray-700
                    font-medium
                    border
                    border-gray-200
                    hover:bg-blue-600
                    hover:text-white
                    hover:border-blue-600
                    transition-all
                    duration-300
                    cursor-pointer
                  "
                >
                  <Icon
                    className="
                      w-4
                      h-4
                      sm:w-5
                      sm:h-5
                      text-blue-600
                      group-hover:text-white
                      transition-colors
                      duration-300
                      shrink-0
                    "
                  />

                  <span className="whitespace-nowrap">{category.name}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// // map() takes each object from an array and uses the JSX inside it as a template to create one UI element for that object.