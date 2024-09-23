// src/components/ChatInterface/ChatInterface.tsx
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { initializeSession, sendMessage, getConfig, Message as ApiMessage } from '../../utils/api';
import FeedbackForm from '../FeedbackForm';
import CookieConsent from '../CookieConsent';
import ChatIcon from '../ChatIcon';
import './ChatInterface.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

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
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false); 
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Check for cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'true') {
      setConsentGiven(true);
    }
  }, []);

  // Initialize session after consent is given
  useEffect(() => {
    if (!consentGiven) return;

    const storedSessionId = localStorage.getItem('sessionId');
    const sessionTimestamp = localStorage.getItem('sessionTimestamp');
    const storedMessages = localStorage.getItem('messages');
    const now = new Date().getTime();

    if (storedSessionId && sessionTimestamp && now - parseInt(sessionTimestamp, 10) < 30 * 60 * 1000) {
      setSessionId(storedSessionId);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
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

  // Save messages to local storage
  useEffect(() => {
    if (consentGiven) {
      localStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [messages, consentGiven]);

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

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setConsentGiven(true);
  };

  const handleNewChat = () => {
    // Clear messages and initialize a new session
    setMessages([]);
    setInput('');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionTimestamp');
    localStorage.removeItem('messages');

    initializeSession()
      .then((data) => {
        setSessionId(data.session_id);
        const now = new Date().getTime();
        localStorage.setItem('sessionId', data.session_id);
        localStorage.setItem('sessionTimestamp', now.toString());
      })
      .catch((error) => {
        console.error('Error initializing new session:', error);
        setError('Failed to start a new chat. Please try again later.');
      });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const openFeedback = () => {
    setIsFeedbackOpen(true);
  };

  const closeFeedback = () => {
    setIsFeedbackOpen(false);
    setFeedbackSubmitted(true);
  };

  const handleFeedbackSubmitted = () => {
    setFeedbackSubmitted(true);
    closeFeedback();
  };

  return (
    <div>
      {!consentGiven && <CookieConsent onAccept={handleAcceptCookies} />}

      {consentGiven && (
        <>
          {!isChatOpen && <ChatIcon onClick={toggleChat} />} {/* Display chat icon when chat is closed */}

          {isChatOpen && (
            <div className="chat-interface">
              <div className="chat-header">
                <span>Chat with AI</span>
                <button className="close-button" onClick={toggleChat} aria-label="Close Chat">
                  ✖
                </button>
              </div>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
                {loading && <div className="loading">AI is typing...</div>}
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="input-area">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Type your message..."
                />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="send-button">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
              <div className="chat-footer">
                <button onClick={handleNewChat} className="new-chat-button">
                  New Chat
                </button>
                <button
                  onClick={!feedbackSubmitted ? openFeedback : undefined}
                  className={`feedback-button ${feedbackSubmitted ? 'disabled' : ''}`}
                  disabled={feedbackSubmitted}
                >
                  {feedbackSubmitted ? 'Thank You' : 'Give Feedback'}
                </button>
              </div>

              {/* Feedback modal */}
              {isFeedbackOpen && (
                <div className="feedback-modal">
                  <div className="feedback-modal-content">
                    <button className="close-feedback" onClick={closeFeedback} aria-label="Close Feedback Form">
                      ✖
                    </button>
                    {sessionId && (
                      <FeedbackForm sessionId={sessionId} onClose={handleFeedbackSubmitted} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatInterface;
