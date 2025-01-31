import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';
import { useSwipeable } from 'react-swipeable';

const supabase = createClient('https://tttlokbnvaaohyeuiznx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dGxva2JudmFhb2h5ZXVpem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDc2MjYsImV4cCI6MjA1Mzc4MzYyNn0.h3jEFZe22ScG_oWOif4clBKajSbEM21qu8H-EhN5bHI');

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] =  useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [swipeState, setSwipeState] = useState({ id: null, delta: 0 });

  const channelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) console.error('Error fetching messages:', error);
    else setMessages(data || []);
  };

  useEffect(() => {
    let storedUserId = localStorage.getItem("chatUserId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", storedUserId);
    }
    setUserId(storedUserId);

    channelRef.current = supabase.channel('messages');

    channelRef.current
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
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          fetchMessages();
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be 5MB or less");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert("Only images (JPEG, PNG, GIF) and PDF files are allowed");
      return;
    }

    setFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    try {
      const fileName = `${userId}_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(`uploads/${fileName}`, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(`uploads/${fileName}`);

      return { url: publicUrl, type: file.type, name: file.name };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }, [userId]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || isUploading) return;

    try {
      setIsUploading(true);
      const fileData = file ? await uploadFile(file) : null;

      const { error } = await supabase.from('messages').insert([{
        text: newMessage.trim(),
        timestamp: Date.now(),
        sender: userId,
        replyTo: replyTo,
        file: fileData
      }]);

      if (error) throw error;

      setNewMessage("");
      setFile(null);
      setFilePreview(null);
      setReplyTo(null);
      setShouldAutoScroll(true);
    } catch (error) {
      alert("Error sending message. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [newMessage, file, isUploading, uploadFile, userId, replyTo]);

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const swipeConfig = useMemo(() => ({
    onSwiping: (e, messageId) => {
      if (Math.abs(e.deltaX) > 20) return;
      setSwipeState({ id: messageId, delta: e.deltaX });
    },
    onSwiped: (e, messageId) => {
      if (Math.abs(e.deltaX) > 20) setReplyTo(messageId);
      setSwipeState({ id: null, delta: 0 });
    },
    trackMouse: true
  }), []);

  const renderFilePreview = useCallback((message) => {
    if (!message.file) return null;

    return message.file.type.startsWith('image/') ? (
      <div className="relative mt-1 max-w-xs">
        <a href={message.file.url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={message.file.url}
            alt="Shared content"
            className="w-full h-auto rounded-sm border border-white/20"
            style={{ maxHeight: '120px' }}
          />
        </a>
      </div>
    ) : (
      <a
        href={message.file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-blue-400 underline"
      >
        {message.file.name}
      </a>
    );
  }, []);

  useEffect(() => {
    return () => filePreview && URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  const MessageComponent = useCallback(({ message }) => {
    const handlers = useSwipeable({
      onSwiping: (e) => swipeConfig.onSwiping(e, message.id),
      onSwiped: (e) => swipeConfig.onSwiped(e, message.id),
      trackMouse: swipeConfig.trackMouse
    });

    return (
      <div className={`mb-4 flex ${message.sender === userId ? "justify-end" : "justify-start"}`}>
        <motion.div
          {...handlers}
          className="max-w-[80%] relative"
          style={{
            x: swipeState.id === message.id ? swipeState.delta : 0,
            overflowX: 'hidden'
          }}
        >
          <div
            className="p-2 rounded-lg relative bg-gradient-to-br text-sm"
            style={{
              background: message.sender === userId
                ? 'linear-gradient(to bottom right, #3B82F6, #2563EB)'
                : 'linear-gradient(to bottom right, #374151, #1F2937)',
              color: message.sender === userId ? 'white' : '#F3F4F6',
              boxShadow: message.sender === userId
                ? '4px 4px 10px rgba(59, 130, 246, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.1)'
                : '4px 4px 10px rgba(0, 0, 0, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.05)'
            }}
          >
            {message.replyTo && (
              <div className={`text-xs mb-1 ${message.sender === userId ? "text-blue-200" : "text-gray-400"}`}>
                 {messages.find(m => m.id === message.replyTo)?.text || 'file'}
              </div>
            )}
            <div>{message.text}</div>
            {renderFilePreview(message)}
            <div className={`text-xs mt-1 ${message.sender === userId ? 'text-blue-200' : 'text-gray-400'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }, [userId, swipeState, swipeConfig, renderFilePreview, formatTimestamp, messages]);

  return (
    <div className="h-screen w-full bg-[#172133] flex flex-col">
      <div className="p-4 bg-[#2D3748] text-white text-center font-semibold text-lg border-b border-gray-600">
        Anonymous Public Thread
      </div>

      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 scrollbar"
      >
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!shouldAutoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            scrollToBottom();
          }}
          className="fixed bottom-24 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-transform hover:scale-105 z-50"
        >
          ↓
        </button>
      )}

      {replyTo && (
        <div className="px-4 py-2 bg-[#2D3748] text-gray-300 text-xs border-t border-gray-600 flex items-center justify-between">
          <span className="truncate">
             {messages.find(m => m.id === replyTo)?.text || 'file'}
          </span>
          <button onClick={() => setReplyTo(null)} className="ml-2 text-gray-400 hover:text-white">
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
                onClick={() => { setFile(null); setFilePreview(null); }}
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
            className={`${isUploading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white p-2 rounded-xl transition-colors`}
            disabled={isUploading}
          >
            <FaPaperPlane size={20} />
          </button>
        </div>
      </form>

      <style jsx global>{`
        .scrollbar::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }

        .scrollbar::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #718096;
        }

        .scrollbar::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Chat;