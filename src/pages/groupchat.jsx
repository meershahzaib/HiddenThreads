import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { 
  FaPaperclip, 
  FaUser, 
  FaArrowAltCircleRight, 
  FaMagic, 
  FaFileArchive, 
  FaFilePdf 
} from "react-icons/fa";
import { FiCopy, FiSend, FiEdit } from "react-icons/fi";
import { supabase } from "../supabaseClient";
import { useSwipeable } from "react-swipeable";
import { toast, Toaster } from "react-hot-toast";

// ─── HELPER: ANONYMOUS USERNAME GENERATOR ──────────────────────────────────
// Generates a random anonymous username using an adjective + noun combination,
// ensuring the total length is between 8 and 10 characters.
const generateAnonymousUsername = () => {
  const adjectives = [
    "Calm", "Cryptic", "Enigmatic", "Shadow", "Mystic", "Phantom", "Nebulous", "Obscure",
    "Celestial", "Eerie", "Vesper", "Twilight", "Midnight", "Spectral", "Ghostly",
    "Silent", "Mysterious", "Hidden", "Arcane", "Secret", "Frosty", "Stormy", "Lunar",
    "Solar", "Cosmic"
  ];
  const nouns = [
    "Raven", "Serpent", "Eclipse", "Mirage", "Tempest", "Oracle", "Reaper", "Spirit",
    "Shade", "Wraith", "Enigma", "Cipher", "Labyrinth", "Crypt", "Obsidian", "Falcon",
    "Panther", "Viper", "Cobra", "Mystery", "Phantom", "Zephyr", "Nebula", "Comet", "Galaxy"
  ];
  for (let i = 0; i < 10; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const username = `${adj}${noun}`;
    if (username.length >= 8 && username.length <= 10) {
      return username;
    }
  }
  // Fallback: if no valid combination is found, trim a longer one.
  const fallback = `${adjectives[0]}${nouns[0]}`;
  return fallback.substring(0, 10).padEnd(8, "0");
};

// ─── HELPER: UNIQUE USERNAME GENERATOR ─────────────────────────────────────
// Generates a new username ensuring it is not identical to the current value.
const generateUniqueAnonymousUsername = (current) => {
  let newName = generateAnonymousUsername();
  while (newName === current) {
    newName = generateAnonymousUsername();
  }
  return newName;
};

// ─── REPLY PREVIEW COMPONENT ─────────────────────────────────────────────
const ReplyPreview = ({ originalMessage, onCancel }) => {
  const previewText =
    originalMessage?.text ||
    (originalMessage?.file?.type.startsWith("image/") ? "Image" : "File");

  return (
    <motion.div
      className="px-4 py-3 bg-[#1E293B] border-t border-gray-700 flex items-center justify-between reply-preview shadow-lg rounded-t-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col">
        <div className="text-xs font-medium uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
          </svg>
          Replying to
        </div>
        <div className="text-sm text-gray-300 truncate max-w-[80vw]">
          {previewText}
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  );
};

// ─── USERNAME MODAL (Initial) ─────────────────────────────────────────────
const UsernameModal = ({ onUsernameSet }) => {
  const [tempUsername, setTempUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameToCheck = tempUsername.trim();
    if (!usernameToCheck) return;
    try {
      const { data, error: fetchError } = await supabase
        .from("private_messages")
        .select("sender")
        .eq("sender", usernameToCheck)
        .limit(1);
      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        setError("Username is already taken. Please choose another.");
        toast.error("Username is already taken. Please choose another.");
        return;
      }
      localStorage.setItem("chatUsername", usernameToCheck);
      await supabase.rpc("set_current_user", { username: usernameToCheck });
      toast.success("Username set successfully.");
      onUsernameSet(usernameToCheck);
    } catch (err) {
      console.error("Error checking username:", err);
      setError("An error occurred while checking username availability.");
      toast.error("An error occurred while checking username availability.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gray-900 rounded-xl shadow-2xl p-10 max-w-sm w-full mx-4 border border-gray-700"
      >
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full border border-gray-600">
            <FaUser size={28} className="text-white" />
          </div>
          <p className="text-gray-400 text-sm">
            Choose a unique username 🔥
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 transition-all duration-200"
            />
          </div>
          {/* Generate Username Button */}
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() =>
                setTempUsername(generateUniqueAnonymousUsername(tempUsername))
              }
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 rounded hover:from-green-500 hover:to-blue-600 transition-colors"
            >
              <FaMagic size={18} />
              <span>Generate Username</span>
            </button>
          </div>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-base py-2 rounded shadow-md transition-all flex items-center justify-center gap-2"
          >
            <FaUser className="text-xs" />
            <span>Continue</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── USERNAME CHANGE MODAL ─────────────────────────────────────────────
const UsernameChangeModal = ({ currentUsername, onUsernameChange, onClose }) => {
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    const usernameToCheck = newUsername.trim();
    if (!usernameToCheck) return;
    if (usernameToCheck === currentUsername) {
      setError("New username must be different.");
      toast.error("New username must be different.");
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from("private_messages")
        .select("sender")
        .eq("sender", usernameToCheck)
        .limit(1);
      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        setError("Username is already taken. Please choose another.");
        toast.error("Username is already taken. Please choose another.");
        return;
      }
      localStorage.setItem("chatUsername", usernameToCheck);
      await supabase.rpc("set_current_user", { username: usernameToCheck });
      toast.success("Username changed successfully.");
      onUsernameChange(usernameToCheck);
      onClose();
    } catch (err) {
      console.error("Error changing username:", err);
      setError("An error occurred while changing username.");
      toast.error("An error occurred while changing username.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-700"
      >
        <div className="flex flex-col items-center space-y-2 mb-4">
          <h2 className="text-xl font-bold text-white">Change Username</h2>
          <p className="text-gray-400 text-sm">Enter a new unique username.</p>
        </div>
        <form onSubmit={handleUsernameChange} className="space-y-4">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="New username"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 transition-all duration-200"
          />
          {/* Generate Username Button */}
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() =>
                setNewUsername(generateUniqueAnonymousUsername(newUsername))
              }
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 rounded hover:from-green-500 hover:to-blue-600 transition-colors"
            >
              <FaMagic size={18} />
              <span>Generate Username</span>
            </button>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold"
            >
              Change
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── PINNED PREWRITTEN MESSAGE COMPONENT ───────────────────────────────────
const PinnedMessage = () => {
  const guidelines = "📌 Welcome Friends , Enjoy The Space 📌";
  return (
    <div className="my-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center rounded-lg shadow-md">
      <p className="text-sm font-medium">{guidelines}</p>
    </div>
  );
};

// ─── SAFE MESSAGE COMPONENT WITH REACTION POPUP ─────────────────────────
const SafeMessageComponent = ({ message, onReply, allMessages }) => {
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reaction, setReaction] = useState(
    message.reactions ? message.reactions[localStorage.getItem("chatUsername")] : null
  );
  const [popupStyle, setPopupStyle] = useState({ left: "50%", transform: "translate(-50%, -10px)" });
  const longPressTimer = useRef(null);
  const messageRef = useRef();
  const username = localStorage.getItem("chatUsername");
  const hasRead = (message.read_by || []).includes(username);

  useEffect(() => {
    setReaction(message.reactions ? message.reactions[username] : null);
  }, [message.reactions, username]);

  const aggregatedReactions = useMemo(() => {
    const agg = {};
    const reactionsObj = message.reactions || {};
    Object.keys(reactionsObj).forEach((user) => {
      const emoji = reactionsObj[user];
      agg[emoji] = (agg[emoji] || 0) + 1;
    });
    return agg;
  }, [message.reactions]);

  const swipeX = useMotionValue(0);
  const swipeConfig = useMemo(
    () => ({
      onSwiping: (e, messageId) => {
        if (Math.abs(e.deltaX) > 70) {
          cancelLongPress();
          return;
        }
        swipeX.set(e.deltaX);
      },
      onSwiped: (e, messageId) => {
        if (Math.abs(e.deltaX) > 70) {
          if (onReply) onReply(messageId);
        }
        swipeX.set(0);
      },
      trackMouse: true,
      delta: 20,
      preventDefaultTouchmoveEvent: true,
    }),
    [onReply, swipeX]
  );
  const handlers = useSwipeable({
    onSwiping: (e) => swipeConfig.onSwiping(e, message.id),
    onSwiped: (e) => swipeConfig.onSwiped(e, message.id),
    trackMouse: swipeConfig.trackMouse,
    delta: swipeConfig.delta,
    preventDefaultTouchmoveEvent: true,
  });

  const startLongPress = (e) => {
    e.persist && e.persist();
    longPressTimer.current = setTimeout(() => {
      setShowReactionPopup(true);
    }, 800);
  };

  const cancelLongPress = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseDown = (e) => {
    startLongPress(e);
    handlers.onMouseDown && handlers.onMouseDown(e);
  };
  const handleTouchStart = (e) => {
    startLongPress(e);
    handlers.onTouchStart && handlers.onTouchStart(e);
  };
  const handleMouseUp = (e) => {
    cancelLongPress(e);
    handlers.onMouseUp && handlers.onMouseUp(e);
  };
  const handleMouseLeave = (e) => {
    cancelLongPress(e);
    handlers.onMouseLeave && handlers.onMouseLeave(e);
  };
  const handleTouchEnd = (e) => {
    cancelLongPress(e);
    handlers.onTouchEnd && handlers.onTouchEnd(e);
  };
  const handleTouchCancel = (e) => {
    cancelLongPress(e);
    handlers.onTouchCancel && handlers.onTouchCancel(e);
  };

  useEffect(() => {
    if (showReactionPopup && messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      const popupWidth = 150;
      const padding = 8;
      let style = { left: "50%", transform: "translate(-50%, -10px)" };
      if (message.sender === username) {
        if (rect.right + popupWidth / 2 > window.innerWidth - padding) {
          style = { right: padding, transform: "translate(0, -10px)" };
        } else {
          style = { left: "50%", transform: "translate(-50%, -10px)" };
        }
      } else {
        if (rect.left - popupWidth / 2 < padding) {
          style = { left: padding, transform: "translate(0, -10px)" };
        } else {
          style = { left: "50%", transform: "translate(-50%, -10px)" };
        }
      }
      setPopupStyle(style);
    }
  }, [showReactionPopup, message.sender, username]);

  const disableCopyStyle = { userSelect: "none" };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const currentReaders = Array.isArray(message.read_by) ? message.read_by : [];
          if (!currentReaders.includes(username)) {
            supabase
              .from("private_messages")
              .update({ read_by: [...currentReaders, username] })
              .eq("id", message.id)
              .then(({ error }) => {
                if (error) console.error("Error updating read status:", error);
              });
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (messageRef.current) observer.observe(messageRef.current);
    return () => {
      if (messageRef.current) observer.unobserve(messageRef.current);
    };
  }, [message.read_by, username, message.id]);

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.text)
      .then(() => setShowReactionPopup(false))
      .catch((err) => {
        console.error("Copy failed", err);
        setShowReactionPopup(false);
      });
  };

  const handleEmojiClick = (emoji) => {
    if (reaction === emoji) {
      setReaction(null);
      const updatedReactions = { ...(message.reactions || {}) };
      delete updatedReactions[username];
      supabase
        .from("private_messages")
        .update({ reactions: updatedReactions }, { returning: "representation" })
        .eq("id", message.id)
        .then(({ error }) => {
          if (error) console.error("Error removing reaction:", error);
        });
    } else {
      setReaction(emoji);
      const updatedReactions = { ...(message.reactions || {}), [username]: emoji };
      supabase
        .from("private_messages")
        .update({ reactions: updatedReactions }, { returning: "representation" })
        .eq("id", message.id)
        .then(({ error }) => {
          if (error) console.error("Error updating reaction:", error);
        });
    }
    setShowReactionPopup(false);
  };

  const handleCustomEmoji = () => {
    const customEmoji = window.prompt("Enter your custom emoji:");
    if (customEmoji) {
      handleEmojiClick(customEmoji);
    }
  };

  const replyPreview =
    message.replyTo && allMessages
      ? allMessages.find((m) => m.id === message.replyTo)?.text || "file"
      : null;

  return (
    <div
      className="mb-4 relative"
      id={`message-${message.id}`}
      ref={messageRef}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={`text-xs mb-2 px-1 ${message.sender === username ? "text-right" : "text-left"}`}
        style={disableCopyStyle}
      >
        <span
          className="px-2 py-1 rounded-full shadow-sm"
          style={{
            backgroundColor: "#0e1423",
            border: "1px solid #465775",
            backgroundImage: "linear-gradient(90deg, #db7ad7, #8a97fb)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {message.sender}
        </span>
      </div>
      <div className={`flex ${message.sender === username ? "justify-end" : "justify-start"}`}>
        <motion.div
          {...handlers}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="max-w-[80%] relative"
          style={{
            x: swipeX,
            overflow: "visible",
            position: "relative",
            ...disableCopyStyle,
          }}
        >
          <div
            className="p-2 rounded-lg relative bg-gradient-to-br text-sm"
            style={{
              background:
                message.sender === username
                  ? "linear-gradient(to bottom right, #3B82F6, rgb(63, 105, 196))"
                  : "linear-gradient(to bottom right, #374151, #1F2937)",
              color: message.sender === username ? "white" : "#F3F4F6",
              boxShadow:
                message.sender === username
                  ? "4px 4px 10px rgba(59, 130, 246, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.1)"
                  : "4px 4px 10px rgba(0, 0, 0, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.05)",
            }}
          >
            {message.replyTo && (
              <div className={`text-xs mb-1 ${message.sender === username ? "text-blue-200" : "text-gray-400"}`}>
                {replyPreview}
              </div>
            )}
            <div className="break-words break-all">{message.text}</div>
            {message.file?.url && (
              <div className="relative mt-1 w-full max-w-xs">
                {message.file.type.startsWith("image/") ? (
                  <a
                    href={message.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={message.file.url}
                      alt="Shared content"
                      className="w-full max-w-[80px] object-cover rounded-lg border border-white/20"
                    />
                  </a>
                ) : (
                  <a
                    href={message.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-blue-400 underline"
                    download={message.file.type.includes("zip") ? message.file.name : undefined}
                  >
                    {message.file.name}
                  </a>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className={`text-xs ${message.sender === username ? "text-blue-200" : "text-gray-400"}`}>
                {formatTimestamp(message.timestamp)}
              </span>
              <div className="flex items-center">
                {hasRead ? (
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
            {Object.keys(aggregatedReactions).length > 0 && (
              <div
                className="absolute flex gap-1"
                style={{
                  bottom: -4,
                  right: message.sender === username ? -4 : "auto",
                  left: message.sender === username ? "auto" : -4,
                }}
              >
                {Object.entries(aggregatedReactions).map(([emoji, count]) => (
                  <div
                    key={emoji}
                    className="bg-gray-900 text-white rounded-full px-1 text-xs flex items-center"
                  >
                    <span>{emoji}</span>
                    {count > 1 && <span className="ml-1">{count}</span>}
                  </div>
                ))}
              </div>
            )}
            <AnimatePresence>
              {showReactionPopup && (
                <motion.div
                  className="reaction-popup flex flex-col p-3 rounded-lg bg-gray-800 shadow-xl"
                  initial={{ scale: 0.8, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    zIndex: 10,
                    maxWidth: "90vw",
                    ...popupStyle,
                  }}
                >
                  <div className="emoji-row flex gap-2 mb-2 justify-center">
                    {["👍", "❤️", "😂", "😮", "😢", "👏"].map((emoji, index) => (
                      <div
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="cursor-pointer text-xl"
                      >
                        {emoji}
                      </div>
                    ))}
                    <div onClick={handleCustomEmoji} className="cursor-pointer text-xl">
                      ➕
                    </div>
                  </div>
                  <hr className="border-gray-600 my-1" />
                  <div className="options-row flex gap-6 justify-center mt-1">
                    <div
                      onClick={handleCopy}
                      className="flex items-center gap-1 cursor-pointer text-white hover:text-gray-300"
                    >
                      <FiCopy size={20} />
                      <span className="text-sm">Copy</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── GROUP COMPONENT ─────────────────────────────────────────────────────────
const Group = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSentMessageId, setLastSentMessageId] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showUsernameChangeModal, setShowUsernameChangeModal] = useState(false);
  const [group, setGroup] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

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
    if (!group) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("private_messages")
        .select("*")
        .order("timestamp", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error fetching messages.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("chatUsername");
    if (storedUsername) {
      setUsername(storedUsername);
      joinGroup("Anonymous Thread 🕵", "");
      supabase
        .from("groups")
        .select("*")
        .eq("name", "Anonymous Thread 🕵")
        .single()
        .then(({ data, error }) => {
          if (data) {
            setGroup({ id: data.id, name: data.name });
          }
        });
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  useEffect(() => {
    if (!group) return;
    const channel = supabase
      .channel("realtime-private-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "private_messages",
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
    channelRef.current = channel;
    fetchMessages();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [group]);

  const handleRealtimeUpdate = (payload) => {
    switch (payload.eventType) {
      case "INSERT":
        setMessages((prev) => {
          const existing = prev.find((msg) => msg.id === payload.new.id);
          if (existing) {
            const updatedText =
              payload.new.text && payload.new.text.trim() !== ""
                ? payload.new.text
                : existing.text;
            return prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new, text: updatedText } : msg
            );
          }
          return [...prev, payload.new];
        });
        break;
      case "UPDATE":
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === payload.new.id) {
              const updatedText =
                payload.new.text && payload.new.text.trim() !== ""
                  ? payload.new.text
                  : msg.text;
              return { ...msg, ...payload.new, text: updatedText };
            }
            return msg;
          })
        );
        break;
      case "DELETE":
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== payload.old.id)
        );
        break;
      default:
        break;
    }
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Determine if file is ZIP by MIME or extension.
    const isZip = file.type === "application/zip" ||
                  file.type === "application/x-zip-compressed" ||
                  file.name.toLowerCase().endsWith(".zip");
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed"
    ];
    if (!isZip && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be 5MB or less");
      return;
    }
    if (!allowedTypes.includes(file.type) && !isZip) {
      toast.error("Only images (JPEG, PNG, GIF), PDF, and ZIP files are allowed");
      return;
    }
    setFile(file);
    // For image files, create an object URL preview.
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      // For non-image files, show the file name as preview.
      setFilePreview(file.name);
    }
  }, []);

  const uploadFile = useCallback(
    async (file) => {
      try {
        const fileName = `${username}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("chat-files")
          .upload(`uploads/${fileName}`, file);
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("chat-files")
          .getPublicUrl(`uploads/${fileName}`);
        return { url: publicUrl, type: file.type, name: file.name };
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Error uploading file.");
        throw error;
      }
    },
    [username]
  );

  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if ((!newMessage.trim() && !file) || isUploading || !group) return;
      try {
        setIsUploading(true);
        let fileData = null;
        if (file) {
          setUploadProgress(0);
          setUploadMessage("Uploading file...");
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
          }, 200);
          fileData = await uploadFile(file);
          clearInterval(progressInterval);
          setUploadProgress(100);
          setUploadMessage("File uploaded successfully.");
          await new Promise((resolve) => setTimeout(resolve, 300));
          setUploadProgress(0);
          setUploadMessage("");
        }
        const messageToSend = {
          text: newMessage.trim(),
          timestamp: Date.now(),
          sender: username,
          replyTo: replyTo,
          file: fileData,
          read_by: [],
          hidden: false,
        };
        const { data, error } = await supabase
          .from("private_messages")
          .insert([messageToSend], { returning: "representation" });
        if (error) throw error;
        if (data && data[0]) {
          setMessages((prev) => [...prev, data[0]]);
          setLastSentMessageId(data[0].id);
        }
        setNewMessage("");
        setFile(null);
        setFilePreview(null);
        setReplyTo(null);
        setShouldAutoScroll(true);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Error sending message. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [newMessage, file, isUploading, uploadFile, username, replyTo, group]
  );

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#172133] overflow-hidden"
      style={{
        height: "100dvh",
        maxHeight: "-webkit-fill-available",
        overscrollBehavior: "none",
      }}
    >
      {showUsernameModal && (
        <UsernameModal
          onUsernameSet={(username) => {
            setUsername(username);
            setShowUsernameModal(false);
            joinGroup("Anonymous Thread 🕵", "");
            supabase
              .from("groups")
              .select("*")
              .eq("name", "Anonymous Thread 🕵")
              .single()
              .then(({ data, error }) => {
                if (data) {
                  setGroup({ id: data.id, name: data.name });
                }
              });
          }}
        />
      )}
      {showUsernameChangeModal && (
        <UsernameChangeModal
          currentUsername={username}
          onUsernameChange={(newUsername) => {
            setUsername(newUsername);
          }}
          onClose={() => setShowUsernameChangeModal(false)}
        />
      )}
      <div className="p-4 bg-[#2D3748] border-b border-gray-700 flex items-center justify-between">
        <div className="text-white font-semibold text-lg">
          {group ? group.name : "Anonymous Thread 🕵"}
        </div>
        <button
          onClick={() => setShowUsernameChangeModal(true)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Change Username"
        >
          <FiEdit size={20} />
        </button>
      </div>

      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 scrollbar touch-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <PinnedMessage />
        <div className="border-t border-gray-700 my-2" />
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          messages.map((message) => (
            <SafeMessageComponent
              key={message.id}
              message={message}
              onReply={(id) => setReplyTo(id)}
              allMessages={messages}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {replyTo && (
          <ReplyPreview
            originalMessage={messages.find((m) => m.id === replyTo)}
            onCancel={() => setReplyTo(null)}
          />
        )}
      </AnimatePresence>

      {/* Updated Bottom Form */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-700 bg-[#2D3748] safe-area-bottom"
      >
        {isUploading && file && (
          <div className="mb-2">
            <div className="w-full bg-gray-700 h-2 rounded">
              <div className="bg-blue-500 h-full rounded" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            {uploadMessage && (
              <div className="text-white text-xs mt-1 text-center">
                {uploadMessage} {uploadProgress > 0 ? `(${uploadProgress}%)` : ""}
              </div>
            )}
          </div>
        )}
        {file && (
          <div className="mb-2 flex items-center justify-center">
            {file.type.startsWith("image/") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-600/20"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                {file.type.includes("pdf") ? (
                  <FaFilePdf size={20} className="text-red-500" />
                ) : file.type.includes("zip") ? (
                  <FaFileArchive size={20} className="text-yellow-500" />
                ) : null}
                <span className="text-white text-xs truncate">{filePreview}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <FaPaperclip size={20} className="text-white" />
            <input
              type="file"
              accept="image/*, application/pdf, application/zip, application/x-zip-compressed"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 rounded-xl border border-gray-700 bg-[#1E293B] text-white focus:outline-none focus:border-blue-500"
            style={{ fontSize: "16px" }}
            disabled={isUploading}
          />
          <button
            type="submit"
            className={`p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors ${isUploading && "bg-gray-600"}`}
            disabled={isUploading}
          >
            <FiSend size={20} className="text-white" />
          </button>
        </div>
      </form>
      <Toaster />
      <style>{`
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
        .reply-preview {
          animation: slideIn 0.2s ease-out;
          background-image: linear-gradient(135deg, #3B82F6, #9333EA);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          border: 2px solid transparent;
        }
        @keyframes slideIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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

// ─── HELPER: JOIN GROUP FUNCTION ──────────────────────────────────────────
const joinGroup = async (groupName, groupPassword) => {
  try {
    let { data: groupData, error } = await supabase
      .from("groups")
      .select("*")
      .eq("name", groupName)
      .single();
    if (!groupData) {
      throw new Error("Group does not exist");
    }
    const groupId = groupData.id;
    const username = localStorage.getItem("chatUsername");
    const { data: existingMembership } = await supabase
      .from("group_memberships")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_name", username)
      .maybeSingle();
    if (existingMembership) {
      localStorage.setItem("private_group_joined", "true");
      return;
    }
    const { error: joinError } = await supabase
      .from("group_memberships")
      .insert([{ group_id: groupId, user_name: username }]);
    if (joinError) {
      // If a conflict (409) error occurs, silently mark as joined.
      if (joinError.status === 409) {
        toast("Already joined group", { icon: "⚠️" });
        localStorage.setItem("private_group_joined", "true");
        return;
      }
      throw new Error("Error joining group");
    }
    localStorage.setItem("private_group_joined", "true");
  } catch (err) {
    toast.error(err.message);
    throw err;
  }
};

// ─── WRAPPER COMPONENT ─────────────────────────────────────────────────────
const ChatApp = () => {
  return (
    <>
      <Group />
      <Toaster />
    </>
  );
};

export default ChatApp;
