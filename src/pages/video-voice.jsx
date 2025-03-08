import React, { useState, useRef, useEffect } from "react";
import { FiVideo, FiPhone, FiX, FiMic, FiMicOff, FiVideoOff } from "react-icons/fi";
import { supabase } from "../supabaseClient";

// Helper function to generate a 6-digit room ID as a string.
const generateRoomId = () => {
  return (Math.floor(Math.random() * 900000) + 100000).toString();
};

// Validate that the room ID is a 6-digit numerical string.
const isValidRoomId = (id) => {
  return /^\d{6}$/.test(id);
};

const VideoVoicePage = () => {
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [callType, setCallType] = useState(null); // "video" or "voice"
  const [action, setAction] = useState(null); // "start" or "join"
  const [callRoomId, setCallRoomId] = useState("");
  const [callRoomPassword, setCallRoomPassword] = useState("");
  const username = localStorage.getItem("chatUsername") || "Anonymous";

  // Audio wave SVG (for reference)
  const audioWaveSvg = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzNCODJGNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTEiIGQ9Ik0xIDIwIHY2IGgtMSB2LTYiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMiIgZD0iTTUgMTAgdjIwIGgtMSB2LTIwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTMiIGQ9Ik0xMCA1IHYzMCBoLTEgdi0zMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmU0IiBkPSJNMTUgMTAgdjIwIGgtMSB2LTIwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTUiIGQ9Ik0yMCAxNSB2MTAgaC0xIHYtMTAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlNiIgZD0iTTI1IDUgdjMwIGgtMSB2LTMwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTciIGQ9Ik0zMCAxMCB2MjAgaC0xIHYtMjAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlOCIgZD0iTTM1IDE1IHYxMCBoLTEgdi0xMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmU5IiBkPSJNNDAgNSB2MzAgaC0xIHYtMzAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMTAiIGQ9Ik00NSAxMCB2MjAgaC0xIHYtMjAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMTEiIGQ9Ik01MCAxNSB2MTAgaC0xIHYtMTAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMTIiIGQ9Ik01NSA1IHYzMCBoLTEgdi0zMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmUxMyIgZD0iTTYwIDEwIHYyMCBoLTEgdi0yMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmUxNCIgZD0iTTY1IDE1IHYxMCBoLTEgdi0xMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmUxNSIgZD0iTTcwIDUgdjMwIGgtMSB2LTMwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTE2IiBkPSJNNzUgMTUgdjEwIGgtMSB2LTEwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTE3IiBkPSJNODAgMjAgdjYgaC0xIHYtNiIgLz4KICAgIDwvZz4KICAgIDxzdHlsZT4KICAgICAgLndhdmUxLCAud2F2ZTQsIC53YXZlNywgLndhdmUxMCwgLndhdmUxMywgLndhdmUxNiB7CiAgICAgICAgYW5pbWF0aW9uOiB3YXZlMSAxLjVzIGluZmluaXRlIGVhc2UtaW4tb3V0OwogICAgICB9CiAgICAgIC53YXZlMiwgLndhdmU1LCAud2F2ZTgsIC53YXZlMTEsIC53YXZlMTQsIC53YXZlMTcgewogICAgICAgIGFuaW1hdGlvbjogd2F2ZTIgMS44cyBpbmZpbml0ZSBlYXNlLWluLW91dDsKICAgICAgfQogICAgICAud2F2ZTMsIC53YXZlNiwgLndhdmU5LCAud2F2ZTEyLCAud2F2ZTE1IHsKICAgICAgICBhbmltYXRpb246IHdhdmUzIDEuMnMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7CiAgICAgIH0KCiAgICAgIEBrZXlmcmFtZXMgd2F2ZTEgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyB9CiAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01cHgpOyB9CiAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfQogICAgICB9CiAgICAgIEBrZXlmcmFtZXMgd2F2ZTIgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01cHgpOyB9CiAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyB9CiAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNXB4KTsgfQogICAgICB9CiAgICAgIEBrZXlmcmFtZXMgd2F2ZTMgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0zcHgpOyB9CiAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDNweCk7IH0KICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0zcHgpOyB9CiAgICAgIH0KICAgIDwvc3R5bGU+Cjwvc3ZnPg==`;

  const handleStartCall = (type) => {
    const roomPass = window.prompt("Enter a room password for your call:");
    if (!roomPass) return;

    const newRoomId = generateRoomId();
    // Trim inputs to remove extra spaces
    setCallRoomId(newRoomId.trim());
    setCallRoomPassword(roomPass.trim());
    setCallType(type);
    setAction("start");
    setShowCallOverlay(true);
  };

  const handleJoinCall = (type) => {
    const roomIdInput = window.prompt("Enter the Room ID (6 digits):");
    if (!roomIdInput) return;

    const roomPassInput = window.prompt("Enter the Room Password:");
    if (!roomPassInput) return;

    // Store trimmed values
    setCallRoomId(roomIdInput.trim());
    setCallRoomPassword(roomPassInput.trim());
    setCallType(type);
    setAction("join");
    setShowCallOverlay(true);
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title">Connect Now</h2>
        <div className="button-group">
          <button className="chat-button video" onClick={() => handleStartCall("video")}>
            <FiVideo className="icon" />
            Start Video Chat
          </button>
          <button className="chat-button video" onClick={() => handleJoinCall("video")}>
            <FiVideo className="icon" />
            Join Video Chat
          </button>
          <button className="chat-button voice" onClick={() => handleStartCall("voice")}>
            <FiPhone className="icon" />
            Start Voice Chat
          </button>
          <button className="chat-button voice" onClick={() => handleJoinCall("voice")}>
            <FiPhone className="icon" />
            Join Voice Chat
          </button>
        </div>
      </div>
      {showCallOverlay && (
        <CallOverlay
          callType={callType}
          action={action}
          username={username}
          initialRoomId={callRoomId}
          roomPassword={callRoomPassword}
          onClose={() => setShowCallOverlay(false)}
        />
      )}
    </div>
  );
};

const CallOverlay = ({
  callType,
  action,
  username,
  initialRoomId,
  roomPassword,
  onClose,
}) => {
  // State management
  const [callStatus, setCallStatus] = useState("initializing");
  const [isCaller, setIsCaller] = useState(action === "join");
  const [displayRoomId, setDisplayRoomId] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(callType === "video");

  // Refs
  const localMediaRef = useRef(null);
  const remoteMediaRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const channelRef = useRef(null);
  const roomIdRef = useRef(initialRoomId);
  const iceCandidatesQueue = useRef([]);
  const iceGatheringComplete = useRef(false);
  const signallingComplete = useRef(false);

  const mediaConstraints = {
    audio: true,
    video: callType === "video" ? { facingMode: "user" } : false,
  };

  // Initialize WebRTC and signaling
  useEffect(() => {
    const initialize = async () => {
      try {
        if (action !== "start" && action !== "join") {
          setCallStatus("Invalid action");
          return;
        }

        // Initialize RTCPeerConnection with STUN servers
        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        });

        // Set up event handlers
        setupPeerConnectionListeners();

        // Get user media
        await setupLocalMedia();

        // Initialize call based on action type
        if (action === "start") {
          await createNewCall();
        } else if (action === "join") {
          await joinExistingCall();
        }
      } catch (error) {
        console.error("Call initialization error:", error);
        setCallStatus(`Failed to initialize call: ${error.message}`);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      cleanupCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupPeerConnectionListeners = () => {
    const pc = peerConnection.current;

    // ICE candidate event
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        handleLocalIceCandidate(candidate);
      } else {
        console.log("ICE gathering complete");
        iceGatheringComplete.current = true;
      }
    };

    // ICE connection state change
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallStatus("Connected");
      } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setCallStatus("Connection failed. Try again.");
      }
    };

    // Track event - for receiving remote streams
    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      if (!remoteMediaRef.current.srcObject) {
        const newStream = new MediaStream();
        remoteMediaRef.current.srcObject = newStream;
      }
      event.track.onunmute = () => {
        console.log("Track unmuted:", event.track.kind);
      };
      remoteMediaRef.current.srcObject.addTrack(event.track);
      setCallStatus("Connected");
    };

    // Signaling state change
    pc.onsignalingstatechange = () => {
      console.log("Signaling state:", pc.signalingState);
      if (pc.signalingState === 'stable') {
        signallingComplete.current = true;
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
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });
      setCallStatus("Media access granted");
      return true;
    } catch (error) {
      console.error("Media access error:", error);
      setCallStatus(`Media access denied: ${error.message}`);
      return false;
    }
  };

  // Create a call record with a 6-digit room ID
  const createNewCall = async () => {
    try {
      setIsCaller(false);
      const newRoomId = initialRoomId || generateRoomId();
      roomIdRef.current = newRoomId;
      setDisplayRoomId(newRoomId);

      // Upsert call record in database
      const { error } = await supabase.from("calls").upsert({
        id: newRoomId,
        status: "waiting",
        type: callType,
        caller: username,
        room_password: roomPassword,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      // Set up signaling channel
      setupSignalingChannel(newRoomId);
      setCallStatus("Waiting for peer to join...");
    } catch (error) {
      console.error("Failed to create call:", error);
      setCallStatus(`Failed to create call: ${error.message}`);
    }
  };

  const joinExistingCall = async () => {
    try {
      // Ensure values are trimmed
      const trimmedRoomId = initialRoomId.trim();
      const trimmedRoomPassword = roomPassword.trim();
      
      if (!isValidRoomId(trimmedRoomId)) {
        setCallStatus("Invalid room ID format");
        return;
      }

      roomIdRef.current = trimmedRoomId;
      setIsCaller(true);
      console.log("Joining call with id:", trimmedRoomId, "password:", trimmedRoomPassword);

      // Query Supabase for a matching call record
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

      // Set up signaling channel before creating offer
      setupSignalingChannel(trimmedRoomId);

      // Create and send offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      // Update call with offer
      const { error: updateError } = await supabase
        .from("calls")
        .update({
          status: "negotiating",
          offer: offer.sdp,
          callee: username
        })
        .eq("id", trimmedRoomId);

      if (updateError) throw updateError;

      setCallStatus("Offer sent, waiting for answer...");
    } catch (error) {
      console.error("Failed to join call:", error);
      setCallStatus(`Failed to join call: ${error.message}`);
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
          try {
            console.log("Call update received:", payload);
            const { new: callData } = payload;
            if (isCaller && callData.answer && callData.status === "active") {
              await handleRemoteAnswer(callData.answer);
            }
            if (!isCaller && callData.offer && callData.status === "negotiating") {
              await handleRemoteOffer(callData.offer);
            }
          } catch (error) {
            console.error("Error handling signaling message:", error);
            setCallStatus("Signaling error");
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
          try {
            console.log("ICE candidate received:", payload);
            const { new: candidateData } = payload;
            await handleRemoteIceCandidate(candidateData.candidate);
          } catch (error) {
            console.error("Error handling ICE candidate:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log("Channel subscription status:", status);
      });
  };

  const handleRemoteOffer = async (offerSdp) => {
    try {
      await peerConnection.current.setRemoteDescription({
        type: "offer",
        sdp: offerSdp,
      });
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      const { error } = await supabase
        .from("calls")
        .update({
          answer: answer.sdp,
          status: "active"
        })
        .eq("id", roomIdRef.current);
      if (error) throw error;
      setCallStatus("Answer sent, establishing connection...");
      processIceCandidateQueue();
    } catch (error) {
      console.error("Error handling offer:", error);
      setCallStatus("Failed to process offer");
    }
  };

  const handleRemoteAnswer = async (answerSdp) => {
    try {
      await peerConnection.current.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });
      setCallStatus("Answer received, establishing connection...");
      processIceCandidateQueue();
    } catch (error) {
      console.error("Error handling answer:", error);
      setCallStatus("Failed to process answer");
    }
  };

  const handleLocalIceCandidate = async (candidate) => {
    try {
      const roomId = roomIdRef.current;
      if (!isValidRoomId(roomId)) {
        iceCandidatesQueue.current.push(candidate);
        return;
      }
      await sendIceCandidate(candidate);
    } catch (error) {
      console.error("Error handling local ICE candidate:", error);
    }
  };

  const sendIceCandidate = async (candidate) => {
    try {
      const { error } = await supabase.from("ice_candidates").insert({
        room_id: roomIdRef.current,
        candidate: candidate.toJSON(),
        created_at: new Date().toISOString()
      });
      if (error) throw error;
    } catch (error) {
      console.error("Failed to send ICE candidate:", error);
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
    if (
      peerConnection.current.remoteDescription &&
      iceCandidatesQueue.current.length > 0
    ) {
      console.log(`Processing ${iceCandidatesQueue.current.length} queued ICE candidates`);
      const candidates = [...iceCandidatesQueue.current];
      iceCandidatesQueue.current = [];
      for (const candidate of candidates) {
        try {
          if (candidate instanceof RTCIceCandidate) {
            await peerConnection.current.addIceCandidate(candidate);
          } else {
            await sendIceCandidate(candidate);
          }
        } catch (error) {
          console.error("Error processing queued candidate:", error);
          iceCandidatesQueue.current.push(candidate);
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTracks = localStream.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream.current && callType === "video") {
      const videoTracks = localStream.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // On cleanup, update call status to "ended"
  const cleanupCall = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    if (roomIdRef.current && isValidRoomId(roomIdRef.current)) {
      supabase
        .from("calls")
        .update({
          status: "ended"
        })
        .eq("id", roomIdRef.current)
        .then(({ error }) => {
          if (error) console.error("Error updating call status:", error);
        });
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
          <h3>{callType === "video" ? "Video Call" : "Voice Call"}</h3>
          <button onClick={handleCloseCall} className="close-button">
            <FiX />
          </button>
        </div>

        {action === "start" && displayRoomId && (
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
          {callType === "video" && (
            <video
              ref={localMediaRef}
              autoPlay
              muted
              playsInline
              className={`local-video ${!videoEnabled ? 'video-disabled' : ''}`}
            />
          )}

          <div className={`remote-media-wrapper ${callStatus === "Connected" ? 'connected' : ''}`}>
            {callType === "voice" ? (
              <div className="audio-only-container">
                <div className="audio-indicator">
                  <span className="audio-wave"></span>
                  <p>Voice Call</p>
                </div>
                <audio ref={remoteMediaRef} autoPlay playsInline />
              </div>
            ) : (
              <video
                ref={remoteMediaRef}
                autoPlay
                playsInline
                className="remote-video"
              />
            )}
          </div>
        </div>

        <div className="call-status">
          <p className={`status-text ${callStatus === "Connected" ? 'status-connected' : ''}`}>
            {callStatus}
          </p>
        </div>

        <div className="call-controls">
          <button
            className={`control-button ${audioEnabled ? 'active' : 'muted'}`}
            onClick={toggleAudio}
            title={audioEnabled ? "Mute" : "Unmute"}
          >
            {audioEnabled ? <FiMic /> : <FiMicOff />}
          </button>

          {callType === "video" && (
            <button
              className={`control-button ${videoEnabled ? 'active' : 'disabled'}`}
              onClick={toggleVideo}
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? <FiVideo /> : <FiVideoOff />}
            </button>
          )}

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

// CSS styles (with corrected .audio-wave selector)
const styles = `
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
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
  }
  
  .chat-button:active {
    transform: translateY(0);
  }
  
  .icon {
    font-size: 1.4rem;
  }
  
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
    background: rgba(59, 130, 246, 0.15);
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
  
  .audio-only-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(45deg, #1A1F2E, #252C3F);
  }
  
  .audio-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #3B82F6;
  }
  
  .audio-wave {
    width: 80px;
    height: 40px;
    background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzNCODJGNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTEiIGQ9Ik0xIDIwIHY2IGgtMSB2LTYiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMiIgZD0iTTUgMTAgdjIwIGgtMSB2LTIwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTMiIGQ9Ik0xMCA1IHYzMCBoLTEgdi0zMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmU0IiBkPSJNMTUgMTAgdjIwIGgtMSB2LTIwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTUiIGQ9Ik0yMCAxNSB2MTAgaC0xIHYtMTAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlNiIgZD0iTTI1IDUgdjMwIGgtMSB2LTMwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTciIGQ9Ik0zMCAxMCB2MjAgaC0xIHYtMjAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlOCIgZD0iTTM1IDE1IHYxMCBoLTEgdi0xMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmU5IiBkPSJNNDAgNSB2MzAgaC0xIHYtMzAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMTAiIGQ9Ik00NSAxMCB2MjAgaC0xIHYtMjAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMTEiIGQ9Ik01MCAxNSB2MTAgaC0xIHYtMTAiIC8+CiAgICAgIDxwYXRoIGNsYXNzPSJ3YXZlMTIiIGQ9Ik01NSA1IHYzMCBoLTEgdi0zMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmUxMyIgZD0iTTYwIDEwIHYyMCBoLTEgdi0yMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmUxNCIgZD0iTTY1IDE1IHYxMCBoLTEgdi0xMCIgLz4KICAgICAgPHBhdGggY2xhc3M9IndhdmUxNSIgZD0iTTcwIDUgdjMwIGgtMSB2LTMwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTE2IiBkPSJNNzUgMTUgdjEwIGgtMSB2LTEwIiAvPgogICAgICA8cGF0aCBjbGFzcz0id2F2ZTE3IiBkPSJNODAgMjAgdjYgaC0xIHYtNiIgLz4KICAgIDwvZz4KICAgIDxzdHlsZT4KICAgICAgLndhdmUxLCAud2F2ZTQsIC53YXZlNywgLndhdmUxMCwgLndhdmUxMywgLndhdmUxNiB7CiAgICAgICAgYW5pbWF0aW9uOiB3YXZlMSAxLjVzIGluZmluaXRlIGVhc2UtaW4tb3V0OwogICAgICB9CiAgICAgIC53YXZlMiwgLndhdmU1LCAud2F2ZTgsIC53YXZlMTEsIC53YXZlMTQsIC53YXZlMTcgewogICAgICAgIGFuaW1hdGlvbjogd2F2ZTIgMS44cyBpbmZpbml0ZSBlYXNlLWluLW91dDsKICAgICAgfQogICAgICAud2F2ZTMsIC53YXZlNiwgLndhdmU5LCAud2F2ZTEyLCAud2F2ZTE1IHsKICAgICAgICBhbmltYXRpb246IHdhdmUzIDEuMnMgaW5maW5pdGUgZWFzZS1pbi1vdXQ7CiAgICAgIH0KCiAgICAgIEBrZXlmcmFtZXMgd2F2ZTEgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyB9CiAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01cHgpOyB9CiAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfQogICAgICB9CiAgICAgIEBrZXlmcmFtZXMgd2F2ZTIgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01cHgpOyB9CiAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyB9CiAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNXB4KTsgfQogICAgICB9CiAgICAgIEBrZXlmcmFtZXMgd2F2ZTMgewogICAgICAgIDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0zcHgpOyB9CiAgICAgICAgNTAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDNweCk7IH0KICAgICAgICAxMDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0zcHgpOyB9CiAgICAgIH0KICAgIDwvc3R5bGU+Cjwvc3ZnPg==");
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 8px;
  }
  
  .audio-indicator p {
    color: #FFF;
    margin: 0;
    font-size: 1rem;
    opacity: 0.8;
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
    .call-container {
      padding: 1rem;
    }
    
    .local-video {
      width: 80px;
      height: 60px;
    }
    
    .control-button {
      width: 40px;
      height: 40px;
      font-size: 1.1rem;
    }
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

export default VideoVoicePage;
