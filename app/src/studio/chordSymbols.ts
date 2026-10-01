// Chord symbols as a music studio's score writes them (Am7, F#m(maj7)/C#):
// the notes a symbol is held as on a "Chords" track, and the symbol notes
// sounding together spell. The studio's score reader names a chords track the
// same way, so a chord set here reads back as the same symbol.

const QUALITY_STEPS: [string, number[]][] = [
  ["", [0, 4, 7]],
  ["m", [0, 3, 7]],
  ["dim", [0, 3, 6]],
  ["aug", [0, 4, 8]],
  ["7", [0, 4, 7, 10]],
  ["maj7", [0, 4, 7, 11]],
  ["m7", [0, 3, 7, 10]],
  ["dim7", [0, 3, 6, 9]],
  ["m7b5", [0, 3, 6, 10]],
  ["sus4", [0, 5, 7]],
  ["sus2", [0, 2, 7]],
  ["6", [0, 4, 7, 9]],
  ["m6", [0, 3, 7, 9]],
  ["7sus4", [0, 5, 7, 10]],
  ["m(maj7)", [0, 3, 7, 11]],
]

export const QUALITIES = QUALITY_STEPS.map(([quality]) => quality)

// The chord's root sounds from C3 to B3, a slash bass an octave below.
export const CHORD_ROOT = 48

const SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]

const mod12 = (value: number) => ((value % 12) + 12) % 12

const pitchClass = (name: string): number => {
  const natural = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[name[0] as "C"]
  const sharps = name.split("#").length - 1
  const flats = name.slice(1).split("b").length - 1
  return mod12(natural + sharps - flats)
}

const ROOT = /^([A-G](?:##|bb|#|b)?)(.*)$/

/** The pitches a symbol is held as, or null when it is no chord a score knows. */
export function chordPitches(symbol: string): number[] | null {
  const [head, bass, extra] = symbol.trim().split("/")
  if (extra !== undefined || !head) return null
  const match = ROOT.exec(head)
  if (!match) return null
  const steps = QUALITY_STEPS.find(([quality]) => quality === match[2])?.[1]
  if (!steps) return null
  if (bass !== undefined && !/^[A-G](?:##|bb|#|b)?$/.test(bass)) return null
  const base = CHORD_ROOT + pitchClass(match[1])
  const pitches = steps.map((step) => base + step)
  if (bass !== undefined) pitches.unshift(CHORD_ROOT - 12 + pitchClass(bass))
  return pitches
}

const shapeOf = (
  classes: Set<number>,
  prefer: number[],
): [number, string] | null => {
  const found: [number, string][] = []
  for (const [quality, steps] of QUALITY_STEPS) {
    for (let root = 0; root < 12; root++) {
      const tones = new Set(steps.map((step) => (root + step) % 12))
      if (
        tones.size === classes.size &&
        [...tones].every((tone) => classes.has(tone))
      ) {
        found.push([root, quality])
      }
    }
  }
  for (const root of prefer) {
    const candidate = found.find(([each]) => each === root)
    if (candidate) return candidate
  }
  return found[0] ?? null
}

/** The symbol notes sounding together spell, or null when they spell none. */
export function chordName(notes: number[]): string | null {
  const pitches = [...new Set(notes)].sort((a, b) => a - b)
  const classes = new Set(pitches.map(mod12))
  if (classes.size < 3) return null
  const [bass, ...upper] = pitches
  const above = new Set(upper.map(mod12))
  const tries: [Set<number>, number[]][] = []
  if (bass < CHORD_ROOT && CHORD_ROOT <= upper[0]) {
    tries.push([above, [mod12(upper[0]), mod12(bass)]])
  }
  tries.push([classes, [mod12(bass), mod12(upper[0])]])
  if (!above.has(mod12(bass))) tries.push([above, [mod12(upper[0])]])
  for (const [wanted, prefer] of tries) {
    const shape = shapeOf(wanted, prefer)
    if (!shape) continue
    const [root, quality] = shape
    const slash = mod12(bass) === root ? "" : `/${SHARP_NAMES[mod12(bass)]}`
    return `${SHARP_NAMES[root]}${quality}${slash}`
  }
  return null
}
