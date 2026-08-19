# @signal-app/control-editor

## Purpose

Editor facade for pitchBend/controller automation lanes, scoped to a single track and a single `ValueEventType` (`pitchBend`, or `controller` with a specific `controllerType`). Shape mirrors `@signal-app/tempo-editor`: a DTO, thin primitives, composed mutators built from those primitives, and an Editor facade class.

## Responsibilities

- `ControlItem` DTO (`{id, tick, value}`) so React never has to branch on `ControllerEvent` vs `PitchBendEvent` — a `ControlEditor` is already bound to one `ValueEventType` at construction.
- `createControlEditor(track, type): ControlEditor` — the public constructor, and the only place query/mutator functions are invoked. It builds a `TrackControlEditor` and binds every query/mutator (`addItem`, `removeItems`, `pasteItemsAtPosition`, `getItemsClipboardData`, ...) directly to it as top-level methods. `TrackControlEditor` itself does not expose `query`/`mutate`, and is not exported — callers only ever see the plain-method `ControlEditor` interface returned by `createControlEditor`.
- `mutations/primitives.ts` (`addItem`/`removeItem`/`updateItem`) — thin, single-item operations, the only functions allowed to unsafely cast the branded mutator context back to the editor.
- `mutations/composed.ts` — everything built from those primitives: `removeItems`, `moveItems`, `removeRedundantItems`, `duplicateItems`, `createOrUpdateItemValue`, `updateItemsInRange(WithEasing)`, `pasteItemsAtPosition`.
- `queries/primitives.ts` / `queries/items.ts` — the read-side counterpart (`getItems`, `getItemById`, `getValueEventType`, `listItems`, `getItemsByIds`, `getItemsClipboardData`, `getItemsInRangeWithPrevious`).
- `ClipboardData`/`ClipboardDataSchema` (zod): carries the source `ValueEventType` alongside the copied items, so `pasteItemsAtPosition` can refuse to paste pitchBend data into a controller lane (or vice versa) — their value ranges aren't compatible.

## Dependencies

- `@signal-app/core` for `Track`, track-level mutation/query primitives (`getAll`, `getEventById`, `createOrUpdate`, `updateEvents`), and shared helpers (`Range`, `isEventInRange`, `closedRange`, `interpolate`).
- `@signal-app/observable` for `Unsubscribe`.
- `midifile-ts` (peer) for `ControllerEvent`/`PitchBendEvent` and MIDI event construction.
- `zod` (peer) for `ClipboardDataSchema`.

## Testing Notes

Importing anything from `@signal-app/core`'s barrel eagerly touches `navigator` (via `SoundFontRepository`'s Electron-vs-web default lookup), so `vitest.config.ts` loads `vitest.setup.ts` to stub a minimal `navigator` before tests run, rather than pulling in a full DOM environment.
