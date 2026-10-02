import React from 'react';

interface SoundProps {
  src: string;
  play: boolean;
}

const Sound: React.FC<SoundProps> = ({ src, play }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.play();
    }
  }, [play]);

  return <audio ref={audioRef} src={src} />;
};

export default Sound;