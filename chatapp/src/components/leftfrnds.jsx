import React, { useEffect, useContext, useState } from 'react'
import { toast } from 'react-hot-toast'
import Chatcontext from '../context/Chatcontext'
import { useNavigate } from 'react-router-dom'
import bgi from '../assets/bg.jpg'
import close from '../assets/close (2).png'
import add from '../assets/add.png'
import settings from "../assets/settings.png"

const Leftfrnds = ({ setMobileView }) => {
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const {
    token,
    setToken,
    setuserdet,
    userdet,
    setOnlineUsers,
    onlineUsers,
    socket,
    getusers,
    users,
    selectedUser,
    setSelectedUser,
    updateprofile,
    setupdateprofile,
    unseenMessages,
    mike,
    setmike
  } = useContext(Chatcontext)

  useEffect(() => {
    getusers()
  }, [onlineUsers])

  const handleLogout = async () => {
    if (socket?.connected) {
      socket.disconnect()
    }
    setuserdet(null)
    setOnlineUsers([])
    setSelectedUser(null)
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setMobileView('chat') // Switch to chat view on mobile when user is selected
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      // Create request body with only non-empty fields
      const updateData = {}

      if (updateprofile.name?.trim()) {
        updateData.name = updateprofile.name.trim()
      }

      if (updateprofile.bio?.trim()) {
        updateData.bio = updateprofile.bio.trim()
      }

      if (selectedImage) {
        updateData.profilePicture = selectedImage
      }

      // Only proceed if there are changes to update
      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to update')
        return
      }

      const response = await fetch('http://localhost:3000/user/updateprofile', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "token": `${token}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Profile updated successfully')
        setIsSettingsOpen(false)
        // Update local user data
        if (data.updateduser) {
          setuserdet({
            name: data.updateduser.name,
            email: data.updateduser.email,
            bio: data.updateduser.bio || "",
            profilePicture: data.updateduser.profilePicture || ""
          })
        }
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header with menu button */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-100">Friends</h2>
        <button
          onClick={() => setIsSideMenuOpen(true)}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden lg:flex gap-2">
          <select
            id="language"
            value={mike || ""}
            onChange={(e) => setmike(e.target.value)}
            className="block w-22 text-xs p-1 text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          >
            <option >Mike Lang</option>
            <option value="en-IN">English</option>
            <option value="te-IN">Telugu</option>
            <option value="hi-IN">Hindi</option>
          </select>
          <button onClick={() => setIsSettingsOpen(true)}>
            <img
              src={settings}
              alt='settings'
              className='h-7 w-7'
            />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {Array.isArray(users) && users.length > 0 && users.map((user) => (
          <div
            key={user._id}
            className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 ${selectedUser?._id === user._id ? 'bg-gray-700' : ''}`}
            onClick={() => handleUserSelect(user)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-100 text-lg">
                      {typeof user.name === 'string' ? user.name[0]?.toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${onlineUsers.includes(user._id) ? 'bg-emerald-500' : 'bg-gray-500'}`}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-100 truncate">{user.name}</p>
                  {unseenMessages[user._id] > 0 && (
                    <span className="bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {unseenMessages[user._id]}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-400">
                    {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Menu - Mobile Only */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-gray-800 shadow-lg">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-100">Menu</h3>
              <button
                onClick={() => setIsSideMenuOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <img src={close} alt="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setIsSettingsOpen(true)
                  setIsSideMenuOpen(false)
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
              <select
                id="language"
                value={mike || ""}
                onChange={(e) => setmike(e.target.value)}
                className="block w-full text-md p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                <option >Mike Lang</option>
                <option value="en-IN">English</option>
                <option value="te-IN">Telugu</option>
                <option value="hi-IN">Hindi</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="relative bg-cover bg-center"
            style={{
              backgroundImage: `url(${bgi})`,
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 w-96 max-w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-100">Profile Settings</h3>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <img
                    src={close}
                    alt="close"
                    className="w-5 h-5"
                  />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
                      {(selectedImage || updateprofile.profilePicture) ? (
                        <img
                          src={selectedImage || updateprofile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-gray-100">
                          {updateprofile.name ? updateprofile.name[0].toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-gray-700 rounded-full cursor-pointer hover:bg-violet-900"
                    >
                      <img
                        src={add}
                        alt="add"
                        className="w-7 h-7"
                      />
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={updateprofile.name}
                    onChange={(e) => setupdateprofile({ ...updateprofile, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                  <textarea
                    value={updateprofile.bio || ''}
                    onChange={(e) => setupdateprofile({ ...updateprofile, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24"
                    placeholder="Write something about yourself..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leftfrnds
