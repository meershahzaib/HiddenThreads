import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import About from './pages/About';
import Group from './pages/groupchat'; 
import VideoVoicePage from './pages/video-voice';
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/about" element={<About />} />
            <Route path="/groupchat" element={<Group />} />
            <Route path="/video-voice" element={<VideoVoicePage />} />  
             </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;