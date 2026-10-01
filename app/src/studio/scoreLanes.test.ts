import { emptySong, songFromMidi, songToMidi } from "@signal-app/core"
import { chordPitches } from "./chordSymbols"
import { chordsOf, removeChord, sectionsOf, setChord, setSection } from "./scoreLanes"

describe("a studio score through a MIDI file", () => {
  it("keeps chord timing, slash bass and section markers after reopening", () => {
    const song = emptySong()
    const bar = song.timebase * 4
    setChord(song, 0, chordPitches("Am7")!)
    setChord(song, bar, chordPitches("F#m(maj7)/C#")!)
    setSection(song, 0, "Verse")
    setSection(song, bar, "Chorus 2")
    const reopened = songFromMidi(songToMidi(song))
    expect(chordsOf(reopened)).toEqual([
      { tick: 0, end: bar, name: "Am7" },
      { tick: bar, end: bar * 2, name: "F#m(maj7)/C#" },
    ])
    expect(sectionsOf(reopened).map(({ tick, name }) => ({ tick, name }))).toEqual([
      { tick: 0, name: "Verse" },
      { tick: bar, name: "Chorus 2" },
    ])
  })

  it("joins the preceding chord through a removed chord after reopening", () => {
    const song = emptySong()
    const bar = song.timebase * 4
    setChord(song, 0, chordPitches("Am7")!)
    setChord(song, bar, chordPitches("G7")!)
    removeChord(song, bar)
    expect(chordsOf(songFromMidi(songToMidi(song)))).toEqual([
      { tick: 0, end: bar * 2, name: "Am7" },
    ])
  })
})
