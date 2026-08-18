import { PianoRollEditorQueryContext } from "../queries/type"

export declare const pianoRollEditorMutatorBrand: unique symbol

export interface PianoRollEditorMutatorContext
  extends PianoRollEditorQueryContext {
  readonly [pianoRollEditorMutatorBrand]: true
}

declare module "../TrackPianoRollEditor" {
  interface TrackPianoRollEditor {
    readonly [pianoRollEditorMutatorBrand]: true
  }
}

export type PianoRollEditorMutator<R = void> = (
  context: PianoRollEditorMutatorContext,
) => R
