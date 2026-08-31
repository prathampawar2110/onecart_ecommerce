"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import ProductCard from "../ProductCard/ProductCard";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();

        // console.log("PRODUCT GRID RESPONSE:", data);
        // console.log("FIRST PRODUCT:", data[0]);
        // console.log("Product Details:", data);

        // Make sure API returned an array
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

  if (loading) {
    return (
      <h2 className="text-center text-xl text-black py-10">
        Loading Products...
      </h2>
    );
  }

  return (
    <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
      <h2 className="text-xl sm:text-2xl md:text-3xl text-black font-bold mb-4 sm:mb-5 md:mb-6">
        Products
      </h2>

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
        "
      >
        {products.map((product) => {
          // Backend UUID
          const productKey =
            product.productUuid || product._id;

          // Skip invalid products
          if (!productKey) {
            console.error("Product UUID missing:", product);
            return null;
          }

          return (
            <ProductCard
              key={productKey}
              product={product}
            />
          );
        })}
      </div>
    </section>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// import { getProducts } from "@/services/productService.js";
// import ProductCard from "../ProductCard/ProductCard";

// export default function ProductGrid() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         const data = await getProducts();

//         console.log("Product Details:", data);

//         data.forEach((product, index) => {
//           console.log("Product:", {
//             index,
//             productUuid: product.productUuid,
//             id: product._id,
//             name: product.name,
//           });
//         });

//         setProducts(data);
//       } catch (error) {
//         console.error("Product Fetch Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProducts();
//   }, []);

//   if (loading) {
//     return (
//       <h2 className="text-center text-xl text-black">
//         Loading Products...
//       </h2>
//     );
//   }

//   return (
//     <section className="px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10 lg:px-8">
//       <h2 className="mb-4 text-xl font-bold text-black sm:mb-5 sm:text-2xl md:mb-6 md:text-3xl">
//         Featured Products
//       </h2>

//       <div
//         className="
//           grid
//           grid-cols-1
//           gap-4
//           sm:grid-cols-2
//           sm:gap-5
//           md:grid-cols-3
//           md:gap-6
//           lg:grid-cols-4
//         "
//       >
//         {products.map((product, index) => (
//           <ProductCard
//             key={product.productUuid || product._id || `product-${index}`}
//             product={product}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }