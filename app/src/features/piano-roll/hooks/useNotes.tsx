import { Rect } from "@signal-app/geometry"
import { NoteEvent } from "@signal-app/pianoroll-editor"
import { useCallback, useMemo, useSyncExternalStore } from "react"
import { useNoteCoordTransform } from "./useNoteCoordTransform"
import { usePianoRoll } from "./usePianoRoll"
import { usePianoRollEditor } from "./usePianoRollEditor"

export type PianoNoteItem = Rect & {
  id: number
  velocity: number
  noteNumber: number
  isSelected: boolean
}

export function useNotes(): PianoNoteItem[] {
  const { selectedTrack, selectedNoteIds } = usePianoRoll()
  const { transform } = useNoteCoordTransform()
  const pianoRollEditor = usePianoRollEditor()
  const noteEvents = useSyncExternalStore(
    pianoRollEditor.onNotesChanged.subscribe,
    () => pianoRollEditor.notes,
  )

  const getRect = useCallback(
    (e: NoteEvent) =>
      selectedTrack?.isRhythmTrack
        ? transform.getDrumRect(e)
        : transform.getRect(e),
    [transform, selectedTrack?.isRhythmTrack],
  )

  const notes = useMemo(
    () =>
      noteEvents.map((e) => {
        const bounds = getRect(e)
        const isSelected = selectedNoteIds.includes(e.id)
        return {
          ...bounds,
          id: e.id,
          velocity: e.velocity,
          noteNumber: e.noteNumber,
          isSelected,
        }
      }),
    [noteEvents, getRect, selectedNoteIds],
  )

  return notes
}
