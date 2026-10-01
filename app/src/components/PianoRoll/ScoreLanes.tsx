import { useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { usePrompt, useToast } from "dialog-hooks"
import React, { FC, useCallback, useState } from "react"
import { useHistory } from "../../hooks/useHistory"
import { useMobxSelector } from "../../hooks/useMobxSelector"
import { useStores } from "../../hooks/useStores"
import { useTickScroll } from "../../hooks/useTickScroll"
import { Localized, useCurrentLanguage, useLocalization } from "../../localize/useLocalization"
import { chordPitches } from "../../studio/chordSymbols"
import {
  barAt,
  chordsOf,
  isSectionName,
  removeChord,
  removeSection,
  repeatedChordTicks,
  sectionsOf,
  setChord,
  setSection,
} from "../../studio/scoreLanes"
import { Theme } from "../../theme/Theme"
import DrawCanvas from "../DrawCanvas"

// Two lanes over the piano roll for a music studio's score: the chord
// symbols and the sections. A click sets or renames the one under it, a
// right click takes it away.

const ROW_HEIGHT = 20
export const SCORE_LANES_HEIGHT = ROW_HEIGHT * 2

const Container = styled.div`
  display: flex;
  height: ${SCORE_LANES_HEIGHT}px;
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  border-bottom: 1px solid var(--color-divider);
  background: var(--color-background);
`

// the canvas is as wide as the roll; laid out absolutely, it does not widen the
// roll it is measured from
const Lanes = styled.div`
  position: relative;
  flex-grow: 1;
  overflow: hidden;
`

const Labels = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--color-divider);
  font-size: 0.7rem;
  color: var(--color-text-secondary);

  div {
    height: ${ROW_HEIGHT}px;
    line-height: ${ROW_HEIGHT}px;
    padding: 0 0.4rem;
    overflow: hidden;
    white-space: nowrap;
  }
`

const sectionHue = (name: string) => {
  let hue = 0
  for (const letter of name.toLowerCase()) {
    hue = (hue * 31 + letter.charCodeAt(0)) % 360
  }
  return hue
}

function drawSpan(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  top: number,
  fill: string,
  label: string,
  theme: Theme,
) {
  const width = Math.max(2, right - left - 1)
  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = fill
  ctx.fillRect(left, top + 2, width, ROW_HEIGHT - 4)
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.rect(left, top, width, ROW_HEIGHT)
  ctx.clip()
  ctx.fillStyle = theme.textColor
  ctx.textBaseline = "middle"
  ctx.font = `11px ${theme.canvasFont}`
  ctx.fillText(label, left + 4, top + ROW_HEIGHT / 2)
  ctx.restore()
}

export const ScoreLanes: FC<{ keyWidth: number }> = ({ keyWidth }) => {
  const [repeatChords, setRepeatChords] = useState(false)
  const language = useCurrentLanguage()
  const repeatLabels: Record<string, string> = { en: "Repeat chord edits in matching sections", ru: "Повторять правки аккордов в совпадающих секциях", ja: "一致するセクションにもコード編集を反映", "zh-Hans": "将和弦编辑同步到匹配的段落", "zh-Hant": "將和弦編輯同步到相同的段落", ko: "일치하는 섹션에 코드 편집 반복" }
  const repeatTitle = repeatLabels[language] ?? repeatLabels.en
  const theme = useTheme()
  const { songStore } = useStores()
  const { canvasWidth: width, scrollLeft, transform } = useTickScroll()
  const { pushHistory } = useHistory()
  const prompt = usePrompt()
  const toast = useToast()
  const localized = useLocalization()

  const lanes = useMobxSelector(
    () => {
      const song = songStore.song
      return {
        chords: chordsOf(song),
        sections: sectionsOf(song),
        end: song.endOfSong,
      }
    },
    [songStore],
    (a, b) => JSON.stringify(a) === JSON.stringify(b),
  )

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, width, SCORE_LANES_HEIGHT)
      const x = (tick: number) => transform.getX(tick) - scrollLeft
      lanes.chords.forEach((chord) =>
        drawSpan(
          ctx,
          x(chord.tick),
          x(chord.end),
          0,
          chord.name ? theme.themeColor : theme.redColor,
          chord.name ?? "?",
          theme,
        ),
      )
      lanes.sections.forEach((section, index) => {
        const end =
          lanes.sections[index + 1]?.tick ??
          Math.max(lanes.end, section.tick + 1)
        drawSpan(
          ctx,
          x(section.tick),
          x(end),
          ROW_HEIGHT,
          `hsl(${sectionHue(section.name)}, 60%, 55%)`,
          section.name,
          theme,
        )
      })
    },
    [width, scrollLeft, transform, lanes, theme],
  )

  const editChord = async (tick: number, remove: boolean) => {
    const song = songStore.song
    const beat = barAt(song, tick).beat
    const onset = Math.floor(tick / beat) * beat
    const here = lanes.chords.find((chord) => chord.tick === onset)
    const targets = repeatChords ? repeatedChordTicks(song, onset) : [onset]
    if (remove) {
      if (!here) return
      pushHistory()
      targets.forEach((target) => removeChord(song, target))
      return
    }
    const text = await prompt.show({
      title: localized["score-chord"],
      message: localized["score-chord-hint"],
      okText: localized["ok"],
      cancelText: localized["cancel"],
      initialText: here?.name ?? "",
    })
    if (text === null) return
    const symbol = text.trim()
    if (symbol === "") {
      if (!here) return
      pushHistory()
      targets.forEach((target) => removeChord(song, target))
      return
    }
    const pitches = chordPitches(symbol)
    if (!pitches) {
      toast.error(`${localized["score-chord-unknown"]}: ${symbol}`)
      return
    }
    pushHistory()
    targets.forEach((target) => setChord(song, target, pitches))
  }

  const editSection = async (tick: number, remove: boolean) => {
    const song = songStore.song
    const start = barAt(song, tick).tick
    const here = [...lanes.sections]
      .reverse()
      .find((section) => section.tick <= tick)
    if (remove) {
      if (!here) return
      pushHistory()
      removeSection(song, here.id)
      return
    }
    const atBar = lanes.sections.find((section) => section.tick === start)
    const text = await prompt.show({
      title: localized["score-section"],
      message: localized["score-section-hint"],
      okText: localized["ok"],
      cancelText: localized["cancel"],
      initialText: atBar?.name ?? "",
    })
    if (text === null) return
    const name = text.trim()
    if (name === "") {
      if (!atBar) return
      pushHistory()
      removeSection(song, atBar.id)
      return
    }
    if (!isSectionName(name)) {
      toast.error(`${localized["score-section-unknown"]}: ${name}`)
      return
    }
    pushHistory()
    setSection(song, start, name)
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const tick = Math.max(
      0,
      transform.getTick(e.nativeEvent.offsetX + scrollLeft),
    )
    const remove = e.button === 2
    if (e.nativeEvent.offsetY < ROW_HEIGHT) void editChord(tick, remove)
    else void editSection(tick, remove)
  }

  return (
    <Container>
      <Labels style={{ width: keyWidth }}>
        <div>
          <input type="checkbox" checked={repeatChords} onChange={(event) => setRepeatChords(event.target.checked)} aria-label={repeatTitle} title={repeatTitle} style={{ margin: "0 3px 0 0", verticalAlign: "middle" }} />
          <Localized name="score-chords" />
        </div>
        <div>
          <Localized name="score-sections" />
        </div>
      </Labels>
      <Lanes>
        <DrawCanvas
          draw={draw}
          width={width}
          height={SCORE_LANES_HEIGHT}
          onMouseDown={onMouseDown}
          onContextMenu={(e) => e.preventDefault()}
          style={{ position: "absolute", left: 0, top: 0, cursor: "pointer" }}
        />
      </Lanes>
    </Container>
  )
}
