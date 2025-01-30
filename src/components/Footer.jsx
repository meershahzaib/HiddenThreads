import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


function Footer() {

  const location = useLocation();

  // Hide footer on Chat Page
  if (location.pathname === "/chat") {
    return null;
  }

  return (
    <footer className="py-8 px-4 md:px-8 bg-dark-lighter">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">HiddenThreads</h3>
            <p className="text-sm text-gray-400">Secure. Private. Anonymous.</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/security">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/support">Help Center</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/status">System Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700/30 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} HiddenThreads. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;