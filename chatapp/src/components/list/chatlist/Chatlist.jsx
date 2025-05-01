import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { userStore } from "../../../lib/userStore";
import chats from "../../chat/Chat";
import { AddUser } from "./addUser/AddUser";
import "./chatlist.css"

import React, { useEffect, useState } from 'react'
import { db } from "../../../lib/firebase";
import { chatStore } from "../../../lib/chatStore";

const Chatlist = () => {
  const [chats,setChats]=useState([])
  const [AddMore,setAddMore]=useState(false);
  const [input,setInput]=useState();
  const {currentUser}=userStore()
  const {chatId,changeChat}=chatStore();

  useEffect(()=>{
    const unsub = onSnapshot(doc(db,"userchats",currentUser.id), async(res) => {
      // setChats(doc.data());
      // console.log("Current data:", doc.data());
      const item=res.data().chats;
      const promises=item.map(async(item)=>{
        const userDocRef=doc(db,"users",item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user=userDocSnap.data()

        return {...item,user};
      });
      const chatData=await Promise.all(promises)
      setChats(chatData.sort((a,b)=>b.updateAt-a.updateAt))

    });
    
    return ()=>{
      unsub();
    }
  },[currentUser.id]);

  // console.log(chats)


  const handleSelect=async(Chat)=>{
    const userChats=chats.map((item)=>{
      const {user,...rest}=item;
      return rest;
    });
    const chatIndex=userChats.findIndex(item=>item.chatId === Chat.chatId)
    userChats[chatIndex].isSeen=true;
    const userChatRef=doc(db,"userchats",currentUser.id);
    try{
      await updateDoc(userChatRef,{
        chats:userChats,
      });
      changeChat(Chat.chatId,Chat.user)

    }catch(err){
      console.log(err)
    }


    

  };

  // const filteredChats=chats.filter((c)=>
  // c.user.username.toLowerCase().includes(input.toLowerCase()))


  const filteredChats = chats.filter((c) => 
    c?.user?.username?.toLowerCase()?.includes(input?.toLowerCase() ?? ''))



  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="search" onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img src={AddMore?"./minus.png":"./plus.png"} alt="" 
        className="adding"
        onClick={()=>setAddMore((prev)=> !prev)}/>
      </div>

      {filteredChats.map((Chat)=>(
      <div className="item" key={Chat.chatId} onClick={()=>handleSelect(Chat)} style={{backgroundColor: Chat.isSeen ? "transparent" : "#2f9da4",opacity:Chat.isSeen ? "1px":"0.7",borderRadius:Chat.isSeen ? "0px":"12px",}}
      
      >
        <img src={Chat.user.blocked.includes(currentUser.id)?"./avatar.png":Chat.user.avatar||"./avatar.png"} alt=""  />
        <div className="text" style={{margin:Chat.isSeen?"":"1px",}}>
        
               <span style={{marginLeft:Chat.isSeen?"":"-80rem"}}>{Chat.user.blocked.includes(currentUser.id)?"User":Chat.user.username}</span>
               <p style={{fontSize:"10px",opacity:"0.7",marginLeft:Chat.isSeen?"":"-80rem"}}>{Chat.lastMessage}</p>
   
        </div>
      </div>
      ))}



     {AddMore && <AddUser/>}
    
      
    </div>
  )
}

export default Chatlist