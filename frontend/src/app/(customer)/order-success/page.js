"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center">
        <div className="text-6xl mb-5">✓</div>

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for shopping with OneCart. Your order has been placed
          successfully.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="
              flex-1
              bg-blue-600
              text-white
              py-3
              rounded-lg
              font-semibold
              hover:bg-blue-700
              transition
              cursor-pointer
            "
          >
            View Orders
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="
              flex-1
              bg-gray-200
              text-gray-700
              py-3
              rounded-lg
              font-semibold
              hover:bg-gray-300
              transition
              cursor-pointer
            "
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
