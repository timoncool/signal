import { describe, expect, it } from "vitest"
import { createTrackNoteMapper } from "../testUtils"
import {
  addNotes,
  cloneNotes,
  duplicateNotes,
  joinNotes,
  quantizeNotes,
  removeNotes,
  splitNotes,
  transposeNotes,
  updateNotes,
} from "./mutations"

describe("mutations", () => {
  it("addNotes adds every note in the batch", () => {
    const editor = createTrackNoteMapper()

    const added = addNotes(editor)([
      { tick: 10, duration: 10, noteNumber: 60, velocity: 100 },
      { tick: 20, duration: 10, noteNumber: 62, velocity: 100 },
    ])

    expect(added).toHaveLength(2)
    expect(editor.getAllNotes()).toMatchObject([
      { tick: 10, noteNumber: 60 },
      { tick: 20, noteNumber: 62 },
    ])
  })

  it("updateNotes applies each note's own update", () => {
    const editor = createTrackNoteMapper()
    const first = editor.addNote({
      tick: 10,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })
    const second = editor.addNote({
      tick: 20,
      duration: 10,
      noteNumber: 62,
      velocity: 100,
    })

    updateNotes(editor)([
      { ...first, velocity: 50 },
      { ...second, velocity: 90 },
    ])

    expect(editor.getNoteById(first.id)?.velocity).toBe(50)
    expect(editor.getNoteById(second.id)?.velocity).toBe(90)
  })

  it("transposeNotes shifts the pitch of selected notes", () => {
    const editor = createTrackNoteMapper()
    const selected = editor.addNote({
      tick: 10,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })
    const untouched = editor.addNote({
      tick: 20,
      duration: 10,
      noteNumber: 62,
      velocity: 100,
    })

    transposeNotes([selected.id], 5)(editor)

    expect(editor.getNoteById(selected.id)?.noteNumber).toBe(65)
    expect(editor.getNoteById(untouched.id)?.noteNumber).toBe(62)
  })

  it("cloneNotes copies selected notes in place with new ids", () => {
    const editor = createTrackNoteMapper()
    const original = editor.addNote({
      tick: 10,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })

    const clonedIds = cloneNotes([original.id])(editor)

    expect(clonedIds).toHaveLength(1)
    expect(clonedIds[0]).not.toBe(original.id)
    expect(editor.getNoteById(clonedIds[0])).toMatchObject({
      tick: 10,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })
    expect(editor.getAllNotes()).toHaveLength(2)
  })

  it("removeNotes removes every selected note", () => {
    const editor = createTrackNoteMapper()
    const first = editor.addNote({
      tick: 10,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })
    const second = editor.addNote({
      tick: 20,
      duration: 10,
      noteNumber: 62,
      velocity: 100,
    })

    removeNotes([first.id])(editor)

    expect(editor.getAllNotes()).toMatchObject([{ id: second.id }])
  })

  it("duplicateNotes uses selection span when initialDeltaTick is zero", () => {
    const editor = createTrackNoteMapper()
    const first = editor.addNote({
      tick: 10,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })
    const second = editor.addNote({
      tick: 30,
      duration: 10,
      noteNumber: 62,
      velocity: 100,
    })

    const result = duplicateNotes([first.id, second.id], 0)(editor)

    expect(result.deltaTick).toBe(20)
    expect(result.addedNoteIds).toHaveLength(2)

    const addedTicks = result.addedNoteIds
      .map((id) => editor.getNoteById(id)?.tick)
      .sort((a, b) => (a ?? 0) - (b ?? 0))

    expect(addedTicks).toStrictEqual([30, 50])
  })

  it("quantizeNotes snaps a note's tick to the given rounding", () => {
    const editor = createTrackNoteMapper()
    const note = editor.addNote({
      tick: 13,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })

    quantizeNotes([note.id], (tick) => Math.floor(tick / 10) * 10)(editor)

    expect(editor.getNoteById(note.id)?.tick).toBe(10)
  })

  it("splitNotes cuts the notes that span the tick in two and leaves the rest", () => {
    const editor = createTrackNoteMapper()
    const spanned = editor.addNote({
      tick: 0,
      duration: 100,
      noteNumber: 60,
      velocity: 90,
    })
    const before = editor.addNote({
      tick: 0,
      duration: 40,
      noteNumber: 64,
      velocity: 80,
    })

    const parts = splitNotes([spanned.id, before.id], 40)(editor)

    expect(parts).toHaveLength(2)
    expect(editor.getNoteById(spanned.id)).toMatchObject({
      tick: 0,
      duration: 40,
    })
    expect(editor.getNoteById(parts[1])).toMatchObject({
      tick: 40,
      duration: 60,
      noteNumber: 60,
      velocity: 90,
    })
    expect(editor.getNoteById(before.id)?.duration).toBe(40)
  })

  it("joinNotes makes one note of the chosen notes of a pitch, with the first one's velocity", () => {
    const editor = createTrackNoteMapper()
    const first = editor.addNote({
      tick: 0,
      duration: 30,
      noteNumber: 60,
      velocity: 70,
    })
    const second = editor.addNote({
      tick: 50,
      duration: 50,
      noteNumber: 60,
      velocity: 110,
    })
    const other = editor.addNote({
      tick: 10,
      duration: 10,
      noteNumber: 62,
      velocity: 100,
    })

    const joined = joinNotes([first.id, second.id, other.id])(editor)

    expect(joined).toEqual([first.id])
    expect(editor.getNoteById(first.id)).toMatchObject({
      tick: 0,
      duration: 100,
      velocity: 70,
    })
    expect(editor.getNoteById(second.id)).toBeUndefined()
    expect(editor.getNoteById(other.id)?.duration).toBe(10)
  })

  it("joinNotes leaves a pitch alone when a note of it outside the choice lies between", () => {
    const editor = createTrackNoteMapper()
    const first = editor.addNote({
      tick: 0,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })
    const between = editor.addNote({
      tick: 30,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })
    const last = editor.addNote({
      tick: 60,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })

    expect(joinNotes([first.id, last.id])(editor)).toEqual([])
    expect(editor.getNoteById(first.id)?.duration).toBe(20)
    expect(editor.getNoteById(between.id)).toBeDefined()
    expect(editor.getNoteById(last.id)).toBeDefined()
  })
})
