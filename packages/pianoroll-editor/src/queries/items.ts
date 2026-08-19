import { filter, map, NoteSelection, Range } from "@signal-app/core"
import { flow, min } from "lodash"
import {
  isNoteInRange,
  type NoteEvent,
  PianoNotesClipboardData,
  sortedNotes,
} from "../entities"
import { getAllNotes, getNoteById } from "./primitives"
import type { PianoRollEditorQuery } from "./type"

export const getNotesByIds =
  (ids: readonly number[]): PianoRollEditorQuery<readonly NoteEvent[]> =>
  (context) =>
    ids
      .map((id) => getNoteById(id)(context))
      .filter((item): item is NoteEvent => item !== undefined)

export const getNotesClipboardData =
  (
    noteIds: readonly number[],
    startTick?: number,
  ): PianoRollEditorQuery<PianoNotesClipboardData | null> =>
  (context) => {
    const notes = getNotesByIds(noteIds)(context)

    const minTick = startTick ?? min(notes.map((e) => e.tick))

    if (minTick === undefined) {
      return null
    }

    return {
      type: "piano_notes",
      notes: notes.map((e) => ({ ...e, tick: e.tick - minTick })),
    }
  }

export const getNeighborNote =
  (
    deltaIndex: number,
    selectedNoteIds: readonly number[],
  ): PianoRollEditorQuery<NoteEvent | null> =>
  (context) => {
    if (selectedNoteIds.length === 0) {
      return null
    }
    const allNotes = getAllNotes(context)
    const selectedNotes = sortedNotes(getNotesByIds(selectedNoteIds)(context))
    if (selectedNotes.length === 0) {
      return null
    }
    const firstNote = sortedNotes(selectedNotes)[0]
    const notes = sortedNotes(allNotes)
    const currentIndex = notes.findIndex((n) => n.id === firstNote.id)
    const nextNote = notes[currentIndex + deltaIndex]
    return nextNote ?? null
  }

export const getAllNoteIds: PianoRollEditorQuery<readonly number[]> = (
  context,
) => getAllNotes(context).map((note) => note.id)

const getNotesInSelection = (
  selection: NoteSelection,
): PianoRollEditorQuery<readonly NoteEvent[]> => {
  const tickRange = Range.create(selection.fromTick, selection.toTick)
  const noteNumberRange = Range.create(
    selection.toNoteNumber,
    selection.fromNoteNumber,
  )
  const isEventInRange = isNoteInRange(tickRange, noteNumberRange)

  return flow(getAllNotes, filter(isEventInRange))
}

export const getNoteIdsInSelection = (
  selection: NoteSelection,
): PianoRollEditorQuery<readonly number[]> =>
  flow(
    getNotesInSelection(selection),
    map((e) => e.id),
  )
