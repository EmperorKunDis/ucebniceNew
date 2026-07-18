'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from '@phosphor-icons/react'
import { LANDING_STORY_CUES, resolveLandingStoryFrame } from './landing-story'
import { computeScreenMatrix, SCREEN_LAYER_HEIGHT, SCREEN_LAYER_WIDTH } from './screen-projection'
import { LandingScreenContent } from './LandingScreenContent'
import styles from './landing.module.css'

const HEADER_HEIGHT = 64
const INTRO_POSE = LANDING_STORY_CUES[0]!.pose
const OPENING_PLAYBACK_RATE = 1.6
const OPENING_CANCEL_SCROLL_PX = 48

export function LandingScrollStory() {
  const storyRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenLayerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const openingRef = useRef<'idle' | 'playing' | 'done'>('idle')
  const [activeCue, setActiveCue] = useState(0)
  const [hold, setHold] = useState(true)
  const [scrubEnabled, setScrubEnabled] = useState(false)
  const [motionPreference, setMotionPreference] = useState<'checking' | 'standard' | 'reduced'>(
    'checking'
  )
  const [openingDone, setOpeningDone] = useState(false)

  const finishOpening = useCallback(() => {
    const video = videoRef.current
    openingRef.current = 'done'
    setOpeningDone(true)
    if (video) {
      video.pause()
      video.playbackRate = 1
    }
  }, [])

  const updateFromScroll = useCallback(() => {
    animationFrameRef.current = null

    const story = storyRef.current
    const video = videoRef.current
    if (!story || !video) return

    const sceneHeight = Math.max(window.innerHeight - HEADER_HEIGHT, 1)
    const offset = HEADER_HEIGHT - story.getBoundingClientRect().top
    const frame = resolveLandingStoryFrame(offset, sceneHeight)

    if (openingRef.current === 'playing') {
      if (offset > OPENING_CANCEL_SCROLL_PX) {
        finishOpening()
      } else {
        return
      }
    }

    if (
      video.readyState >= HTMLMediaElement.HAVE_METADATA &&
      Math.abs(video.currentTime - frame.time) > 0.02
    ) {
      video.currentTime = frame.time
    }

    progressRef.current?.style.setProperty(
      '--story-progress',
      String((frame.cueIndex + frame.cueProgress) / LANDING_STORY_CUES.length)
    )
    setActiveCue(current => (current === frame.cueIndex ? current : frame.cueIndex))
    setHold(current => (current === frame.hold ? current : frame.hold))
  }, [finishOpening])

  const scheduleScrollUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) return
    animationFrameRef.current = window.requestAnimationFrame(updateFromScroll)
  }, [updateFromScroll])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktopViewport = window.matchMedia('(min-width: 900px)')

    const applyMode = () => {
      const shouldReduce = reducedMotion.matches
      const shouldScrub = desktopViewport.matches && !shouldReduce

      setMotionPreference(shouldReduce ? 'reduced' : 'standard')
      setScrubEnabled(shouldScrub)
      videoRef.current?.pause()

      if (!shouldScrub) {
        openingRef.current = 'done'
        setOpeningDone(true)
        if (videoRef.current && videoRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
          videoRef.current.currentTime = INTRO_POSE
        }
      }
    }

    applyMode()
    reducedMotion.addEventListener('change', applyMode)
    desktopViewport.addEventListener('change', applyMode)

    return () => {
      reducedMotion.removeEventListener('change', applyMode)
      desktopViewport.removeEventListener('change', applyMode)
    }
  }, [])

  useEffect(() => {
    if (!scrubEnabled) return

    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true })
    window.addEventListener('resize', scheduleScrollUpdate)
    scheduleScrollUpdate()

    return () => {
      window.removeEventListener('scroll', scheduleScrollUpdate)
      window.removeEventListener('resize', scheduleScrollUpdate)
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [scheduleScrollUpdate, scrubEnabled])

  // Keeps the HTML screen layer registered with the laptop display in the video.
  useEffect(() => {
    const stage = stageRef.current
    const layer = screenLayerRef.current
    if (!stage || !layer) return

    const applyMatrix = () => {
      const cue = LANDING_STORY_CUES[activeCue]!
      const matrix = computeScreenMatrix(cue.quad, stage.clientWidth, stage.clientHeight)
      if (matrix) layer.style.transform = matrix
    }

    applyMatrix()
    const observer = new ResizeObserver(applyMatrix)
    observer.observe(stage)

    return () => observer.disconnect()
  }, [activeCue])

  // Plays the lid-opening shot once on load, then hands control to scroll.
  const startOpening = useCallback(() => {
    const video = videoRef.current
    if (!video || openingRef.current !== 'idle') return

    if (!scrubEnabled || window.scrollY > OPENING_CANCEL_SCROLL_PX) {
      if (openingRef.current === 'idle' && scrubEnabled) {
        openingRef.current = 'done'
        setOpeningDone(true)
        scheduleScrollUpdate()
      }
      return
    }

    openingRef.current = 'playing'
    video.currentTime = 0
    video.playbackRate = OPENING_PLAYBACK_RATE
    video
      .play()
      .then(() => {
        if (openingRef.current !== 'playing') video.pause()
      })
      .catch(() => {
        video.currentTime = INTRO_POSE
        finishOpening()
      })
  }, [finishOpening, scheduleScrollUpdate, scrubEnabled])

  useEffect(() => {
    if (!scrubEnabled || motionPreference !== 'standard') return
    const video = videoRef.current
    if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) startOpening()
  }, [motionPreference, scrubEnabled, startOpening])

  const activeStoryCue = LANDING_STORY_CUES[activeCue]!
  const screensVisible = openingDone && hold

  return (
    <section
      ref={storyRef}
      className={styles.scrollStory}
      data-scrub={scrubEnabled ? 'enabled' : 'static'}
      aria-labelledby="landing-title"
    >
      <a className={styles.skipStory} href="#landing-after-story">
        Přeskočit animovanou prezentaci
      </a>

      <div className={styles.storySticky}>
        <div className={styles.storyGlow} aria-hidden="true" />
        <div
          ref={stageRef}
          className={styles.storyStage}
          data-layout={activeCue === 0 ? 'intro' : 'feature'}
        >
          <div className={styles.deviceLayer}>
            <video
              ref={videoRef}
              className={styles.storyVideo}
              muted
              playsInline
              preload="auto"
              poster="/media/landing/ucebnice-scroll-poster.jpg"
              aria-label="MacBook s ukázkami funkcí Učebnice AI; na počítači animaci ovládá posun stránky"
              data-testid="landing-macbook-video"
              data-motion={motionPreference}
              data-scrub={scrubEnabled ? 'enabled' : 'disabled'}
              onLoadedMetadata={() => {
                const video = videoRef.current
                if (!video) return
                if (scrubEnabled && motionPreference === 'standard') {
                  startOpening()
                } else {
                  video.currentTime = INTRO_POSE
                }
              }}
              onTimeUpdate={() => {
                const video = videoRef.current
                if (openingRef.current === 'playing' && video && video.currentTime >= INTRO_POSE) {
                  video.currentTime = INTRO_POSE
                  finishOpening()
                }
              }}
              onPlay={() => {
                if (openingRef.current !== 'playing') videoRef.current?.pause()
              }}
            >
              <source
                media="(max-width: 899px)"
                src="/media/landing/ucebnice-macbook-scroll-mobile.mp4"
                type="video/mp4"
              />
              <source src="/media/landing/ucebnice-macbook-scroll.webm" type="video/webm" />
              <source src="/media/landing/ucebnice-macbook-scroll.mp4" type="video/mp4" />
            </video>

            <div
              ref={screenLayerRef}
              className={styles.screenLayer}
              style={{ width: SCREEN_LAYER_WIDTH, height: SCREEN_LAYER_HEIGHT }}
            >
              {LANDING_STORY_CUES.map((cue, index) => (
                <div
                  key={cue.id}
                  className={styles.screenContent}
                  data-visible={screensVisible && index === activeCue ? 'true' : 'false'}
                  aria-hidden={!(screensVisible && index === activeCue) && cue.kind !== 'intro'}
                >
                  <LandingScreenContent cueId={cue.id} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.storyPanels}>
            {LANDING_STORY_CUES.slice(1).map((cue, index) => {
              const isActive = index + 1 === activeCue && hold

              return (
                <article
                  className={`${styles.storyPanel} ${cue.reward ? styles.storyPanelReward : ''} ${
                    isActive ? styles.storyPanelActive : ''
                  }`}
                  key={cue.id}
                  data-story-cue={cue.id}
                  data-active={isActive ? 'true' : 'false'}
                  aria-hidden={scrubEnabled ? !isActive : true}
                >
                  <div className={styles.storyPanelInner}>
                    <p className={styles.storyEyebrow}>
                      {cue.number && <span>{cue.number} / 08</span>}
                      {cue.eyebrow}
                    </p>
                    <h3>{cue.title}</h3>
                    <p className={styles.storyDescription}>{cue.description}</p>
                    {cue.proof && <p className={styles.storyProof}>{cue.proof}</p>}
                  </div>
                </article>
              )
            })}
          </div>

          <div
            className={styles.introCta}
            data-visible={activeCue === 0 && openingDone ? 'true' : 'false'}
          >
            <Link
              className={styles.primaryButton}
              href="/dashboard"
              tabIndex={activeCue === 0 ? 0 : -1}
            >
              Začít kurz <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link
              className={styles.secondaryButton}
              href="#obsah"
              tabIndex={activeCue === 0 ? 0 : -1}
            >
              Prohlédnout obsah
            </Link>
          </div>

          <div className={styles.storyHud} aria-hidden="true">
            <span>{String(activeCue + 1).padStart(2, '0')}</span>
            <div>
              <span ref={progressRef} />
            </div>
            <span>{activeCue === 0 ? 'INTRO' : activeStoryCue.number}</span>
          </div>

          {scrubEnabled && (
            <div className={styles.scrollHint} aria-hidden="true">
              <ArrowDown size={16} />
              Scroll ovládá animaci
            </div>
          )}
        </div>
      </div>

      <div className={styles.staticStoryList} aria-label="Funkce Učebnice AI">
        {LANDING_STORY_CUES.slice(1).map(cue => (
          <article className={styles.staticStoryCard} key={cue.id} data-static-story-cue={cue.id}>
            <p className={styles.storyEyebrow}>
              <span>{cue.number} / 08</span>
              {cue.eyebrow}
            </p>
            <h3>{cue.title}</h3>
            <p>{cue.description}</p>
            <small>{cue.proof}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
