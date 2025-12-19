"use client";

import { useState, useEffect } from "react";
import MobileLandingPage from "./mobile-landing.page";
import DesktopLandingPage from "./desktop-landing.page";

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check screen size on mount
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    setMounted(true);

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  // Render appropriate component based on screen size
  return isMobile ? <MobileLandingPage /> : <DesktopLandingPage />;
}
