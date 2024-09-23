// src/components/ChatIcon/ChatIcon.tsx
import React from 'react';
import './ChatIcon.css';

interface ChatIconProps {
  onClick: () => void;
}

const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => {
  return (
    <div className="chat-icon" onClick={onClick}>
      <span className="chat-icon-symbol">💬</span>
    </div>
  );
};

export default ChatIcon;
