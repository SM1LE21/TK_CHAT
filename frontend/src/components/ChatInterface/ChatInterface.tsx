// src/components/ChatInterface/ChatInterface.tsx
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { initializeSession, sendMessage, getConfig, Message as ApiMessage } from '../../utils/api';
import FeedbackForm from '../FeedbackForm';
import './ChatInterface.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatInterface: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'true') {
      setConsentGiven(true);
    } else {
      // Display cookie banner or modal here
      // For demonstration, we'll assume consent is given
      localStorage.setItem('cookieConsent', 'true');
      setConsentGiven(true);
    }
  }, []);

  // Initialize session after consent is given
  useEffect(() => {
    if (!consentGiven) return;

    const storedSessionId = localStorage.getItem('sessionId');
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    const now = new Date().getTime();

    if (storedSessionId && sessionTimestamp && now - parseInt(sessionTimestamp, 10) < 30 * 60 * 1000) {
      setSessionId(storedSessionId);
    } else {
      initializeSession()
        .then((data) => {
          setSessionId(data.session_id);
          localStorage.setItem('sessionId', data.session_id);
          localStorage.setItem('sessionTimestamp', now.toString());
        })
        .catch((error) => {
          console.error('Error initializing session:', error);
          setError('Failed to initialize session. Please try again later.');
        });
    }
  }, [consentGiven]);

  // Fetch configuration from backend
  useEffect(() => {
    getConfig()
      .then((config) => {
        setShowFeedback(config.showFeedback);
      })
      .catch((error) => {
        console.error('Error fetching configuration:', error);
        // Handle error if needed
      });
  }, []);

  const isSessionValid = () => {
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    const now = new Date().getTime();
    return sessionTimestamp && now - parseInt(sessionTimestamp, 10) < 30 * 60 * 1000;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!isSessionValid()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'system', content: 'Session expired. Please refresh the page.' },
      ]);
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!sessionId) throw new Error('Session ID is not set.');
      const response = await sendMessage(sessionId, input);
      const aiMessage: Message = { role: 'assistant', content: response.content };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      // Update session timestamp on successful interaction
      const now = new Date().getTime();
      localStorage.setItem('sessionTimestamp', now.toString());
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && <div className="loading">AI is typing...</div>}
      </div>
      {error && <div className="error-message">{error}</div>}
      <textarea
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={loading}
        placeholder="Type your message..."
      />
      <button onClick={handleSend} disabled={loading || !input.trim()}>
        Send
      </button>
      {showFeedback && sessionId && <FeedbackForm sessionId={sessionId} />}
    </div>
  );
};

export default ChatInterface;
