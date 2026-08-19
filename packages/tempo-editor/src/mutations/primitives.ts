import { TempoItem } from "../entities"
import { TempoEditorMutator, TempoEditorMutatorContext } from "./type"

export interface MutableTempoEditor {
  addItem: (item: Omit<TempoItem, "id">) => TempoItem
  removeItem: (id: number) => void
  updateItem: (item: TempoItem) => void
}

const asMutableTempoEditor = (
  context: TempoEditorMutatorContext,
): MutableTempoEditor => context as unknown as MutableTempoEditor

export const addItem =
  (item: Omit<TempoItem, "id">): TempoEditorMutator<TempoItem | undefined> =>
  (context) =>
    asMutableTempoEditor(context).addItem(item)

export const removeItem =
  (id: number): TempoEditorMutator<void> =>
  (context) =>
    asMutableTempoEditor(context).removeItem(id)

export const updateItem =
  (item: TempoItem): TempoEditorMutator<void> =>
  (context) =>
    asMutableTempoEditor(context).updateItem(item)
