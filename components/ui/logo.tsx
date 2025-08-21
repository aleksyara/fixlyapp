// import Image from "next/image";
// import Link from "next/link";

// type LogoProps = {
//   size?: number;
//   withText?: boolean;
// };

// export default function Logo({ size = 100, withText = true }: LogoProps) {
//   return (
//     <Link
//       href="/"
//       aria-label="Go to homepage"
//       className="flex flex-col items-center md:flex-row md:items-center md:gap-10 w-full md:w-auto justify-center"
//     >
//       <Image
//         src="/logo.png"
//         alt="Fixly logo"
//         width={size}
//         height={size}
//         priority
//       />
//       {withText && (
//         <span
//           className="
//             font-bold tracking-tight text-center 
//             text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl
//           "
//         >
//           <span className="text-blue-600">Fix</span>&nbsp;
//           <span className="text-gray-700">Appliance</span>&nbsp;
//           <span className="text-indigo-600">Easy</span>
//         </span>
//       )}
//     </Link>
//   );
// }
import Image from "next/image";
import Link from "next/link";
import React from "react";

type LogoProps = {
  size?: number;
  withText?: boolean;
};

export default function Logo({ size = 150, withText = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Go to homepage"
      className="inline-flex items-center gap-2"
    >
      <Image
        src="/logo.png"   // make sure logo.png is inside /public
        alt="Fixly logo"
        width={size}
        height={size}
        priority
      />
      {withText && (
        <span className="font-bold text-xl tracking-tight">FIXLY</span>
      )}
    </Link>
  );
}