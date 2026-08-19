export declare const arrangeEditorQueryBrand: unique symbol

export interface ArrangeEditorQueryContext {
  readonly [arrangeEditorQueryBrand]: true
}

declare module "../SongArrangeEditor" {
  interface SongArrangeEditor {
    readonly [arrangeEditorQueryBrand]: true
  }
}

export type ArrangeEditorQuery<R> = (context: ArrangeEditorQueryContext) => R
