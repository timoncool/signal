import { NoteEvent } from "../entities"
import { PianoRollEditorMutator, PianoRollEditorMutatorContext } from "./type"

type MutablePianoRollEditor = {
  addNote: (note: readonly Omit<NoteEvent, "id">[]) => NoteEvent[]
  removeNotes: (ids: readonly number[]) => void
  updateNote: (note: NoteEvent) => void
}

const asMutablePianoRollEditor = (
  context: PianoRollEditorMutatorContext,
): MutablePianoRollEditor => context as unknown as MutablePianoRollEditor

export const addNote =
  (
    item: Omit<NoteEvent, "id">,
  ): PianoRollEditorMutator<NoteEvent | undefined> =>
  (context) =>
    asMutablePianoRollEditor(context).addNote([item])[0]

export const removeNote =
  (id: number): PianoRollEditorMutator<void> =>
  (context) => {
    asMutablePianoRollEditor(context).removeNotes([id])
  }

export const updateNote =
  (item: NoteEvent): PianoRollEditorMutator<void> =>
  (context) => {
    asMutablePianoRollEditor(context).updateNote(item)
  }
