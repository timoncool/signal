import flatten from "lodash/flatten"
import type { AnyEvent } from "midifile-ts"
import {
  type DeltaTimeProvider,
  isSignalEvent,
  mapFromSignalEvent,
  type TickProvider,
  type TrackEvent,
} from "../entities"
import { deassemble as deassembleNote } from "./noteAssembler"

// events in each tracks
export function addDeltaTime<T extends TickProvider>(
  events: T[],
): (T & DeltaTimeProvider)[] {
  let prevTick = 0
  return events
    .sort((a, b) => a.tick - b.tick)
    .map((e) => {
      const newEvent = {
        ...e,
        deltaTime: Math.round(e.tick) - Math.round(prevTick),
      }
      // biome-ignore lint/suspicious/noExplicitAny: ignore
      delete (newEvent as any).tick
      prevTick = e.tick
      return newEvent
    })
}

// convert the signal event to the normal sequencer specific event
const fromSignalEvent = (e: TrackEvent): TrackEvent => {
  if (isSignalEvent(e)) {
    return mapFromSignalEvent(e)
  }
  return e
}

// midifile-ts writes nothing for a meta or channel event it has no code for,
// and its delta time goes with it, so every later event would land earlier.
// Such events (Reaper's notation metas among them) are left out before the
// deltas are counted.
const writable = (e: TrackEvent) =>
  !("subtype" in e && e.subtype === "unknown" && (e.type === "meta" || e.type === "channel"))

export function toRawEvents(events: readonly TrackEvent[]): AnyEvent[] {
  const a = flatten(events.filter(writable).map(fromSignalEvent).map(deassembleNote))
  const c = addDeltaTime(a)
  return c as AnyEvent[]
}
