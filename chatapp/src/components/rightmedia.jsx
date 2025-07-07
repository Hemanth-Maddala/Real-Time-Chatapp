import React, { useContext, useEffect, useState } from 'react'
import Chatcontext from '../context/Chatcontext'

const Rightmedia = ({ setMobileView }) => {
  const { selectedUser, messages, userdet, onlineUsers } = useContext(Chatcontext)
  const [mediaMessages, setMediaMessages] = useState([])

  useEffect(() => {
    if (messages && Array.isArray(messages)) {
      // Filter messages that contain images
      const mediaOnly = messages.filter(message => message.image)
      setMediaMessages(mediaOnly)
    }
  }, [messages])

  if (!selectedUser) {
    return (
      <div className="h-full bg-gray-900 border-l border-gray-700 p-4 hidden lg:block">
        <p className="text-gray-400 text-center">Select a friend to view their details and media</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Header with back button */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <button
          onClick={() => setMobileView('chat')}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-200 lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold text-gray-100 ml-2">Media & Profile</h3>
      </div>

      {/* Friend's Profile Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden mb-4">
            {selectedUser.profilePicture ? (
              <img
                src={selectedUser.profilePicture}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-100 text-3xl">
                {selectedUser.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">{selectedUser.name}</h2>
          <p className="text-gray-400 text-center text-sm mb-4">{selectedUser.bio || 'No bio set'}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${onlineUsers.includes(selectedUser._id) ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
              {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-gray-100 font-medium mb-4">Shared Media</h3>
        {mediaMessages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {mediaMessages.map((message, index) => (
              <div key={message._id || index} className="relative group">
                <img
                  src={message.image}
                  alt={`Shared media ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                />
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(message.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No media shared yet</p>
        )}
      </div>
    </div>
  )
}

export default Rightmedia