"use client";

import { Menu, X, User } from "lucide-react";
import Image from "next/image";

export default function Header({
  onMenuToggle,
  isMobileMenuOpen,
}: {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 h-16">
        {/* Mobile Menu Button */}
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-md"
            onClick={onMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/medicare_pro.png"
              alt="Medicare Pro Logo"
              width={36}
              height={36}
            />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              MediCare Pro
            </h1>
          </div>
        </div>

        {/* Right side - Profile */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
