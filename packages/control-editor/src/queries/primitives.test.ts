import { describe, expect, it } from "vitest"
import { createTrackControlEditor } from "../testUtils"
import { getItemById, getItems, getValueEventType } from "./primitives"

describe("control editor primitive queries", () => {
  it("getItems lists all items of the editor's type", () => {
    const editor = createTrackControlEditor()
    editor.addItem({ tick: 10, value: 64 })
    editor.addItem({ tick: 20, value: 100 })

    expect(getItems(editor)).toStrictEqual(editor.getItems())
  })

  it("getItemById returns the matching item, or undefined", () => {
    const editor = createTrackControlEditor()
    const added = editor.addItem({ tick: 10, value: 64 })

    expect(getItemById(added.id)(editor)).toStrictEqual(added)
    expect(getItemById(-1)(editor)).toBeUndefined()
  })

  it("getValueEventType returns the editor's own ValueEventType", () => {
    const editor = createTrackControlEditor({
      type: "controller",
      controllerType: 7,
    })

    expect(getValueEventType(editor)).toStrictEqual({
      type: "controller",
      controllerType: 7,
    })
  })
})
