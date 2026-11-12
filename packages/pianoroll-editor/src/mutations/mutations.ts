import { isNotUndefined, map } from "@signal-app/core"
import { flow } from "lodash"
import {
  duplicatedNotes,
  type NoteEvent,
  quantizeNote,
  toId,
  transposeNote,
} from "../entities"
import { getNotesByIds } from "../queries"
import type { PianoRollEditorMutator, PianoRollMutationContext } from "./type"

export const updateNotes =
  (editor: PianoRollMutationContext) => (notes: readonly NoteEvent[]) =>
    notes.map(editor.updateNote)

export const addNotes =
  (editor: PianoRollMutationContext) =>
  (notes: readonly Omit<NoteEvent, "id">[]): readonly NoteEvent[] =>
    notes.map(editor.addNote).filter(isNotUndefined)

export const transposeNotes =
  (noteIds: readonly number[], deltaPitch: number): PianoRollEditorMutator =>
  (editor) =>
    flow(
      getNotesByIds(noteIds),
      map(transposeNote(deltaPitch)),
      updateNotes(editor),
    )(editor)

export const cloneNotes =
  (noteIds: readonly number[]): PianoRollEditorMutator<readonly number[]> =>
  (editor) =>
    flow(getNotesByIds(noteIds), map(editor.addNote), map(toId))(editor)

// duplicate notes with an optional deltaTick
// if deltaTick is 0, duplicate to the right of the selected notes
export const duplicateNotes = (
  noteIds: readonly number[],
  initialDeltaTick: number,
): PianoRollEditorMutator<{ addedNoteIds: number[]; deltaTick: number }> => {
  return (editor) => {
    const selectedNotes = getNotesByIds(noteIds)(editor)
    const { notes, deltaTick } = duplicatedNotes(
      selectedNotes,
      initialDeltaTick,
    )
    const addedNoteIds = addNotes(editor)(notes).map(toId)
    return { addedNoteIds, deltaTick }
  }
}

export const removeNotes =
  (noteIds: readonly number[]): PianoRollEditorMutator =>
  (editor) =>
    noteIds.forEach((id) => editor.removeNote(id))

export const quantizeNotes =
  (
    noteIds: readonly number[],
    quantizeRound: (tick: number) => number,
  ): PianoRollEditorMutator<readonly NoteEvent[]> =>
  (editor) =>
    flow(
      getNotesByIds(noteIds),
      map(quantizeNote(quantizeRound)),
      updateNotes(editor),
    )(editor)

// splits each note that spans `atTick` in two there: the first part ends at
// it, the second starts at it, with the same pitch and velocity; a note that
// does not span it is left alone. Answers the ids of both parts.
export const splitNotes =
  (
    noteIds: readonly number[],
    atTick: number,
  ): PianoRollEditorMutator<readonly number[]> =>
  (editor) =>
    getNotesByIds(noteIds)(editor).flatMap((note) => {
      const end = note.tick + note.duration
      if (atTick <= note.tick || atTick >= end) {
        return []
      }
      editor.updateNote({ id: note.id, duration: atTick - note.tick })
      const second = editor.addNote({
        tick: atTick,
        duration: end - atTick,
        noteNumber: note.noteNumber,
        velocity: note.velocity,
      })
      return [note.id, second.id]
    })

// joins the chosen notes of one pitch into one, from the start of the first to
// the end of the last, with the first one's velocity. A pitch whose span holds
// a note of that pitch that is not chosen is left alone: the joined note would
// cover it. Answers the ids of the joined notes.
export const joinNotes =
  (noteIds: readonly number[]): PianoRollEditorMutator<readonly number[]> =>
  (editor) => {
    const chosen = getNotesByIds(noteIds)(editor)
    const pitches = new Set(chosen.map((note) => note.noteNumber))
    return [...pitches].flatMap((pitch) => {
      const notes = chosen
        .filter((note) => note.noteNumber === pitch)
        .sort((a, b) => a.tick - b.tick)
      if (notes.length < 2) {
        return []
      }
      const first = notes[0]
      const end = Math.max(...notes.map((note) => note.tick + note.duration))
      const ids = new Set(notes.map(toId))
      const covered = editor
        .getAllNotes()
        .some(
          (other) =>
            other.noteNumber === pitch &&
            !ids.has(other.id) &&
            other.tick < end &&
            other.tick + other.duration > first.tick,
        )
      if (covered) {
        return []
      }
      editor.updateNote({ id: first.id, duration: end - first.tick })
      notes.slice(1).forEach((note) => editor.removeNote(note.id))
      return [first.id]
    })
  }
