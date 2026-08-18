import type { NoteEvent } from "../entities"
import { getNoteById } from "./primitives"
import type { PianoRollEditorQuery } from "./type"

export const getNotesByIds =
  (ids: readonly number[]): PianoRollEditorQuery<readonly NoteEvent[]> =>
  (context) =>
    ids
      .map((id) => getNoteById(id)(context))
      .filter((item): item is NoteEvent => item !== undefined)
