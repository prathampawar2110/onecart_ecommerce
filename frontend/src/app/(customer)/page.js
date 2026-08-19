// // import CategoryBar from "@/components/CategoryBar/CategoryBar";
import Carousel from "@/components/Carousel/Carousel";
// import CategoryBar from "@/components/CategoryBar/CategoryBar";
import ProductGrid from "@/components/ProductGrid/ProductGrid";

export default function Home() {
  return (
    <main className="w-full max-w-full min-h-screen">

      {/* <CategoryBar /> */}

      {/* ================= Carousel ================= */}

      <section className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <Carousel />
      </section>

      {/* ================= Product Section ================= */}

      <section
        className="
          w-full
          max-w-7xl
          mx-auto
          px-3
          sm:px-4
          md:px-6
          lg:px-8
          mt-6
          sm:mt-8
          md:mt-10
        "
      >
        <ProductGrid />
      </section>

    </main>
  );
}