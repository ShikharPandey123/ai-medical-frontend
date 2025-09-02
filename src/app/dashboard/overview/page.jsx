"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "../../../lib/axiosInstance"

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    recentPatients: 0,
    pendingApproval: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        
        // Fetch all patients to get count
        const patientsResponse = await axiosInstance.get("/patient/get-all-patients")
        const patients = patientsResponse.data?.data?.patients || []
        
        // Set patient count immediately
        setStats(prevStats => ({
          ...prevStats,
          recentPatients: patients.length,
        }))
        
        // Fetch visits for all patients to calculate total visits and pending approvals
        let totalVisits = 0
        let pendingApproval = 0
        
        // Use Promise.allSettled to fetch all visits concurrently instead of sequentially
        const visitPromises = patients.map(patient => 
          axiosInstance.get(`/visit/${patient.id}/visit-history`)
            .then(response => response.data?.visits || [])
            .catch(error => {
              console.error(`Failed to fetch visits for patient ${patient.id}:`, error)
              return []
            })
        )
        
        const allVisitsResults = await Promise.allSettled(visitPromises)
        
        allVisitsResults.forEach(result => {
          if (result.status === 'fulfilled') {
            const visits = result.value
            totalVisits += visits.length
            
            // Count pending visits (status: "pending")
            const pendingVisits = visits.filter(visit => visit.status === "pending")
            pendingApproval += pendingVisits.length
          }
        })
        
        setStats({
          totalVisits,
          recentPatients: patients.length,
          pendingApproval,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        setStats({
          totalVisits: 0,
          recentPatients: 0,
          pendingApproval: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, []) // Empty dependency array to run only once

  return (
    <div className="p-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Visits</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-gray-900">{stats.totalVisits}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Patients</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-gray-900">{stats.recentPatients}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Pending Approval</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-20 mx-auto"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-gray-900">{stats.pendingApproval}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
