import Carousel from "@/components/Carousel/Carousel";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";

export default function Home() {
  const valueProps = [
    {
      icon: Truck,
      title: "Free Delivery",
      subtitle: "Free Delivery on every orders",
    },
    {
      icon: RotateCcw,
      title: "7-Day Returns",
      subtitle: "Hassle-free replacements",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      subtitle: "Verified direct from source",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      subtitle: "UPI, Cards & NetBanking",
    },
  ];

  return (
    <main className="w-full max-w-full min-h-screen">
      {/* ================= Carousel ================= */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-2 sm:mt-4">
        <Carousel />
      </section>

      {/* ================= Value Props Trust Bar ================= */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 sm:p-2.5 rounded-xl transition hover:bg-slate-50"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {prop.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                    {prop.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= Product Section ================= */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-12">
        <ProductGrid />
      </section>
    </main>
  );
}