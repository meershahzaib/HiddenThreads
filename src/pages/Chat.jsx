import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { createClient } from '@supabase/supabase-js';
import { useSwipeable } from 'react-swipeable';

const supabase = createClient(
  'https://tttlokbnvaaohyeuiznx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dGxva2JudmFhb2h5ZXVpem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDc2MjYsImV4cCI6MjA1Mzc4MzYyNn0.h3jEFZe22ScG_oWOif4clBKajSbEM21qu8H-EhN5bHI'
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [swipeState, setSwipeState] = useState({ id: null, delta: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSentMessageId, setLastSentMessageId] = useState(null);

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
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let storedUserId = localStorage.getItem("chatUserId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("chatUserId", storedUserId);
    }
    setUserId(storedUserId);

    const channel = supabase.channel('realtime-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    channelRef.current = channel;

    fetchMessages();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleRealtimeUpdate = (payload) => {
    switch (payload.eventType) {
      case 'INSERT':
        setMessages(prev => {
          const isDuplicate = prev.some(msg => msg.id === payload.new.id);
          return isDuplicate ? prev : [...prev, payload.new];
        });
        break;
      case 'UPDATE':
        setMessages(prev => prev.map(msg =>
          msg.id === payload.new.id ? payload.new : msg
        ));
        break;
      case 'DELETE':
        setMessages(prev => prev.filter(msg =>
          msg.id !== payload.old.id
        ));
        break;
      default:
        break;
    }
  };

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

      const messageToSend = {
        text: newMessage.trim(),
        timestamp: Date.now(),
        sender: userId,
        replyTo: replyTo,
        file: fileData,
        read_by: []
      };

      const { data, error } = await supabase.from('messages').insert([messageToSend]).select();

      if (error) throw error;

      if (data && data[0]) {
        // Add the message immediately to local state
        setMessages(prev => [...prev, data[0]]);
        setLastSentMessageId(data[0].id);
      }

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
      if (Math.abs(e.deltaX) > 50) return;
      setSwipeState({ id: messageId, delta: e.deltaX });
    },
    onSwiped: (e, messageId) => {
      if (Math.abs(e.deltaX) > 50) setReplyTo(messageId);
      setSwipeState({ id: null, delta: 0 });
    },
    trackMouse: true,
    delta: 10,
    preventDefaultTouchmoveEvent: true,
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

  const SafeMessageComponent = ({ message }) => {
    const handlers = useSwipeable({
      onSwiping: (e) => swipeConfig.onSwiping(e, message.id),
      onSwiped: (e) => swipeConfig.onSwiped(e, message.id),
      trackMouse: swipeConfig.trackMouse,
      delta: swipeConfig.delta,
      preventDefaultTouchmoveEvent: swipeConfig.preventDefaultTouchmoveEvent
    });

    const messageRef = useRef();
    const hasRead = (message.read_by || []).includes(userId);

    const setRefs = useCallback(
      (node) => {
        handlers.ref(node);
        messageRef.current = node;
      },
      [handlers.ref]
    );

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const currentReaders = Array.isArray(message.read_by) ? message.read_by : [];
            if (!currentReaders.includes(userId)) {
              supabase
                .from('messages')
                .update({ read_by: [...currentReaders, userId] })
                .eq('id', message.id)
                .then(({ error }) => {
                  if (error) console.error('Error updating read status:', error);
                });
            }
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      if (messageRef.current) observer.observe(messageRef.current);
      return () => {
        if (messageRef.current) observer.unobserve(messageRef.current);
      };
    }, [message.read_by, userId, message.id]);

    return (
      <div className={`mb-4 flex ${message.sender === userId ? "justify-end" : "justify-start"}`}>
        <motion.div
          {...handlers}
          ref={setRefs}
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
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className={`text-xs ${message.sender === userId ? 'text-blue-200' : 'text-gray-400'}`}>
                {formatTimestamp(message.timestamp)}
              </span>
              <div className="flex items-center">
                {hasRead ? (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-black ml-1"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-black ml-[-6px]"
                    >
                      <path
                        d="M18 12L9 17L6.5 14.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-400 ml-1"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col bg-[#172133] overflow-hidden" 
      style={{
        height: '100dvh', 
        maxHeight: '-webkit-fill-available', 
        overscrollBehavior: 'none'
      }}
    >
      <div className="p-4 bg-[#2D3748] text-white text-center font-semibold text-lg border-b border-gray-600">
        Anonymous Public Thread
      </div>

      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 scrollbar touch-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          messages.map((message) => (
            <SafeMessageComponent key={message.id} message={message} />
          ))
        )}
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

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-600 bg-[#2D3748] safe-area-bottom">
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
            style={{ 
              fontSize: '16px',
              WebkitUserSelect: 'text',
              userSelect: 'text'
            }}
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
        html, body {
          overscroll-behavior: none;
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
          touch-action: manipulation;
        }

        @supports (-webkit-touch-callout: none) {
          body {
            height: -webkit-fill-available;
          }
        }

        .safe-area {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .safe-area-bottom {
          padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
        }

        @media (max-width: 640px) {
          .scrollbar::-webkit-scrollbar {
            display: none;
          }

          input, textarea, select, button {
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
          }
        }

        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
      `}</style>
    </div>
  );
};

export default Chat;