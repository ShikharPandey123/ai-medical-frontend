"use client";

import { Home, Users, Plus, MessageSquare, HelpCircle, User, Mic } from "lucide-react";
import type { FC } from "react";
// import Link from "next/link";
import { cn } from "@/lib/utils";
// import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { usePathname } from "next/navigation.js";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  {
    name: "Record New Visit",
    href: "/dashboard/record-visit",
    icon: Plus,
  },
  {
    name: "Start Recording",
    href: "/dashboard/recording",
    icon: Mic,
  },
  {
    name: "Consultation",
    href: "/dashboard/consultation",
    icon: MessageSquare,
  },
];

const Sidebar: FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-medical-sidebar border-r border-medical-border-light overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className="p-6 border-b border-medical-border-light">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
              <AvatarFallback className="bg-medical-secondary text-medical-text-secondary">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-medical-text-primary">MediConsult</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-medical-sidebar-hover text-medical-text-primary shadow-sm"
                        : "text-medical-text-secondary hover:bg-medical-sidebar-hover hover:text-medical-text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Help Section at Bottom */}
        <div className="p-4 border-t border-medical-border-light">
          <Link
            href="/dashboard/help"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-medical-text-secondary hover:bg-medical-sidebar-hover hover:text-medical-text-primary transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help and docs</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;