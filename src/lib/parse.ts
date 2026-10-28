import type { QuizQuestion } from '@/types';

/**
 * Parses a JSON quiz from the AI response. Falls back to extracting a
 * fenced ```json block. Returns null if parsing fails.
 */
export function parseQuiz(raw: string): QuizQuestion[] | null {
  if (!raw) return null;
  let text = raw.trim();

  // Try to extract a ```json ... ``` block
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Try to find the first [ ... ] block
  const bracketStart = text.indexOf('[');
  const bracketEnd = text.lastIndexOf(']');
  if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
    text = text.slice(bracketStart, bracketEnd + 1);
  }

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    const questions: QuizQuestion[] = parsed
      .filter(
        (q): q is Record<string, unknown> =>
          typeof q === 'object' && q !== null,
      )
      .map((q) => {
        const options = Array.isArray(q.options)
          ? (q.options as unknown[]).map(String)
          : [];
        const correctIndex =
          typeof q.correctIndex === 'number'
            ? q.correctIndex
            : typeof q.correct === 'number'
              ? q.correct
              : 0;
        return {
          question: String(q.question ?? ''),
          options,
          correctIndex: Math.max(0, Math.min(correctIndex, options.length - 1)),
          explanation: String(q.explanation ?? ''),
        };
      })
      .filter((q) => q.question && q.options.length === 4);

    return questions.length > 0 ? questions : null;
  } catch {
    return null;
  }
}

/**
 * Parses a study schedule from the AI response. Expects JSON: { schedule: [...] }
 * or a raw array. Returns null if parsing fails.
 */
export function parseSchedule(
  raw: string,
): { day: string; timeSlot: string; topic: string; activity: string; priority: 'High' | 'Medium' | 'Low' }[] | null {
  if (!raw) return null;
  let text = raw.trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();

  const bracketStart = text.indexOf('[');
  const bracketEnd = text.lastIndexOf(']');
  if (bracketStart !== -1 && bracketEnd !== -1) {
    text = text.slice(bracketStart, bracketEnd + 1);
  }

  try {
    let parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'schedule' in parsed) {
      parsed = (parsed as Record<string, unknown>).schedule;
    }
    if (!Array.isArray(parsed)) return null;
    const validPriorities = ['High', 'Medium', 'Low'] as const;
    return parsed
      .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null)
      .map((b) => ({
        day: String(b.day ?? ''),
        timeSlot: String(b.timeSlot ?? b.time ?? ''),
        topic: String(b.topic ?? ''),
        activity: String(b.activity ?? ''),
        priority: (validPriorities.includes(b.priority as (typeof validPriorities)[number])
          ? b.priority
          : 'Medium') as 'High' | 'Medium' | 'Low',
      }))
      .filter((b) => b.topic);
  } catch {
    return null;
  }
}
