"use client";

import {
  ShoppingBag,
  Smartphone,
  Laptop,
  WashingMachine,
  Shirt,
  Trophy,
  BookOpen,
  Sparkles,
  Home,
  Tag,
} from "lucide-react";

import { useEffect, useState, Suspense } from "react";
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";

import { getCategories } from "@/services/categoryService";

function getCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase();

  if (
    name.includes("smartphone") ||
    name.includes("mobile")
  )
    return Smartphone;

  if (
    name.includes("electronics") ||
    name.includes("laptop") ||
    name.includes("computer")
  )
    return Laptop;

  if (
    name.includes("home") ||
    name.includes("appliance") ||
    name.includes("washing")
  )
    return WashingMachine;

  if (
    name.includes("fashion") ||
    name.includes("shirt") ||
    name.includes("clothing")
  )
    return Shirt;

  if (
    name.includes("sports") ||
    name.includes("sport")
  )
    return Trophy;

  if (
    name.includes("book") ||
    name.includes("books")
  )
    return BookOpen;

  if (
    name.includes("beauty") ||
    name.includes("cosmetic")
  )
    return Sparkles;

  if (name.includes("furniture"))
    return Home;

  return Tag;
}

function CategoryBarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategoryParam =
    searchParams.get("category");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  function handleCategoryClick(categoryName) {
    if (categoryName === "For You") {
      router.push("/");
    } else {
      router.push(
        `/search?category=${encodeURIComponent(
          categoryName
        )}`
      );
    }
  }

  const isForYouActive =
    pathname === "/" && !activeCategoryParam;

  return (
    <div
      className="
        w-full
        bg-white
        border-b
        border-slate-200
        shadow-sm
        py-2
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-3
          sm:px-6
          lg:px-8
        "
      >
        {/* CENTERED CATEGORY BAR */}
        <div
          className="
            flex
            items-center
            justify-center
            gap-2

            overflow-x-auto
            scrollbar-hide

            py-1
          "
        >
          {/* FOR YOU */}
          <button
            type="button"
            onClick={() =>
              handleCategoryClick("For You")
            }
            className={`
              group
              flex
              items-center
              gap-2
              shrink-0

              px-3.5
              py-1.5

              rounded-full

              text-xs
              sm:text-sm

              font-semibold

              border

              transition-all
              duration-200

              cursor-pointer

              ${
                isForYouActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              }
            `}
          >
            <ShoppingBag
              className={`
                w-3.5
                h-3.5
                sm:w-4
                sm:h-4

                ${
                  isForYouActive
                    ? "text-white"
                    : "text-blue-600"
                }
              `}
            />

            <span className="whitespace-nowrap">
              For You
            </span>
          </button>

          {/* LOADING */}
          {loading && (
            <div className="flex gap-2 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="
                    h-8
                    w-24
                    bg-slate-200
                    rounded-full
                    shrink-0
                  "
                />
              ))}
            </div>
          )}

          {/* CATEGORIES */}
          {!loading &&
            categories.map((cat) => {
              const Icon = getCategoryIcon(
                cat.name
              );

              const isActive =
                activeCategoryParam === cat.name;

              return (
                <button
                  key={
                    cat.categoryUuid ||
                    cat._id ||
                    cat.name
                  }
                  type="button"
                  onClick={() =>
                    handleCategoryClick(cat.name)
                  }
                  className={`
                    group
                    flex
                    items-center
                    gap-2
                    shrink-0

                    px-3.5
                    py-1.5

                    rounded-full

                    text-xs
                    sm:text-sm

                    font-semibold

                    border

                    transition-all
                    duration-200

                    cursor-pointer

                    ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-3.5
                      h-3.5
                      sm:w-4
                      sm:h-4

                      ${
                        isActive
                          ? "text-white"
                          : "text-blue-600 group-hover:text-blue-700"
                      }
                    `}
                  />

                  <span className="whitespace-nowrap">
                    {cat.name}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default function CategoryBar() {
  return (
    <Suspense
      fallback={
        <div
          className="
            w-full
            bg-white
            shadow-sm
            border-b
            border-gray-200
            py-3
          "
        >
          <div
            className="
              max-w-7xl
              mx-auto
              flex
              justify-center
              gap-2
              overflow-x-auto
              scrollbar-hide
            "
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="
                  h-8
                  w-24
                  bg-slate-200
                  rounded-full
                  shrink-0
                  animate-pulse
                "
              />
            ))}
          </div>
        </div>
      }
    >
      <CategoryBarContent />
    </Suspense>
  );
}