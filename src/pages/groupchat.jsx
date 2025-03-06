import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperclip, FaUser, FaArrowAltCircleRight } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useSwipeable } from "react-swipeable";

// ─── REPLY PREVIEW COMPONENT (ORIGINAL STYLE) ─────────────────────────────

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

// ─── USERNAME MODAL ─────────────────────────────────────────────────────────

const UsernameModal = () => {
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
        return;
      }

      localStorage.setItem("chatUsername", usernameToCheck);
      await supabase.rpc("set_current_user", { username: usernameToCheck });
      window.location.reload();
    } catch (err) {
      console.error("Error checking username:", err);
      setError("An error occurred while checking username availability.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.33, 1, 0.68, 1] }}
        className="bg-[#0E1423] rounded-xl shadow-lg p-6 max-w-xs w-full mx-4 border border-gray-700"
      >
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="p-2 bg-gradient-to-br from-[#db7ad720] to-[#8a97fb20] rounded-lg border border-gray-600">
            <FaUser size={20} className="text-[#8a97fb]" />
          </div>
          <h2 className="text-[18px] font-semibold bg-gradient-to-r from-[#db7ad7] to-[#8a97fb] bg-clip-text text-transparent tracking-tight">
            Welcome to HiddenThreads
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700 transition-all duration-200"
            />
          </div>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm py-2 rounded transition-all flex items-center justify-center gap-2"
          >
            <FaUser className="text-xs" />
            <span>Continue</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── GROUP MODAL (Password-Only) ───────────────────────────────────────────

const GroupModal = ({ onJoin }) => {
  const [groupPassword, setGroupPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = groupPassword.trim();
    if (!password) {
      setError("Please provide the group password.");
      return;
    }
    try {
      await onJoin(password);
    } catch (err) {
      setError(err.message || "Error joining group");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.33, 1, 0.68, 1] }}
        className="bg-[#0E1423] rounded-xl shadow-lg p-6 max-w-xs w-full mx-4 border border-gray-700"
      >
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="p-2 bg-gradient-to-br from-[#db7ad720] to-[#8a97fb20] rounded-lg border border-gray-600">
            <FaUser size={20} className="text-[#8a97fb]" />
          </div>
          <h2 className="text-[18px] font-semibold bg-gradient-to-r from-[#db7ad7] to-[#8a97fb] bg-clip-text text-transparent tracking-tight">
            Enter Group Password
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={groupPassword}
              onChange={(e) => setGroupPassword(e.target.value)}
              placeholder="Group Password"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700 transition-all duration-200"
            />
          </div>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm py-2 rounded transition-all flex items-center justify-center gap-2"
          >
            <FaUser className="text-xs" />
            <span>Join Group</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── PINNED PREWRITTEN MESSAGE COMPONENT (UPDATED GRADIENT & DIVIDER) ───────────────────────────────────

const PinnedMessage = () => {
  const guidelines =
    "📌 𝙶𝚛𝚘𝚞𝚙 𝙶𝚞𝚒𝚍𝚎𝚕𝚒𝚗𝚎𝚜 & 𝙰𝚗𝚗𝚘𝚞𝚗𝚌𝚎𝚖𝚎𝚗𝚝 📌 𝚆𝚎𝚕𝚌𝚘𝚖𝚎! 𝚃𝚑𝚒𝚜 𝚒𝚜 𝚊𝚗 𝚘𝚙𝚎𝚗 𝚊𝚗𝚍 𝚞𝚗𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚎𝚍 𝚜𝚙𝚊𝚌𝚎 𝚠𝚑𝚎𝚛𝚎 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 𝚌𝚊𝚗 𝚏𝚛𝚎𝚎𝚕𝚒 𝚒𝚗𝚝𝚎𝚛𝚊𝚌𝚝, 𝚜𝚑𝚊𝚛𝚎, 𝚊𝚗𝚍 𝚎𝚗𝚐𝚊𝚐𝚎 𝚠𝚒𝚝𝚑𝚘𝚞𝚝 𝚌𝚘𝚗𝚌𝚎𝚛𝚗𝚜 𝚊𝚋𝚘𝚞𝚝 𝚎𝚌𝚎𝚜𝚜𝚒𝚟𝚎 𝚖𝚘𝚍𝚎𝚛𝚊𝚝𝚒𝚘𝚗. ✅ 𝙵𝚛𝚎𝚎𝚍𝚘𝚖 𝚘𝚏 𝙴𝚗𝚙𝚛𝚎𝚜𝚜𝚒𝚘𝚗 – 𝙴𝚗𝚐𝚊𝚐𝚎 𝚒𝚗 𝚍𝚒𝚜𝚌𝚞𝚜𝚜𝚒𝚘𝚗𝚜 𝚠𝚒𝚝𝚑𝚘𝚞𝚝 𝚞𝚗𝚗𝚎𝚌𝚎𝚜𝚜𝚊𝚛𝚢 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝𝚒𝚘𝚗𝚜. ✅ 𝚁𝚎𝚕𝚊𝚟𝚎𝚍 𝙴𝚗𝚟𝚒𝚛𝚘𝚗𝚖𝚎𝚗𝚝 – 𝙽𝚘 𝚛𝚒𝚐𝚒𝚍 𝚛𝚞𝚕𝚎𝚜; 𝚎𝚗𝚓𝚘𝚒 𝚒𝚘𝚞𝚛 𝚝𝚒𝚖𝚎 𝚑𝚎𝚛𝚎. ✅ 𝚁𝚎𝚜𝚙𝚎𝚌𝚝 & 𝙲𝚘𝚞𝚛𝚝𝚎𝚜𝚒 – 𝚆𝚑𝚒𝚕𝚎 𝚝𝚑𝚎𝚛𝚎 𝚊𝚛𝚎 𝚖𝚒𝚗𝚒𝚖𝚊𝚕 𝚐𝚞𝚒𝚍𝚎𝚕𝚒𝚗𝚎𝚜, 𝚖𝚞𝚝𝚞𝚊𝚕 𝚛𝚎𝚜𝚙𝚎𝚌𝚝 𝚒𝚜 𝚎𝚗𝚌𝚘𝚞𝚛𝚊𝚐𝚎𝚍. 𝙴𝚗𝚓𝚘𝚒 𝚒𝚘𝚞𝚛 𝚝𝚒𝚖𝚎 𝚊𝚗𝚍 𝚖𝚊𝚔𝚎 𝚝𝚑𝚎 𝚖𝚘𝚜𝚝 𝚘𝚏 𝚝𝚑𝚒𝚜 𝚜𝚙𝚊𝚌𝚎! 🚀";
  return (
    <div className="my-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-center rounded-lg shadow-md">
      <p className="text-sm font-medium">{guidelines}</p>
    </div>
  );
};

// ─── GROUP COMPONENT ─────────────────────────────────────────────────────────

const Group = () => {
  const [messages, setMessages] = useState([]); // holds private group messages
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [swipeState, setSwipeState] = useState({ id: null, delta: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSentMessageId, setLastSentMessageId] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // For this private group, the group is fixed as "Private Group"
  const [group, setGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

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

  // Fetch messages from "private_messages" table
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
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, check for username and group membership.
  useEffect(() => {
    const storedUsername = localStorage.getItem("chatUsername");
    if (storedUsername) {
      setUsername(storedUsername);
      if (localStorage.getItem("private_group_joined") === "true") {
        supabase
          .from("groups")
          .select("*")
          .eq("name", "Private Group")
          .single()
          .then(({ data, error }) => {
            if (data) {
              setGroup({ id: data.id, name: data.name });
              setShowGroupModal(false);
            } else {
              setShowGroupModal(true);
            }
          });
      } else {
        setShowGroupModal(true);
      }
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  // Subscribe to realtime changes on "private_messages" table
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
          const isDuplicate = prev.some((msg) => msg.id === payload.new.id);
          return isDuplicate ? prev : [...prev, payload.new];
        });
        break;
      case "UPDATE":
        setMessages((prev) =>
          prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
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
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be 5MB or less");
      return;
    }
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only images (JPEG, PNG, GIF) and PDF files are allowed");
      return;
    }
    setFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
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
        throw error;
      }
    },
    [username]
  );

  // Insert new message into "private_messages" table
  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if ((!newMessage.trim() && !file) || isUploading || !group) return;
      try {
        setIsUploading(true);
        const fileData = file ? await uploadFile(file) : null;
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
        alert("Error sending message. Please try again.");
        console.error("Error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [newMessage, file, isUploading, uploadFile, username, replyTo, group]
  );

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Smooth swipe config
  const swipeConfig = useMemo(
    () => ({
      onSwiping: (e, messageId) => {
        if (Math.abs(e.deltaX) > 70) return;
        setSwipeState({ id: messageId, delta: e.deltaX });
      },
      onSwiped: (e, messageId) => {
        if (Math.abs(e.deltaX) > 70) {
          setReplyTo(messageId);
        }
        setSwipeState({ id: null, delta: 0 });
      },
      trackMouse: true,
      delta: 20,
      preventDefaultTouchmoveEvent: true,
    }),
    []
  );

  const renderFilePreview = useCallback((message) => {
    if (!message.file) return null;
    return message.file.type.startsWith("image/") ? (
      <div className="relative mt-1 max-w-xs">
        <a
          href={message.file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={message.file.url}
            alt="Shared content"
            className="w-full h-auto rounded-sm border border-white/20"
            style={{ maxHeight: "120px" }}
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
    const handleSwiping = (e) => {
      swipeConfig.onSwiping(e, message.id);
    };

    const handlers = useSwipeable({
      onSwiping: handleSwiping,
      onSwiped: (e) => {
        swipeConfig.onSwiped(e, message.id);
      },
      trackMouse: swipeConfig.trackMouse,
      delta: swipeConfig.delta,
      preventDefaultTouchmoveEvent: true,
    });

    const messageRef = useRef();
    const hasRead = (message.read_by || []).includes(username);

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
            const currentReaders = Array.isArray(message.read_by)
              ? message.read_by
              : [];
            if (!currentReaders.includes(username)) {
              supabase
                .from("private_messages")
                .update({ read_by: [...currentReaders, username] })
                .eq("id", message.id)
                .then(({ error }) => {
                  if (error)
                    console.error("Error updating read status:", error);
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

    return (
      <div className="mb-4" id={`message-${message.id}`}>
        <div
          className={`text-xs mb-2 px-1 ${
            message.sender === username ? "text-right" : "text-left"
          }`}
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
        <div
          className={`flex ${
            message.sender === username ? "justify-end" : "justify-start"
          }`}
        >
          <motion.div
            {...handlers}
            ref={setRefs}
            className="max-w-[80%] relative"
            style={{
              x: swipeState.id === message.id ? swipeState.delta : 0,
              overflowX: "hidden",
            }}
            onMouseDown={handlers.onMouseDown}
            onMouseUp={handlers.onMouseUp}
            onMouseLeave={handlers.onMouseLeave}
            onTouchStart={handlers.onTouchStart}
            onTouchEnd={handlers.onTouchEnd}
            onTouchCancel={handlers.onTouchCancel}
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
                <div
                  className={`text-xs mb-1 ${
                    message.sender === username
                      ? "text-blue-200"
                      : "text-gray-400"
                  }`}
                >
                  {messages.find((m) => m.id === message.replyTo)?.text || "file"}
                </div>
              )}
              <div>{message.text}</div>
              {message.file?.url && (
                <div className="relative mt-1 max-w-xs">
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
                        className="w-full h-auto rounded-sm border border-white/20"
                        style={{ maxHeight: "120px" }}
                      />
                    </a>
                  ) : (
                    <a
                      href={message.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-blue-400 underline"
                    >
                      {message.file.name}
                    </a>
                  )}
                </div>
              )}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span
                  className={`text-xs ${
                    message.sender === username ? "text-blue-200" : "text-gray-400"
                  }`}
                >
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
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#172133] overflow-hidden"
      style={{
        height: "100dvh",
        maxHeight: "-webkit-fill-available",
        overscrollBehavior: "none",
      }}
    >
      {showUsernameModal && <UsernameModal />}
      {!showUsernameModal && showGroupModal && (
        <GroupModal
          onJoin={async (groupPassword) => {
            if (!username) return;
            await joinGroup("Private Group", groupPassword);
            const { data: grp } = await supabase
              .from("groups")
              .select("*")
              .eq("name", "Private Group")
              .single();
            setGroup({ id: grp.id, name: grp.name });
            setShowGroupModal(false);
          }}
        />
      )}
      <div className="p-4 bg-[#2D3748] text-white text-center font-semibold text-lg border-b border-gray-700">
        {group ? group.name : "Chat Group"}
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
        {/* Pinned prewritten message with updated gradient */}
        <PinnedMessage />
        {/* Divider to separate pinned message from main chat */}
        <div className="border-t border-gray-700 my-2" />
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

      {/* Reply preview (unchanged from original styling) */}
      <AnimatePresence>
        {replyTo && (
          <ReplyPreview
            originalMessage={messages.find((m) => m.id === replyTo)}
            onCancel={() => setReplyTo(null)}
          />
        )}
      </AnimatePresence>

      {/* BOTTOM MESSAGE SECTION (ORIGINAL STYLE) */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-700 bg-[#2D3748] safe-area-bottom"
      >
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
              <img
                src={filePreview}
                alt="Preview"
                className="w-8 h-8 object-cover rounded-lg border border-gray-600/20"
              />
            </div>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 bg-[#1E293B] text-white text-sm transition-colors"
            style={{
              fontSize: "16px",
              WebkitUserSelect: "text",
              userSelect: "text",
            }}
            disabled={isUploading}
          />
          <button
            type="submit"
            className={`${
              isUploading ? "bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white p-2 rounded-xl transition-colors`}
            disabled={isUploading}
          >
            <FaArrowAltCircleRight size={20} />
          </button>
        </div>
      </form>

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
  let { data: groupData, error } = await supabase
    .from("groups")
    .select("*")
    .eq("name", groupName)
    .single();

  if (!groupData) {
    throw new Error("Group does not exist");
  }
  if (groupData.password !== groupPassword) {
    throw new Error("Incorrect group password");
  }

  const groupId = groupData.id;

  const { error: countError, count } = await supabase
    .from("group_memberships")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId);
  if (countError) {
    throw new Error("Error checking group membership");
  }
  if (count >= 20) {
    throw new Error("This group has reached the maximum number of users.");
  }

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
    throw new Error("Error joining group");
  }
  localStorage.setItem("private_group_joined", "true");
};

export default Group;
