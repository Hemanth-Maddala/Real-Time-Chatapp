import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Login from './components/Login'
import Chat from './components/Chat'
import Signin from './components/Signin'
import Usechat from './context/Usechat'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"))

  // This listens for changes to localStorage (e.g. login/logout from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"))
    }

    // Add listener when component mounts
    window.addEventListener('storage', handleStorageChange)

    // Clean up the listener when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Optional: Also listen for token changes on this tab
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token")
      setToken(currentToken)
    }, 1000) // check every second

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      setToken(tokenFromURL);

      // Clean the URL (remove ?token=...)
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = "/chat";
    }
  }, []);

  return (
    <Usechat>
      <Router>
        <Routes>
          <Route path='/login' element={!token ? <Login /> : <Navigate to="/chat" />} />
          <Route path='/' element={!token ? <Signin /> : <Navigate to="/chat" />} />
          <Route path='/chat' element={token ? <Chat /> : <Navigate to='/' />} />
        </Routes>
        <Toaster />
      </Router>
    </Usechat>
  )
}

export default App
