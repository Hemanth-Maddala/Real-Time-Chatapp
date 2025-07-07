import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import bgi from '../assets/bg.jpg'
import googleIcon from '../assets/google.png'
import { toast } from 'react-hot-toast'
import Chatcontext from '../context/Chatcontext'

const Login = () => {
  const { setToken, connectsocket } = useContext(Chatcontext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      const userdata = await response.json()
      if (userdata.success) {
        toast.success("Login successful")
        localStorage.setItem("token", userdata.token)
        setToken(userdata.token)
        connectsocket(userdata.user)
        navigate("/chat")
      } else {
        toast.error(userdata.message || "Login failed")
      }
    } catch (error) {
      console.log("error", error)
      toast.error("Login failed")
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${bgi})`,
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      {/* Content */}
      <div className='max-w-md w-full space-y-8 p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-md relative z-10'>
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Login to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Login
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/90 text-gray-500">Or</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => window.location.href = "http://localhost:3000/auth/google"}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <img
                src={googleIcon}
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/" className="font-medium text-green-600 hover:text-green-500">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
