// src/components/FeedbackForm/FeedbackForm.tsx
import React, { useState, FormEvent } from 'react';
import { submitFeedback } from '../../utils/api';
import './FeedbackForm.css';

interface FeedbackFormProps {
  sessionId: string;
  onClose: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ sessionId, onClose }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await submitFeedback(sessionId, feedback);
      setSubmitted(true);
      
      // Optionally close the dialog here or keep it open to show a thank you message
      // onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h2>Feedback</h2>
      <p>We appreciate your feedback on the chat tool.</p>
      {!submitted ? (
        <>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback..."
            required
          />
          <div className="button-group">
            <button type="submit">Submit Feedback</button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p>Thank you for your feedback!</p>
      )}
    </form>
  );
};

export default FeedbackForm;
