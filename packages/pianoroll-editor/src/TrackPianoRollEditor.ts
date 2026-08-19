import {
  addEvent,
  getAllNotes,
  getEventById,
  isEventOverlapRange,
  isNoteEvent,
  Range,
  Track,
  TrackEvent,
  updateEvent,
} from "@signal-app/core"
import { ObservableValue } from "@signal-app/observable"
import { NoteEvent } from "./entities/note/NoteEvent"
import { PianoRollEditorMutator } from "./mutations"
import { PianoRollEditorQuery } from "./queries"
import { PianoRollEditor } from "./type"

export class TrackPianoRollEditor implements PianoRollEditor {
  private readonly _windowedEvents = new ObservableValue<readonly TrackEvent[]>(
    [],
  )
  private readonly _notes = new ObservableValue<readonly NoteEvent[]>([])
  private _tickRange: Range = [0, 0]

  constructor(private readonly track: Track) {
    this.updateWindowedEvents()
    this.track.subscribeEventsChanged(
      (e) => isEventOverlapRange(this._tickRange)(e),
      this.updateWindowedEvents,
    )
  }

  updateTickRange = (range: Range) => {
    this._tickRange = range
    this.updateWindowedEvents()
  }

  private updateWindowedEvents = () => {
    const events = this.track.events.filter(
      isEventOverlapRange(this._tickRange),
    )
    this._windowedEvents.set(events)

    const notes = events.filter(isNoteEvent)
    this._notes.set(notes)
  }

  get onWindowedEventsChanged() {
    return this._windowedEvents.onChanged
  }

  get onNotesChanged() {
    return this._notes.onChanged
  }

  get notes(): readonly NoteEvent[] {
    return this._notes.value
  }

  get windowedEvents(): readonly TrackEvent[] {
    return this._windowedEvents.value
  }

  get isRhythmTrack(): boolean {
    return this.track.isRhythmTrack
  }

  get onIsRhythmTrackChanged() {
    return this.track.onIsRhythmTrackChanged
  }

  // queries

  query = <R>(fn: PianoRollEditorQuery<R>): R => fn(this)

  getNoteById = (id: number): NoteEvent | undefined => {
    const event = this.track.query(getEventById(id))
    if (event && isNoteEvent(event)) {
      return event
    }
    return undefined
  }

  getAllNotes = (): readonly NoteEvent[] => {
    return this.track.query(getAllNotes())
  }

  // mutations

  mutate = <R>(mutator: PianoRollEditorMutator<R>): R =>
    this.track.transaction(() => mutator(this))

  addNote = (note: Omit<NoteEvent, "id">): NoteEvent => {
    const event = {
      ...note,
      type: "channel",
      subtype: "note",
    } as const
    return this.track.mutate(addEvent(event)) as unknown as NoteEvent
  }

  updateNote = (
    id: number,
    update: Partial<NoteEvent>,
  ): NoteEvent | undefined => {
    const event = this.track.mutate(updateEvent(id, update))
    return event ? (event as unknown as NoteEvent) : undefined
  }
}
