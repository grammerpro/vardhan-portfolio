"use client";

import { usePathname } from "next/navigation";

/**
 * Route transition, CSS only.
 *
 * This previously used framer-motion, which put roughly 40kB and a large
 * chunk of script evaluation on the homepage's critical path for a 350ms
 * fade. It also used `easeOut` and `easeIn`, which brief section 3 forbids.
 *
 * Keying the wrapper on the pathname restarts the CSS animation on
 * navigation, which is all the original did.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}
