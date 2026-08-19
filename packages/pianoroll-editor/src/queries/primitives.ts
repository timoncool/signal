import { NoteEvent } from "../entities"
import type { PianoRollEditorQuery, PianoRollEditorQueryContext } from "./type"

type QueryPianoRollEditor = {
  getNoteById: (id: number) => NoteEvent | undefined
  getAllNotes: () => readonly NoteEvent[]
}

const asQueryPianoRollEditor = (
  context: PianoRollEditorQueryContext,
): QueryPianoRollEditor => context as unknown as QueryPianoRollEditor

export const getNoteById =
  (id: number): PianoRollEditorQuery<NoteEvent | undefined> =>
  (context) =>
    asQueryPianoRollEditor(context).getNoteById(id)

export const getAllNotes: PianoRollEditorQuery<readonly NoteEvent[]> = (
  context,
) => asQueryPianoRollEditor(context).getAllNotes()
