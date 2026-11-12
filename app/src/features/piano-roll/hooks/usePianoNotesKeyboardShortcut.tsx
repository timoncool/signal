import { useMemo } from "react"
import { useKeyboardShortcut } from "../../../hooks/useKeyboardShortcut"
import {
  useCopySelection,
  useCutSelection,
  useDeleteSelection,
  useDuplicateSelection,
  useJoinSelectedNotes,
  usePasteSelection,
  useQuantizeSelectedNotes,
  useSelectNextNote,
  useSelectPreviousNote,
  useSplitSelectedNotes,
  useTransposeSelection,
} from "./selection"
import { usePianoRoll } from "./usePianoRoll"

export const usePianoNotesKeyboardShortcut = () => {
  const selectNextNote = useSelectNextNote()
  const selectPreviousNote = useSelectPreviousNote()
  const copySelection = useCopySelection()
  const deleteSelection = useDeleteSelection()
  const pasteSelection = usePasteSelection()
  const cutSelection = useCutSelection()
  const duplicateSelection = useDuplicateSelection()
  const quantizeSelectedNotes = useQuantizeSelectedNotes()
  const transposeSelection = useTransposeSelection()
  const splitSelectedNotes = useSplitSelectedNotes()
  const joinSelectedNotes = useJoinSelectedNotes()
  const { mouseMode, resetSelection } = usePianoRoll()
  const { setOpenTransposeDialog } = usePianoRoll()

  const actions = useMemo(
    () => [
      {
        code: "KeyC",
        metaKey: true,
        run: copySelection,
      },
      {
        code: "KeyV",
        metaKey: true,
        run: () => pasteSelection(),
      },
      {
        code: "KeyX",
        metaKey: true,
        run: cutSelection,
      },
      {
        code: "KeyD",
        metaKey: true,
        run: duplicateSelection,
      },
      {
        code: "KeyE",
        metaKey: true,
        run: () => splitSelectedNotes(),
      },
      {
        code: "KeyJ",
        metaKey: true,
        run: joinSelectedNotes,
      },
      {
        code: "KeyQ",
        run: quantizeSelectedNotes,
      },
      {
        code: "KeyT",
        run: () => setOpenTransposeDialog(true),
      },
      { code: "Delete", run: deleteSelection },
      {
        code: "Backspace",
        run: deleteSelection,
      },
      {
        code: "ArrowUp",
        shiftKey: true,
        run: () => transposeSelection(12),
      },
      {
        code: "ArrowUp",
        run: () => transposeSelection(1),
      },
      {
        code: "ArrowDown",
        shiftKey: true,
        run: () => transposeSelection(-12),
      },
      {
        code: "ArrowDown",
        run: () => transposeSelection(-1),
      },
      {
        code: "ArrowRight",
        run: selectNextNote,
        enabled: () => mouseMode === "pencil",
      },
      {
        code: "ArrowLeft",
        run: selectPreviousNote,
        enabled: () => mouseMode === "pencil",
      },
      { code: "Escape", run: resetSelection },
    ],
    [
      mouseMode,
      setOpenTransposeDialog,
      deleteSelection,
      duplicateSelection,
      quantizeSelectedNotes,
      splitSelectedNotes,
      joinSelectedNotes,
      transposeSelection,
      selectNextNote,
      selectPreviousNote,
      resetSelection,
      copySelection,
      pasteSelection,
      cutSelection,
    ],
  )

  return useKeyboardShortcut({
    actions,
    onCopy: copySelection,
    onPaste: pasteSelection,
    onCut: cutSelection,
  })
}
