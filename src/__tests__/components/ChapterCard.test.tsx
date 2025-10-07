import { render, screen } from '@testing-library/react'
import { ChapterCard } from '@/components/chapters/ChapterCard'
import { Chapter } from '@/data/chapters'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('ChapterCard', () => {
  const mockChapter: Chapter = {
    id: '01',
    number: 1,
    title: 'Test Chapter',
    description: 'This is a test chapter description',
    hours: '1',
    textFile: 'test.md',
    lectureFile: 'test-lecture.md',
  }

  it('should render chapter number, title, and description', () => {
    render(<ChapterCard chapter={mockChapter} />)

    expect(screen.getByText('Kapitola 1')).toBeInTheDocument()
    expect(screen.getByText('Test Chapter')).toBeInTheDocument()
    expect(screen.getByText('This is a test chapter description')).toBeInTheDocument()
  })

  it('should render hour information', () => {
    render(<ChapterCard chapter={mockChapter} />)

    expect(screen.getByText('Hodina 1')).toBeInTheDocument()
  })

  it('should show video indicator when chapter has video', () => {
    const chapterWithVideo: Chapter = {
      ...mockChapter,
      videoFile: 'test-video.mp4',
    }

    render(<ChapterCard chapter={chapterWithVideo} />)

    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('should not show video indicator when chapter has no video', () => {
    render(<ChapterCard chapter={mockChapter} />)

    expect(screen.queryByText('Video')).not.toBeInTheDocument()
  })

  it('should show interactive indicator when chapter has notebook', () => {
    const chapterWithNotebook: Chapter = {
      ...mockChapter,
      notebookLMUrl: 'https://example.com/notebook',
    }

    render(<ChapterCard chapter={chapterWithNotebook} />)

    expect(screen.getByText('Interaktivní')).toBeInTheDocument()
  })

  it('should show interactive indicator when chapter has colab notebook', () => {
    const chapterWithColab: Chapter = {
      ...mockChapter,
      colabNotebook: 'test-notebook.ipynb',
    }

    render(<ChapterCard chapter={chapterWithColab} />)

    expect(screen.getByText('Interaktivní')).toBeInTheDocument()
  })

  it('should not show interactive indicator when chapter has no notebook', () => {
    render(<ChapterCard chapter={mockChapter} />)

    expect(screen.queryByText('Interaktivní')).not.toBeInTheDocument()
  })

  it('should link to correct chapter URL', () => {
    render(<ChapterCard chapter={mockChapter} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/chapters/01')
  })

  it('should show both video and interactive indicators', () => {
    const fullChapter: Chapter = {
      ...mockChapter,
      videoFile: 'test-video.mp4',
      notebookLMUrl: 'https://example.com/notebook',
    }

    render(<ChapterCard chapter={fullChapter} />)

    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('Interaktivní')).toBeInTheDocument()
  })

  it('should handle multi-hour format', () => {
    const multiHourChapter: Chapter = {
      ...mockChapter,
      hours: '12-13',
    }

    render(<ChapterCard chapter={multiHourChapter} />)

    expect(screen.getByText('Hodina 12-13')).toBeInTheDocument()
  })
})
