import { emptySong, songToMidi } from "@signal-app/core"
import { FC, useEffect, useRef } from "react"
import { useSetSong } from "../../actions"
import { songFromArrayBuffer } from "../../actions/file"
import { useExport } from "../../hooks/useExport"
import { useSettings } from "../../hooks/useSettings"
import { useSong } from "../../hooks/useSong"
import { useStores } from "../../hooks/useStores"
import { Language } from "../../localize/useLocalization"
import { ThemeType } from "../../theme/Theme"

// The studio that opened signal in its window talks to it with messages:
// it hands a song in, asks for the song as a MIDI file or as WAV audio when
// it keeps it, and is told whether the song has unsaved edits.
type StudioMessage =
  | { studio: true; type: "open"; data: ArrayBuffer; name: string }
  | { studio: true; type: "new"; name: string }
  | { studio: true; type: "midi"; id: number }
  | { studio: true; type: "wav"; id: number }
  | { studio: true; type: "saved" }
  | { studio: true; type: "look"; language: string; theme: string }

const LANGUAGES: Record<string, Language> = {
  en: "en",
  ru: "ru",
  zh: "zh-Hans",
  ja: "ja",
  ko: "ko",
}

const SOUNDFONT_WAIT_MS = 60_000

const tell = (message: object, transfer: Transferable[] = []) =>
  window.parent.postMessage(
    { signal: true, ...message },
    window.location.origin,
    transfer,
  )

export const StudioBridge: FC = () => {
  const setSong = useSetSong()
  const { getSong, setSaved, isSaved, name } = useSong()
  const { renderSong } = useExport()
  const { setLanguage, setThemeType } = useSettings()
  const { synth } = useStores()
  const handlers = useRef({ setSong, getSong, setSaved, renderSong })
  handlers.current = { setSong, getSong, setSaved, renderSong }

  useEffect(() => {
    const look = (language: string | null, theme: string | null) => {
      const chosen = language ? LANGUAGES[language] : undefined
      if (chosen) setLanguage(chosen)
      if (theme === "dark" || theme === "light") {
        setThemeType(theme as ThemeType)
      }
    }
    const params = new URLSearchParams(window.location.search)
    look(params.get("lang"), params.get("theme"))

    const soundFontLoaded = async () => {
      const deadline = Date.now() + SOUNDFONT_WAIT_MS
      while (synth.loadedSoundFont === null && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
      if (synth.loadedSoundFont === null) {
        throw new Error("The SoundFont did not load. Reopen the MIDI editor and try again.")
      }
    }

    const onMessage = async (event: MessageEvent<StudioMessage>) => {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        event.data?.studio !== true
      ) {
        return
      }
      const message = event.data
      const { setSong, getSong, setSaved, renderSong } = handlers.current
      switch (message.type) {
        case "open": {
          const song = songFromArrayBuffer(
            message.data,
            undefined,
            message.name,
          )
          song.name = message.name
          // naming the song counts as an edit to signal
          song.isSaved = true
          setSong(song)
          break
        }
        case "new": {
          const song = emptySong()
          song.name = message.name
          song.isSaved = true
          setSong(song)
          break
        }
        case "midi": {
          const song = getSong()
          const data = songToMidi(song).buffer as ArrayBuffer
          tell({ type: "midi", id: message.id, data, name: song.name }, [data])
          break
        }
        case "wav": {
          try {
            await soundFontLoaded()
            const blob = await renderSong("WAV")
            const data = await blob.arrayBuffer()
            tell({ type: "wav", id: message.id, data }, [data])
          } catch (e) {
            tell({
              type: "failed",
              id: message.id,
              error: e instanceof Error ? e.message : String(e),
            })
          }
          break
        }
        case "saved":
          setSaved(true)
          break
        case "look":
          look(message.language, message.theme)
          break
      }
    }

    window.addEventListener("message", onMessage)
    tell({ type: "ready" })
    return () => window.removeEventListener("message", onMessage)
  }, [setLanguage, setThemeType, synth])

  useEffect(() => {
    tell({ type: "dirty", dirty: !isSaved, name })
  }, [isSaved, name])

  return null
}
