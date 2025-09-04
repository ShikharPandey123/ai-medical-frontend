"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Info, Bell, Calendar, Clock, Users, Activity, AlertCircle, CheckCircle, BookOpen, Settings } from "lucide-react"
import axiosInstance from "../../../lib/axiosInstance"

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    recentPatients: 0,
    pendingApproval: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard stats from backend (your original logic)
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
    <div className="min-h-screen mt-12 bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
       

        {/* System Status Banner */}
        <div className="mb-6 animate-slide-down">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">System Status: All services operational</p>
                  <p className="text-xs text-green-600">Last updated: Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Statistics Cards (Your original logic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Visits</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
              ) : (
                <p className="text-4xl font-bold text-gray-900">{stats.totalVisits}</p>
              )}
              <p className="text-xs text-green-600 mt-2">All completed visits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Patients</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
              ) : (
                <p className="text-4xl font-bold text-gray-900">{stats.recentPatients}</p>
              )}
              <p className="text-xs text-blue-600 mt-2">Registered in system</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Pending Approval</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
              ) : (
                <p className="text-4xl font-bold text-gray-900">{stats.pendingApproval}</p>
              )}
              <p className="text-xs text-yellow-600 mt-2">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Information Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-700">Operating Hours</h4>
              <p className="text-xs text-gray-500 mt-1">Mon-Fri: 9AM-6PM</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-700">Emergency</h4>
              <p className="text-xs text-gray-500 mt-1">24/7 Available</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-700">Documentation</h4>
              <p className="text-xs text-gray-500 mt-1">Up to date</p>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Settings className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-gray-700">System</h4>
              <p className="text-xs text-gray-500 mt-1">Running smoothly</p>
            </CardContent>
          </Card>
        </div>

        {/* Information Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Guidelines */}
          <Card className="bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Quick Guidelines</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <p>Review pending approvals regularly to maintain workflow efficiency</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <p>Patient data is automatically backed up every 6 hours</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <p>Use the search function to quickly locate patient records</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <p>System maintenance occurs every Sunday at 2 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notices */}
          <Card className="bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-semibold text-gray-900">Important Notices</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-blue-800">System Update</p>
                  <p className="text-xs text-blue-600 mt-1">New features will be deployed this weekend</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm font-medium text-green-800">Data Security</p>
                  <p className="text-xs text-green-600 mt-1">All patient information is encrypted and secure</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm font-medium text-yellow-800">Reminder</p>
                  <p className="text-xs text-yellow-600 mt-1">Monthly reports are due by the end of this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information Banner */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-indigo-600" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Healthcare Management System</h4>
                  <p className="text-sm text-gray-600">Streamlined patient care and administrative efficiency</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-indigo-600">Version 2.4.1</p>
                <p className="text-xs text-gray-500">Last updated today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in;
        }
        
        .animate-slide-down {
          animation: slideDown 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}