// The Music Player's playlist. To add your own songs, put audio files in
// /public/music and add entries like:
//   { title: "My Song", artist: "Me", src: "music/my-song.mp3" },
// (Only use music you have the rights to share.)
//
// The built-in tracks are original chiptunes written for this site and
// played by the browser's synthesizer, so they need no audio files.
// Notes are written one step (an eighth note) each: "C5" is a note, "C5*2"
// holds it for two steps, and "." is a rest.

export interface Chiptune {
  bpm: number;
  /** How many times the pattern repeats. */
  loops: number;
  melody: string;
  bass: string;
}

export interface Track {
  title: string;
  artist: string;
  src?: string;
  chiptune?: Chiptune;
}

export const playlist: Track[] = [
  {
    title: "Startup Groove",
    artist: "Adan's PC",
    chiptune: {
      bpm: 132,
      loops: 4,
      melody:
        "C5 E5 G5 E5 A5*2 G5 E5 F5 A5 C6 A5 G5*2 E5 . " +
        "D5 F5 A5 F5 G5*2 E5 C5 D5 E5 F5 D5 C5*3 . " +
        "E5 G5 C6 G5 A5*2 G5 E5 F5 E5 D5 C5 D5*2 G4 . " +
        "C5 D5 E5 G5 A5 G5 E5 D5 C5*4 . . . .",
      bass:
        "C3 . G3 . C3 . G3 . F3 . C4 . F3 . C4 . " +
        "D3 . A3 . G3 . D4 . C3 . G3 . C3 . G3 . " +
        "A2 . E3 . A2 . E3 . F3 . C4 . G3 . D4 . " +
        "F3 . C4 . G3 . D4 . C3 . G3 . C3*2 . .",
    },
  },
  {
    title: "Dial-Up Dreams",
    artist: "Adan's PC",
    chiptune: {
      bpm: 96,
      loops: 3,
      melody:
        "A4 C5 E5 A5*3 G5 E5 D5*2 E5 C5*3 . " +
        "F4 A4 C5 F5*3 E5 C5 B4*2 C5 A4*3 . " +
        "D5 F5 A5 G5*2 F5 E5 D5 C5 B4 C5 D5*3 . " +
        "E5 D5 C5 B4 A4*2 B4 C5 E4 G#4 B4 A4*3 . . . . .",
      bass:
        "A2*4 E3*4 A2*4 E3*4 F2*4 C3*4 F2*4 C3*4 " +
        "D3*4 A2*4 G2*4 C3*4 F2*4 E2*4 A2*4 E2*4",
    },
  },
  {
    title: "Desktop Boogie",
    artist: "Adan's PC",
    chiptune: {
      bpm: 150,
      loops: 4,
      melody:
        "G4 . A#4 B4 D5 . E5 D5 G4 . A#4 B4 D5*2 . . " +
        "C5 . D#5 E5 G5 . A5 G5 C5 . D#5 E5 G5*2 . . " +
        "D5 . F5 F#5 A5 . G5 F5 C5 . D#5 E5 G5 . E5 . " +
        "G4 A#4 B4 D5 E5 D5 B4 A4 G4*2 . D5 G4*2 . .",
      bass:
        "G2 . B2 . D3 . E3 . G2 . B2 . D3 . E3 . " +
        "C3 . E3 . G3 . A3 . C3 . E3 . G3 . A3 . " +
        "D3 . F#3 . A3 . B3 . C3 . E3 . G3 . A3 . " +
        "G2 . B2 . D3 . E3 . G2 . D3 . G2*2 . .",
    },
  },
];
