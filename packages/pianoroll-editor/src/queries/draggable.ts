import { MaxNoteNumber, Range } from "@signal-app/core"
import { max, min } from "lodash"
import { getNotesByIds } from "./items"
import { getNoteById } from "./primitives"
import { PianoRollEditorQuery } from "./type"

interface NotePoint {
  readonly tick: number
  readonly noteNumber: number
}

export const getDraggablePosition =
  (
    noteId: number,
    position: "left" | "center" | "right",
  ): PianoRollEditorQuery<NotePoint | null> =>
  (events) => {
    const note = getNoteById(noteId)(events)
    if (note === undefined) {
      return null
    }
    switch (position) {
      case "center":
        return note
      case "left":
        return note
      case "right":
        return {
          tick: note.tick + note.duration,
          noteNumber: note.noteNumber,
        }
    }
  }

export const getDraggableArea =
  (
    noteId: number,
    selectedNoteIds: readonly number[],
    position: "left" | "center" | "right",
    minLength: number = 0,
  ): PianoRollEditorQuery<{
    tickRange: Range
    noteNumberRange: Range
  } | null> =>
  (context) => {
    const note = getNoteById(noteId)(context)
    if (note === undefined) {
      return null
    }
    const notes = getNotesByIds(selectedNoteIds)(context)

    const minTick = min(notes.map((n) => n.tick)) ?? 0
    const tickLowerBound = note.tick - minTick
    switch (position) {
      case "center": {
        const maxNoteNumber = max(notes.map((n) => n.noteNumber)) ?? 0
        const minNoteNumber = min(notes.map((n) => n.noteNumber)) ?? 0
        const noteNumberLowerBound = note.noteNumber - minNoteNumber
        const noteNumberUpperBound =
          MaxNoteNumber - (maxNoteNumber - note.noteNumber)
        return {
          tickRange: Range.create(tickLowerBound, Infinity),
          noteNumberRange: Range.create(
            noteNumberLowerBound,
            noteNumberUpperBound,
          ),
        }
      }
      case "left":
        return {
          tickRange: Range.create(
            tickLowerBound,
            note.tick + note.duration - minLength,
          ),
          noteNumberRange: Range.point(note.noteNumber), // allow to move only vertically
        }
      case "right":
        return {
          tickRange: Range.create(note.tick + minLength, Infinity),
          noteNumberRange: Range.point(note.noteNumber), // allow to move only vertically
        }
    }
  }
