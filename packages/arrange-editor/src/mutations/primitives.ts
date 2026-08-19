import { TrackEvent } from "@signal-app/core"
import { ArrangeEditorMutator, ArrangeEditorMutatorContext } from "./type"

export interface MutableArrangeEditor {
  addEvent: (
    trackIndex: number,
    event: Omit<TrackEvent, "id">,
  ) => TrackEvent | undefined
  removeEvent: (trackIndex: number, id: number) => void
  updateEvent: (
    trackIndex: number,
    id: number,
    update: Partial<TrackEvent>,
  ) => void
}

const asMutableArrangeEditor = (
  context: ArrangeEditorMutatorContext,
): MutableArrangeEditor => context as unknown as MutableArrangeEditor

export const addEvent =
  (
    trackIndex: number,
    event: Omit<TrackEvent, "id">,
  ): ArrangeEditorMutator<TrackEvent | undefined> =>
  (context) =>
    asMutableArrangeEditor(context).addEvent(trackIndex, event)

export const removeEvent =
  (trackIndex: number, id: number): ArrangeEditorMutator<void> =>
  (context) => {
    asMutableArrangeEditor(context).removeEvent(trackIndex, id)
  }

export const updateEvent =
  (
    trackIndex: number,
    id: number,
    update: Partial<TrackEvent>,
  ): ArrangeEditorMutator<void> =>
  (context) => {
    asMutableArrangeEditor(context).updateEvent(trackIndex, id, update)
  }
