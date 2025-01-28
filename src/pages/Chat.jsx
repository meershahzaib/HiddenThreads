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
    <div className="pt-24 px-4 md:px-8 h-screen">
      <div className="max-w-4xl mx-auto glass h-[calc(100vh-120px)]">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700/30">
            <h1 className="text-xl font-medium">Anonymous Thread</h1>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === "me" ? "bg-primary/20" : "bg-gray-700/20"}`}>
                  {message.text}
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-gray-700/30">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-2 rounded-lg bg-dark-lighter border border-gray-700/30 focus:outline-none focus:border-primary"
              />
              <button type="submit" className="button-primary">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;