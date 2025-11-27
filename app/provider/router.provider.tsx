"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";

interface Props {
  children: ReactNode;
}

export default function RouterLoadingProvider({ children }: Props) {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Trigger on route change
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timeout);
  }, [pathname]);

  const currentTheme = theme ?? resolvedTheme;
  const isDark = currentTheme === "dark";

  return (
    <>
      {mounted && loading && (
        <>
          <style jsx global>{`
            @keyframes cloudDrift {
              0% { transform: translateX(0); }
              100% { transform: translateX(120px); }
            }
            @keyframes cloudDrift2 {
              0% { transform: translateX(0); }
              100% { transform: translateX(-120px); }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>

          <div
            className={`fixed inset-0 z-[9999] overflow-hidden 
              ${isDark 
                ? "bg-gradient-to-b from-[#0B0A1B] via-[#1a1533] to-[#2d1b4e]" 
                : "bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100"
              }`}
          >
            {/* Stars (dark only) */}
            {isDark && (
              <div className="absolute inset-0">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      // eslint-disable-next-line react-hooks/purity
                      left: `${Math.random() * 100}%`,
                      // eslint-disable-next-line react-hooks/purity
                      top: `${Math.random() * 100}%`,
                      // eslint-disable-next-line react-hooks/purity
                      animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                      // eslint-disable-next-line react-hooks/purity
                      animationDelay: `${Math.random()}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Clouds */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute ${isDark ? "opacity-20" : "opacity-70"}`}
                  style={{
                    left: `${i * 30 - 10}%`,
                    top: `${20 + i * 15}%`,
                    animation: `${i % 2 === 0 ? "cloudDrift" : "cloudDrift2"} ${
                      14 + i * 4
                    }s linear infinite`,
                  }}
                >
                  <svg width="120" height="60" viewBox="0 0 120 60">
                    <ellipse cx="30" cy="40" rx="25" ry="20" fill={isDark ? "#374151" : "#ffffff"} />
                    <ellipse cx="60" cy="30" rx="35" ry="25" fill={isDark ? "#374151" : "#ffffff"} />
                    <ellipse cx="90" cy="40" rx="25" ry="20" fill={isDark ? "#374151" : "#ffffff"} />
                  </svg>
                </div>
              ))}
            </div>
              {/* <Image src={theme==="light" ? "/loading_light.png" : "/loading_dark.png"} alt="Loading Image" width={400} height={400} /> */}
              {/* <h1 className="text-center text-3xl mt-48" >Your ride awaits.....</h1> */}
            {/* Hills */}
            <div className="absolute bottom-0 left-0 right-0 h-48">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path
                  d="M0,150 Q300,80 600,150 T1200,150 L1200,300 L0,300 Z"
                  fill={isDark ? "#1e3a2f" : "#86efac"}
                  opacity="0.6"
                />
                <path
                  d="M0,180 Q300,120 600,180 T1200,180 L1200,300 L0,300 Z"
                  fill={isDark ? "#164e3f" : "#4ade80"}
                  opacity="0.7"
                />
                <path
                  d="M0,220 Q300,160 600,220 T1200,220 L1200,300 L0,300 Z"
                  fill={isDark ? "#0f3a2e" : "#22c55e"}
                />
              </svg>
            </div>
          </div>
        </>
      )}

      {children}
    </>
  );
}
