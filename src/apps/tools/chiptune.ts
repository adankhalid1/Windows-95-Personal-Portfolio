import type { Chiptune } from "../../data/music";

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "A4" -> 440 Hz. Supports sharps ("F#3") and flats ("Bb3"). */
function frequency(note: string): number {
  const m = /^([A-G])([#b]?)(\d)$/.exec(note);
  if (!m) return 0;
  const semis = NOTE_INDEX[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) + 1) * 12;
  return 440 * 2 ** ((semis - 69) / 12);
}

interface Note {
  step: number;
  length: number;
  freq: number;
}

function parse(pattern: string): { notes: Note[]; steps: number } {
  const notes: Note[] = [];
  let step = 0;
  for (const token of pattern.trim().split(/\s+/)) {
    const [name, times] = token.split("*");
    const length = Number(times ?? 1);
    if (name !== ".") notes.push({ step, length, freq: frequency(name) });
    step += length;
  }
  return { notes, steps: step };
}

export function songLength(song: Chiptune): number {
  const stepSec = 60 / song.bpm / 2;
  const steps = Math.max(parse(song.melody).steps, parse(song.bass).steps);
  return steps * stepSec * song.loops;
}

/**
 * Schedules a whole chiptune on the Web Audio clock, starting `offset`
 * seconds in. Returns a function that stops it.
 */
export function playChiptune(ctx: AudioContext, out: AudioNode, song: Chiptune, offset: number): () => void {
  const stepSec = 60 / song.bpm / 2;
  const melody = parse(song.melody);
  const bass = parse(song.bass);
  const patternSec = Math.max(melody.steps, bass.steps) * stepSec;
  const start = ctx.currentTime + 0.05 - offset;
  const oscillators: OscillatorNode[] = [];

  const voice = (notes: Note[], type: OscillatorType, volume: number) => {
    for (let loop = 0; loop < song.loops; loop++) {
      for (const n of notes) {
        const t0 = start + loop * patternSec + n.step * stepSec;
        const t1 = t0 + n.length * stepSec * 0.92;
        if (t1 < ctx.currentTime || !n.freq) continue;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = n.freq;
        // Short attack and release so notes don't click.
        const begin = Math.max(t0, ctx.currentTime);
        gain.gain.setValueAtTime(0, begin);
        gain.gain.linearRampToValueAtTime(volume, begin + 0.01);
        gain.gain.setValueAtTime(volume, t1 - 0.03);
        gain.gain.linearRampToValueAtTime(0, t1);
        osc.connect(gain).connect(out);
        osc.start(begin);
        osc.stop(t1 + 0.01);
        oscillators.push(osc);
      }
    }
  };
  voice(melody.notes, "square", 0.12);
  voice(bass.notes, "triangle", 0.25);

  return () => {
    for (const o of oscillators) {
      try {
        o.stop();
      } catch {
        /* already stopped */
      }
    }
  };
}
