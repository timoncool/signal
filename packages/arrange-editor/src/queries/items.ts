import { isEventInRange, Range, TrackEvent } from "@signal-app/core"
import { ArrangeNote } from "../entities/ArrangeNote"
import { ArrangeSelection } from "../entities/ArrangeSelection"
import { ArrangeEventsClipboardData } from "../entities/clipboardTypes"
import { getArrangeNotes, getEventById, getEvents } from "./primitives"
import { ArrangeEditorQuery } from "./type"

// Only notes are drawn in the arrange view, so this is the display-side
// query. Selection and mutation deliberately work on every event type.
export const listNotes: ArrangeEditorQuery<readonly ArrangeNote[]> =
  getArrangeNotes

// returns { trackIndex: [eventId] } for every event in the selected tick
// range, whatever its type — a controller point inside the range travels
// with the selection just like a note does.
export const getEventIdsInSelection =
  (
    selection: ArrangeSelection,
  ): ArrangeEditorQuery<{ [trackIndex: number]: number[] }> =>
  (context) => {
    const tickRange = Range.create(selection.fromTick, selection.toTick)
    const ids: { [trackIndex: number]: number[] } = {}
    for (
      let trackIndex = selection.fromTrackIndex;
      trackIndex < selection.toTrackIndex;
      trackIndex++
    ) {
      ids[trackIndex] = getEvents(trackIndex)(context)
        .filter(isEventInRange(tickRange))
        .map((e) => e.id)
    }
    return ids
  }

export const getEventsInSelection =
  (
    selection: ArrangeSelection,
  ): ArrangeEditorQuery<{ [trackIndex: number]: TrackEvent[] }> =>
  (context) => {
    const idsByTrackIndex = getEventIdsInSelection(selection)(context)
    const events: { [trackIndex: number]: TrackEvent[] } = {}
    for (const trackIndexStr in idsByTrackIndex) {
      const trackIndex = parseInt(trackIndexStr, 10)
      events[trackIndex] = idsByTrackIndex[trackIndex]
        .map((id) => getEventById(trackIndex, id)(context))
        .filter((e): e is TrackEvent => e !== undefined)
    }
    return events
  }

export const hasEventsInSelection =
  (selection: ArrangeSelection): ArrangeEditorQuery<boolean> =>
  (context) =>
    Object.values(getEventIdsInSelection(selection)(context)).some(
      (ids) => ids.length > 0,
    )

export const getEventsClipboardData =
  (
    selection: ArrangeSelection,
  ): ArrangeEditorQuery<ArrangeEventsClipboardData> =>
  (context) => {
    const eventsByTrackIndex = getEventsInSelection(selection)(context)
    const events: { [trackIndex: number]: TrackEvent[] } = {}
    for (const trackIndexStr in eventsByTrackIndex) {
      const trackIndex = parseInt(trackIndexStr, 10)
      events[trackIndex] = eventsByTrackIndex[trackIndex].map((e) => ({
        ...e,
        tick: e.tick - selection.fromTick,
      }))
    }
    return {
      type: "arrange_events",
      events,
      selectedTrackIndex: selection.fromTrackIndex,
    }
  }
