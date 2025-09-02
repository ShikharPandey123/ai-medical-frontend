"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "../../../lib/axiosInstance"

export default function DashboardOverview() {
  const router = useRouter()

  const [stats, setStats] = useState({
    totalVisits: 120,
    recentPatients: 85,
    pendingApproval: 15,
    averageVisitDuration: "25 min",
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosInstance.get("/dashboard/stats")
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      }
    }

    fetchDashboardStats()
  }, [])

  const handleAddNewPatient = () => {
    // Navigate to patients page with modal open
    router.push("/dashboard/patients") 
  }

  const handleStartRecording = () => {
    // Navigate to record visit page
    router.push("/dashboard/record-visit")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // TODO: Optionally redirect to patients page with query param
    router.push(`/dashboard/patients?search=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="p-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Search Bar and Add Button */}
      <div className="flex items-center justify-between mb-8">
        {/* <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search patients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-green-50 border-green-200 focus:border-green-300 focus:ring-green-200"
          />
        </form> */}

        {/* <Button
          onClick={handleAddNewPatient}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-6"
        >
          Add New Patient
        </Button> */}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Visits</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.totalVisits}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Recent Patients</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.recentPatients}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Pending Approval</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.pendingApproval}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Average Visit Duration</h3>
            <p className="text-4xl font-bold text-gray-900">{stats.averageVisitDuration}</p>
          </CardContent>
        </Card>
      </div>

      {/* Start Recording Button */}
      {/* <div className="flex justify-start">
        <Button
          onClick={handleStartRecording}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-8 py-3 text-lg"
        >
          Start Recording
        </Button>
      </div> */}
    </div>
  )
}
