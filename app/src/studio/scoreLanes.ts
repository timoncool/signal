import {
  emptyTrack,
  isNoteEvent,
  isProgramChangeEvent,
  Measure,
  NoteEvent,
  Song,
  Track,
  TrackEventOf,
} from "@signal-app/core"
import { MarkerEvent } from "midifile-ts"
import { chordName } from "./chordSymbols"

// A music studio's score as a song: chord symbols are the chords a track
// named "Chords" holds, each until the next, and sections are markers on the
// conductor track at the bar they start. The studio's score export writes them
// this way and its MIDI reader reads them back.

export const CHORDS_TRACK = "Chords"

// The section names the score knows; a marker named otherwise, or by one of
// these with a number after it ("Chorus 2"), is no section of the score.
const SECTION_LABELS = [
  "intro and verse",
  "pre-chorus and chorus",
  "verse and pre-chorus",
  "pre-chorus",
  "post-chorus",
  "instrumental",
  "development",
  "interlude",
  "pre-outro",
  "variation",
  "fade-out",
  "chorus",
  "bridge",
  "intro",
  "verse",
  "outro",
  "theme",
  "solo",
  "loop",
  "rap",
]

export const SECTION_NAMES = [
  "Intro",
  "Verse",
  "Pre-Chorus",
  "Chorus",
  "Bridge",
  "Interlude",
  "Instrumental",
  "Outro",
]

export function isSectionName(text: string): boolean {
  const clean = text
    .toLowerCase()
    .replace(/_/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
  return SECTION_LABELS.some((label) => {
    if (!clean.startsWith(label)) return false
    const next = clean.charAt(label.length)
    return next === "" || /[\s\d:.-]/.test(next)
  })
}
const CHORDS_PROGRAM = 48
const CHORDS_VELOCITY = 64

export interface LaneChord {
  tick: number
  end: number
  name: string | null
}

export interface LaneSection {
  id: number
  tick: number
  name: string
}

export const chordsTrack = (song: Song): Track | undefined =>
  song.tracks.find(
    (track) => !track.isConductorTrack && track.name === CHORDS_TRACK,
  )

const chordNotes = (song: Song): NoteEvent[] =>
  chordsTrack(song)?.events.filter(isNoteEvent) ?? []

export function chordsOf(song: Song): LaneChord[] {
  const notes = chordNotes(song)
  const onsets = [...new Set(notes.map((note) => note.tick))].sort(
    (a, b) => a - b,
  )
  return onsets.map((tick, index) => {
    const starting = notes.filter((note) => note.tick === tick)
    const end =
      onsets[index + 1] ??
      Math.max(...starting.map((note) => note.tick + note.duration))
    return {
      tick,
      end,
      name: chordName(starting.map((note) => note.noteNumber)),
    }
  })
}

export function sectionsOf(song: Song): LaneSection[] {
  return (song.conductorTrack?.events ?? [])
    .flatMap((event) =>
      "subtype" in event && event.subtype === "marker" && "text" in event
        ? [{ id: event.id, tick: event.tick, name: String(event.text) }]
        : [],
    )
    .sort((a, b) => a.tick - b.tick)
}

/** The bar a tick falls in: its first tick and its length. */
export const barAt = (song: Song, tick: number) => {
  const bar = Measure.getMeasureStart(song.measures, tick, song.timebase)
  return { tick: bar.tick, length: bar.duration, beat: bar.ticksPerBeat }
}

function addChordsTrack(song: Song): Track {
  const used = new Set(song.tracks.map((track) => track.channel))
  const channel =
    [...Array(16).keys()].find(
      (candidate) => candidate !== 9 && !used.has(candidate),
    ) ?? 0
  const track = emptyTrack(channel)
  track.setName(CHORDS_TRACK)
  const program = track.events.find(isProgramChangeEvent)
  if (program) track.updateEvent(program.id, { value: CHORDS_PROGRAM })
  song.addTrack(track)
  return track
}

/** A chord from `tick` held until the next one, or for a bar when none follows. */
export function setChord(song: Song, tick: number, pitches: number[]) {
  const track = chordsTrack(song) ?? addChordsTrack(song)
  const notes = track.events.filter(isNoteEvent)
  track.removeEvents(
    notes.filter((note) => note.tick === tick).map((note) => note.id),
  )
  for (const note of notes) {
    if (note.tick < tick && note.tick + note.duration > tick) {
      track.updateEvent(note.id, { duration: tick - note.tick })
    }
  }
  const next = notes
    .map((note) => note.tick)
    .filter((onset) => onset > tick)
    .sort((a, b) => a - b)[0]
  const end = next ?? tick + barAt(song, tick).length
  track.addEvents(
    pitches.map((noteNumber) => ({
      type: "channel" as const,
      subtype: "note" as const,
      tick,
      duration: end - tick,
      noteNumber,
      velocity: CHORDS_VELOCITY,
    })),
  )
}

/** The chord at `tick` taken out; the one before it holds on through its place. */
export function removeChord(song: Song, tick: number) {
  const track = chordsTrack(song)
  if (!track) return
  const notes = track.events.filter(isNoteEvent)
  const here = notes.filter((note) => note.tick === tick)
  if (here.length === 0) return
  const end = Math.max(...here.map((note) => note.tick + note.duration))
  track.removeEvents(here.map((note) => note.id))
  const before = notes.filter((note) => note.tick < tick)
  if (before.length === 0) return
  const previous = Math.max(...before.map((note) => note.tick))
  for (const note of before) {
    if (note.tick === previous && note.tick + note.duration === tick) {
      track.updateEvent(note.id, { duration: end - note.tick })
    }
  }
}

export function setSection(song: Song, tick: number, name: string) {
  const conductor = song.conductorTrack
  if (!conductor) return
  const existing = sectionsOf(song).find((section) => section.tick === tick)
  if (existing) {
    conductor.updateEvent<TrackEventOf<MarkerEvent>>(existing.id, {
      text: name,
    })
    return
  }
  conductor.addEvent<TrackEventOf<MarkerEvent>>({
    type: "meta",
    subtype: "marker",
    text: name,
    tick,
  })
}

export function removeSection(song: Song, id: number) {
  song.conductorTrack?.removeEvent(id)
}
