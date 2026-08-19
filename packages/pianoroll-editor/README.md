# @signal-app/pianoroll-editor

## Purpose

Editor facade for piano roll note editing, scoped to a single track. Shape mirrors `@signal-app/control-editor` and `@signal-app/tempo-editor`: a DTO, thin primitives, composed mutators built from those primitives, and an Editor facade class.

## Responsibilities

- `NoteEvent` DTO (`{id, tick, duration, noteNumber, velocity}`) — the piano-roll-facing note shape. This is a different, simpler type than `@signal-app/core`'s own `NoteEvent`, which this package only sees at its `TrackPianoRollEditor` boundary (`addNote`/`updateNote` translate to/from core's MIDI event shape there).
- `createPianoRollEditor(track: Track): PianoRollEditor` — the public constructor, and the only place query/mutator functions are invoked. It builds a `TrackPianoRollEditor` and binds every query/mutator (`addNote`, `removeNotes`, `dragNote`, `getNotesClipboardData`, ...) directly to it as top-level methods. `TrackPianoRollEditor` itself does not expose `query`/`mutate`, and is not exported — callers only ever see the plain-method `PianoRollEditor` interface (`PianoRollEditor = ReturnType<typeof createPianoRollEditor>`) returned by `createPianoRollEditor`.
- `transaction(fn: () => R): R` — the one facade method beyond what `@signal-app/control-editor`/`@signal-app/tempo-editor` expose: it wraps the underlying `track.transaction`, so a caller can batch several bound mutator calls (e.g. dragging every note in a multi-selection) into a single change notification/undo step instead of one per note.
- `mutations/primitives.ts` (`addNote`/`removeNote`/`updateNote`) — thin, single-note operations, the only functions allowed to unsafely cast the branded mutator context back to the editor.
- `mutations/composed.ts` — everything built from those primitives: `addNotes`, `updateNotes`, `removeNotes`, `transposeNotes`, `cloneNotes`, `addClipboardNotes`, `duplicateNotes`, `quantizeNotes`.
- `mutations/draggable.ts` (`dragNote`) / `queries/draggable.ts` (`getDraggablePosition`, `getDraggableArea`) — the drag-gesture-specific mutator/queries, kept separate from the general composed ones since they're only used by the piano roll's drag handles.
- `queries/primitives.ts` / `queries/items.ts` — the read-side counterpart (`getNoteById`, `getAllNotes`, `getNotesByIds`, `getNotesClipboardData`, `getNeighborNote`, `getAllNoteIds`, `getNoteIdsInSelection`).
- `PianoNotesClipboardData`/`PianoNotesClipboardDataSchema` (zod): the piano-roll-specific clipboard payload.

## Dependencies

- `@signal-app/core` for `Track`, its event mutation/query primitives (`addEvent`, `updateEvent`, `getAllNotes`, `getEventById`, `isEventOverlapRange`, `isNoteEvent`), and shared helpers (`Range`, `NoteSelection`, `MaxNoteNumber`, `NoteNumber`, `filter`, `map`).
- `@signal-app/observable` for `ObservableValue` (backing `windowedEvents`/`notes`) and `Unsubscribe`-shaped subscriptions.
- `midifile-ts` (peer), transitively, for the MIDI note event shape `addNote`/`updateNote` construct.
- `zod` (peer) for `PianoNotesClipboardDataSchema`.

## Testing Notes

Same as `@signal-app/control-editor`/`@signal-app/tempo-editor`: `vitest.config.ts` loads `vitest.setup.ts` to stub a minimal `navigator`, since importing anything from `@signal-app/core`'s barrel eagerly touches it (via `SoundFontRepository`'s Electron-vs-web default lookup).
