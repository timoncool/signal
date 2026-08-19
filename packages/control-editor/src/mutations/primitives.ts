import { ControlItem } from "../entities/ControlItem"
import { ControlEditorMutator, ControlEditorMutatorContext } from "./type"

export interface MutableControlEditor {
  addItem: (item: Omit<ControlItem, "id">) => ControlItem
  removeItem: (id: number) => void
  updateItem: (item: ControlItem) => void
}

const asMutableControlEditor = (
  context: ControlEditorMutatorContext,
): MutableControlEditor => context as unknown as MutableControlEditor

export const addItem =
  (item: Omit<ControlItem, "id">): ControlEditorMutator<ControlItem> =>
  (context) =>
    asMutableControlEditor(context).addItem(item)

export const removeItem =
  (id: number): ControlEditorMutator<void> =>
  (context) =>
    asMutableControlEditor(context).removeItem(id)

export const updateItem =
  (item: ControlItem): ControlEditorMutator<void> =>
  (context) =>
    asMutableControlEditor(context).updateItem(item)
