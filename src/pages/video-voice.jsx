import React, { useState, useRef, useEffect } from "react";
import { FiVideo, FiX, FiMic, FiMicOff, FiVideoOff, FiPhone } from "react-icons/fi";
import { supabase } from "../supabaseClient";

// Generate a random 6-digit room ID as a string.
const generateRoomId = () => (Math.floor(Math.random() * 900000) + 100000).toString();

// Validate that a room ID is exactly 6 digits.
const isValidRoomId = (id) => /^\d{6}$/.test(id);

/* Custom Modal Component for Professional Input */
const InputModal = ({ title, fields, onSubmit, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">{title}</h3>
        {fields.map((field) => (
          <div className="modal-field" key={field.name}>
            <label className="modal-label">{field.label}</label>
            <input
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
              className="modal-input"
            />
          </div>
        ))}
        <div className="modal-buttons">
          <button className="modal-button modal-submit" onClick={onSubmit}>
            Submit
          </button>
          <button className="modal-button modal-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoVoicePage = () => {
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [action, setAction] = useState(""); // "start" or "join"
  const [callRoomId, setCallRoomId] = useState("");
  const [callRoomPassword, setCallRoomPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "start" or "join"
  const [inputRoomId, setInputRoomId] = useState("");
  const [inputRoomPassword, setInputRoomPassword] = useState("");
  const username = localStorage.getItem("chatUsername") || "Anonymous";

  // Open modal for starting a call (password only).
  const handleStartCall = () => {
    setModalType("start");
    setInputRoomPassword("");
    setShowModal(true);
  };

  // Open modal for joining a call (room ID and password).
  const handleJoinCall = () => {
    setModalType("join");
    setInputRoomId("");
    setInputRoomPassword("");
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (modalType === "start") {
      const newRoomId = generateRoomId();
      setCallRoomId(newRoomId.trim());
      setCallRoomPassword(inputRoomPassword.trim());
      setAction("start");
    } else if (modalType === "join") {
      setCallRoomId(inputRoomId.trim());
      setCallRoomPassword(inputRoomPassword.trim());
      setAction("join");
    }
    setShowModal(false);
    setShowCallOverlay(true);
  };

  const handleModalCancel = () => setShowModal(false);

  return (
    <>
      <div className="page-container">
        <div className="card">
          <h2 className="title">Connect Now</h2>
          <div className="button-group">
            <button className="chat-button video" onClick={handleStartCall}>
              <FiVideo className="icon" /> Start Video Chat
            </button>
            <button className="chat-button video" onClick={handleJoinCall}>
              <FiVideo className="icon" /> Join Video Chat
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <InputModal
          title={modalType === "start" ? "Start Video Chat" : "Join Video Chat"}
          fields={
            modalType === "start"
              ? [
                  {
                    name: "password",
                    label: "Room Password",
                    placeholder: "Enter room password",
                    value: inputRoomPassword,
                    onChange: (e) => setInputRoomPassword(e.target.value),
                  },
                ]
              : [
                  {
                    name: "roomId",
                    label: "Room ID",
                    placeholder: "Enter 6-digit Room ID",
                    value: inputRoomId,
                    onChange: (e) => setInputRoomId(e.target.value),
                  },
                  {
                    name: "password",
                    label: "Room Password",
                    placeholder: "Enter room password",
                    value: inputRoomPassword,
                    onChange: (e) => setInputRoomPassword(e.target.value),
                  },
                ]
          }
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
        />
      )}
      {showCallOverlay && (
        <CallOverlay
          action={action}
          username={username}
          initialRoomId={callRoomId}
          roomPassword={callRoomPassword}
          onClose={() => setShowCallOverlay(false)}
        />
      )}
    </>
  );
};

const CallOverlay = ({ action, username, initialRoomId, roomPassword, onClose }) => {
  const [callStatus, setCallStatus] = useState("initializing");
  const [displayRoomId, setDisplayRoomId] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  // Ref to prevent processing duplicate answers.
  const answerReceivedRef = useRef(false);

  // Refs for media and connection objects.
  const localMediaRef = useRef(null);
  const remoteMediaRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const channelRef = useRef(null);
  const roomIdRef = useRef("");
  const iceCandidatesQueue = useRef([]);

  const mediaConstraints = { audio: true, video: { facingMode: "user" } };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Create a new RTCPeerConnection.
        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        });
        setupPeerConnectionListeners();
        await setupLocalMedia();
        if (action === "start") {
          roomIdRef.current = initialRoomId;
          setDisplayRoomId(initialRoomId);
          await createNewCall();
        } else if (action === "join") {
          roomIdRef.current = initialRoomId;
          await joinExistingCall();
        }
      } catch (error) {
        console.error("Call initialization error:", error);
        setCallStatus(`Failed to initialize call: ${error.message}`);
      }
    };
    initialize();
    return () => cleanupCall();
  }, []);

  const setupPeerConnectionListeners = () => {
    const pc = peerConnection.current;
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        handleLocalIceCandidate(candidate);
      }
    };
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setCallStatus("Connected");
      } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        setCallStatus("Connection failed. Try again.");
      }
    };
    pc.ontrack = (event) => {
      if (!remoteMediaRef.current.srcObject) {
        remoteMediaRef.current.srcObject = new MediaStream();
      }
      remoteMediaRef.current.srcObject.addTrack(event.track);
      setCallStatus("Connected");
    };
    pc.onsignalingstatechange = () => {
      if (peerConnection.current.signalingState === "stable") {
        processIceCandidateQueue();
      }
    };
  };

  const setupLocalMedia = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      if (localMediaRef.current) {
        localMediaRef.current.srcObject = localStream.current;
      }
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });
      setCallStatus("Media access granted");
    } catch (error) {
      console.error("Media access error:", error);
      setCallStatus(`Media access denied: ${error.message}`);
    }
  };

  const setupSignalingChannel = (roomId) => {
    channelRef.current = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          const { new: callData } = payload;
          if (callData.answer && callData.status === "active") {
            console.log("Received answer SDP:", callData.answer);
            // Guard: process answer only once.
            if (answerReceivedRef.current) {
              console.log("Answer already processed; ignoring duplicate.");
              return;
            }
            await handleRemoteAnswer(callData.answer);
            answerReceivedRef.current = true;
          }
          if (callData.offer && callData.status === "negotiating") {
            await handleRemoteOffer(callData.offer);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ice_candidates",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { new: candidateData } = payload;
          await handleRemoteIceCandidate(candidateData.candidate);
        }
      )
      .subscribe((status) => {
        console.log("Channel subscription status:", status);
      });
  };

  const createNewCall = async () => {
    try {
      const { error } = await supabase.from("calls").upsert({
        id: roomIdRef.current,
        status: "waiting",
        type: "video",
        caller: username,
        room_password: roomPassword,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setupSignalingChannel(roomIdRef.current);
      setCallStatus("Waiting for peer to join...");
    } catch (error) {
      console.error("Failed to create call:", error);
      setCallStatus(`Failed to create call: ${error.message}`);
    }
  };

  const joinExistingCall = async () => {
    try {
      const trimmedRoomId = initialRoomId.trim();
      const trimmedRoomPassword = roomPassword.trim();
      if (!isValidRoomId(trimmedRoomId)) {
        setCallStatus("Invalid room ID format");
        return;
      }
      roomIdRef.current = trimmedRoomId;
      console.log("Joining call with ID:", trimmedRoomId, "Password:", trimmedRoomPassword);
      const { data: existingCalls, error } = await supabase
        .from("calls")
        .select("*")
        .eq("id", trimmedRoomId)
        .eq("room_password", trimmedRoomPassword)
        .eq("status", "waiting")
        .limit(1);
      if (error) throw error;
      if (!existingCalls || existingCalls.length === 0) {
        setCallStatus("No available call found with that Room ID/Password");
        return;
      }
      setupSignalingChannel(trimmedRoomId);
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      const { error: updateError } = await supabase
        .from("calls")
        .update({
          status: "negotiating",
          offer: offer.sdp,
          callee: username,
        })
        .eq("id", trimmedRoomId);
      if (updateError) throw updateError;
      setCallStatus("Offer sent, waiting for answer...");
    } catch (error) {
      console.error("Failed to join call:", error);
      setCallStatus(`Failed to join call: ${error.message}`);
    }
  };

  const handleLocalIceCandidate = async (candidate) => {
    try {
      await sendIceCandidate(candidate);
    } catch (error) {
      iceCandidatesQueue.current.push(candidate);
    }
  };

  const sendIceCandidate = async (candidate) => {
    try {
      const { error } = await supabase.from("ice_candidates").insert({
        room_id: roomIdRef.current,
        candidate: candidate.toJSON(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (error) {
      iceCandidatesQueue.current.push(candidate);
    }
  };

  const handleRemoteIceCandidate = async (candidateData) => {
    try {
      const candidate = new RTCIceCandidate(candidateData);
      if (peerConnection.current.remoteDescription) {
        await peerConnection.current.addIceCandidate(candidate);
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
    } catch (error) {
      console.error("Error adding remote ICE candidate:", error);
    }
  };

  const processIceCandidateQueue = async () => {
    if (peerConnection.current.remoteDescription && iceCandidatesQueue.current.length > 0) {
      const candidates = [...iceCandidatesQueue.current];
      iceCandidatesQueue.current = [];
      for (const candidate of candidates) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
        } catch (error) {
          iceCandidatesQueue.current.push(candidate);
        }
      }
    }
  };

  const handleRemoteOffer = async (offerSdp) => {
    try {
      await peerConnection.current.setRemoteDescription({ type: "offer", sdp: offerSdp });
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      const { error } = await supabase.from("calls").update({
        answer: answer.sdp,
        status: "active",
      }).eq("id", roomIdRef.current);
      if (error) throw error;
      setCallStatus("Answer sent, establishing connection...");
      processIceCandidateQueue();
    } catch (error) {
      setCallStatus("Failed to process offer");
    }
  };

  const handleRemoteAnswer = async (answerSdp) => {
    try {
      if (
        peerConnection.current.remoteDescription &&
        peerConnection.current.remoteDescription.type === "answer"
      ) {
        console.log("Remote description already set; ignoring duplicate answer.");
        return;
      }
      console.log("Received answer SDP:", answerSdp);
      await peerConnection.current.setRemoteDescription({ type: "answer", sdp: answerSdp });
      setCallStatus("Answer received, establishing connection...");
      processIceCandidateQueue();
    } catch (error) {
      console.error("Error in handleRemoteAnswer:", error);
      setCallStatus("Failed to process answer");
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const cleanupCall = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    if (roomIdRef.current && isValidRoomId(roomIdRef.current)) {
      supabase.from("calls").update({ status: "ended" })
        .eq("id", roomIdRef.current)
        .then(({ error }) => { if (error) console.error("Error updating call status:", error); });
    }
  };

  const handleCloseCall = () => {
    cleanupCall();
    onClose();
  };

  return (
    <div className="overlay">
      <div className="call-container">
        <div className="call-header">
          <h3>Video Call</h3>
          <button onClick={handleCloseCall} className="close-button">
            <FiX />
          </button>
        </div>
        {action === "start" && (
          <div className="room-info">
            <p className="room-id">
              Your Room ID: <span className="room-id-value">{displayRoomId}</span>
            </p>
            <p className="helper-text">
              Share this ID and your password with others to join
            </p>
          </div>
        )}
        <div className="media-container">
          <video
            ref={localMediaRef}
            autoPlay
            muted
            playsInline
            className={`local-video ${!videoEnabled ? "video-disabled" : ""}`}
          />
          <div className="remote-media-wrapper">
            <video
              ref={remoteMediaRef}
              autoPlay
              playsInline
              className="remote-video"
            />
          </div>
        </div>
        <div className="call-status">
          <p className={`status-text ${callStatus === "Connected" ? "status-connected" : ""}`}>
            {callStatus}
          </p>
        </div>
        <div className="call-controls">
          <button
            className={`control-button ${audioEnabled ? "active" : "muted"}`}
            onClick={toggleAudio}
            title={audioEnabled ? "Mute" : "Unmute"}
          >
            {audioEnabled ? <FiMic /> : <FiMicOff />}
          </button>
          <button
            className={`control-button ${videoEnabled ? "active" : "disabled"}`}
            onClick={toggleVideo}
            title={videoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {videoEnabled ? <FiVideo /> : <FiVideoOff />}
          </button>
          <button
            className="control-button end-call"
            onClick={handleCloseCall}
            title="End call"
          >
            <FiPhone />
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS styles (original styling plus modal styles)
const styles = `
  /* Main page styling */
  .page-container {
    background: #0E1422;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    font-family: 'Comfortaa', sans-serif;
  }
  .card {
    background: #1A1F2E;
    border-radius: 24px;
    padding: 2rem;
    max-width: 480px;
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  .title {
    color: #FFF;
    font-size: 1.8rem;
    margin-bottom: 2rem;
  }
  .button-group {
    display: grid;
    gap: 1rem;
  }
  .chat-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 1.2rem;
    border: none;
    border-radius: 14px;
    background: #252C3F;
    color: #FFF;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }
  .chat-button:hover {
    background: #3B82F6;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(59,130,246,0.3);
  }
  .chat-button:active {
    transform: translateY(0);
  }
  .icon {
    font-size: 1.4rem;
  }
  /* Overlay and call container styling */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }
  .call-container {
    background: #1A1F2E;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 800px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  .call-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    color: #FFF;
  }
  .call-header h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  .close-button {
    background: none;
    border: none;
    color: #FFF;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }
  .close-button:hover {
    opacity: 1;
  }
  .room-info {
    background: rgba(59,130,246,0.15);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .room-id {
    color: #FFF;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  .room-id-value {
    font-weight: bold;
    user-select: all;
    background: rgba(255,255,255,0.1);
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
  }
  .helper-text {
    color: rgba(255,255,255,0.7);
    margin: 0;
    font-size: 0.85rem;
  }
  .media-container {
    position: relative;
    margin-bottom: 2rem;
    border-radius: 12px;
    overflow: hidden;
    background: #111827;
    aspect-ratio: 16 / 9;
  }
  .local-video {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 120px;
    height: 90px;
    border-radius: 8px;
    border: 2px solid #3B82F6;
    object-fit: cover;
    z-index: 10;
    transition: opacity 0.3s ease;
  }
  .video-disabled {
    opacity: 0.5;
  }
  .remote-media-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  .remote-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }
  .call-status {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  .status-text {
    color: rgba(255,255,255,0.7);
    margin: 0;
    font-size: 0.9rem;
    transition: color 0.3s ease;
  }
  .status-connected {
    color: #10B981;
  }
  .call-controls {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
  }
  .control-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.3rem;
  }
  .control-button.active {
    background: #3B82F6;
    color: #FFF;
  }
  .control-button.muted,
  .control-button.disabled {
    background: #4B5563;
    color: #FFF;
  }
  .control-button.end-call {
    background: #EF4444;
    color: #FFF;
    transform: rotate(135deg);
  }
  .control-button:hover {
    transform: scale(1.1);
  }
  .control-button.end-call:hover {
    transform: rotate(135deg) scale(1.1);
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @media (max-width: 640px) {
    .call-container { padding: 1rem; }
    .local-video { width: 80px; height: 60px; }
    .control-button { width: 40px; height: 40px; font-size: 1.1rem; }
  }
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
  }
  .modal-card {
    background: #1A1F2E;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    color: #FFF;
    font-family: 'Comfortaa', sans-serif;
  }
  .modal-title {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    text-align: center;
  }
  .modal-field {
    margin-bottom: 1rem;
  }
  .modal-label {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 1rem;
  }
  .modal-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid #444;
    background: #252C3F;
    color: #FFF;
    font-size: 1rem;
  }
  .modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
  .modal-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  .modal-submit {
    background: #3B82F6;
    color: #FFF;
  }
  .modal-submit:hover {
    background: #2563EB;
  }
  .modal-cancel {
    background: #EF4444;
    color: #FFF;
  }
  .modal-cancel:hover {
    background: #DC2626;
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
export default VideoVoicePage;
