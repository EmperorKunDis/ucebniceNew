import {
  createHackathonSchema,
  createTeamSchema,
  INAPPROPRIATE_NAME_MESSAGE,
  isAppropriateEntityName,
} from '@/lib/validation-schemas'

describe('entity name moderation', () => {
  it('allows ordinary Czech and English names', () => {
    expect(isAppropriateEntityName('AI tým Praha')).toBe(true)
    expect(
      createTeamSchema.safeParse({
        name: 'Datoví průzkumníci',
        hackathonId: '123e4567-e89b-12d3-a456-426614174000',
      }).success
    ).toBe(true)
  })

  it('rejects inappropriate entity names in shared schemas', () => {
    const result = createHackathonSchema.safeParse({
      title: 'Nazi klub',
      description: 'Hackathon pro studenty programování',
      theme: 'AI nástroje',
      startDate: '2026-08-01T10:00:00.000Z',
      endDate: '2026-08-02T10:00:00.000Z',
      registrationDeadline: '2026-07-20T10:00:00.000Z',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(INAPPROPRIATE_NAME_MESSAGE)
  })

  it('normalizes common obfuscation before checking names', () => {
    expect(isAppropriateEntityName('h1tl3r tým')).toBe(false)
  })
})
