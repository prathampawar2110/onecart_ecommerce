"use client";

import { useEffect, useState } from "react";

import { getProducts } from "@/services/productService";

import ProductCard from "../ProductCard/ProductCard";

import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";

import Link from "next/link";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();

        if (!Array.isArray(data)) {
          throw new Error("Invalid products response");
        }

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Group products by category
  const productsByCategory = products.reduce((groups, product) => {
    const category = product.category?.trim();

    if (!category) {
      return groups;
    }

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(product);

    return groups;
  }, {});

  // Convert object into category array
  const categories = Object.entries(productsByCategory);

  return (
    <section className="py-2">
      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover & Shop</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop by Category
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore our products organized by category.
          </p>
        </div>

        {!loading && products.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full w-fit">
            {products.length} products
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-10">
          {[...Array(3)].map((_, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Category Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-7 bg-slate-200 rounded-md w-36 animate-pulse" />

                <div className="h-5 bg-slate-200 rounded-md w-20 animate-pulse" />
              </div>

              {/* Product Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col gap-4 animate-shimmer"
                  >
                    <div className="w-full aspect-square bg-slate-200 rounded-xl" />

                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />

                    <div className="h-4 bg-slate-200 rounded-md w-1/2" />

                    <div className="h-6 bg-slate-200 rounded-md w-1/3 mt-2" />

                    <div className="h-9 bg-slate-200 rounded-xl w-full mt-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 my-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            No products available
          </h3>

          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            We are restocking new items. Please check back soon or explore other categories.
          </p>
        </div>
      ) : categories.length === 0 ? (
        /* Products exist but categories are missing */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 my-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Categories not available
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Products are available, but their categories have not been set.
          </p>
        </div>
      ) : (
        /* Category Sections */
        <div className="space-y-10">
          {categories.map(([category, categoryProducts]) => {
            // Show maximum 4 products on homepage
            const displayedProducts = categoryProducts.slice(0, 4);

            return (
              <section key={category}>
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {category}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {categoryProducts.length}{" "}
                      {categoryProducts.length === 1 ? "product" : "products"}
                    </p>
                  </div>

                  {/* View All */}
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className="
                      flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>View All</span>

                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Products */}
                <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:pb-0 sm:snap-none">
                  {displayedProducts.map((product) => {
                    const productKey = product.productUuid || product._id;

                    if (!productKey) {
                      return null;
                    }

                    return (
                      <div
                        key={productKey}
                        className="min-w-[78%] snap-start sm:min-w-0"
                      >
                        <ProductCard product={product} />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}