import { Track } from "@signal-app/core"
import { TrackPianoRollEditor } from "./TrackPianoRollEditor"
import { PianoRollEditor } from "./type"

export const createPianoRollEditor = (track: Track): PianoRollEditor =>
  new TrackPianoRollEditor(track)
