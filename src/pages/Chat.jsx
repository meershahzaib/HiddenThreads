import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, ref, push, onValue } from "../firebase";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [replyMessage, setReplyMessage] = useState(null);

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

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      push(ref(db, "messages"), {
        text: newMessage,
        timestamp: Date.now(),
        sender: userId,
        replyTo: replyMessage ? replyMessage.text : null,
      });
      setNewMessage("");
      setReplyMessage(null);
    }
  };

  const handleSwipeToReply = (message) => {
    setReplyMessage(message);
  };

  return (
    <div className="pt-24 px-4 h-screen flex flex-col items-center bg-[#1e2938]">
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
              onSwipe={() => handleSwipeToReply(message)}
            >
              <div className={`max-w-[70%] p-3 rounded-lg text-sm ${message.sender === userId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                {message.replyTo && (
                  <div className="text-xs text-gray-400 border-l-2 border-gray-500 pl-2 mb-1">
                    Replying to: {message.replyTo}
                  </div>
                )}
                {message.text}
              </div>
            </motion.div>
          ))}
        </div>

        {replyMessage && (
          <div className="p-2 bg-gray-700 text-white text-sm flex items-center justify-between">
            <span>Replying to: {replyMessage.text}</span>
            <button onClick={() => setReplyMessage(null)} className="text-red-500">Cancel</button>
          </div>
        )}

        <form onSubmit={sendMessage} className="p-2 border-t flex items-center bg-[#1e2938] border-gray-500">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 rounded-lg border border-gray-500 focus:outline-none bg-gray-700 text-white"
          />
          <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
