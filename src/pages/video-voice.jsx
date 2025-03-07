import React, { useState, useRef, useEffect } from "react";
import { FiVideo, FiPhone, FiX } from "react-icons/fi";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from 'uuid';

const VideoVoicePage = () => {
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [callType, setCallType] = useState(null);
  const username = localStorage.getItem("chatUsername") || "Anonymous";

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title">Connect Now</h2>
        <div className="button-group">
          <button 
            className="chat-button video" 
            onClick={() => {
              setCallType("video");
              setShowCallOverlay(true);
            }}
          >
            <FiVideo className="icon" />
            Video Call
          </button>
          <button
            className="chat-button voice"
            onClick={() => {
              setCallType("voice");
              setShowCallOverlay(true);
            }}
          >
            <FiPhone className="icon" />
            Voice Call
          </button>
        </div>
      </div>
      {showCallOverlay && (
        <CallOverlay
          callType={callType}
          username={username}
          onClose={() => setShowCallOverlay(false)}
        />
      )}
    </div>
  );
};

const isValidUUID = uuid => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

const CallOverlay = ({ callType, username, onClose }) => {
  const [callStatus, setCallStatus] = useState("initializing");
  const [isCaller, setIsCaller] = useState(false);
  const localMediaRef = useRef(null);
  const remoteMediaRef = useRef(null);
  const peerConnection = useRef(null);
  const channel = useRef(null);
  const iceCandidateBuffer = useRef([]);
  const roomId = useRef('');
  const mediaConstraints = {
    audio: true,
    video: callType === "video" ? { facingMode: "user" } : false
  };

  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (channel.current) {
        supabase.removeChannel(channel.current);
      }
      stopMediaTracks();
    };
  }, []);

  const stopMediaTracks = () => {
    if (localMediaRef.current?.srcObject) {
      localMediaRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (remoteMediaRef.current?.srcObject) {
      remoteMediaRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const initializeCall = async () => {
    try {
      setCallStatus("Connecting...");
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localMediaRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers here
        ]
      });

      peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          if (isValidUUID(roomId.current)) {
            sendIceCandidate(candidate);
          } else {
            iceCandidateBuffer.current.push(candidate);
          }
        }
      };

      peerConnection.current.ontrack = event => {
        const remoteStream = event.streams[0];
        remoteMediaRef.current.srcObject = remoteStream;
        setCallStatus("Connected");
      };

      const { data: existingCalls, error } = await supabase
        .from("calls")
        .select("*")
        .eq("status", "waiting")
        .limit(1);

      if (existingCalls?.length > 0) {
        await handleExistingCall(existingCalls[0]);
      } else {
        await createNewCall();
      }
    } catch (error) {
      console.error("Call initialization failed:", error);
      setCallStatus("Connection failed");
    }
  };

  const sendIceCandidate = async (candidate) => {
    try {
      if (!isValidUUID(roomId.current)) {
        console.error('Invalid room ID when sending ICE candidate');
        return;
      }

      const { error } = await supabase
        .from("ice_candidates")
        .insert({
          room_id: roomId.current,
          candidate: candidate.toJSON()
        });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to send ICE candidate:", error);
    }
  };

  const createNewCall = async () => {
    try {
      const newRoomId = uuidv4();
      roomId.current = newRoomId;
      setIsCaller(false);

      const { error } = await supabase
        .from("calls")
        .insert({ 
          id: newRoomId,
          status: "waiting",
          type: callType,
          caller: username
        });

      if (error) throw error;

      setupSignalingChannel(newRoomId);
      setCallStatus("Waiting for peer...");
      flushIceCandidates();
    } catch (error) {
      console.error("Failed to create call:", error);
      setCallStatus("Failed to create call");
    }
  };

  const flushIceCandidates = () => {
    iceCandidateBuffer.current.forEach(candidate => {
      if (isValidUUID(roomId.current)) {
        sendIceCandidate(candidate);
      }
    });
    iceCandidateBuffer.current = [];
  };

  const handleExistingCall = async (existingCall) => {
    try {
      if (!isValidUUID(existingCall.id)) {
        throw new Error('Invalid existing call ID');
      }

      roomId.current = existingCall.id;
      setIsCaller(true);
      setCallStatus("Connecting to peer...");

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      const { error } = await supabase
        .from("calls")
        .update({ 
          status: "negotiating",
          offer: offer.sdp,
          callee: username
        })
        .eq("id", existingCall.id);

      if (error) throw error;

      setupSignalingChannel(existingCall.id);
      flushIceCandidates();
    } catch (error) {
      console.error("Failed to handle existing call:", error);
      setCallStatus("Connection failed");
    }
  };

  const setupSignalingChannel = (roomId) => {
    channel.current = supabase
      .channel(`room-${roomId}`)
      .on("postgres_changes", 
        { 
          event: "UPDATE",
          schema: "public",
          table: "calls",
          filter: `id=eq.${roomId}`
        },
        async (payload) => {
          const { new: callData } = payload;
          if (!isCaller && callData.offer) {
            await handleOffer(callData.offer);
          }
          if (isCaller && callData.answer) {
            await handleAnswer(callData.answer);
          }
        }
      )
      .on("postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ice_candidates",
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const { new: candidateData } = payload;
          try {
            const candidate = new RTCIceCandidate(candidateData.candidate);
            await peerConnection.current.addIceCandidate(candidate);
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      )
      .subscribe();
  };

  const handleOffer = async (offerSdp) => {
    try {
      await peerConnection.current.setRemoteDescription({
        type: "offer",
        sdp: offerSdp
      });

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      const { error } = await supabase
        .from("calls")
        .update({
          answer: answer.sdp,
          status: "active"
        })
        .eq("id", roomId.current);

      if (error) throw error;
    } catch (error) {
      console.error("Error handling offer:", error);
      setCallStatus("Connection failed");
    }
  };

  const handleAnswer = async (answerSdp) => {
    try {
      await peerConnection.current.setRemoteDescription({
        type: "answer",
        sdp: answerSdp
      });
    } catch (error) {
      console.error("Error handling answer:", error);
      setCallStatus("Connection failed");
    }
  };

  return (
    <div className="overlay">
      <div className="call-container">
        <div className="call-header">
          <h3>{callType === "video" ? "Video Call" : "Voice Call"}</h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>

        <div className="media-container">
          {callType === "video" && (
            <video 
              ref={localMediaRef}
              autoPlay
              muted
              playsInline
              className="local-video"
            />
          )}
          <video
            ref={remoteMediaRef}
            autoPlay
            playsInline
            className={`remote-media ${callType === "voice" ? "audio-only" : ""}`}
          />
        </div>

        <div className="call-controls">
          <p className="status">{callStatus}</p>
          {!callStatus.includes("Connected") && (
            <button 
              className="connect-button"
              onClick={initializeCall}
              disabled={callStatus === "Connecting..."}
            >
              {callStatus === "initializing" ? "Start Call" : "Connecting..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Add your CSS styles here
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
  }

  .chat-button:hover {
    background: #3B82F6;
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
  }

  .call-container {
    background: #1A1F2E;
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 800px;
  }

  .call-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .close-button {
    background: none;
    border: none;
    color: #FFF;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .media-container {
    position: relative;
    margin-bottom: 2rem;
  }

  .local-video {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 120px;
    border-radius: 8px;
    border: 2px solid #3B82F6;
  }

  .remote-media {
    width: 100%;
    max-height: 60vh;
    border-radius: 12px;
    background: #000;
  }

  .audio-only {
    background: #252C3F;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #3B82F6;
  }

  .call-controls {
    text-align: center;
  }

  .status {
    color: #FFF;
    margin-bottom: 1rem;
  }

  .connect-button {
    background: #3B82F6;
    color: #FFF;
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.3s ease;
  }

  .connect-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .card {
      padding: 1.5rem;
    }

    .title {
      font-size: 1.4rem;
    }

    .chat-button {
      padding: 1rem;
      font-size: 1rem;
    }

    .call-container {
      padding: 1.5rem;
    }

    .remote-media {
      height: 50vh;
    }
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

export default VideoVoicePage;
