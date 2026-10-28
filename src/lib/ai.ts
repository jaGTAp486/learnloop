import { EDGE_FUNCTION_URL } from './supabase';
import type { AIResponse } from '@/types';

type AIRequest = {
  task: 'doubt' | 'notes' | 'quiz' | 'exam' | 'chat';
  prompt: string;
  simpleEnglish?: boolean;
  context?: string;
};

async function callEdgeFunction(req: AIRequest): Promise<AIResponse> {
  if (!EDGE_FUNCTION_URL) {
    return { content: '', isDemo: true };
  }
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI service error (${res.status}). ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as AIResponse;
  return data;
}

export async function solveDoubt(question: string, simpleEnglish: boolean): Promise<AIResponse> {
  return callEdgeFunction({ task: 'doubt', prompt: question, simpleEnglish });
}

export async function generateNotes(topic: string, simpleEnglish: boolean): Promise<AIResponse> {
  return callEdgeFunction({ task: 'notes', prompt: topic, simpleEnglish });
}

export async function generateQuiz(topic: string): Promise<AIResponse> {
  return callEdgeFunction({ task: 'quiz', prompt: topic });
}

export async function generateExamPlan(
  subject: string,
  unit: string,
  studyTime: string,
  priorities: string,
): Promise<AIResponse> {
  const prompt = `Subject: ${subject}\nUnit: ${unit}\nAvailable study time: ${studyTime}\nTopic priorities: ${priorities}`;
  return callEdgeFunction({ task: 'exam', prompt });
}

export async function chatAssistant(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<AIResponse> {
  return callEdgeFunction({
    task: 'chat',
    prompt: message,
    context: history
      .slice(-8)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n'),
  });
}
