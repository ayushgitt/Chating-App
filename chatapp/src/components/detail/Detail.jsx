import React from 'react'
import "./detail.css"
import { auth, db } from '../../lib/firebase'
import { chatStore } from '../../lib/chatStore'
import { userStore } from '../../lib/userStore'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
const Detail = () => {
  const {chatId,user,isCurrentUserBlocked,isReceiverBlocked,changeBlock}=
    chatStore();
    const {currentUser}=userStore();

  const handleBlock=async()=>{
    if(!user) return;

    const userDocRef=doc(db,"users",currentUser.id)
    try{
      await updateDoc(userDocRef,{
        blocked:isReceiverBlocked? arrayRemove(user.id):arrayUnion(user.id),

      });
      changeBlock();

    }catch(err){
      console.log(err)
    }
  };
  return (
    <div className='detail'>

      
      <div className="user">
        <img src={user.avatar||"./avatar.png"} alt="" />
        <h2>{user.username}</h2>
        <p>{user.email}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat setting</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Chat setting</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Share Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
        </div>

        <div className="photos">
          <div className="photoitem">
            <div className="photodetail">
            <img src="./chwal.jpg" alt=""  />
            <span>Picture at 11-2024</span>
            </div>
            <img src="./download.png" alt="" className='delpic' />
          </div>
          <div className="photoitem">
            <div className="photodetail">
            <img src="./chwal.jpg" alt=""  />
            <span>Picture at 11-2024</span>
            </div>
            <img src="./download.png" alt="" className='delpic' />
          </div> 
          <div className="photoitem">
            <div className="photodetail">
            <img src="./chwal.jpg" alt=""  />
            <span>Picture at 11-2024</span>
            </div>
            <img src="./download.png" alt="" className='delpic'/>
          </div> 
          
          
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>{
          isCurrentUserBlocked ? "You are Blocked!!": isReceiverBlocked?"User Blocked":"Blocked User"
          
          }</button>
        <button className='logoutbtn' onClick={()=>auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Detail