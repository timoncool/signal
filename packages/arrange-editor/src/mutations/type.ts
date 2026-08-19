import { ArrangeEditorQueryContext } from "../queries/type"

export declare const arrangeEditorMutatorBrand: unique symbol

export interface ArrangeEditorMutatorContext extends ArrangeEditorQueryContext {
  readonly [arrangeEditorMutatorBrand]: true
}

declare module "../SongArrangeEditor" {
  interface SongArrangeEditor {
    readonly [arrangeEditorMutatorBrand]: true
  }
}

export type ArrangeEditorMutator<R = void> = (
  context: ArrangeEditorMutatorContext,
) => R
