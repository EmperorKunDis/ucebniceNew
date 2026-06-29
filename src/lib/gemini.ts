/**
 * Gemini AI Integration for Project Review
 *
 * Uses Google's Gemini API to evaluate student projects
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface ProjectReviewResult {
  score: number // 0-100
  feedback: string
  strengths: string[]
  improvements: string[]
  approved: boolean // score >= 70
}

interface ReviewProjectParams {
  projectCode: string
  chapterTitle: string
  chapterDescription: string
  projectRequirements: string
  referenceNotebook?: string
}

/**
 * Review a student's project submission using Gemini AI
 */
export async function reviewProjectWithGemini(
  params: ReviewProjectParams
): Promise<ProjectReviewResult> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured, using fallback review')
    return fallbackReview()
  }

  const { projectCode, chapterTitle, chapterDescription, projectRequirements, referenceNotebook } =
    params

  const prompt = `Jsi přísný ale spravedlivý učitel programování. Zhodnoť následující studentský projekt.

## Kapitola: ${chapterTitle}
${chapterDescription}

## Požadavky na projekt:
${projectRequirements}

${
  referenceNotebook
    ? `## Referenční řešení (pracovní sešit):
${referenceNotebook}`
    : ''
}

## Studentův kód:
\`\`\`
${projectCode}
\`\`\`

## Tvůj úkol:
1. Zhodnoť projekt na škále 0-100 bodů
2. Identifikuj silné stránky (max 3)
3. Navrhni zlepšení (max 3)
4. Napiš konstruktivní zpětnou vazbu v češtině

Odpověz POUZE v tomto JSON formátu (bez markdown bloků):
{
  "score": <číslo 0-100>,
  "feedback": "<konstruktivní zpětná vazba v češtině, 2-3 věty>",
  "strengths": ["<silná stránka 1>", "<silná stránka 2>"],
  "improvements": ["<návrh zlepšení 1>", "<návrh zlepšení 2>"]
}

Buď přísný ale povzbudivý. Pokud kód nesplňuje základní požadavky, dej nízké skóre. Pokud je výborný, neboj se dát vysoké skóre.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return fallbackReview()
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('No text in Gemini response')
      return fallbackReview()
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr
        .replace(/```json?\n?/g, '')
        .replace(/```/g, '')
        .trim()
    }

    const result = JSON.parse(jsonStr)

    return {
      score: Math.min(100, Math.max(0, result.score || 0)),
      feedback: result.feedback || 'Projekt byl zhodnocen.',
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      approved: (result.score || 0) >= 70,
    }
  } catch (error) {
    console.error('Error calling Gemini:', error)
    return fallbackReview()
  }
}

/**
 * Fallback review when Gemini is not available
 */
function fallbackReview(): ProjectReviewResult {
  return {
    score: 0,
    feedback: 'Automatické hodnocení není momentálně dostupné. Projekt musí zkontrolovat učitel.',
    strengths: [],
    improvements: ['Počkej na ruční kontrolu projektu nebo zkus odevzdání později.'],
    approved: false,
  }
}

/**
 * Evaluate milestone test project (combines multiple chapter projects)
 */
export async function reviewMilestoneProject(
  projectCode: string,
  milestone: number,
  chaptersSummary: string
): Promise<ProjectReviewResult> {
  if (!GEMINI_API_KEY) {
    return fallbackReview()
  }

  const prompt = `Jsi přísný učitel programování. Zhodnoť závěrečný projekt po ${milestone}. kapitole.

## Shrnutí kapitol 1-${milestone}:
${chaptersSummary}

## Studentův závěrečný projekt:
\`\`\`
${projectCode}
\`\`\`

Tento projekt by měl demonstrovat znalosti ze všech ${(milestone / 10) * 10} kapitol. Zhodnoť:
- Správnost implementace
- Pochopení konceptů
- Kvalitu kódu
- Kreativitu

Odpověz POUZE v JSON formátu:
{
  "score": <0-100>,
  "feedback": "<zpětná vazba v češtině>",
  "strengths": ["..."],
  "improvements": ["..."]
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      }
    )

    if (!response.ok) {
      return fallbackReview()
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) return fallbackReview()

    let jsonStr = text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr
        .replace(/```json?\n?/g, '')
        .replace(/```/g, '')
        .trim()
    }

    const result = JSON.parse(jsonStr)

    return {
      score: Math.min(100, Math.max(0, result.score || 0)),
      feedback: result.feedback || '',
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      approved: (result.score || 0) >= 70,
    }
  } catch (error) {
    console.error('Error in milestone review:', error)
    return fallbackReview()
  }
}
