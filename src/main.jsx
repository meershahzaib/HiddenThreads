import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
    domain="dev-xfrlryt1keh2c3oo.us.auth0.com"
    clientId="dHRsjdZSQQlNnm6yAMESgZtzMv9pvXN6"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    
    <App />


    </Auth0Provider>
  </StrictMode>,
)
