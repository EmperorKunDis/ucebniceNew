import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chapters } from '../src/data/chapters'

type IssueLevel = 'error' | 'warning'

interface ContentIssue {
  level: IssueLevel
  message: string
}

const EXPECTED_CHAPTER_COUNT = 40
const CHAPTERS_WITHOUT_VIDEO = new Set(['09', '10'])
const currentFile = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(currentFile), '..')
const lectureDir = path.join(repoRoot, 'public', 'prednasky')
const textDirs = [path.join(repoRoot, 'public', 'texty'), lectureDir]
const videoDir = process.env.VIDEO_FILES_DIR
  ? path.resolve(process.env.VIDEO_FILES_DIR)
  : path.join(repoRoot, 'data', 'videa')

const issues: ContentIssue[] = []

function addIssue(level: IssueLevel, message: string): void {
  issues.push({ level, message })
}

function existsFile(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile()
  } catch {
    return false
  }
}

function existsDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory()
  } catch {
    return false
  }
}

function assertRelativeFilename(value: string, label: string, chapterId: string): void {
  if (value !== path.basename(value) || value.includes('/') || value.includes('\\')) {
    addIssue('error', `Chapter ${chapterId}: ${label} must be a plain filename, got "${value}"`)
  }
}

function expectedChapterId(number: number): string {
  return String(number).padStart(2, '0')
}

function validateChapterStructure(): void {
  if (chapters.length !== EXPECTED_CHAPTER_COUNT) {
    addIssue('error', `Expected ${EXPECTED_CHAPTER_COUNT} chapters, found ${chapters.length}`)
  }

  const ids = new Set<string>()
  const numbers = new Set<number>()

  chapters.forEach((chapter, index) => {
    const expectedNumber = index + 1
    const expectedId = expectedChapterId(expectedNumber)

    if (ids.has(chapter.id)) {
      addIssue('error', `Duplicate chapter id "${chapter.id}"`)
    }
    ids.add(chapter.id)

    if (numbers.has(chapter.number)) {
      addIssue('error', `Duplicate chapter number ${chapter.number}`)
    }
    numbers.add(chapter.number)

    if (chapter.number !== expectedNumber) {
      addIssue(
        'error',
        `Chapter ${chapter.id}: expected number ${expectedNumber}, got ${chapter.number}`
      )
    }

    if (chapter.id !== expectedId) {
      addIssue(
        'error',
        `Chapter number ${chapter.number}: expected id "${expectedId}", got "${chapter.id}"`
      )
    }

    if (!chapter.title.trim()) {
      addIssue('error', `Chapter ${chapter.id}: title is empty`)
    }

    if (!chapter.description.trim()) {
      addIssue('error', `Chapter ${chapter.id}: description is empty`)
    }

    if (!chapter.hours.trim()) {
      addIssue('error', `Chapter ${chapter.id}: hours is empty`)
    }
  })
}

function validateContentFiles(): void {
  chapters.forEach(chapter => {
    assertRelativeFilename(chapter.lectureFile, 'lectureFile', chapter.id)
    assertRelativeFilename(chapter.textFile, 'textFile', chapter.id)

    const lecturePath = path.join(lectureDir, chapter.lectureFile)
    if (!existsFile(lecturePath)) {
      addIssue(
        'error',
        `Chapter ${chapter.id}: missing lecture file ${path.relative(repoRoot, lecturePath)}`
      )
    }

    const textExists = textDirs.some(dir => existsFile(path.join(dir, chapter.textFile)))
    if (!textExists) {
      addIssue(
        'error',
        `Chapter ${chapter.id}: missing text file ${chapter.textFile} in public/texty or public/prednasky`
      )
    }
  })
}

function validateVideos(): void {
  const referencedVideos = new Set<string>()
  const videoDirectoryExists = existsDirectory(videoDir)

  chapters.forEach(chapter => {
    if (!chapter.videoFile) {
      if (!CHAPTERS_WITHOUT_VIDEO.has(chapter.id)) {
        addIssue('warning', `Chapter ${chapter.id}: no videoFile is configured`)
      }
      return
    }

    assertRelativeFilename(chapter.videoFile, 'videoFile', chapter.id)

    if (!chapter.videoFile.endsWith('.mp4')) {
      addIssue(
        'error',
        `Chapter ${chapter.id}: videoFile should be an .mp4 file, got "${chapter.videoFile}"`
      )
    }

    referencedVideos.add(chapter.videoFile)
    const videoPath = path.join(videoDir, chapter.videoFile)
    if (videoDirectoryExists && !existsFile(videoPath)) {
      addIssue(
        'error',
        `Chapter ${chapter.id}: missing video file ${path.relative(repoRoot, videoPath)}`
      )
    }
  })

  if (!videoDirectoryExists) {
    addIssue('error', `Video directory does not exist: ${path.relative(repoRoot, videoDir)}`)
    return
  }

  const actualVideos = fs.readdirSync(videoDir).filter(file => file.endsWith('.mp4'))
  actualVideos.forEach(file => {
    if (!referencedVideos.has(file)) {
      addIssue(
        'warning',
        `Unreferenced video file: ${path.relative(repoRoot, path.join(videoDir, file))}`
      )
    }
  })
}

function validateExternalReferences(): void {
  chapters.forEach(chapter => {
    if (chapter.colabNotebook) {
      assertRelativeFilename(chapter.colabNotebook, 'colabNotebook', chapter.id)
      if (!chapter.colabNotebook.endsWith('.ipynb')) {
        addIssue('error', `Chapter ${chapter.id}: colabNotebook should be an .ipynb file`)
      }
    }

    if (chapter.notebookLMUrl) {
      try {
        const url = new URL(chapter.notebookLMUrl)
        if (url.hostname !== 'notebooklm.google.com') {
          addIssue('warning', `Chapter ${chapter.id}: unexpected NotebookLM host ${url.hostname}`)
        }
      } catch {
        addIssue('error', `Chapter ${chapter.id}: invalid notebookLMUrl`)
      }
    }
  })
}

function printSummary(): void {
  const errors = issues.filter(issue => issue.level === 'error')
  const warnings = issues.filter(issue => issue.level === 'warning')
  const configuredVideos = chapters.filter(chapter => chapter.videoFile).length

  console.log(`Validated ${chapters.length} chapters`)
  console.log(`Lecture directory: ${path.relative(repoRoot, lectureDir)}`)
  console.log(`Video directory: ${path.relative(repoRoot, videoDir)}`)
  console.log(`Configured videos: ${configuredVideos}`)

  issues.forEach(issue => {
    console.log(`${issue.level.toUpperCase()}: ${issue.message}`)
  })

  if (errors.length > 0) {
    console.error(
      `Content validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`
    )
    process.exitCode = 1
    return
  }

  console.log(`Content validation passed with ${warnings.length} warning(s).`)
}

validateChapterStructure()
validateContentFiles()
validateVideos()
validateExternalReferences()
printSummary()
