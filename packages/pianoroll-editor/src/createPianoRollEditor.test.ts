import { Track } from "@signal-app/core"
import { describe, expect, it, vi } from "vitest"
import { createPianoRollEditor } from "./createPianoRollEditor"

describe("createPianoRollEditor", () => {
  it("runs a composed mutation in one transaction, emitting a single change", () => {
    const track = new Track()
    const editor = createPianoRollEditor(track)
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

    const listener = vi.fn()
    track.onEventsChanged.subscribe(listener)

    // removes two notes; without a transaction this would notify twice
    editor.removeNotes([first.id, second.id])

    expect(editor.getAllNoteIds()).toStrictEqual([])
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
