import Link from "next/link";
import Image from "next/image";


export default function ProductCard({ product }) {

  console.log("CARD PRODUCT:", product);
  console.log("CARD UUID:", product?.productUuid);

  return (
    <div
      className="
        group
        w-full
        
        border border-gray-200
        rounded-lg
        shadow-md
        bg-white
        overflow-hidden
        transition-all
        duration-300
        ease-in-out
        hover:-translate-y-1
        hover:scale-[1.02]
        hover:shadow-xl
        cursor-pointer
      "
    >
      <Link href={`/products/${product.product_uuid}`}>

        {/* Product Image */}
        <div className="relative w-full h-56 flex items-center justify-center p-4">
          <Image
            src={product.image_url || "/products/default.webp"}
            alt={product.name || "product"}
            fill
            className="
              object-contain
              p-4
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />
        </div>

        {/* Product Name */}
        <h2 className="text-center text-blue-700 font-semibold text-lg px-4 pb-5">
          {product.name}
        </h2>

      </Link>
    </div>
  );
}