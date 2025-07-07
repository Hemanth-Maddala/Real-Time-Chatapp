import React, { useState } from 'react'
import Leftfrnds from './leftfrnds'
import Chatarea from './Chatarea'
import Rightmedia from './rightmedia'

const Chat = () => {
  const [mobileView, setMobileView] = useState('friends') // 'friends', 'chat', 'media'

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Friends List
      // on mobile view it takes full width if view is frnds else hidden
      // appears in small screen unless mobileview is media
      // appears every time in small and large screens , for sm screen:- 240px , for large 80rem */}
      <div 
        className={`
          ${mobileView === 'friends' ? 'w-full' : 'hidden'} sm:block   
          ${mobileView === 'media' ? 'sm:hidden' : ''}    
          sm:w-[240px] lg:w-80 lg:block          
        `}
      >
        <Leftfrnds setMobileView={setMobileView} />
      </div>

      {/* Chat Area */}
      {/* // shows only when mobileView === 'chat'.
      // in small screens hidden if view is media
      // Displayed as block element on small and large screens */}
      <div 
        className={`
          ${mobileView === 'chat' ? 'w-full' : 'hidden'}  
          ${mobileView === 'media' ? 'sm:hidden' : ''}   
          sm:flex-1 sm:block lg:block 
        `}
      >
        <Chatarea setMobileView={setMobileView} mobileView={mobileView} />
      </div>

      {/* Media Area */}
      {/* On mobile: only shown when mobileView === 'media'.
      // On small screens: shown full-width if in 'media' view.
      // On large screens: always visible with fixed width. */}
      <div 
        className={`
          ${mobileView === 'media' ? 'w-full' : 'hidden'} 
          sm:w-full sm:${mobileView === 'media' ? 'block' : 'hidden'} 
          lg:w-80 lg:block
        `}
      >
        <Rightmedia setMobileView={setMobileView} />
      </div>
    </div>
  )
}

export default Chat