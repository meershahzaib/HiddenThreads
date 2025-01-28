import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, ref, push, onValue } from "../firebase";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
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
        sender: "me", // Identifies the sender
      });
      setNewMessage("");
    }
  };

  return (
    <div className="pt-16 px-2 h-screen flex flex-col items-center bg-gray-100">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg flex flex-col h-[80vh] overflow-hidden">
        <div className="p-4 bg-gray-800 text-white text-center font-semibold">
          Anonymous Thread
        </div>
        
        <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-2 flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] p-3 rounded-lg text-sm ${message.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                {message.text}
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-2 border-t flex items-center bg-white">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 rounded-lg border border-gray-300 focus:outline-none"
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
