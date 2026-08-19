import type { Range, TrackEvent } from "@signal-app/core"
import type { Observable } from "@signal-app/observable"
import type { NoteEvent } from "./entities"
import type { PianoRollEditorMutator } from "./mutations"
import type { PianoRollEditorQuery } from "./queries"

export interface PianoRollEditor {
  updateTickRange: (range: Range) => void
  query<R>(fn: PianoRollEditorQuery<R>): R
  mutate<R>(mutator: PianoRollEditorMutator<R>): R
  get onWindowedEventsChanged(): Observable
  get onNotesChanged(): Observable
  get windowedEvents(): readonly TrackEvent[]
  get notes(): readonly NoteEvent[]
  get isRhythmTrack(): boolean
  get onIsRhythmTrackChanged(): Observable
}
