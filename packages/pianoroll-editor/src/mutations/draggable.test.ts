import { describe, expect, it } from "vitest"
import { createTrackPianoRollEditor } from "../testUtils"
import { dragNote } from "./draggable"

describe("pianoroll editor mutations/draggable", () => {
  it("dragNote updates tick and note number when dragging center", () => {
    const editor = createTrackPianoRollEditor()
    const note = editor.addNote({
      tick: 10,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })

    editor.mutate(dragNote({ tick: 15, noteNumber: 62 }, note.id, "center"))

    const updated = editor.getNoteById(note.id)
    expect(updated?.tick).toBe(15)
    expect(updated?.noteNumber).toBe(62)
    expect(updated?.duration).toBe(20)
  })

  it("dragNote updates duration from edge handles", () => {
    const editor = createTrackPianoRollEditor()
    const note = editor.addNote({
      tick: 10,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })

    editor.mutate(dragNote({ tick: 6 }, note.id, "left"))
    editor.mutate(dragNote({ tick: 40 }, note.id, "right"))

    const updated = editor.getNoteById(note.id)
    expect(updated?.tick).toBe(6)
    expect(updated?.duration).toBe(34)
  })
})
