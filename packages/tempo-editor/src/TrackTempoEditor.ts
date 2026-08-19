import {
  getTempoItemById,
  getTempoItems,
  isSetTempoEvent,
  setTempoEventToTempoItem,
  TempoItem,
  Track,
  TrackEventOf,
  tempoItemToSetTempoEvent,
  updateEvents,
} from "@signal-app/core"
import { Unsubscribe } from "@signal-app/observable"
import { SetTempoEvent } from "midifile-ts"
import { MutableTempoEditor } from "./mutations/primitives"
import { QueryTempoEditor } from "./queries/primitives"

export class TrackTempoEditor implements QueryTempoEditor, MutableTempoEditor {
  constructor(private readonly conductorTrack: Track) {}

  getItems = (): readonly TempoItem[] =>
    this.conductorTrack.query(getTempoItems)

  getById = (id: number): TempoItem | undefined =>
    this.conductorTrack.query(getTempoItemById(id))

  addItems = (items: readonly Omit<TempoItem, "id">[]): TempoItem[] =>
    this.conductorTrack
      .addEvents<TrackEventOf<SetTempoEvent>>(
        items.map((item) =>
          tempoItemToSetTempoEvent({
            id: 0,
            ...item,
          }),
        ),
      )
      .map(setTempoEventToTempoItem)

  removeItems = (ids: readonly number[]): void => {
    this.conductorTrack.removeEvents(ids)
  }

  updateItems = (items: readonly TempoItem[]): void =>
    this.conductorTrack.mutate(
      updateEvents(items.map(tempoItemToSetTempoEvent)),
    )

  observeItems = (listener: () => void): Unsubscribe =>
    this.conductorTrack.subscribeEventsChanged(isSetTempoEvent, listener)
}
