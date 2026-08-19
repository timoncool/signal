import { Song, Track } from "@signal-app/core"
import { describe, expect, it, vi } from "vitest"
import { createArrangeEditor } from "./createArrangeEditor"
import { addControllerToTrack, addNoteToTrack } from "./testUtils"

const createSong = (trackCount: number) => {
  const song = new Song()
  for (let i = 0; i < trackCount; i++) {
    const track = new Track()
    track.channel = i
    song.addTrack(track)
  }
  return song
}

describe("createArrangeEditor", () => {
  it("runs a composed mutation in one transaction, emitting a single change", () => {
    const song = createSong(1)
    addNoteToTrack(song.tracks[0], { tick: 10 })
    addControllerToTrack(song.tracks[0], { tick: 20 })

    const editor = createArrangeEditor(song)
    const listener = vi.fn()
    editor.observeItems(listener)

    // removes two events; without a transaction this would notify twice
    editor.removeSelection({
      fromTick: 0,
      toTick: 50,
      fromTrackIndex: 0,
      toTrackIndex: 1,
    })

    expect(song.tracks[0].events).toHaveLength(0)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
