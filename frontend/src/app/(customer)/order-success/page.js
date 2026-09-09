"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, PackageCheck, Truck, ArrowRight, ShoppingBag } from "lucide-react";

export default function OrderSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-12 max-w-lg w-full text-center animate-in zoom-in-95 duration-300">
        {/* Animated Checkmark Circle */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Order Confirmed
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
          Order Placed Successfully!
        </h1>

        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-8">
          Thank you for your purchase with OneCart. Your order has been placed and is now being packed for dispatch.
        </p>

        {/* Order Progress Steps */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 mb-8 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            What happens next?
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Order confirmation and details recorded
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Warehouse package dispatch in 24 hours
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Delivery to your doorstep in 3–5 business days
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3.5 px-5 rounded-xl font-bold text-sm shadow-sm transition cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            View Orders
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-5 rounded-xl font-bold text-sm transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
