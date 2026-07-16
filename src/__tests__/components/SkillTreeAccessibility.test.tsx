import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillNode, type SkillNodeData } from '@/components/learning/skill-tree/SkillNode'
import { SkillCheckpoint } from '@/components/learning/skill-tree/SkillCheckpoint'

const activeNode: SkillNodeData = {
  id: '01',
  title: 'Co je umělá inteligence?',
  description: null,
  module: 1,
  order: 1,
  status: 'active',
  stars: 0,
  xpReward: 20,
  difficulty: 'BEGINNER',
  position: { x: 200, y: 120 },
  prerequisites: [],
  progress: 20,
  lessonsCompleted: 0,
  exercisesCorrect: 0,
  exercisesTotal: 10,
  reviewDue: 0,
}

describe('skill tree keyboard access', () => {
  it('activates an unlocked skill node with the keyboard', async () => {
    const onClick = jest.fn()
    render(<SkillNode node={activeNode} onClick={onClick} />)

    const button = screen.getByRole('button', { name: /Kapitola 01: Co je umělá inteligence/ })
    await userEvent.tab()
    expect(button).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledWith(activeNode)
  })

  it('keeps locked nodes disabled', () => {
    render(<SkillNode node={{ ...activeNode, status: 'locked' }} onClick={jest.fn()} />)

    expect(screen.getByRole('button', { name: /zamčeno/ })).toBeDisabled()
  })

  it('activates an actionable checkpoint with the keyboard', async () => {
    const onClick = jest.fn()
    render(
      <SkillCheckpoint
        module={{ id: 1, name: 'Základy', chaptersRange: ['01', '02'] }}
        position={{ x: 200, y: 40 }}
        isUnlocked={true}
        isCompleted={false}
        completedChapters={1}
        totalChapters={2}
        onClick={onClick}
      />
    )

    const button = screen.getByRole('button', { name: /Modul 1: Základy/ })
    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('progressbar', { name: 'Pokrok modulu 1' })).toHaveAttribute(
      'aria-valuenow',
      '50'
    )
  })
})
