import { ArrangeEditor, createArrangeEditor } from "@signal-app/arrange-editor"
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"
import { useStores } from "../../../hooks/useStores"

const ArrangeEditorContext = createContext<ArrangeEditor | undefined>(undefined)

export const ArrangeEditorProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { songStore } = useStores()
  const song = useSyncExternalStore(
    songStore.onSongChanged.subscribe,
    useCallback(() => songStore.song, [songStore]),
  )

  const arrangeEditor = useMemo(() => createArrangeEditor(song), [song])

  return (
    <ArrangeEditorContext.Provider value={arrangeEditor}>
      {children}
    </ArrangeEditorContext.Provider>
  )
}

export function useArrangeEditor(): ArrangeEditor {
  const arrangeEditor = useContext(ArrangeEditorContext)
  if (arrangeEditor === undefined) {
    throw new Error(
      "useArrangeEditor must be used within an ArrangeEditorProvider",
    )
  }
  return arrangeEditor
}
