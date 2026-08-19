import { flow } from "lodash"
import { filter } from "../../../helpers"
import { isNoteEvent, NoteEvent } from "../../event"
import { getEventsByIds } from "./composed"
import { getAll } from "./primitives"
import { TrackEventsQuery } from "./type"

export type NoteSelection = {
  readonly fromTick: number
  readonly toTick: number
  readonly fromNoteNumber: number
  readonly toNoteNumber: number
}

export const getNotesByIds = (
  ids: readonly number[],
): TrackEventsQuery<readonly NoteEvent[]> =>
  flow(getEventsByIds(ids), filter(isNoteEvent))

export const getAllNotes = (): TrackEventsQuery<readonly NoteEvent[]> =>
  flow(getAll, filter(isNoteEvent))
