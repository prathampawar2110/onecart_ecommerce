"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard/ProductCard";
import { searchProducts, getProductByCategory } from "@/services/productService";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("query");
  const category = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");

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

        if (!Array.isArray(data)) {
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

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-low") {
      return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    if (sortBy === "name-az") {
      return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return list;
  }, [products, sortBy]);

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Search className="w-3.5 h-3.5" />
            <span>Search & Browse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {category
              ? `Category: ${category}`
              : query
              ? `Results for “${query}”`
              : "Search Products"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {category
              ? `Browse handpicked products in ${category}`
              : query
              ? `Explore all items matching your search keywords`
              : "Find your favorite items across OneCart"}
          </p>
        </div>

        {/* Filter / Sort Control */}
        {!loading && products.length > 0 && (
          <div className="flex items-center gap-3 self-start md:self-end">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>

            <div className="relative inline-flex items-center">
              <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none shadow-2xs"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Alphabetical: A to Z</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
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
      ) : sortedProducts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 my-8 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No products found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            {query
              ? `We could not find any matches for “${query}”. Try different keywords or browse our categories.`
              : "Please type a search query or pick a category above."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition cursor-pointer"
            >
              Explore All Products
            </button>
          </div>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          {sortedProducts.map((product) => {
            const productUuid =
              product?.product_uuid || product?.productUuid || product?._id;

            if (!productUuid) return null;

            return <ProductCard key={productUuid} product={product} />;
          })}
        </div>
      )}
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}