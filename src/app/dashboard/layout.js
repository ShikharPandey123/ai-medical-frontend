import React from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

export default function DashboardLayout({children}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16">{children}</main>
      </div>
    </div>
  )
}
