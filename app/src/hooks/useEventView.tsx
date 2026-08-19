import { useStore } from "jotai"
import { useEffect, useSyncExternalStore } from "react"
import { usePianoRollEditor } from "../features/piano-roll/hooks/usePianoRollEditor"
import { tickRangeAtom } from "./useTickScroll"

// create shared cache for events in the piano roll
export function EventViewProvider({ children }: { children: React.ReactNode }) {
  const pianoRollEditor = usePianoRollEditor()
  const store = useStore()

  useEffect(() => {
    const update = () => {
      const tickRange = store.get(tickRangeAtom)
      pianoRollEditor.updateTickRange(tickRange)
    }
    update()
    return store.sub(tickRangeAtom, update)
  }, [pianoRollEditor, store])

  return children
}

export function useEventView() {
  const pianoRollEditor = usePianoRollEditor()
  return useSyncExternalStore(
    pianoRollEditor.onWindowedEventsChanged.subscribe,
    () => pianoRollEditor.windowedEvents,
  )
}
