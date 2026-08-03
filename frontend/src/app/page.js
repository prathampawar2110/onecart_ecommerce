// export default function Home() {
//   return (
//     <main>
//       <h1>E-commerece</h1>
//     </main>
//   )
// }

"use client";

import { useEffect, useState } from "react";
import BASE_URL from "@/lib/api";

export default function Home() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    async function getProducts() {

      try {
        const response = await fetch(`${BASE_URL}/products`);

        const data = await response.json();

        setProducts(data);

      } catch (error) {
        console.log(error);
      }

    }

    getProducts();

  }, []);


  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-5">
        Products
      </h1>


      <div className="grid grid-cols-3 gap-5">

        {
          products.map((product)=>(
            
            <div 
              key={product._id}
              className="border p-5 rounded-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover mb-3"
              />

              <h2 className="text-xl font-semibold">
                {product.name}
              </h2>

              <p>
                Price: ₹{product.price}
              </p>

              <p>
                Category: {product.category}
              </p>

              <p>
                Stock: {product.stock}
              </p>

            </div>

          ))
        }

      </div>

    </main>
  );
}