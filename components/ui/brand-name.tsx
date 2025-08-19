// components/ui/brand-name.tsx
import React from "react";

export default function BrandName() {
  return (
    <span
      className="
        font-bold tracking-tight 
        text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl
      "
    >
      <span className="text-blue-600">Fix</span>&nbsp;
      <span className="text-gray-700">Appliance</span>&nbsp;
      <span className="text-indigo-600">Easy</span>
    </span>
  );
}