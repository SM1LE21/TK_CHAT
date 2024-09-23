// src/components/CookieConsent/CookieConsent.tsx
import React from 'react';
import './CookieConsent.css';

interface CookieConsentProps {
  onAccept: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  return (
    <div className="cookie-consent">
      <p>
        We use cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.
      </p>
      <button onClick={onAccept}>Accept</button>
    </div>
  );
};

export default CookieConsent;
