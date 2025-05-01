import React, { useState } from 'react'
import "./login.css"
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc } from 'firebase/firestore';
import {setDoc } from "firebase/firestore"; 
import supabase from '../../lib/superbase';



const Login = () => {
  const [avatar,setAvatar]=useState({
    file:null,
    url:""
  }) 

  const[loading,setLoading]=useState(false);

  const handleAvatar=e=>{
    if(e.target.files[0]){
    setAvatar({
      file:e.target.files[0],
      url:URL.createObjectURL(e.target.files[0])
    })
  }
  }

  const uploadAvatar = async (file) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('chatapp')
      .upload(`avatars/${fileName}`, file);
    
    if (error) {
      throw error;
    }
    
    // Get public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('chatapp')
      .getPublicUrl(data.path);
    
    return publicUrl;
  }

  const handleLogin = async (e) =>{
    e.preventDefault()
    setLoading(true);
    const formData = new FormData(e.target)
    const {email,password}=Object.fromEntries(formData);
    try{
      await signInWithEmailAndPassword(auth,email,password);

    }catch(err){
      console.log(err);
      console.log(err.message);
    }finally{
      setLoading(false);
    }

    toast.success("Congo!! Loged in successfully")
  }

  const handleRegister =async(e)=>{
    e.preventDefault()
    setLoading(true);
    const formData = new FormData(e.target)
    const {username,email,password}=Object.fromEntries(formData);
    
    try{
      // Upload avatar first
      let imgURL = "";
      if (avatar.file) {
        imgURL = await uploadAvatar(avatar.file);
      }

      const res=await createUserWithEmailAndPassword(auth,email,password)
      
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgURL, // Use the URL from Supabase storage
        id:res.user.uid,
        blocked:[]
      });
      
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats:[],
      });
      
      toast.success("Account Created ! You can login now!")

    }catch(err){
      console.log(err)
      toast.error(err.message)
    }
  }
  return (
    <div className='login'>
        <div className="item">
            <form onSubmit={handleLogin}>
                <h2>Welcome Back</h2>
                <input type="text" placeholder='Email' name='email'/>
                <input type="text" placeholder='Password' name='password'/>
                <button>Sign In</button>
            </form>
        </div>
                  <div className="saprator"></div>
                  <div className="item">
            
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                <label htmlFor="file">
                  <img src={avatar.url || "./avatar.png"} alt="" />
                  Upload an image</label>
                <input type="file" id='file' style={{display:"none"}} onChange={handleAvatar} />
                <input type="text" placeholder='Username' name='username' />
                <input type="text" placeholder='Email' name='email' />
                <input type="password" placeholder='Password' name='password'/>
                <button>Sign Up</button>
            </form>
        </div>
    </div>
  )
}

export default Login