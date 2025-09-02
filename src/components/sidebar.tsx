"use client";

import { Home, Users } from "lucide-react";
import type { FC } from "react";
// import { cn } from "../lib/utils.js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: FC<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard/overview",
    icon: Home,
  },
  {
    name: "Patients",
    href: "/dashboard/patients",
    icon: Users,
  },
];

const Sidebar: FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64",
          "bg-medical-sidebar border-r border-medical-border-light",
          "overflow-y-auto z-50 transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-medical-sidebar-hover text-medical-text-primary shadow-sm"
                          : "text-medical-text-secondary hover:bg-medical-sidebar-hover hover:text-medical-text-primary"
                      )}
                      onClick={onClose} // close mobile menu when link is clicked
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
