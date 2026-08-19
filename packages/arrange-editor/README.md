# @signal-app/arrange-editor

## Purpose

Editor facade for the arrange view: moving, duplicating, deleting, transposing, batch-editing velocity, and copy/pasting selections that span multiple tracks. Shape mirrors `@signal-app/tempo-editor` and `@signal-app/control-editor` (thin primitives, composed mutators built from those primitives, and an Editor facade class), except the aggregate it wraps is a `Song`'s whole track list rather than a single `Track`.

## A selection covers every event type

Only notes are *drawn* in the arrange view, but a selection is a plain tick range × track-index range and covers **every event in it regardless of type**. Moving, duplicating, deleting, copying, and pasting a selection carry controller and pitch-bend points along with the notes.

That split runs through the package:

- The read side used for mutation is `TrackEvent`-shaped (`getEvents`, `getEventById`, `getEventIdsInSelection`, `getEventsInSelection`).
- `ArrangeNote` and `listNotes` are **display-only**, for rendering the arrange view.
- `transposeSelection` and `batchUpdateSelectionVelocity` are the only mutators that look at event type, and only because their transform is note-specific — they skip non-note events rather than excluding them from the selection.

## Cross-track identity

Arrange operations are inherently cross-track: moving a selection can shift it onto another track. The identity a primitive addresses is therefore `(trackIndex, id)`, not a bare `id` — an event's id is only unique within its own track, since `Track`'s id generator is per-instance.

Moving events across tracks is expressed as `removeEvent` on the source plus `addEvent` on the destination. There is no dedicated "move" primitive: remove+add already composes it, and the per-track id constraint requires it anyway (an event moved to another track necessarily gets a new id, which is why `moveEvents` returns the new ids).

## Transactions

A single arrange mutation can touch several tracks, so `createArrangeEditor` runs every bound mutator inside a transaction covering *every* track (`SongArrangeEditor.transaction`). Without it, a composed mutation would emit one change notification per event touched.

## What does not live here

Track list operations — inserting, duplicating, removing, and reordering tracks — are `SongCommand`s in `@signal-app/core` (`insertNewTrack`, `duplicateTrack`, `addNewTrack`, `moveTrack`), called via `useSongCommand` from both the `arrange` and `track-list` app features. They are not about editing the events inside tracks.

## Responsibilities

- `createArrangeEditor(song: Song): ArrangeEditor` — the public constructor, and the only place query/mutator functions are invoked. It builds a `SongArrangeEditor` and binds every query/mutator directly to it as top-level methods. `SongArrangeEditor` itself does not expose `query`/`mutate`, and is not exported — callers only ever see the plain-method `ArrangeEditor` interface (`ArrangeEditor = ReturnType<typeof createArrangeEditor>`). `observeItems` follows both track-list changes (`Song.onTracksChanged`) and each current track's event changes, so callers need not re-subscribe when tracks are added or removed.
- `mutations/primitives.ts` (`addEvent`/`removeEvent`/`updateEvent`, each taking `(trackIndex, ...)`) and `queries/primitives.ts` (`trackCount`, `getEvents`, `getEventById`, `getArrangeNotes`) — thin, single-event operations, the only functions allowed to unsafely cast the branded context back to the editor.
- `mutations/composed.ts` — `moveEvents`, `duplicateSelection`, `removeSelection`, `transposeSelection`, `batchUpdateSelectionVelocity`, `pasteEventsAt`, all built from the primitives above; none touch `Track` directly.
- `queries/items.ts` — `listNotes` (display), `getEventIdsInSelection`, `getEventsInSelection`, `hasEventsInSelection`, `getEventsClipboardData`.
- `getTrackCount` / `observeTrackCount` — the track count and a subscription to track-list changes alone, so app code that only needs "how many tracks are there" does not have to reach for `useSong`. `observeTrackCount` is deliberately narrower than `observeItems`, which also fires on every event change.
- `ArrangeNote` DTO (`{id, tick, duration, noteNumber, velocity, event, trackId, trackIndex}`) — the display shape. `event` (the underlying `NoteEvent`, held by reference) is there for consumers needing the raw event, such as arrange view rendering.
- `ArrangeSelection`/`ArrangePoint` — pure tick/track-index range and point entities with no `Track`/`Song` dependency, used directly by app code for gesture math and keyboard-shortcut clamping.
- `ArrangeEventsClipboardData`/`ArrangeEventsClipboardDataSchema` (zod) — the clipboard payload, keyed by trackIndex.

## Dependencies

- `@signal-app/core` for `Song`, `Track`, `TrackEvent`/`NoteEvent`, track-level query primitives (`getAll`, `getEventById`), and shared helpers (`isNoteEvent`, `transposeNote`, `batchUpdateNoteVelocity`, `Range`, `isEventInRange`, `filter`, `map`, `isNotUndefined`).
- `@signal-app/observable` for `Unsubscribe`, `combineSubscription`, `switchSubscription`.
- `midifile-ts` (peer) for the MIDI event shapes underlying `TrackEvent`.
- `zod` (peer) for `ArrangeEventsClipboardDataSchema`.

## Testing Notes

Same as the other editor packages: `vitest.config.ts` loads `vitest.setup.ts` to stub a minimal `navigator`, since importing anything from `@signal-app/core`'s barrel eagerly touches it (via `SoundFontRepository`'s Electron-vs-web default lookup).

Test tracks must be given an explicit `channel` (`track.channel = i`) — a `Song`'s first-ever track otherwise defaults to being the channel-less conductor track, and `Track.addEvents` silently drops `"channel"`-type events (including notes) on the conductor track.

`testUtils` provides both `addNoteToTrack` and `addControllerToTrack`; mutation tests use both so the "a selection covers every event type" rule stays pinned.
