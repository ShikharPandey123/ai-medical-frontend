"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/lib/axiosInstance"
import { useState } from "react"
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    rememberMe: false,
    twoFactorAuth: false,
  })
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    })
    setErrors([])
    setSuccess("")
  }

  // const handleCheckboxChange = (name, checked) => {
  //   setForm({ ...form, [name]: checked })
  //   setErrors([])
  //   setSuccess("")
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])
    setSuccess("")
    try {
  const res = await axiosInstance.post("/doctor/register-doctor", {
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
      })
      setSuccess(res.data.message)
      router.push("/login");
      setForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        rememberMe: false,
        twoFactorAuth: false,
      })
    } catch (err) {
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data)) {
          setErrors(err.response.data)
        } else if (err.response.data.message) {
          setErrors([err.response.data.message])
        } else {
          setErrors(["Registration failed"])
        }
      } else {
        setErrors(["Registration failed"])
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-teal-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-emerald-200 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-teal-300 rounded-full blur-md"></div>
      </div>

      <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <div className="flex">
          {/* Left side - Stethoscope image */}
          <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-teal-50/50 to-white">
            <div className="relative">
              <img
                src="/assets/images/black-stethoscope.png"
                alt="Medical stethoscope"
                className="w-72 h-72 object-contain"
              />
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="flex-1 p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-3xl font-semibold text-teal-600 text-center mb-8">Register</h1>

              {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
              {errors.length > 0 && (
                <div className="mb-4 text-red-600">
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-center">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-gray-50 border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:bg-white focus:border-teal-300 focus:ring-teal-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-gray-50 border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:bg-white focus:border-teal-300 focus:ring-teal-200"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-gray-50 border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:bg-white focus:border-teal-300 focus:ring-teal-200 pr-12"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-13 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5 " />
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <Input
                    type="text"
                    name="specialization"
                    placeholder="Enter medical specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full h-12 px-4 bg-gray-50 border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:bg-white focus:border-teal-300 focus:ring-teal-200"
                    required
                  />
                </div>

                {/* Checkboxes */}
                {/* <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember"
                      checked={form.rememberMe}
                      onCheckedChange={(checked) => handleCheckboxChange("rememberMe", checked)}
                      className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="2fa"
                      checked={form.twoFactorAuth}
                      onCheckedChange={(checked) => handleCheckboxChange("twoFactorAuth", checked)}
                      className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <label htmlFor="2fa" className="text-sm text-gray-600">
                      Two-factor authentication
                    </label>
                  </div>
                </div> */}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium text-base rounded-lg mt-8"
                >
                  {loading ? "Registering..." : "REGISTER"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
