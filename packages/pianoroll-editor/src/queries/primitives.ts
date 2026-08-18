import { NoteEvent } from "../entities"
import type { PianoRollEditorQuery, PianoRollEditorQueryContext } from "./type"

type QueryPianoRollEditor = {
  getNoteById: (id: number) => NoteEvent | undefined
}

const asQueryPianoRollEditor = (
  context: PianoRollEditorQueryContext,
): QueryPianoRollEditor => context as unknown as QueryPianoRollEditor

export const getNoteById =
  (id: number): PianoRollEditorQuery<NoteEvent | undefined> =>
  (context) =>
    asQueryPianoRollEditor(context).getNoteById(id)
