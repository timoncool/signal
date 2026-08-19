import { Track } from "@signal-app/core"
import { ValueEventType } from "./entities/ValueEventType"
import {
  addItem,
  ControlEditorMutator,
  createOrUpdateItemValue,
  duplicateItems,
  moveItems,
  pasteItemsAtPosition,
  removeItems,
  removeRedundantItems,
  updateItemsInRange,
  updateItemsInRangeWithEasing,
} from "./mutations"
import {
  ControlEditorQuery,
  getItemsByIds,
  getItemsClipboardData,
  getItemsInRangeWithPrevious,
} from "./queries"
import { TrackControlEditor } from "./TrackControlEditor"

export const createControlEditor = (track: Track, type: ValueEventType) => {
  const editor = new TrackControlEditor(track, type)

  const bindQuery =
    <A extends unknown[], R>(
      fn: (...args: A) => ControlEditorQuery<R>,
    ): ((...args: A) => R) =>
    (...args: A) =>
      fn(...args)(editor)

  const bindMutation =
    <A extends unknown[], R>(
      fn: (...args: A) => ControlEditorMutator<R>,
    ): ((...args: A) => R) =>
    (...args: A) =>
      editor.mutate(fn(...args))

  return {
    type: editor.type,
    observeItems: editor.observeItems,
    createPreviewEvent: editor.createPreviewEvent,

    // queries

    getItemsByIds: bindQuery(getItemsByIds),
    getItemsClipboardData: bindQuery(getItemsClipboardData),
    getItemsInRangeWithPrevious: bindQuery(getItemsInRangeWithPrevious),

    // mutations

    addItem: bindMutation(addItem),
    removeItems: bindMutation(removeItems),
    createOrUpdateItemValue: bindMutation(createOrUpdateItemValue),
    updateItemsInRange: bindMutation(updateItemsInRange),
    updateItemsInRangeWithEasing: bindMutation(updateItemsInRangeWithEasing),
    pasteItemsAtPosition: bindMutation(pasteItemsAtPosition),
    duplicateItems: bindMutation(duplicateItems),
    removeRedundantItems: bindMutation(removeRedundantItems),
    moveItems: bindMutation(moveItems),
  }
}
