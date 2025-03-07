import React from 'react';
import { FiVideo, FiPhone } from 'react-icons/fi';

const VideoVoicePage = () => {
  const handleVideoChat = () => {
    console.info('Initiating video chat...');
  };

  const handleVoiceChat = () => {
    console.info('Initiating voice chat...');
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="title">Connect Now</h2>
        <div className="button-group">
          <button className="chat-button video" onClick={handleVideoChat}>
            <FiVideo className="icon" />
            <span>Video Call</span>
          </button>
          <button className="chat-button voice" onClick={handleVoiceChat}>
            <FiPhone className="icon" />
            <span>Voice Call</span>
          </button>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap');

        .page-container {
          background-color: #0E1422;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          font-family: 'Comfortaa', sans-serif;
        }

        .card {
          background-color: #1A1F2E;
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 480px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .title {
          color: #FFFFFF;
          font-weight: 500;
          font-size: 1.8rem;
          margin-bottom: 2.5rem;
          letter-spacing: 0.5px;
        }

        .button-group {
          display: grid;
          gap: 1.2rem;
        }

        .chat-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 1.2rem;
          border: none;
          border-radius: 14px;
          background-color: #252C3F;
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          gap: 0.8rem;
        }

        .chat-button:hover {
          background-color: #3B82F6;
          transform: translateY(-2px);
        }

        .chat-button.video:hover {
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .chat-button.voice:hover {
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .icon {
          font-size: 1.4rem;
          color: #8A9BA8;
        }

        .chat-button:hover .icon {
          color: #FFFFFF;
        }

        @media (max-width: 768px) {
          .card {
            padding: 2rem;
            border-radius: 20px;
          }

          .title {
            font-size: 1.6rem;
            margin-bottom: 2rem;
          }

          .chat-button {
            padding: 1rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .card {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .title {
            font-size: 1.4rem;
            margin-bottom: 1.5rem;
          }

          .chat-button {
            padding: 0.9rem;
            border-radius: 12px;
          }

          .icon {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoVoicePage;