import { ControlItem } from "../entities/ControlItem"
import { ControlEditorMutator, ControlEditorMutatorContext } from "./type"

type MutableControlEditor = {
  addItem: (item: Omit<ControlItem, "id">) => ControlItem
  removeItems: (ids: readonly number[]) => void
  updateItems: (items: readonly ControlItem[]) => void
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
  (context) => {
    asMutableControlEditor(context).removeItems([id])
  }

export const updateItem =
  (item: ControlItem): ControlEditorMutator<void> =>
  (context) => {
    asMutableControlEditor(context).updateItems([item])
  }
