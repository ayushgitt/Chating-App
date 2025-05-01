import EmojiPicker from "emoji-picker-react"
import "./chat.css"
import { useEffect, useRef, useState } from "react"
import { chatStore } from "../../lib/chatStore"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { userStore } from "../../lib/userStore"
import supabase from "../../lib/superbase"

const Chat = () => {
  const [open, setopen] = useState(false)
  const [text, setText] = useState("")
  const [chat, setChat] = useState(null)
  const { chatId, user,isCurrentUserBlocked,isReceiverBlocked } = chatStore();
  const { currentUser } = userStore();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  
  const [isUploading, setIsUploading] = useState(false); // Track upload state

  const endRef = useRef(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages])

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        setChat(res.data());
      }
    );
    return () => {
      unsub();
    };
  }, [chatId]);

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleImg = e => {
    if(e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  // Function to upload image to Supabase
  const uploadImage = async (file) => {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('chatapp')
      .upload(`chat-images/${fileName}`, file);
    
    if (error) {
      throw error;
    }
    
    // Get public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('chatapp')
      .getPublicUrl(data.path);
    
    return publicUrl;
  }

  const handleSend = async () => {
    if (text === "" && !img.file) return; // Don't send empty messages without images
    
    setIsUploading(true);
    let imgUrl = null;
    
    try {
      // Upload image if exists
      if (img.file) {
        imgUrl = await uploadImage(img.file);
      }

      // Update the chat messages
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text || "", // Handle case where only image is sent
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }), // Only add img if URL exists
        })
      });

      // Update last message in user chats
      const userIDs = [currentUser.id, user.id];
      const lastMessageText = text || (imgUrl ? "Image" : ""); // Handle image-only messages
      
      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatSnapshot = await getDoc(userChatRef);
        
        if (userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            const updatedChats = [...userChatsData.chats];
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              lastMessage: lastMessageText || "Image", // Show "Image" if no text
              isSeen: id === currentUser.id,
              updatedAt: Date.now(),
            };

            await updateDoc(userChatRef, {
              chats: updatedChats,
            });
          }
        }
      });

      setText("");
      setImg({
        file: null,
        url: "",
      });

    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsUploading(false);
    }
  };
  console.log(chat)

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="text">
            <span>{user?.username}</span>
            <p>{user.email} </p>
            
          </div>
          
        </div>
        <div className="icon">
          <img src="./info.png" alt="" />
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
        </div>
      </div>
      

      <div className="center">
      {chat?.messages?.map(message => (
  <div className={`message ${message.senderId === currentUser.id ? "own" : ""}`} key={message?.createdAt}>
    <div className="text">
      {message.img && (
        <img 
          src={message.img} 
          alt="Received image" 
          style={{
            maxWidth: '300px',     // Same as sent images
            maxHeight: '300px',    // Same as sent images
            width: 'auto',
            height: 'auto',
            borderRadius: '10px',
            objectFit: 'contain',
            margin: '8px 0'
          }}
        />
      )}
      <p>{message.text}</p>
    </div>
  </div>
))}

        {img.url && (
          <div className="message own"  >
            <div className="texts">
              <img src={img.url} alt="Preview" 
              style={{
                maxWidth: '300px',
                maxHeight: '300px',
                width: 'auto',
                height: 'auto',
                borderRadius: '10px',
                objectFit: 'contain',
                margin: '8px 0'
              }}
              />
            </div>
          </div>

          
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icon">
          <label htmlFor="file">
            <img src="./img.png" alt="Attach image" />
          </label>
          <input 
            type="file" 
            id="file" 
            style={{display:"none"}} 
            accept="image/*" 
            onChange={handleImg}
          />
          <img src="./camera.png" alt="Take photo" />
          <img src="./mic.png" alt="Record voice" />
        </div>

        <input 
          type="text" 
          placeholder={(isCurrentUserBlocked || isReceiverBlocked)?"You can not send a message":'Type a message...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />

        <div className="emoji">
          <img 
            src="./emoji.png" 
            alt="Emoji picker"
            onClick={() => setopen((prev) => !prev)} 
          />
          {open && (
            <div className="emojipicker">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <button 
          className="sendbutton" 
          onClick={handleSend}
          // disabled={isUploading}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          {isUploading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  )
}

export default Chat