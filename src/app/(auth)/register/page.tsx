"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import axiosInstance from "@/lib/axiosInstance"
import { useState } from "react"
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // 1. Add toast import

// 2. Password validation helper
const passwordValidation = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character.");
  }
  return errors;
};

// Live password validation checker
const getPasswordValidationStatus = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    rememberMe: false,
    twoFactorAuth: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

    // 2. Password validation
    const passwordErrors = passwordValidation(form.password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      toast.error(passwordErrors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/doctor/register-doctor", {
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
      })
      setSuccess(res.data.message)
      toast.success(res.data.message || "Registration successful!");
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
      let errorMsgs = ["Registration failed"];
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data)) {
          errorMsgs = err.response.data;
        } else if (err.response.data.message) {
          errorMsgs = [err.response.data.message];
        }
      }
      setErrors(errorMsgs);
      toast.error(errorMsgs.join("\n"));
    }
    setLoading(false)
  }

  // Get password validation status
  const passwordStatus = getPasswordValidationStatus(form.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-teal-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-emerald-200 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-teal-300 rounded-full blur-md"></div>
      </div>

      {/* 3. Responsive design */}
      <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden relative z-10">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Stethoscope image - Hidden on small devices */}
          <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-teal-50/50 to-white">
            <div className="relative">
              <div className="w-72 h-72 bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                <img
                  src="/assets/images/black-stethoscope.png"
                  alt="Medical stethoscope"
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-2xl md:text-3xl font-semibold text-teal-600 text-center mb-8">Register</h1>

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

                {/* Password field with live validation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full h-12 px-4 pr-12 bg-gray-50 border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-400 focus:bg-white focus:border-teal-300 focus:ring-teal-200"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 focus:outline-none transition-colors duration-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Live Password Validation */}
                  {(passwordFocused || form.password) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-medium text-gray-600 mb-2">Password Requirements:</div>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${passwordStatus.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordStatus.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-xs ${passwordStatus.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordStatus.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          One uppercase letter
                        </div>
                        <div className={`flex items-center text-xs ${passwordStatus.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordStatus.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          One lowercase letter
                        </div>
                        <div className={`flex items-center text-xs ${passwordStatus.number ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordStatus.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          One number
                        </div>
                        <div className={`flex items-center text-xs ${passwordStatus.special ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${passwordStatus.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          One special character (!@#$%^&*...)
                        </div>
                      </div>
                    </div>
                  )}
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