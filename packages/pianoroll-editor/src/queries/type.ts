export declare const pianoRollEditorQueryBrand: unique symbol

export interface PianoRollEditorQueryContext {
  readonly [pianoRollEditorQueryBrand]: true
}

declare module "../TrackPianoRollEditor" {
  interface TrackPianoRollEditor {
    readonly [pianoRollEditorQueryBrand]: true
  }
}

export type PianoRollEditorQuery<R> = (
  context: PianoRollEditorQueryContext,
) => R
