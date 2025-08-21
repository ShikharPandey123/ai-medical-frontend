"use client"

import Link from "next/link"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 h-16">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <div className="w-6 h-6 bg-black rounded-sm mr-3"></div>
          <h1 className="text-xl font-semibold text-gray-900">MediConsult</h1>
        </div>

        {/* Navigation - Only visible on patient page */}
        

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
            <AvatarFallback className="bg-gray-200 text-gray-600">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
