import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import keycloak from './service/keycloak';
import { ReactKeycloakProvider } from '@react-keycloak/web';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    }}
  >
    <App />
  </ReactKeycloakProvider>
);
