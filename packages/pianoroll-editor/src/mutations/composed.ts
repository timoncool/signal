import { map } from "@signal-app/core"
import { flow } from "lodash"
import {
  getNotesDuration,
  moveEvent,
  NoteEvent,
  PianoNotesClipboardData,
  quantizeNote,
  transposeNote,
} from "../entities"
import { getNotesByIds } from "../queries"
import { addNote, removeNote, updateNote } from "./primitives"
import { PianoRollEditorMutator } from "./type"

export const updateNotes =
  (notes: readonly NoteEvent[]): PianoRollEditorMutator =>
  (context) =>
    notes.forEach((note) => updateNote(note.id, note)(context))

export const addNotes =
  (
    notes: readonly Omit<NoteEvent, "id">[],
  ): PianoRollEditorMutator<readonly NoteEvent[]> =>
  (context) =>
    notes
      .map((note) => addNote(note)(context))
      .filter((note): note is NoteEvent => note !== undefined)

export const transposeNotes =
  (noteIds: readonly number[], deltaPitch: number): PianoRollEditorMutator =>
  (context) => {
    const transposedNotes = flow(
      getNotesByIds(noteIds),
      map(transposeNote(deltaPitch)),
    )(context)
    return updateNotes(transposedNotes)(context)
  }

export const cloneNotes =
  (noteIds: readonly number[]): PianoRollEditorMutator<number[]> =>
  (context) =>
    getNotesByIds(noteIds)(context)
      .map((note) => addNote(note)(context))
      .map((note) => note.id)

export const addClipboardNotes = (
  data: PianoNotesClipboardData,
  tick: number,
): PianoRollEditorMutator => {
  const notes = data.notes.map(moveEvent(tick))
  return addNotes(notes)
}

// duplicate notes with an optional deltaTick
// if deltaTick is 0, duplicate to the right of the selected notes
export const duplicateNotes =
  (
    noteIds: readonly number[],
    initialDeltaTick: number,
  ): PianoRollEditorMutator<{ addedNoteIds: number[]; deltaTick: number }> =>
  (events) => {
    const selectedNotes = getNotesByIds(noteIds)(events)

    const deltaTick =
      initialDeltaTick === 0
        ? getNotesDuration(selectedNotes)
        : initialDeltaTick

    const notes = selectedNotes.map(moveEvent(deltaTick))

    const addedNoteIds = addNotes(notes)(events).map((e) => e.id)

    return { addedNoteIds, deltaTick }
  }

export const removeNotes =
  (noteIds: readonly number[]): PianoRollEditorMutator =>
  (context) =>
    noteIds.forEach((id) => removeNote(id)(context))

const quantizedNotes = (
  noteIds: readonly number[],
  quantizeRound: (tick: number) => number,
) => flow(getNotesByIds(noteIds), map(quantizeNote(quantizeRound)))

export const quantizeNotes =
  (
    noteIds: readonly number[],
    quantizeRound: (tick: number) => number,
  ): PianoRollEditorMutator =>
  (context) => {
    const notes = quantizedNotes(noteIds, quantizeRound)(context)
    updateNotes(notes)(context)
  }
