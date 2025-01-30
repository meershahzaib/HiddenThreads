import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  // Hide Header on Chat Page
  if (location.pathname === "/chat") {
    return null;
  }

  return (
    <header className="fixed w-full top-0 z-50">
      <nav className="glass mx-4 my-4 md:mx-8 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
            </svg>
            <span className="text-xl font-medium">HiddenThreads</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <div className="relative">
              <button 
                className="flex items-center space-x-1 hover:text-primary transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>Resources</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {showDropdown && (
                <div className="dropdown">
                  <Link to="/privacy" className="dropdown-item">Privacy Policy</Link>
                  <Link to="/terms" className="dropdown-item">Terms of Service</Link>
                  <Link to="/support" className="dropdown-item">Support</Link>
                </div>
              )}
            </div>
            <Link to="/chat" className="button-primary">
              Start Thread
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-4">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
              <Link to="/chat" className="button-primary text-center">
                Start Thread
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
