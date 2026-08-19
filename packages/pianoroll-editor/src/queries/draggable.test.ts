import { describe, expect, it } from "vitest"
import { createTrackPianoRollEditor } from "../testUtils"
import { getDraggableArea, getDraggablePosition } from "./draggable"

describe("pianoroll editor queries/draggable", () => {
  it("getDraggablePosition returns right edge for right handle", () => {
    const editor = createTrackPianoRollEditor()
    const note = editor.addNote({
      tick: 10,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })

    const result = getDraggablePosition(note.id, "right")(editor)

    expect(result).toStrictEqual({ tick: 30, noteNumber: 60 })
  })

  it("getDraggableArea returns center move ranges based on selected notes", () => {
    const editor = createTrackPianoRollEditor()
    const first = editor.addNote({
      tick: 10,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })
    const second = editor.addNote({
      tick: 30,
      duration: 20,
      noteNumber: 72,
      velocity: 100,
    })

    const area = getDraggableArea(
      first.id,
      [first.id, second.id],
      "center",
    )(editor)

    expect(area?.tickRange).toStrictEqual([0, Infinity])
    expect(area?.noteNumberRange).toStrictEqual([0, 115])
  })
})
