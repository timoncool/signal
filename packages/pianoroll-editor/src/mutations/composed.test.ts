import { describe, expect, it } from "vitest"
import { createTrackPianoRollEditor } from "../testUtils"
import { addClipboardNotes, duplicateNotes, quantizeNotes } from "./composed"

describe("pianoroll editor mutations/composed", () => {
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
