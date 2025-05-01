import { lazy, useEffect } from "react";
// import Chat from "./components/chat/chat";
const Chat=lazy(()=> import("./components/chat/chat"));
const Detail =lazy(()=> import("./components/detail/detail"));
// import Detail from "./components/detail/detail";
const List=lazy(()=> import("./components/list/list"));
// import List from "./components/list/list";
const Login = lazy(()=> import ('./components/login/Login'));
// import Login from "./components/login/Login";
import { Notification } from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import {userStore} from "./lib/userStore"
import {chatStore} from "./lib/chatStore"



function App() {

  const {currentUser,isLoading,fetchUserInfo}=userStore();
  const {chatId}=chatStore()
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,(user)=>{
        fetchUserInfo(user?.uid);
        console.log(user);
    });

    return ()=>{
      unsub();
    };
  },[fetchUserInfo]);

  if(isLoading) return <div className="loading">Loading.....</div>


  // const user=false;

  return (
    <>
    <div className="container">
    {currentUser?(
      <><List/>
      {chatId && <Chat/>}
      {chatId && <Detail/>}
      </>
          ):(
      
        <Login/>
     )}
     <Notification/>
     </div>
     
    </>
  )
}

export default App
