import { userStore } from "../../../lib/userStore"
import "./userinfo.css"
import React from 'react'

const Userinfo = () => {
  
  const { currentUser, isLoading } = userStore(); // Correctly use Zustand hook
  if (isLoading) return <div>Loading...</div>; // Handle loading state
  if (!currentUser) return <div>No user found</div>; // Handle null case

  return (
    <div className="userinfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./edit.png" alt="" />
        <img src="./video.png" alt="" />
      </div>
    </div>
  )
}

export default Userinfo