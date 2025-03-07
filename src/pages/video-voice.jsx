
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { supabase } from "../supabaseClient"; // Import your Supabase instance

const Video = ({ currentUser, partnerUser, callId, isCaller }) => {
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const userVideoRef = useRef();
  const partnerVideoRef = useRef();

  // Subscribe to Supabase real-time signaling
  useEffect(() => {
    const channel = supabase.channel(`call-${callId}`);
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "call_signals", filter: `call_id=eq.${callId}` },
      (payload) => {
        if (peer) {
          peer.signal(payload.new.signal);
        }
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId, peer]);

  // Get user media and initialize peer
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = currentStream;
        }

        // Initialize peer connection
        const newPeer = new Peer({
          initiator: isCaller,
          trickle: false,
          stream: currentStream,
        });

        newPeer.on("signal", (signalData) => {
          supabase.from("call_signals").insert([
            { call_id: callId, sender: currentUser, receiver: partnerUser, signal: signalData },
          ]);
        });

        newPeer.on("stream", (remoteStream) => {
          if (partnerVideoRef.current) {
            partnerVideoRef.current.srcObject = remoteStream;
          }
        });

        setPeer(newPeer);
      })
      .catch((err) => console.error("Error accessing media devices:", err));
  }, [isCaller, callId, currentUser, partnerUser]);

  // End Call
  const endCall = () => {
    if (peer) peer.destroy();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Toggle Audio
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-wrapper">
        <video ref={userVideoRef} autoPlay muted className="local-video" />
        <video ref={partnerVideoRef} autoPlay className="remote-video" />
      </div>

      <div className="controls">
        <button onClick={toggleMute} className="control-btn">
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleVideo} className="control-btn">
          {isVideoOn ? "Hide Video" : "Show Video"}
        </button>
        <button onClick={endCall} className="end-call-btn">End Call</button>
      </div>

      {/* CSS Styling */}
      <style jsx>{`
        .video-call-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: black;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .video-wrapper {
          position: relative;
          width: 80%;
          max-width: 800px;
          background: #000;
        }
        video {
          width: 100%;
          border-radius: 8px;
        }
        .controls {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .control-btn {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .end-call-btn {
          padding: 8px 16px;
          background: red;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Video;
