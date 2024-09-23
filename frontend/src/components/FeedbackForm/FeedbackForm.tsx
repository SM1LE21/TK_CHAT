// src/components/FeedbackForm/FeedbackForm.tsx
import React, { useState, FormEvent } from 'react';
import { submitFeedback } from '../../utils/api';
import './FeedbackForm.css';

interface FeedbackFormProps {
  sessionId: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ sessionId }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await submitFeedback(sessionId, feedback);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (submitted) {
    return <div className="feedback-message">Thank you for your feedback!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Your feedback..."
        required
      />
      <button type="submit">Submit Feedback</button>
    </form>
  );
};

export default FeedbackForm;
