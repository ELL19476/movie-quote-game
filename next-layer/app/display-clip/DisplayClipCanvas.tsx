import React, { useEffect, useRef, useState } from 'react';

// Hilfsfunktion: Wandelt das SRT-Zeitformat (00:00:02,230) in Sekunden als Float um
const parseTimeToSeconds = (timeStr: string): number => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
};

interface ClipTimestamp {
  start: number;
  end: number;
}

const VideoSequencer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timestamps, setTimestamps] = useState<ClipTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Debug-Sequenz: Die Zahlen entsprechen dem N-ten Element in der Datei
  const playSequence = [1, 5, 3, 4];

  // 1. Timestamps einlesen und parsen
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('/timestamps/stamps_1');
        const text = await response.text();

        // Regex sucht gezielt nach den Start- und Endzeiten, ignoriert Nummern/Text
        const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        const parsedStamps: ClipTimestamp[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          parsedStamps.push({
            start: parseTimeToSeconds(match[1]),
            end: parseTimeToSeconds(match[2]),
          });
        }
        
        setTimestamps(parsedStamps);
      } catch (error) {
        console.error('Fehler beim Laden der Timestamps:', error);
      }
    };

    fetchTimestamps();
  }, []);

  // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

    let animationFrameId: number;

    const checkVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
      const currentClipIndex = playSequence[sequenceIndex] - 1;
      const currentClip = timestamps[currentClipIndex];

      if (currentClip && video.currentTime >= currentClip.end) {
        // Haben wir das Ende des aktuellen Clips erreicht?
        const nextSequenceIndex = sequenceIndex + 1;

        if (nextSequenceIndex < playSequence.length) {
          // Springe zum nächsten Clip in der Sequenz
          const nextClipIndex = playSequence[nextSequenceIndex] - 1;
          const nextClip = timestamps[nextClipIndex];
          
          if (nextClip) {
            video.currentTime = nextClip.start;
            setSequenceIndex(nextSequenceIndex);
          }
        } else {
          // Sequenz beendet
          video.pause();
          setIsPlaying(false);
          return;
        }
      }

      // Loop am Laufen halten
      animationFrameId = requestAnimationFrame(checkVideoTime);
    };

    animationFrameId = requestAnimationFrame(checkVideoTime);

    // Cleanup beim Unmounten oder State-Wechsel
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Funktion zum Starten der Sequenz
  const handleStartSequence = () => {
    if (timestamps.length === 0 || !videoRef.current) {
      alert("Timestamps werden noch geladen oder Video fehlt!");
      return;
    }

    setSequenceIndex(0);
    setIsPlaying(true);

    const firstClipIndex = playSequence[0] - 1;
    if (timestamps[firstClipIndex]) {
      videoRef.current.currentTime = timestamps[firstClipIndex].start;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <video
        ref={videoRef}
        src="/videos/clip_1.mp4"
        controls
        width="100%"
        style={{ borderRadius: '8px', backgroundColor: '#000' }}
      />
      
      <button 
        onClick={handleStartSequence}
        disabled={isPlaying || timestamps.length === 0}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        {isPlaying ? 'Sequenz läuft...' : 'Debug Sequenz [1, 5, 3, 4] abspielen'}
      </button>

      <div>
        <strong>Aktueller Schritt: </strong> 
        {isPlaying ? `${sequenceIndex + 1} von ${playSequence.length}` : 'Pausiert/Beendet'}
      </div>
    </div>
  );
};

export default VideoSequencer;import React, { useEffect, useRef, useState } from 'react';

// Hilfsfunktion: Wandelt das SRT-Zeitformat (00:00:02,230) in Sekunden als Float um
const parseTimeToSeconds = (timeStr: string): number => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
};

interface ClipTimestamp {
  start: number;
  end: number;
}

const VideoSequencer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timestamps, setTimestamps] = useState<ClipTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Debug-Sequenz: Die Zahlen entsprechen dem N-ten Element in der Datei
  const playSequence = [1, 5, 3, 4];

  // 1. Timestamps einlesen und parsen
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('/timestamps/stamps_1');
        const text = await response.text();

        // Regex sucht gezielt nach den Start- und Endzeiten, ignoriert Nummern/Text
        const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        const parsedStamps: ClipTimestamp[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          parsedStamps.push({
            start: parseTimeToSeconds(match[1]),
            end: parseTimeToSeconds(match[2]),
          });
        }
        
        setTimestamps(parsedStamps);
      } catch (error) {
        console.error('Fehler beim Laden der Timestamps:', error);
      }
    };

    fetchTimestamps();
  }, []);

  // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

    let animationFrameId: number;

    const checkVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
      const currentClipIndex = playSequence[sequenceIndex] - 1;
      const currentClip = timestamps[currentClipIndex];

      if (currentClip && video.currentTime >= currentClip.end) {
        // Haben wir das Ende des aktuellen Clips erreicht?
        const nextSequenceIndex = sequenceIndex + 1;

        if (nextSequenceIndex < playSequence.length) {
          // Springe zum nächsten Clip in der Sequenz
          const nextClipIndex = playSequence[nextSequenceIndex] - 1;
          const nextClip = timestamps[nextClipIndex];
          
          if (nextClip) {
            video.currentTime = nextClip.start;
            setSequenceIndex(nextSequenceIndex);
          }
        } else {
          // Sequenz beendet
          video.pause();
          setIsPlaying(false);
          return;
        }
      }

      // Loop am Laufen halten
      animationFrameId = requestAnimationFrame(checkVideoTime);
    };

    animationFrameId = requestAnimationFrame(checkVideoTime);

    // Cleanup beim Unmounten oder State-Wechsel
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Funktion zum Starten der Sequenz
  const handleStartSequence = () => {
    if (timestamps.length === 0 || !videoRef.current) {
      alert("Timestamps werden noch geladen oder Video fehlt!");
      return;
    }

    setSequenceIndex(0);
    setIsPlaying(true);

    const firstClipIndex = playSequence[0] - 1;
    if (timestamps[firstClipIndex]) {
      videoRef.current.currentTime = timestamps[firstClipIndex].start;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <video
        ref={videoRef}
        src="/videos/clip_1.mp4"
        controls
        width="100%"
        style={{ borderRadius: '8px', backgroundColor: '#000' }}
      />
      
      <button 
        onClick={handleStartSequence}
        disabled={isPlaying || timestamps.length === 0}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        {isPlaying ? 'Sequenz läuft...' : 'Debug Sequenz [1, 5, 3, 4] abspielen'}
      </button>

      <div>
        <strong>Aktueller Schritt: </strong> 
        {isPlaying ? `${sequenceIndex + 1} von ${playSequence.length}` : 'Pausiert/Beendet'}
      </div>
    </div>
  );
};

export default VideoSequencer;import React, { useEffect, useRef, useState } from 'react';

// Hilfsfunktion: Wandelt das SRT-Zeitformat (00:00:02,230) in Sekunden als Float um
const parseTimeToSeconds = (timeStr: string): number => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
};

interface ClipTimestamp {
  start: number;
  end: number;
}

const VideoSequencer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timestamps, setTimestamps] = useState<ClipTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Debug-Sequenz: Die Zahlen entsprechen dem N-ten Element in der Datei
  const playSequence = [1, 5, 3, 4];

  // 1. Timestamps einlesen und parsen
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('/timestamps/stamps_1');
        const text = await response.text();

        // Regex sucht gezielt nach den Start- und Endzeiten, ignoriert Nummern/Text
        const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        const parsedStamps: ClipTimestamp[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          parsedStamps.push({
            start: parseTimeToSeconds(match[1]),
            end: parseTimeToSeconds(match[2]),
          });
        }
        
        setTimestamps(parsedStamps);
      } catch (error) {
        console.error('Fehler beim Laden der Timestamps:', error);
      }
    };

    fetchTimestamps();
  }, []);

  // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

    let animationFrameId: number;

    const checkVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
      const currentClipIndex = playSequence[sequenceIndex] - 1;
      const currentClip = timestamps[currentClipIndex];

      if (currentClip && video.currentTime >= currentClip.end) {
        // Haben wir das Ende des aktuellen Clips erreicht?
        const nextSequenceIndex = sequenceIndex + 1;

        if (nextSequenceIndex < playSequence.length) {
          // Springe zum nächsten Clip in der Sequenz
          const nextClipIndex = playSequence[nextSequenceIndex] - 1;
          const nextClip = timestamps[nextClipIndex];
          
          if (nextClip) {
            video.currentTime = nextClip.start;
            setSequenceIndex(nextSequenceIndex);
          }
        } else {
          // Sequenz beendet
          video.pause();
          setIsPlaying(false);
          return;
        }
      }

      // Loop am Laufen halten
      animationFrameId = requestAnimationFrame(checkVideoTime);
    };

    animationFrameId = requestAnimationFrame(checkVideoTime);

    // Cleanup beim Unmounten oder State-Wechsel
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Funktion zum Starten der Sequenz
  const handleStartSequence = () => {
    if (timestamps.length === 0 || !videoRef.current) {
      alert("Timestamps werden noch geladen oder Video fehlt!");
      return;
    }

    setSequenceIndex(0);
    setIsPlaying(true);

    const firstClipIndex = playSequence[0] - 1;
    if (timestamps[firstClipIndex]) {
      videoRef.current.currentTime = timestamps[firstClipIndex].start;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <video
        ref={videoRef}
        src="/videos/clip_1.mp4"
        controls
        width="100%"
        style={{ borderRadius: '8px', backgroundColor: '#000' }}
      />
      
      <button 
        onClick={handleStartSequence}
        disabled={isPlaying || timestamps.length === 0}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        {isPlaying ? 'Sequenz läuft...' : 'Debug Sequenz [1, 5, 3, 4] abspielen'}
      </button>

      <div>
        <strong>Aktueller Schritt: </strong> 
        {isPlaying ? `${sequenceIndex + 1} von ${playSequence.length}` : 'Pausiert/Beendet'}
      </div>
    </div>
  );
};

export default VideoSequencer;import React, { useEffect, useRef, useState } from 'react';

// Hilfsfunktion: Wandelt das SRT-Zeitformat (00:00:02,230) in Sekunden als Float um
const parseTimeToSeconds = (timeStr: string): number => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
};

interface ClipTimestamp {
  start: number;
  end: number;
}

const VideoSequencer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timestamps, setTimestamps] = useState<ClipTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Debug-Sequenz: Die Zahlen entsprechen dem N-ten Element in der Datei
  const playSequence = [1, 5, 3, 4];

  // 1. Timestamps einlesen und parsen
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('/timestamps/stamps_1');
        const text = await response.text();

        // Regex sucht gezielt nach den Start- und Endzeiten, ignoriert Nummern/Text
        const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        const parsedStamps: ClipTimestamp[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          parsedStamps.push({
            start: parseTimeToSeconds(match[1]),
            end: parseTimeToSeconds(match[2]),
          });
        }
        
        setTimestamps(parsedStamps);
      } catch (error) {
        console.error('Fehler beim Laden der Timestamps:', error);
      }
    };

    fetchTimestamps();
  }, []);

  // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

    let animationFrameId: number;

    const checkVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
      const currentClipIndex = playSequence[sequenceIndex] - 1;
      const currentClip = timestamps[currentClipIndex];

      if (currentClip && video.currentTime >= currentClip.end) {
        // Haben wir das Ende des aktuellen Clips erreicht?
        const nextSequenceIndex = sequenceIndex + 1;

        if (nextSequenceIndex < playSequence.length) {
          // Springe zum nächsten Clip in der Sequenz
          const nextClipIndex = playSequence[nextSequenceIndex] - 1;
          const nextClip = timestamps[nextClipIndex];
          
          if (nextClip) {
            video.currentTime = nextClip.start;
            setSequenceIndex(nextSequenceIndex);
          }
        } else {
          // Sequenz beendet
          video.pause();
          setIsPlaying(false);
          return;
        }
      }

      // Loop am Laufen halten
      animationFrameId = requestAnimationFrame(checkVideoTime);
    };

    animationFrameId = requestAnimationFrame(checkVideoTime);

    // Cleanup beim Unmounten oder State-Wechsel
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Funktion zum Starten der Sequenz
  const handleStartSequence = () => {
    if (timestamps.length === 0 || !videoRef.current) {
      alert("Timestamps werden noch geladen oder Video fehlt!");
      return;
    }

    setSequenceIndex(0);
    setIsPlaying(true);

    const firstClipIndex = playSequence[0] - 1;
    if (timestamps[firstClipIndex]) {
      videoRef.current.currentTime = timestamps[firstClipIndex].start;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <video
        ref={videoRef}
        src="/videos/clip_1.mp4"
        controls
        width="100%"
        style={{ borderRadius: '8px', backgroundColor: '#000' }}
      />
      
      <button 
        onClick={handleStartSequence}
        disabled={isPlaying || timestamps.length === 0}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        {isPlaying ? 'Sequenz läuft...' : 'Debug Sequenz [1, 5, 3, 4] abspielen'}
      </button>

      <div>
        <strong>Aktueller Schritt: </strong> 
        {isPlaying ? `${sequenceIndex + 1} von ${playSequence.length}` : 'Pausiert/Beendet'}
      </div>
    </div>
  );
};

export default VideoSequencer;import React, { useEffect, useRef, useState } from 'react';

// Hilfsfunktion: Wandelt das SRT-Zeitformat (00:00:02,230) in Sekunden als Float um
const parseTimeToSeconds = (timeStr: string): number => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
};

interface ClipTimestamp {
  start: number;
  end: number;
}

const VideoSequencer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timestamps, setTimestamps] = useState<ClipTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Debug-Sequenz: Die Zahlen entsprechen dem N-ten Element in der Datei
  const playSequence = [1, 5, 3, 4];

  // 1. Timestamps einlesen und parsen
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('/timestamps/stamps_1');
        const text = await response.text();

        // Regex sucht gezielt nach den Start- und Endzeiten, ignoriert Nummern/Text
        const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        const parsedStamps: ClipTimestamp[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          parsedStamps.push({
            start: parseTimeToSeconds(match[1]),
            end: parseTimeToSeconds(match[2]),
          });
        }
        
        setTimestamps(parsedStamps);
      } catch (error) {
        console.error('Fehler beim Laden der Timestamps:', error);
      }
    };

    fetchTimestamps();
  }, []);

  // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

    let animationFrameId: number;

    const checkVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
      const currentClipIndex = playSequence[sequenceIndex] - 1;
      const currentClip = timestamps[currentClipIndex];

      if (currentClip && video.currentTime >= currentClip.end) {
        // Haben wir das Ende des aktuellen Clips erreicht?
        const nextSequenceIndex = sequenceIndex + 1;

        if (nextSequenceIndex < playSequence.length) {
          // Springe zum nächsten Clip in der Sequenz
          const nextClipIndex = playSequence[nextSequenceIndex] - 1;
          const nextClip = timestamps[nextClipIndex];
          
          if (nextClip) {
            video.currentTime = nextClip.start;
            setSequenceIndex(nextSequenceIndex);
          }
        } else {
          // Sequenz beendet
          video.pause();
          setIsPlaying(false);
          return;
        }
      }

      // Loop am Laufen halten
      animationFrameId = requestAnimationFrame(checkVideoTime);
    };

    animationFrameId = requestAnimationFrame(checkVideoTime);

    // Cleanup beim Unmounten oder State-Wechsel
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Funktion zum Starten der Sequenz
  const handleStartSequence = () => {
    if (timestamps.length === 0 || !videoRef.current) {
      alert("Timestamps werden noch geladen oder Video fehlt!");
      return;
    }

    setSequenceIndex(0);
    setIsPlaying(true);

    const firstClipIndex = playSequence[0] - 1;
    if (timestamps[firstClipIndex]) {
      videoRef.current.currentTime = timestamps[firstClipIndex].start;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <video
        ref={videoRef}
        src="/videos/clip_1.mp4"
        controls
        width="100%"
        style={{ borderRadius: '8px', backgroundColor: '#000' }}
      />
      
      <button 
        onClick={handleStartSequence}
        disabled={isPlaying || timestamps.length === 0}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        {isPlaying ? 'Sequenz läuft...' : 'Debug Sequenz [1, 5, 3, 4] abspielen'}
      </button>

      <div>
        <strong>Aktueller Schritt: </strong> 
        {isPlaying ? `${sequenceIndex + 1} von ${playSequence.length}` : 'Pausiert/Beendet'}
      </div>
    </div>
  );
};

export default VideoSequencer;import React, { useEffect, useRef, useState } from 'react';

// Hilfsfunktion: Wandelt das SRT-Zeitformat (00:00:02,230) in Sekunden als Float um
const parseTimeToSeconds = (timeStr: string): number => {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
};

interface ClipTimestamp {
  start: number;
  end: number;
}

const VideoSequencer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timestamps, setTimestamps] = useState<ClipTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Debug-Sequenz: Die Zahlen entsprechen dem N-ten Element in der Datei
  const playSequence = [1, 5, 3, 4];

  // 1. Timestamps einlesen und parsen
  useEffect(() => {
    const fetchTimestamps = async () => {
      try {
        const response = await fetch('/timestamps/stamps_1');
        const text = await response.text();

        // Regex sucht gezielt nach den Start- und Endzeiten, ignoriert Nummern/Text
        const regex = /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        const parsedStamps: ClipTimestamp[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          parsedStamps.push({
            start: parseTimeToSeconds(match[1]),
            end: parseTimeToSeconds(match[2]),
          });
        }
        
        setTimestamps(parsedStamps);
      } catch (error) {
        console.error('Fehler beim Laden der Timestamps:', error);
      }
    };

    fetchTimestamps();
  }, []);

  // 2. Kontinuierliche Prüfung der Abspielzeit über requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !videoRef.current || timestamps.length === 0) return;

    let animationFrameId: number;

    const checkVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      // Wir ziehen 1 ab, da deine Liste 1-basiert ist (1. Element = Index 0)
      const currentClipIndex = playSequence[sequenceIndex] - 1;
      const currentClip = timestamps[currentClipIndex];

      if (currentClip && video.currentTime >= currentClip.end) {
        // Haben wir das Ende des aktuellen Clips erreicht?
        const nextSequenceIndex = sequenceIndex + 1;

        if (nextSequenceIndex < playSequence.length) {
          // Springe zum nächsten Clip in der Sequenz
          const nextClipIndex = playSequence[nextSequenceIndex] - 1;
          const nextClip = timestamps[nextClipIndex];
          
          if (nextClip) {
            video.currentTime = nextClip.start;
            setSequenceIndex(nextSequenceIndex);
          }
        } else {
          // Sequenz beendet
          video.pause();
          setIsPlaying(false);
          return;
        }
      }

      // Loop am Laufen halten
      animationFrameId = requestAnimationFrame(checkVideoTime);
    };

    animationFrameId = requestAnimationFrame(checkVideoTime);

    // Cleanup beim Unmounten oder State-Wechsel
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sequenceIndex, timestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Funktion zum Starten der Sequenz
  const handleStartSequence = () => {
    if (timestamps.length === 0 || !videoRef.current) {
      alert("Timestamps werden noch geladen oder Video fehlt!");
      return;
    }

    setSequenceIndex(0);
    setIsPlaying(true);

    const firstClipIndex = playSequence[0] - 1;
    if (timestamps[firstClipIndex]) {
      videoRef.current.currentTime = timestamps[firstClipIndex].start;
      videoRef.current.play();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
      <video
        ref={videoRef}
        src="/videos/clip_1.mp4"
        controls
        width="100%"
        style={{ borderRadius: '8px', backgroundColor: '#000' }}
      />
      
      <button 
        onClick={handleStartSequence}
        disabled={isPlaying || timestamps.length === 0}
        style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
      >
        {isPlaying ? 'Sequenz läuft...' : 'Debug Sequenz [1, 5, 3, 4] abspielen'}
      </button>

      <div>
        <strong>Aktueller Schritt: </strong> 
        {isPlaying ? `${sequenceIndex + 1} von ${playSequence.length}` : 'Pausiert/Beendet'}
      </div>
    </div>
  );
};

export default VideoSequencer;
