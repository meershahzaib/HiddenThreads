import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';
import { useSwipeable } from 'react-swipeable';

const supabase = createClient('https://tttlokbnvaaohyeuiznx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dGxva2JudmFhb2h5ZXVpem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDc2MjYsImV4cCI6MjA1Mzc4MzYyNn0.h3jEFZe22ScG_oWOif4clBKajSbEM21qu8H-EhN5bHI');

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let storedUserId = localStorage.getItem("chatUserId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", storedUserId);
    }
    setUserId(storedUserId);

    const channel = supabase
      .channel('messages')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        payload => {
          if (payload.new) {
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              const messageIndex = newMessages.findIndex(m => m.id === payload.new.id);

              if (messageIndex >= 0) {
                newMessages[messageIndex] = payload.new;
              } else {
                newMessages.push(payload.new);
              }

              return newMessages.sort((a, b) => a.timestamp - b.timestamp);
            });
          }
        }
      )
      .subscribe();

    fetchMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be 5MB or less");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only images (JPEG, PNG, GIF) and PDF files are allowed");
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const preview = URL.createObjectURL(selectedFile);
      setFilePreview(preview);
    } else {
      setFilePreview(null);
    }
  };

  const uploadFile = async (file) => {
    try {
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}_${file.name}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        type: file.type,
        name: file.name
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || isUploading) return;

    try {
      setIsUploading(true);
      let fileData = null;

      if (file) {
        fileData = await uploadFile(file);
      }

      const messageData = {
        text: newMessage.trim(),
        timestamp: Date.now(),
        sender: userId,
        replyTo: replyTo ? replyTo : null,
        file: fileData
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage("");
      setFile(null);
      setFilePreview(null);
      setReplyTo(null);
    } catch (error) {
      alert("Error sending message. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const swipeHandlers = useSwipeable({
    onSwiped: (eventData) => {
      const messageElement = eventData.event.target.closest('.message-container');
      if (messageElement) {
        setReplyTo(messageElement.dataset.id);
        setTimeout(() => setReplyTo(null), 2000);
      }
    },
    trackMouse: true
  });

  const renderFilePreview = (message) => {
    if (!message.file) return null;

    if (message.file.type.startsWith('image/')) {
      return (
        <div className="relative mt-1 max-w-xs">
          <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={message.file.url}
              alt="Shared image"
              className="w-full h-auto rounded-sm border border-white/20"
              style={{ maxHeight: '120px' }}
            />
          </a>
        </div>
      );
    } else if (message.file.type === 'application/pdf') {
      return (
        <a
          href={message.file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-blue-400 underline"
        >
          {message.file.name}
        </a>
      );
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#172133] px-4">
      <div className="w-full max-w-2xl bg-[#1E293B] shadow-2xl rounded-2xl flex flex-col h-[80vh] overflow-hidden">
        <div className="p-4 bg-[#2D3748] text-white text-center font-semibold text-lg border-b border-gray-600">
          Anonymous Thread
        </div>

        <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 flex ${message.sender === userId ? "justify-end" : "justify-start"}`}
              {...swipeHandlers}
            >
              <div 
                className="max-w-[80%] group relative message-container"
                data-id={message.id}
              >
                <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div
                  className={`p-2 rounded-lg relative ${
                    message.sender === userId
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100"
                  }`}
                  style={{
                    boxShadow: message.sender === userId
                      ? "4px 4px 10px rgba(37, 99, 235, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.1)"
                      : "4px 4px 10px rgba(0, 0, 0, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow">
                      {message.replyTo && (
                        <div className={`text-xs mb-1 ${message.sender === userId ? "text-blue-200" : "text-gray-400"}`}>
                          Replying to: {messages.find(m => m.id === message.replyTo)?.text || 'a file'}
                        </div>
                      )}
                      <div className="text-sm">{message.text}</div>
                      {renderFilePreview(message)}
                      <div className={`text-xs mt-1 ${message.sender === userId ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {replyTo && (
          <div className="px-4 py-2 bg-[#2D3748] text-gray-300 text-xs border-t border-gray-600 flex items-center justify-between">
            <span className="truncate">
              Replying to: {messages.find(m => m.id === replyTo)?.text || 'a file'}
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} className="p-4 border-t border-gray-600 bg-[#2D3748]">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer text-gray-400 hover:text-white transition-colors">
              <FaPaperclip size={20} />
              <input
                type="file"
                accept="image/*, application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>

            {filePreview && (
              <div className="relative">
                <img src={filePreview} alt="Preview" className="w-8 h-8 object-cover rounded-lg border border-gray-600/20" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs shadow-lg"
                >
                  ✕
                </button>
              </div>
            )}

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-2 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 bg-[#1E293B] text-white text-sm transition-colors"
              disabled={isUploading}
            />

            <button
              type="submit"
              className={`${isUploading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white p-2 rounded-xl transition-colors`}
              disabled={isUploading}
            >
              <FaPaperPlane size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;n