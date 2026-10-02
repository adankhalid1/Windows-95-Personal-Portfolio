import { useCallback, useEffect, useRef, useState } from "react";
import { playlist as builtIn, type Track } from "../../data/music";
import { playChiptune, songLength } from "./chiptune";

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  analyser: AnalyserNode;
  audio: HTMLAudioElement;
}

/** A Winamp-flavoured player for the built-in chiptunes and your own audio files. */
function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>(builtIn);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(() => (builtIn[0]?.chiptune ? songLength(builtIn[0].chiptune) : 0));
  const [volume, setVolume] = useState(0.7);
  const engine = useRef<Engine | null>(null);
  const stopSynth = useRef<(() => void) | null>(null);
  const startedAt = useRef(0); // ctx time that corresponds to position 0
  const bars = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const track = tracks[index];

  /** Audio is created on first play: browsers only allow it after a click. */
  const getEngine = useCallback(() => {
    if (engine.current) return engine.current;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    master.connect(analyser).connect(ctx.destination);
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    ctx.createMediaElementSource(audio).connect(master);
    engine.current = { ctx, master, analyser, audio };
    return engine.current;
  }, []);

  const halt = useCallback(() => {
    stopSynth.current?.();
    stopSynth.current = null;
    engine.current?.audio.pause();
  }, []);

  const play = useCallback(
    (i: number, from = 0) => {
      const t = tracks[i];
      if (!t) return;
      const e = getEngine();
      void e.ctx.resume();
      halt();
      setIndex(i);
      setPosition(from);
      if (t.chiptune) {
        setDuration(songLength(t.chiptune));
        stopSynth.current = playChiptune(e.ctx, e.master, t.chiptune, from);
        startedAt.current = e.ctx.currentTime - from;
      } else if (t.src) {
        if (e.audio.src !== new URL(t.src, location.href).href) e.audio.src = t.src;
        e.audio.currentTime = from;
        void e.audio.play();
      }
      setPlaying(true);
    },
    [tracks, getEngine, halt],
  );

  const pause = () => {
    halt();
    setPlaying(false);
  };

  const stop = () => {
    halt();
    setPlaying(false);
    setPosition(0);
  };

  const next = useCallback(() => play((index + 1) % tracks.length), [play, index, tracks.length]);
  const prev = () => play(position > 3 ? index : (index - 1 + tracks.length) % tracks.length);

  useEffect(() => {
    if (engine.current) engine.current.master.gain.value = volume;
  }, [volume]);

  // Clock, auto-advance and the spectrum bars.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const e = engine.current;
      if (e && playing) {
        const t = tracks[index];
        const pos = t.chiptune ? e.ctx.currentTime - startedAt.current : e.audio.currentTime;
        if (!t.chiptune && Number.isFinite(e.audio.duration)) setDuration(e.audio.duration);
        const len = t.chiptune ? songLength(t.chiptune) : e.audio.duration;
        if ((t.chiptune && pos >= len) || (!t.chiptune && e.audio.ended)) {
          next();
          return;
        }
        setPosition(Math.max(0, pos));
      }
      const c = bars.current?.getContext("2d");
      if (c) {
        const data = new Uint8Array(32);
        if (e && playing) e.analyser.getByteFrequencyData(data);
        c.fillStyle = "#000";
        c.fillRect(0, 0, 76, 32);
        for (let i = 0; i < 19; i++) {
          const h = Math.round((data[i] / 255) * 30);
          for (let y = 0; y < h; y += 2) {
            c.fillStyle = y > 22 ? "#e04000" : y > 14 ? "#e0c000" : "#00c000";
            c.fillRect(i * 4, 31 - y, 3, 1);
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, index, tracks, next]);

  // Stop the music when the window closes.
  useEffect(
    () => () => {
      stopSynth.current?.();
      engine.current?.audio.pause();
      void engine.current?.ctx.close();
    },
    [],
  );

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const added = [...files].map((f) => ({
      title: f.name.replace(/\.[^.]+$/, ""),
      artist: "Your file",
      src: URL.createObjectURL(f),
    }));
    setTracks([...tracks, ...added]);
  };

  return (
    <div className="music">
      <div className="music-top">
        <div className="music-lcd">
          <div className="music-time">{clock(position)}</div>
          <canvas ref={bars} width={76} height={32} className="music-bars" aria-hidden />
        </div>
        <div className="music-info">
          <div className="music-marquee" aria-live="polite">
            <span>
              {index + 1}. {track?.artist} - {track?.title} ({clock(duration)}) ***
            </span>
          </div>
          <div className="music-meta">
            <span>{track?.chiptune ? "CHIPTUNE" : "AUDIO"}</span>
            <span>{playing ? "▶ PLAYING" : position > 0 ? "❚❚ PAUSED" : "■ STOPPED"}</span>
          </div>
        </div>
      </div>
      <input
        className="music-seek"
        type="range"
        min={0}
        max={Math.max(1, Math.floor(duration))}
        value={Math.floor(position)}
        aria-label="Seek"
        onChange={(e) => {
          const to = Number(e.currentTarget.value);
          if (playing) play(index, to);
          else setPosition(to);
        }}
      />
      <div className="music-controls">
        <button className="win-btn" onClick={prev} aria-label="Previous">⏮</button>
        <button className="win-btn" onClick={() => play(index, position)} aria-label="Play">▶</button>
        <button className="win-btn" onClick={pause} aria-label="Pause">⏸</button>
        <button className="win-btn" onClick={stop} aria-label="Stop">⏹</button>
        <button className="win-btn" onClick={next} aria-label="Next">⏭</button>
        <label className="music-volume">
          🔊
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            aria-label="Volume"
            onChange={(e) => setVolume(Number(e.currentTarget.value))}
          />
        </label>
      </div>
      <ol className="music-playlist">
        {tracks.map((t, i) => (
          <li key={`${t.title}-${i}`}>
            <button className={i === index ? "current" : ""} onDoubleClick={() => play(i)} onClick={() => play(i)}>
              <span>
                {i + 1}. {t.artist} - {t.title}
              </span>
              <span>{t.chiptune ? clock(songLength(t.chiptune)) : ""}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="music-footer">
        <button className="win-btn" onClick={() => fileInput.current?.click()}>
          + Add files...
        </button>
        <span className="muted">Your files stay on your device.</span>
        <input
          ref={fileInput}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}

export default MusicPlayer;
