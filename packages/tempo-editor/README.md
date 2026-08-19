# @signal-app/tempo-editor

## Purpose

Editor facade for tempo automation, scoped to a single conductor track. Shape mirrors `@signal-app/control-editor`: a DTO, thin primitives, composed mutators built from those primitives, and an Editor facade class.

## Two layers of query/mutator

`trackQueries/tempo.ts` (`getTempoItems`/`getTempoItemById`) and `trackMutations/tempo.ts` (`addTempoItem`/`addTempoItems`/`updateTempoItem`/`updateTempoItems`) operate directly on a `Track` via `TrackEventsQuery`/`TrackEventsMutator` context: they read/write `SetTempoEvent`s and translate to/from the `TempoItem` DTO. `TrackTempoEditor`'s own methods (`getItems`, `addItem`, `updateItem`, `removeItem`, ...) are built on top of these.

`mutations/`/`queries/` sit a level above: they operate on `TempoEditorMutator`/`TempoEditorQuery` context — the editor itself — and are what `createTempoEditor` binds into the public facade.

## Responsibilities

- `TempoItem` DTO (`entities/tempo/TempoItem.ts`) and its transforms to/from `SetTempoEvent` (`entities/tempo/transform.ts`).
- `createTempoEditor(conductorTrack: Track): TempoEditor` — the public constructor, and the only place query/mutator functions are invoked. It builds a `TrackTempoEditor` and binds every query/mutator (`removeItems`, `duplicateItems`, `pasteItemsAtPosition`, `getItemsClipboardData`, ...) directly to it as top-level methods. `TrackTempoEditor` itself does not expose `query`/`mutate`, and is not exported — callers only ever see the plain-method `TempoEditor` interface (`TempoEditor = ReturnType<typeof createTempoEditor>`) returned by `createTempoEditor`. It's scoped to a single conductor track instance, not a `Song` — callers are responsible for resolving `song.conductorTrack` and re-creating the editor if it changes (see `TempoEditorProvider` in `app`, which shows a fallback UI when there's no conductor track instead of constructing an editor with nothing to wrap).
- `mutations/primitives.ts` (`addItem`/`removeItem`/`updateItem`) — thin, single-item operations, the only functions allowed to unsafely cast the branded mutator context back to the editor.
- `mutations/composed.ts` — everything built from those primitives: `removeItems`, `duplicateItems`, `pasteItemsAtPosition`, `moveItems`, `removeRedundantItems`, `createOrUpdateItem`, `updateItemsInRange`, `setBpm`.
- `queries/primitives.ts` / `queries/items.ts` — the read-side counterpart (`getItems`, `getItemById`, `getItemsByIds`, `getEventIdsInRange`, `getItemsClipboardData`).
- `trackQueries/tempo.ts` / `trackMutations/tempo.ts` — see "Two layers of query/mutator" above.
- `ClipboardData`/`ClipboardDataSchema` (zod): the tempo-specific clipboard payload.

## Dependencies

- `@signal-app/core` for `Track` and its low-level event primitives (`addEvent`, `updateEvent`, `getAll`, `getEventById`, `isSetTempoEvent`, `TrackEventsMutator`/`TrackEventsQuery`), and shared helpers (`Range`, `closedRange`, `interpolate`, `filter`, `bpmToUSecPerBeat`/`uSecPerBeatToBPM`).
- `@signal-app/observable` for `Unsubscribe`.
- `midifile-ts` (peer) for `SetTempoEvent`.
- `zod` (peer) for `ClipboardDataSchema`.

## Testing Notes

Same as `@signal-app/control-editor`: `vitest.config.ts` loads `vitest.setup.ts` to stub a minimal `navigator`, since importing anything from `@signal-app/core`'s barrel eagerly touches it (via `SoundFontRepository`'s Electron-vs-web default lookup).
