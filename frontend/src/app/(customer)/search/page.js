"use client";

import { Suspense } from "react";
import ProductCard from "@/components/ProductCard/ProductCard";

import {
  searchProducts,
  getProductByCategory,
} from "@/services/productService";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// ==========================================================
// SEARCH CONTENT
// ==========================================================

function SearchContent() {
  // ==========================================================
  // SEARCH PARAMS
  // ==========================================================

  const searchParams = useSearchParams();

  const query = searchParams.get("query");
  const category = searchParams.get("category");

  // ==========================================================
  // STATE
  // ==========================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // FETCH PRODUCTS
  // ==========================================================

  useEffect(() => {
    async function fetchSearchResults() {
      setLoading(true);

      if (!query && !category) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        let data;

        if (category) {
          data = await getProductByCategory(category);
        } else {
          data = await searchProducts(query);
        }

        // console.log("SEARCH/CATEGORY RESPONSE:", data);

        if (!Array.isArray(data)) {
          console.error("Invalid search response:", data);
          setProducts([]);
          return;
        }

        setProducts(data);
      } catch (error) {
        console.error("Search product error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query, category]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <h2 className="text-center text-xl mt-10">
        Searching Products........
      </h2>
    );
  }

  // ==========================================================
  // SEARCH RESULT PAGE
  // ==========================================================

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">

      {/* Heading */}

      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2">
          {category
            ? `Products in ${category}`
            : `Search Result for ${query}`}
        </h1>

        <p className="text-sm sm:text-base text-black mb-2">
          {category
            ? `Exploring Our latest ${category} products`
            : `Showing Products matching ${query}`}
        </p>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {products.length === 0 ? (
        <p className="text-gray-600">
          No Products Found
        </p>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-4
            sm:gap-5
            md:gap-6
            text-xl
            text-center
            text-black
          "
        >
          {products.map((product) => {
            // ---------------------------------------------
            // Get product UUID
            // ---------------------------------------------

            const productUuid =
              product?.product_uuid ||
              product?.productUuid ||
              product?._id;

            // ---------------------------------------------
            // Invalid product
            // ---------------------------------------------

            if (!productUuid) {
              console.error(
                "Search product missing UUID:",
                product
              );

              return null;
            }

            // ---------------------------------------------
            // Product Card
            // ---------------------------------------------

            return (
              <ProductCard
                key={productUuid}
                product={product}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

// ==========================================================
// PAGE
// ==========================================================

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <h2 className="text-center text-xl mt-10">
          Loading Search........
        </h2>
      }
    >
      <SearchContent />
    </Suspense>
  );
}