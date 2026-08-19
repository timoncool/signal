import { Track } from "@signal-app/core"
import { TrackPianoRollEditor } from "./TrackPianoRollEditor"

export const createTrackPianoRollEditor = (): TrackPianoRollEditor =>
  new TrackPianoRollEditor(new Track())
