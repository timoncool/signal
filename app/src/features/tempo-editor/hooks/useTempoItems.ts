import { useCallback } from "react"
import { useDerivedValue } from "../../../hooks/useDerivedValue"
import { useTempoEditorService } from "./useTempoEditor"

export function useTempoItems() {
  const tempoEditor = useTempoEditorService()
  return useDerivedValue(
    tempoEditor.observeItems,
    useCallback(() => tempoEditor.listItems(), [tempoEditor]),
  )
}
