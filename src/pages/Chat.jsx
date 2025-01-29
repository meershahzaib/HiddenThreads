import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, ref, push, onValue, storage, uploadBytes, getDownloadURL } from "../firebase";
import { FaPaperclip, FaPaperPlane, FaReply } from "react-icons/fa";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem("chatUserId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", storedUserId);
    }
    setUserId(storedUserId);

    const messagesRef = ref(db, "messages");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() || file) {
      let fileUrl = null;
      if (file) {
        const storageRef = ref(storage, `uploads/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);
        setFile(null);
        setFilePreview(null);
      }
      
      push(ref(db, "messages"), {
        text: newMessage,
        fileUrl: fileUrl || null,
        timestamp: Date.now(),
        sender: userId,
        replyTo: replyTo || null,
      });
      setNewMessage("");
      setReplyTo(null);
    }
  };

  return (
    <div className="pt-20 px-2 h-screen flex flex-col items-center bg-[#1e2938]">
      <div className="w-full max-w-lg bg-[#1e2938] shadow-lg rounded-2xl border border-gray-500 flex flex-col h-[73vh] overflow-hidden">
        <div className="p-4 bg-gray-800 text-white text-center font-semibold text-lg">
          Anonymous Thread
        </div>
        
        <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-2 flex ${message.sender === userId ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] p-3 rounded-lg text-sm ${message.sender === userId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                <div className="flex items-start gap-2">
                  {message.replyTo && (
                    <div className="text-gray-500 text-xs mb-1 italic">Replying to: {message.replyTo}</div>
                  )}
                  <button
                    className="text-gray-500 hover:text-gray-300"
                    onClick={() => setReplyTo(message.text)}
                  >
                    <FaReply size={14} />
                  </button>
                </div>
                {message.text}
                {message.fileUrl && (
                  <div>
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img src={message.fileUrl} alt="File" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {replyTo && (
          <div className="p-2 bg-gray-700 text-white text-xs text-center border-t border-gray-500">
            Replying to: {replyTo}
          </div>
        )}

        <form onSubmit={sendMessage} className="p-2 border-t flex items-center bg-[#1e2938] border-gray-500">
          <label className="cursor-pointer text-white mx-2">
            <FaPaperclip size={20} />
            <input 
              type="file" 
              accept="image/*, application/pdf" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files[0] && e.target.files[0].size <= 5 * 1024 * 1024) {
                  setFile(e.target.files[0]);
                  setFilePreview(URL.createObjectURL(e.target.files[0]));
                } else {
                  alert("File size must be 5MB or less");
                }
              }}
            />
          </label>
          
          {filePreview && (
            <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover mx-2 rounded-lg" />
          )}
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-1 rounded-lg border border-gray-500 focus:outline-none bg-gray-700 text-white w-3/5"
          />
          
          <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded-lg">
            <FaPaperPlane size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
