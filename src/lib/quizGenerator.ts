import type { QuizQuestion } from '@/types';
import { QUESTION_BANK, getSubjectsForLevel, getTopicsForSubject, getLevelById } from './curriculum';

export type QuizConfig = {
  levelId: string;
  subSelection: string | null;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numQuestions: number;
};

export type QuizResult = {
  questions: QuizQuestion[];
  error: string | null;
};

/** Generate a quiz from the local question bank, filtered by level/subject/topic.
 *  This is a rule-based generator — no AI involved. It shuffles questions and
 *  answer options to provide variety on repeated attempts. */
export function generateLevelQuiz(config: QuizConfig): QuizResult {
  const { levelId, subject, topic, numQuestions } = config;

  const level = getLevelById(levelId);
  if (!level) {
    return { questions: [], error: 'Invalid education level selected.' };
  }

  // Check if the subject is valid for this level
  const validSubjects = getSubjectsForLevel(levelId, config.subSelection);
  if (subject && !validSubjects.includes(subject)) {
    return {
      questions: [],
      error: `"${subject}" is not available for ${level.label}. Please choose from the available subjects.`,
    };
  }

  // Get questions from the bank
  const levelBank = QUESTION_BANK[levelId];
  if (!levelBank) {
    return {
      questions: [],
      error: `The question bank for ${level.label} is not available yet. We're adding questions for more levels — please check back soon or try another level.`,
    };
  }

  const subjectBank = levelBank[subject];
  if (!subjectBank) {
    return {
      questions: [],
      error: `The question bank for "${subject}" at ${level.label} is not available yet. We're working on it — please try another subject.`,
    };
  }

  // If a specific topic is provided, use that; otherwise use all topics for the subject
  let pool: QuizQuestion[] = [];
  if (topic && topic !== 'All Topics') {
    const topicBank = subjectBank[topic];
    if (!topicBank || topicBank.length === 0) {
      return {
        questions: [],
        error: `No questions available for "${topic}" in ${subject} at ${level.label} yet. Please try a different topic or select "All Topics".`,
      };
    }
    pool = [...topicBank];
  } else {
    // Combine all topics
    pool = Object.values(subjectBank).flat();
  }

  if (pool.length === 0) {
    return {
      questions: [],
      error: `No questions available for ${subject} at ${level.label} yet. We're adding more — please check back soon.`,
    };
  }

  // Shuffle the pool and take the requested number of questions
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  // Shuffle answer options for each question (keeping track of correct index)
  const withShuffledOptions = selected.map((q) => shuffleOptions(q));

  return { questions: withShuffledOptions, error: null };
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const correctAnswer = q.options[q.correctIndex];
  const shuffledOpts = shuffleArray(q.options);
  const newCorrectIndex = shuffledOpts.indexOf(correctAnswer);
  return {
    ...q,
    options: shuffledOpts,
    correctIndex: newCorrectIndex,
  };
}
