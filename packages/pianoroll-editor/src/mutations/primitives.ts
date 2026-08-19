import { NoteEvent } from "../entities"
import { PianoRollEditorMutator, PianoRollEditorMutatorContext } from "./type"

type MutablePianoRollEditor = {
  addNote: (note: Omit<NoteEvent, "id">) => NoteEvent
  removeNotes: (ids: readonly number[]) => void
  updateNote: (id: number, note: Partial<NoteEvent>) => NoteEvent | undefined
}

const asMutablePianoRollEditor = (
  context: PianoRollEditorMutatorContext,
): MutablePianoRollEditor => context as unknown as MutablePianoRollEditor

export const addNote =
  (item: Omit<NoteEvent, "id">): PianoRollEditorMutator<NoteEvent> =>
  (context) =>
    asMutablePianoRollEditor(context).addNote(item)

export const removeNote =
  (id: number): PianoRollEditorMutator<void> =>
  (context) => {
    asMutablePianoRollEditor(context).removeNotes([id])
  }

export const updateNote =
  (
    id: number,
    item: Partial<NoteEvent>,
  ): PianoRollEditorMutator<NoteEvent | undefined> =>
  (context) =>
    asMutablePianoRollEditor(context).updateNote(id, item)
