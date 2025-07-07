import React, { useContext, useEffect, useRef, useState } from 'react';
import Chatcontext from '../context/Chatcontext';
import { toast } from 'react-hot-toast';
import image from '../assets/photo.png';
import send from '../assets/send (1).png';
import microphone from "../assets/microphone.png";
import stopmike from "../assets/stopmike.png";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Chatarea = ({ setMobileView }) => {

  const [islistening, setislistening] = useState(false);
  const messageEndRef = useRef(null);
  const {
    selectedUser,
    messages,
    newMessage,
    setNewMessage,
    sendmessage,
    userdet,
    getmessages,
    setUnseenMessages,
    mike,
    setmike
  } = useContext(Chatcontext);

  const {
    transcript,
    resetTranscript
  } = useSpeechRecognition();

  const startlistening = () => {
    setislistening(true);
    SpeechRecognition.startListening({
      continuous: true,
      language: mike || 'en-IN'
    });
  };


  const stoplistening = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    setislistening(false);
  };

  useEffect(() => {
    if (islistening && transcript) {
      setNewMessage(prev => ({ ...prev, text: transcript }));
    }
  }, [transcript]);

  useEffect(() => {
    if (selectedUser?._id) {
      getmessages(selectedUser._id);
      setUnseenMessages(prev => ({
        ...prev,
        [selectedUser._id]: 0
      }));
    }
  }, [selectedUser]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.text.trim() && !newMessage.image) {
      toast.error('Please enter a message');
      return;
    }
    await sendmessage(newMessage);
    setNewMessage({ text: '', image: '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMessage(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = () => {
    setMobileView('media');
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <p className="text-gray-400 text-lg">Select a friend to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
        <button
          onClick={() => setMobileView('friends')}
          className="sm:hidden p-2 -ml-2 text-gray-400 hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          className="flex items-center space-x-3 flex-1 cursor-pointer"
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center overflow-hidden">
            {selectedUser.profilePicture ? (
              <img
                src={selectedUser.profilePicture}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-100 text-lg">
                {selectedUser.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-gray-100 font-medium">{selectedUser.name}</h3>
            <p className="text-sm text-gray-400">{selectedUser.bio || 'No bio set'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderId === userdet?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${message.senderId === userdet?._id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'}`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Message attachment"
                    className="max-w-full rounded-lg mb-2 h-[18rem]"
                  />
                )}
                {message.text && <p className="break-words">{message.text}</p>}
                <span className="text-xs opacity-70 mt-1 space-x-2">
                  <span>{new Date(message.createdAt).toISOString().split('T')[0]}</span>{' '}
                  <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <label className="p-2 hover:bg-gray-700 rounded-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <img src={image} alt="imageselect" className="w-7 h-7" />
          </label>

          <input
            type="text"
            value={newMessage.text}
            onChange={(e) => setNewMessage(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {islistening ? (
            <button type="button" onClick={stoplistening}>
              <img src={stopmike} alt="stop mic" className="w-8 h-8 cursor-pointer hover:bg-gray-700 rounded-full" />
            </button>
          ) : (
            <button type="button" onClick={startlistening}>
              <img src={microphone} alt="start mic" className="w-8 h-8 cursor-pointer hover:bg-gray-700 rounded-full" />
            </button>
          )}

          <button
            type="submit"
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <img src={send} alt="send" className="w-7 h-7" />
          </button>
        </div>

        {newMessage.image && (
          <div className="mt-2 relative">
            <img src={newMessage.image} alt="Upload preview" className="max-h-32 rounded-lg" />
            <button
              type="button"
              onClick={() => setNewMessage(prev => ({ ...prev, image: '' }))}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Chatarea;
