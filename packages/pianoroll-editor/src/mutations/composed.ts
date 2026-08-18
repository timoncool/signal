import { map, transposeNote } from "@signal-app/core"
import { flow } from "lodash"
import { NoteEvent } from "../entities"
import { getNotesByIds } from "../queries"
import { updateNote } from "./primitives"
import { PianoRollEditorMutator } from "./type"

export const updateNotes =
  (notes: readonly NoteEvent[]): PianoRollEditorMutator =>
  (context) => {
    notes.map((note) => updateNote(note)).forEach((mutator) => mutator(context))
  }

export const transposeNotes =
  (noteIds: readonly number[], deltaPitch: number): PianoRollEditorMutator =>
  (context) => {
    const transposedNotes = flow(
      getNotesByIds(noteIds),
      map(transposeNote(deltaPitch)),
    )(context)
    return updateNotes(transposedNotes)(context)
  }
