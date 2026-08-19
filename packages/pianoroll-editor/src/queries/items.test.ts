import { describe, expect, it } from "vitest"
import { createTrackPianoRollEditor } from "../testUtils"
import { getNoteIdsInSelection } from "./items"

describe("pianoroll editor queries/items", () => {
  it("getNoteIdsInSelection should select notes by tick and note ranges", () => {
    const editor = createTrackPianoRollEditor()

    const first = editor.addNote({
      tick: 10,
      duration: 20,
      noteNumber: 60,
      velocity: 100,
    })

    editor.addNote({
      tick: 35,
      duration: 10,
      noteNumber: 60,
      velocity: 100,
    })

    editor.addNote({
      tick: 15,
      duration: 10,
      noteNumber: 65,
      velocity: 100,
    })

    const noteIds = editor.query(
      getNoteIdsInSelection({
        fromTick: 0,
        toTick: 30,
        fromNoteNumber: 61,
        toNoteNumber: 59,
      }),
    )

    expect(noteIds).toStrictEqual([first.id])
  })
})
