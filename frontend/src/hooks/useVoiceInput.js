import { useState, useEffect, useRef } from 'react';

const useVoiceInput = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  
  // 💡 useRef keeps the "listener" alive across re-renders
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one complete sentence
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      // --- EVENT HANDLERS ---
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        // We don't manually set isListening(false) here, 
        // because onend will fire automatically next.
      };

      recognition.onerror = (event) => {
        console.error("Voice Error:", event.error);
        // Ignore "no-speech" errors (happens if you don't talk fast enough)
        if (event.error !== 'no-speech') {
             setError(event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Browser not supported");
      return;
    }

    try {
      // Clear previous text and start
      setText('');
      recognitionRef.current.start();
    } catch (err) {
      // If user clicks fast, it might already be started
      console.warn("Recognition already started");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return {
    text,
    isListening,
    startListening,
    stopListening,
    hasSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};

export default useVoiceInput;