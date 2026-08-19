import type { Range } from "@signal-app/core"
import { Unsubscribe } from "@signal-app/observable"
import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { ClipboardData, ControlItem, ValueEventType } from "./entities"
import { ControlEditorMutator } from "./mutations/type"

export interface ControlEditor {
  get type(): ValueEventType
  observeItems: (listener: () => void) => Unsubscribe
  mutate: <R = void>(fn: ControlEditorMutator<R>) => R
  createPreviewEvent: (value: number) => ControllerEvent | PitchBendEvent

  // queries
  getItemsByIds: (ids: readonly number[]) => readonly ControlItem[]
  getItemsClipboardData: (ids: readonly number[]) => ClipboardData | null
  getItemsInRangeWithPrevious: (tickRange: Range) => readonly ControlItem[]
}
