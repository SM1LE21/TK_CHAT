// src/components/ChatIcon/ChatIcon.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import './ChatIcon.css';

interface ChatIconProps {
  onClick: () => void;
}

const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => {
    return (
      <div className="chat-icon" onClick={onClick}>
        <FontAwesomeIcon icon={faComment} className="chat-icon-symbol" />
      </div>
    );
  };
  

export default ChatIcon;
