"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Lottie from "lottie-react";
import wheelAnimation from "@/public/animations/wheel.json";


interface Props {
  children: ReactNode;
}

export default function RouterLoadingProvider({ children }: Props) {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent theme mismatch on first render
  useEffect(() => setMounted(true), []);

  // Trigger loading on route change
  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [pathname, mounted]);

  if (!mounted) return <>{children}</>;

  const currentTheme = theme ?? resolvedTheme;
  const isDark = currentTheme === "dark";

  // Plain background colors
  const darkBg = "#0b0c1f";
  const lightBg = "#dff6ff";

  return (
    <>
      {loading && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: isDark ? darkBg : lightBg }}
        >
          {/* Centered Lottie animation */}
          <Lottie
            animationData={wheelAnimation}
            loop
            autoplay
            style={{ width: 400, height: 400 }}
          />
        </div>
      )}

      {children}
    </>
  );
}