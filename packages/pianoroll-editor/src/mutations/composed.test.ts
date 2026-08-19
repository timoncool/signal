import { describe, expect, it } from "vitest"
import { createTrackPianoRollEditor } from "../testUtils"
import {
  addClipboardNotes,
  addNotes,
  cloneNotes,
  duplicateNotes,
  quantizeNotes,
  removeNotes,
  transposeNotes,
  updateNotes,
} from "./composed"

describe("pianoroll editor mutations/composed", () => {
  it("addNotes adds every note in the batch", () => {
    const editor = createTrackPianoRollEditor()

    const added = addNotes([
      { tick: 10, duration: 10, noteNumber: 60, velocity: 100 },
      { tick: 20, duration: 10, noteNumber: 62, velocity: 100 },
    ])(editor)

    expect(added).toHaveLength(2)
    expect(editor.getAllNotes()).toMatchObject([
      { tick: 10, noteNumber: 60 },
      { tick: 20, noteNumber: 62 },
    ])
  })

  it("updateNotes applies each note's own update", () => {
    const editor = createTrackPianoRollEditor()
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

    updateNotes([
      { ...first, velocity: 50 },
      { ...second, velocity: 90 },
    ])(editor)

    expect(editor.getNoteById(first.id)?.velocity).toBe(50)
    expect(editor.getNoteById(second.id)?.velocity).toBe(90)
  })

  it("transposeNotes shifts the pitch of selected notes", () => {
    const editor = createTrackPianoRollEditor()
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
    const editor = createTrackPianoRollEditor()
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
    const editor = createTrackPianoRollEditor()
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
    const editor = createTrackPianoRollEditor()
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
    const editor = createTrackPianoRollEditor()
    const note = editor.addNote({
      tick: 13,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })

    quantizeNotes([note.id], (tick) => Math.floor(tick / 10) * 10)(editor)

    expect(editor.getNoteById(note.id)?.tick).toBe(10)
  })

  it("addClipboardNotes adds pasted notes shifted to the target tick", () => {
    const editor = createTrackPianoRollEditor()

    addClipboardNotes(
      {
        type: "piano_notes",
        notes: [{ tick: 0, duration: 5, noteNumber: 70, velocity: 90 }],
      },
      40,
    )(editor)

    expect(editor.getAllNotes()).toMatchObject([
      { tick: 40, duration: 5, noteNumber: 70, velocity: 90 },
    ])
  })
})
