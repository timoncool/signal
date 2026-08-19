import { TrackEvent } from "@signal-app/core"
import { ArrangeNote } from "../entities/ArrangeNote"
import { ArrangeEditorQuery, ArrangeEditorQueryContext } from "./type"

export interface QueryArrangeEditor {
  trackCount: number
  // A selection covers every event in its tick range regardless of type, so
  // the read side is TrackEvent-shaped. ArrangeNote is display-only.
  getEvents: (trackIndex: number) => readonly TrackEvent[]
  getEventById: (trackIndex: number, id: number) => TrackEvent | undefined
  getArrangeNotes: () => readonly ArrangeNote[]
}

const asQueryArrangeEditor = (
  context: ArrangeEditorQueryContext,
): QueryArrangeEditor => context as unknown as QueryArrangeEditor

export const getTrackCount: ArrangeEditorQuery<number> = (context) =>
  asQueryArrangeEditor(context).trackCount

export const getEvents =
  (trackIndex: number): ArrangeEditorQuery<readonly TrackEvent[]> =>
  (context) =>
    asQueryArrangeEditor(context).getEvents(trackIndex)

export const getEventById =
  (
    trackIndex: number,
    id: number,
  ): ArrangeEditorQuery<TrackEvent | undefined> =>
  (context) =>
    asQueryArrangeEditor(context).getEventById(trackIndex, id)

export const getArrangeNotes: ArrangeEditorQuery<readonly ArrangeNote[]> = (
  context,
) => asQueryArrangeEditor(context).getArrangeNotes()
