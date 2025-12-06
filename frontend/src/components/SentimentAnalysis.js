import React, { useMemo } from 'react';
import Sentiment from 'sentiment'; // The NLP Library
import { Smile, Frown, Meh, Activity } from 'lucide-react'; // Your icons

const SentimentAnalysis = ({ text }) => {
  // 1. Initialize the AI analyzer
  const sentiment = new Sentiment();

  // 2. Analyze the text (memoized so it only runs when text changes)
  const result = useMemo(() => {
    return sentiment.analyze(text || "");
  }, [text]);

  // 3. Determine the "Vibe" based on the score
  const getVibe = (score) => {
    if (score > 2) return { color: 'text-success', icon: <Smile size={20} />, label: 'Positive', bg: 'bg-success-subtle' };
    if (score < -1) return { color: 'text-danger', icon: <Frown size={20} />, label: 'Negative', bg: 'bg-danger-subtle' };
    return { color: 'text-secondary', icon: <Meh size={20} />, label: 'Neutral', bg: 'bg-light' };
  };

  const vibe = getVibe(result.score);

  if (!text || text.length < 5) return null; // Don't show for empty/short text

  return (
    <div className={`d-flex align-items-center justify-content-between p-2 rounded mt-2 ${vibe.bg} animate-fade-in`}>
      <div className="d-flex align-items-center gap-2">
        <Activity size={16} className={vibe.color} />
        <small className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>AI TONE DETECTOR</small>
      </div>
      
      <div className={`d-flex align-items-center gap-2 ${vibe.color} fw-bold`}>
        {vibe.icon}
        <span>{vibe.label}</span>
        <span className="badge bg-white text-dark border ms-1">Score: {result.score}</span>
      </div>
    </div>
  );
};

export default SentimentAnalysis;