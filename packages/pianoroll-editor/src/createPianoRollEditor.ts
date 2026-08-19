import { Track } from "@signal-app/core"
import {
  addClipboardNotes,
  addNote,
  cloneNotes,
  dragNote,
  duplicateNotes,
  PianoRollEditorMutator,
  quantizeNotes,
  removeNote,
  removeNotes,
  transposeNotes,
} from "./mutations"
import {
  getAllNoteIds,
  getDraggableArea,
  getDraggablePosition,
  getNeighborNote,
  getNoteIdsInSelection,
  getNotesByIds,
  getNotesClipboardData,
  PianoRollEditorQuery,
} from "./queries"
import { TrackPianoRollEditor } from "./TrackPianoRollEditor"

export const createPianoRollEditor = (track: Track) => {
  const editor = new TrackPianoRollEditor(track)

  const bindQuery =
    <A extends unknown[], R>(
      fn: (...args: A) => PianoRollEditorQuery<R>,
    ): ((...args: A) => R) =>
    (...args: A) =>
      fn(...args)(editor)

  // Each mutation runs in a transaction so a composed mutation that touches
  // many notes emits one change notification instead of one per note.
  const bindMutation =
    <A extends unknown[], R>(
      fn: (...args: A) => PianoRollEditorMutator<R>,
    ): ((...args: A) => R) =>
    (...args: A) =>
      track.transaction(() => fn(...args)(editor))

  return {
    updateTickRange: editor.updateTickRange,
    get onWindowedEventsChanged() {
      return editor.onWindowedEventsChanged
    },
    get onNotesChanged() {
      return editor.onNotesChanged
    },
    get windowedEvents() {
      return editor.windowedEvents
    },
    get notes() {
      return editor.notes
    },
    get isRhythmTrack() {
      return editor.isRhythmTrack
    },
    get onIsRhythmTrackChanged() {
      return editor.onIsRhythmTrackChanged
    },

    transaction: <R>(fn: () => R): R => track.transaction(fn),

    // queries

    getNotesByIds: bindQuery(getNotesByIds),
    getNotesClipboardData: bindQuery(getNotesClipboardData),
    getNeighborNote: bindQuery(getNeighborNote),
    getAllNoteIds: bindQuery(() => getAllNoteIds),
    getNoteIdsInSelection: bindQuery(getNoteIdsInSelection),
    getDraggablePosition: bindQuery(getDraggablePosition),
    getDraggableArea: bindQuery(getDraggableArea),

    // mutations

    addNote: bindMutation(addNote),
    removeNote: bindMutation(removeNote),
    removeNotes: bindMutation(removeNotes),
    transposeNotes: bindMutation(transposeNotes),
    cloneNotes: bindMutation(cloneNotes),
    addClipboardNotes: bindMutation(addClipboardNotes),
    duplicateNotes: bindMutation(duplicateNotes),
    quantizeNotes: bindMutation(quantizeNotes),
    dragNote: bindMutation(dragNote),
  }
}
