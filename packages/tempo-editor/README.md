# @signal-app/tempo-editor

## Purpose

Editor facade for tempo automation, split out of `@signal-app/core`'s `editor/*` family into its own package (mirroring `@signal-app/control-editor`, which moved out the same way).

## Why a separate package

`editor/tempo` used to live inside `@signal-app/core` next to `editor/control`. Both domains needed a prefix on some mutation/query names purely to avoid colliding inside one shared export namespace (`addClipboardTempoEvents`, `tempoEventsToClipboardData`). Moving tempo-editing into its own package removes that need — the clipboard functions are now `pasteItemsAtPosition`/`getItemsClipboardData`, matching `@signal-app/control-editor`'s naming for the same operations.

## Ownership of `TempoItem`

The `TempoItem` DTO (`entities/tempo/TempoItem.ts`) and its transforms to/from `SetTempoEvent` (`entities/tempo/transform.ts`) now live entirely in this package, not in `@signal-app/core` — core no longer has any notion of `TempoItem`. That's possible because core's own `Track` never needed to answer "what are this track's tempo events" itself; only this package did, so there was no circular dependency to route around by keeping the DTO in core.

Owning the DTO means this package also owns the low-level Track-event operations that produce/consume it, which used to live in core next to `Track`'s other event mutators/queries:

- `trackQueries/tempo.ts` (`getTempoItems`/`getTempoItemById`) — reads `SetTempoEvent`s off a raw `TrackEventsQuery` context (a `Track`/event array), same shape as core's other `entities/track/queries/*` modules.
- `trackMutations/tempo.ts` (`addTempoItem`/`addTempoItems`/`updateTempoItem`/`updateTempoItems`) — the `TrackEventsMutator` counterpart, used by `TrackTempoEditor` to translate a `TempoItem` add/update into a `SetTempoEvent` mutation on the underlying `Track`.

These are a level below `mutations/`/`queries/` (which operate on `TempoEditorMutator`/`TempoEditorQuery` — i.e. the editor itself as context): `trackMutations`/`trackQueries` are how `TrackTempoEditor`'s own methods are implemented, mirroring the split `@signal-app/core` uses internally between `Track`-level primitives and higher composed operations, just scoped to the tempo domain now that it's moved out.

## Responsibilities

- `createTempoEditor(conductorTrack: Track): TempoEditor` — the public constructor, and the only place query/mutator functions are invoked. It builds a `TrackTempoEditor` and binds every query/mutator (`removeItems`, `duplicateItems`, `pasteItemsAtPosition`, `getItemsClipboardData`, ...) directly to it as top-level methods, so it is a facade: `TrackTempoEditor` itself does not expose `query`/`mutate`, and is not exported — callers only ever see the plain-method `TempoEditor` interface (`TempoEditor = ReturnType<typeof createTempoEditor>`) returned by `createTempoEditor`. It's scoped to a single conductor track instance, not a `Song` — callers are responsible for resolving `song.conductorTrack` and re-creating the editor if it changes (see `TempoEditorProvider` in `app`, which shows a fallback UI when there's no conductor track instead of constructing an editor with nothing to wrap).
- `mutations/primitives.ts` (`addItem`/`removeItem`/`updateItem`) — thin, single-item operations, the only functions allowed to unsafely cast the branded mutator context back to the editor.
- `mutations/composed.ts` — everything built from those primitives: `removeItems`, `duplicateItems`, `pasteItemsAtPosition`, `moveItems`, `removeRedundantItems`, `createOrUpdateItem`, `updateItemsInRange`, `setBpm`.
- `queries/primitives.ts` / `queries/items.ts` — the read-side counterpart (`getItems`, `getItemById`, `getItemsByIds`, `getEventIdsInRange`, `getItemsClipboardData`).
- `trackQueries/tempo.ts` / `trackMutations/tempo.ts` — see "Ownership of `TempoItem`" above.
- `ClipboardData`/`ClipboardDataSchema` (zod): the tempo-specific clipboard payload, split out of `entities/clipboard/clipboardTypes.ts`.

## Dependencies

- `@signal-app/core` for `Track` and its low-level event primitives (`addEvent`, `updateEvent`, `getAll`, `getEventById`, `isSetTempoEvent`, `TrackEventsMutator`/`TrackEventsQuery`), and shared helpers (`Range`, `closedRange`, `interpolate`, `filter`, `bpmToUSecPerBeat`/`uSecPerBeatToBPM`). No longer depends on core for `TempoItem` itself.
- `@signal-app/observable` for `Unsubscribe`.
- `midifile-ts` (peer) for `SetTempoEvent`.
- `zod` (peer) for `ClipboardDataSchema`.

## Testing Notes

Same as `@signal-app/control-editor`: `vitest.config.ts` loads `vitest.setup.ts` to stub a minimal `navigator`, since importing anything from `@signal-app/core`'s barrel eagerly touches it (via `SoundFontRepository`'s Electron-vs-web default lookup).
