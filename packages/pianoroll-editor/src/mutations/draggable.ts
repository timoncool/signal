import { NoteEvent } from "../entities"
import { getNoteById } from "../queries"
import { updateNote } from "./primitives"
import { PianoRollEditorMutator } from "./type"

export const dragNote =
  (
    position: Partial<{
      tick: number
      noteNumber: number
    }>,
    noteId: number,
    draggablePosition: "left" | "right" | "center",
  ): PianoRollEditorMutator<NoteEvent | null> =>
  (context) => {
    const note = getNoteById(noteId)(context)
    if (note === undefined) {
      return null
    }
    switch (draggablePosition) {
      case "center": {
        return updateNote(note.id, position)(context) ?? null
      }
      case "left": {
        if (position.tick === undefined) {
          return null
        }
        return (
          updateNote(note.id, {
            tick: position.tick,
            duration: note.duration + note.tick - position.tick,
          })(context) ?? null
        )
      }
      case "right": {
        if (position.tick === undefined) {
          return null
        }
        return (
          updateNote(note.id, {
            duration: position.tick - note.tick,
          })(context) ?? null
        )
      }
    }
  }
