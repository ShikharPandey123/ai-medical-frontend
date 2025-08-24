"use client"

import { useRouter } from "next/navigation.js";
import { useEffect, useState } from "react";
import type { FC } from "react";

interface SplashScreenProps {
  duration?: number;
  appName?: string;
  tagline?: string;
}

const SplashScreen: FC<SplashScreenProps> = ({
  duration = 3000,
  appName = "MediCare Pro",
  tagline = "Your Digital Health Companion",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0);
  const [textOpacity, setTextOpacity] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Logo scale animation
    const logoTimer = setTimeout(() => {
      setLogoScale(1);
    }, 200);

    // Text fade in
    const textTimer = setTimeout(() => {
      setTextOpacity(1);
    }, 800);

    // Hide splash screen and redirect
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // Redirect to login after fade out animation
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, router]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 flex items-center justify-center z-50 opacity-0 transition-opacity duration-500 pointer-events-none"></div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 flex items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center text-white">
        {/* Main Logo/Icon */}
        <div className="mb-8 transition-transform duration-1000 ease-out" style={{ transform: `scale(${logoScale})` }}>
          {/* Medical Cross with Circle */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Subtle outer glow */}
            <div
              className="absolute inset-0 bg-white/10 rounded-full animate-pulse"
              style={{ animationDuration: "3s" }}
            ></div>

            {/* Main circle */}
            <div className="relative w-full h-full bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 flex items-center justify-center shadow-2xl">
              {/* Medical cross */}
              <div className="relative">
                {/* Vertical bar */}
                <div className="w-3 h-12 bg-white rounded-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                {/* Horizontal bar */}
                <div className="w-12 h-3 bg-white rounded-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* App Name and Tagline */}
        <div className="transition-opacity duration-1000 ease-out" style={{ opacity: textOpacity }}>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3 tracking-wide">{appName}</h1>
          <p className="text-base md:text-lg font-light opacity-80 mb-8">{tagline}</p>

          {/* Simple loading indicator */}
          <div className="w-16 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Bottom branding */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 ease-out"
          style={{ opacity: textOpacity }}
        >
          <p className="text-xs opacity-60">Powered by Advanced Medical Technology</p>
        </div>
      </div>

      {/* Minimal background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 border border-white rounded-full"
          style={{ animation: "spin 30s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-white rounded-full"
          style={{ animation: "spin 40s linear infinite reverse" }}
        ></div>
      </div>
    </div>
  );
};

export default SplashScreen;
