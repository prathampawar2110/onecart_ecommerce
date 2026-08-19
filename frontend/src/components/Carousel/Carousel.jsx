"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  "/banners/banner1.png",
  "/banners/banner2.png",
  "/banners/banner3.png",
];

export default function Carousel() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Automatic slide change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Next button
  const nextSlide = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  // Previous button
  const previousSlide = () => {
    setCurrentBanner(
      (prev) => (prev - 1 + banners.length) % banners.length
    );
  };

  return (
    <div
      className="
        w-full
        px-2
        sm:px-4
        md:px-6
        lg:px-8
        py-3
        sm:py-4
        md:py-5
      "
    >
      {/* Carousel container */}
      <div
        className="
          relative
          w-full
          aspect-16/5
          min-h-35
          sm:min-h-45
          md:min-h-55
          lg:min-h-70
          overflow-hidden
          rounded-md
          sm:rounded-lg
          lg:rounded-xl
        "
      >
        {/* Banner */}
        <Image
          src={banners[currentBanner]}
          alt="OneCart Banner"
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />

        {/* Previous Button */}
        <button
          onClick={previousSlide}
          aria-label="Previous banner"
          className="
            absolute
            left-2
            sm:left-3
            md:left-4
            top-1/2
            -translate-y-1/2
            bg-white/80
            hover:bg-blue-200
            rounded-full
            p-1.5
            sm:p-2
            shadow-lg
            transition-all
            duration-300
            cursor-pointer
          "
        >
          <ChevronLeft
            className="
              w-4
              h-4
              sm:w-5
              sm:h-5
              md:w-6
              md:h-6
            "
          />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          aria-label="Next banner"
          className="
            absolute
            right-2
            sm:right-3
            md:right-4
            top-1/2
            -translate-y-1/2
            bg-white/80
            hover:bg-blue-200
            rounded-full
            p-1.5
            sm:p-2
            shadow-lg
            transition-all
            duration-300
            cursor-pointer
          "
        >
          <ChevronRight
            className="
              w-4
              h-4
              sm:w-5
              sm:h-5
              md:w-6
              md:h-6
            "
          />
        </button>

        {/* Dots */}
        <div
          className="
            absolute
            bottom-2
            sm:bottom-3
            md:bottom-4
            left-1/2
            -translate-x-1/2
            flex
            gap-1.5
            sm:gap-2
          "
        >
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Go to banner ${index + 1}`}
              className={`
                w-2
                h-2
                sm:w-2.5
                sm:h-2.5
                md:w-3
                md:h-3
                rounded-full
                transition-all
                duration-300
                cursor-pointer
                ${
                  currentBanner === index
                    ? "bg-black"
                    : "bg-white/50"
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}