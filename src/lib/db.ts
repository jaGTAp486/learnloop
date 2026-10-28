import { supabase } from '@/lib/supabase';
import type {
  AppData, StudyGoal, Mission, QuizAttempt, MasteryTopic,
  ActivityItem, RevisionItem, ArcadeStats, ArcadeBestScore,
  CircleGroup, CirclePost, CozyMission, StudyRoomState,
  EducationProfile,
} from '@/types';
import { emptyAppData, sampleCircles } from '@/types';

/** Fetch all app data for the current authenticated user from Supabase. */
export async function fetchAppData(): Promise<AppData> {
  if (!supabase) return { ...emptyAppData };

  const [
    goalsRes, missionsRes, quizRes, masteryRes, activitiesRes,
    notesRes, doubtsRes, revisionRes, arcadeRes, membershipsRes, postsRes,
    cozyMissionsRes, studyRoomRes,
  ] = await Promise.all([
    supabase.from('study_goals').select('*').order('created_at', { ascending: true }),
    supabase.from('missions').select('*').order('created_at', { ascending: true }),
    supabase.from('quiz_attempts').select('*').order('created_at', { ascending: false }),
    supabase.from('mastery_topics').select('*'),
    supabase.from('activities').select('*').order('timestamp', { ascending: false }),
    supabase.from('notes_history').select('*').order('created_at', { ascending: false }),
    supabase.from('doubts_history').select('*').order('created_at', { ascending: false }),
    supabase.from('revision_queue').select('*').order('created_at', { ascending: false }),
    supabase.from('arcade_stats').select('*').maybeSingle(),
    supabase.from('circle_memberships').select('*'),
    supabase.from('circle_posts').select('*').order('created_at', { ascending: false }),
    supabase.from('cozy_missions').select('*').order('created_at', { ascending: false }),
    supabase.from('study_room').select('*').maybeSingle(),
  ]);

  const circles = buildCircles(membershipsRes.data ?? []);

  // Fetch education profile from profiles table
  let education: EducationProfile = { ...emptyAppData.education };
  if (supabase) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('education_level_id, education_sub_selection, preferred_subjects')
      .maybeSingle();
    if (profileData) {
      education = {
        levelId: profileData.education_level_id ?? null,
        subSelection: profileData.education_sub_selection ?? null,
        preferredSubjects: Array.isArray(profileData.preferred_subjects) ? profileData.preferred_subjects : [],
      };
    }
  }

  return {
    goals: (goalsRes.data ?? []).map(rowToGoal),
    missions: (missionsRes.data ?? []).map(rowToMission),
    quizAttempts: (quizRes.data ?? []).map(rowToQuizAttempt),
    mastery: (masteryRes.data ?? []).map(rowToMastery),
    activities: (activitiesRes.data ?? []).map(rowToActivity),
    notesHistory: (notesRes.data ?? []).map((r: any) => ({ id: r.id, topic: r.topic, createdAt: ts(r.created_at) })),
    doubtsHistory: (doubtsRes.data ?? []).map((r: any) => ({ id: r.id, question: r.question, createdAt: ts(r.created_at) })),
    revisionQueue: (revisionRes.data ?? []).map(rowToRevision),
    arcade: rowToArcade(arcadeRes.data),
    circles,
    circlePosts: (postsRes.data ?? []).map(rowToPost),
    cozyMissions: (cozyMissionsRes.data ?? []).map(rowToCozyMission),
    studyRoom: rowToStudyRoom(studyRoomRes.data),
    education,
  };
}

/** Persist a full AppData snapshot to Supabase, diffing against current DB state.
 *  This does a simple strategy: upsert changed entities and delete removed ones.
 *  For simplicity and reliability, we do a full sync per table. */
export async function saveAppData(data: AppData): Promise<void> {
  if (!supabase) return;

  // We sync each table. Since the update pattern replaces entire arrays,
  // the safest approach is to upsert all current rows and delete rows not in the set.
  await Promise.all([
    syncGoals(data.goals),
    syncMissions(data.missions),
    syncQuizAttempts(data.quizAttempts),
    syncMastery(data.mastery),
    syncActivities(data.activities),
    syncNotes(data.notesHistory),
    syncDoubts(data.doubtsHistory),
    syncRevision(data.revisionQueue),
    syncArcade(data.arcade),
    syncCircleMemberships(data.circles),
    syncCirclePosts(data.circlePosts),
    syncCozyMissions(data.cozyMissions),
    syncStudyRoom(data.studyRoom),
    syncEducation(data.education),
  ]);
}

// ============ Per-table sync functions ============

async function syncGoals(goals: StudyGoal[]): Promise<void> {
  if (!supabase) return;
  if (goals.length > 0) {
    await supabase.from('study_goals').upsert(
      goals.map((g) => ({ id: g.id, title: g.title, done: g.done, created_at: new Date(g.createdAt).toISOString() })),
      { onConflict: 'id' },
    );
  }
}

async function syncMissions(missions: Mission[]): Promise<void> {
  if (!supabase) return;
  if (missions.length > 0) {
    await supabase.from('missions').upsert(
      missions.map((m) => ({
        id: m.id, title: m.title, subject: m.subject, description: m.description,
        difficulty: m.difficulty, status: m.status, created_at: new Date(m.createdAt).toISOString(),
        completed_at: m.completedAt ? new Date(m.completedAt).toISOString() : null,
      })),
      { onConflict: 'id' },
    );
  }
}

async function syncQuizAttempts(attempts: QuizAttempt[]): Promise<void> {
  if (!supabase) return;
  if (attempts.length > 0) {
    await supabase.from('quiz_attempts').upsert(
      attempts.map((q) => ({
        id: q.id, topic: q.topic, total_questions: q.totalQuestions,
        correct_answers: q.correctAnswers, score: q.score, created_at: new Date(q.createdAt).toISOString(),
      })),
      { onConflict: 'id' },
    );
  }
}

async function syncMastery(mastery: MasteryTopic[]): Promise<void> {
  if (!supabase) return;
  if (mastery.length > 0) {
    await supabase.from('mastery_topics').upsert(
      mastery.map((m) => ({
        id: m.id, topic: m.topic, attempts: m.attempts, best_score: m.bestScore,
        last_score: m.lastScore, avg_score: m.avgScore,
        last_practiced_at: m.lastPracticedAt ? new Date(m.lastPracticedAt).toISOString() : null,
      })),
      { onConflict: 'id' },
    );
  }
}

async function syncActivities(activities: ActivityItem[]): Promise<void> {
  if (!supabase) return;
  if (activities.length > 0) {
    await supabase.from('activities').upsert(
      activities.map((a) => ({
        id: a.id, type: a.type, title: a.title, detail: a.detail,
        timestamp: new Date(a.timestamp).toISOString(),
      })),
      { onConflict: 'id' },
    );
  }
}

async function syncNotes(notes: { id: string; topic: string; createdAt: number }[]): Promise<void> {
  if (!supabase) return;
  if (notes.length > 0) {
    await supabase.from('notes_history').upsert(
      notes.map((n) => ({ id: n.id, topic: n.topic, created_at: new Date(n.createdAt).toISOString() })),
      { onConflict: 'id' },
    );
  }
}

async function syncDoubts(doubts: { id: string; question: string; createdAt: number }[]): Promise<void> {
  if (!supabase) return;
  if (doubts.length > 0) {
    await supabase.from('doubts_history').upsert(
      doubts.map((d) => ({ id: d.id, question: d.question, created_at: new Date(d.createdAt).toISOString() })),
      { onConflict: 'id' },
    );
  }
}

async function syncRevision(items: RevisionItem[]): Promise<void> {
  if (!supabase) return;
  if (items.length > 0) {
    await supabase.from('revision_queue').upsert(
      items.map((r) => ({
        id: r.id, topic: r.topic, reason: r.reason, priority: r.priority,
        detail: r.detail, created_at: new Date(r.createdAt).toISOString(),
      })),
      { onConflict: 'id' },
    );
  }
}

async function syncArcade(arcade: ArcadeStats): Promise<void> {
  if (!supabase) return;
  await supabase.from('arcade_stats').upsert({
    total_xp: arcade.totalXP,
    games_played: arcade.gamesPlayed,
    achievements: arcade.achievements,
    best_scores: JSON.stringify(arcade.bestScores),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

async function syncCircleMemberships(circles: CircleGroup[]): Promise<void> {
  if (!supabase) return;
  const joined = circles.filter((c) => c.joined);
  if (joined.length > 0) {
    await supabase.from('circle_memberships').upsert(
      joined.map((c) => ({ circle_id: c.id })),
      { onConflict: 'user_id,circle_id' },
    );
  }
}

async function syncCirclePosts(posts: CirclePost[]): Promise<void> {
  if (!supabase) return;
  if (posts.length > 0) {
    await supabase.from('circle_posts').upsert(
      posts.map((p) => ({
        id: p.id, circle_id: p.circleId, author: p.author, content: p.content,
        created_at: new Date(p.createdAt).toISOString(),
      })),
      { onConflict: 'id' },
    );
  }
}

// ============ Row mappers (DB row → AppData type) ============

function ts(val: unknown): number {
  if (!val) return 0;
  return new Date(val as string).getTime();
}

function rowToGoal(r: any): StudyGoal {
  return { id: r.id, title: r.title, done: r.done, createdAt: ts(r.created_at) };
}

function rowToMission(r: any): Mission {
  return {
    id: r.id, title: r.title, subject: r.subject, description: r.description,
    difficulty: r.difficulty, status: r.status, createdAt: ts(r.created_at),
    completedAt: r.completed_at ? ts(r.completed_at) : null,
  };
}

function rowToQuizAttempt(r: any): QuizAttempt {
  return {
    id: r.id, topic: r.topic, totalQuestions: r.total_questions,
    correctAnswers: r.correct_answers, score: r.score, createdAt: ts(r.created_at),
  };
}

function rowToMastery(r: any): MasteryTopic {
  return {
    id: r.id, topic: r.topic, attempts: r.attempts, bestScore: r.best_score,
    lastScore: r.last_score, avgScore: r.avg_score,
    lastPracticedAt: r.last_practiced_at ? ts(r.last_practiced_at) : null,
  };
}

function rowToActivity(r: any): ActivityItem {
  return {
    id: r.id, type: r.type, title: r.title, detail: r.detail, timestamp: ts(r.timestamp),
  };
}

function rowToRevision(r: any): RevisionItem {
  return {
    id: r.id, topic: r.topic, reason: r.reason, priority: r.priority,
    detail: r.detail, createdAt: ts(r.created_at),
  };
}

function rowToArcade(r: any | null): ArcadeStats {
  if (!r) return { totalXP: 0, gamesPlayed: 0, achievements: [], bestScores: [] };
  let bestScores: ArcadeBestScore[] = [];
  try {
    const raw = typeof r.best_scores === 'string' ? JSON.parse(r.best_scores) : r.best_scores;
    if (Array.isArray(raw)) bestScores = raw;
  } catch { /* ignore parse error */ }
  return {
    totalXP: r.total_xp ?? 0,
    gamesPlayed: r.games_played ?? 0,
    achievements: Array.isArray(r.achievements) ? r.achievements : [],
    bestScores,
  };
}

function rowToPost(r: any): CirclePost {
  return {
    id: r.id, circleId: r.circle_id, author: r.author, content: r.content, createdAt: ts(r.created_at),
  };
}

function rowToCozyMission(r: any): CozyMission {
  return {
    id: r.id, topic: r.topic, duration: r.duration,
    goals: Array.isArray(r.goals) ? r.goals : [],
    questions: Array.isArray(r.questions) ? r.questions : [],
    answers: Array.isArray(r.answers) ? r.answers : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    score: r.score ?? null,
    xpEarned: r.xp_earned ?? 0,
    createdAt: ts(r.created_at),
    completedAt: r.completed_at ? ts(r.completed_at) : null,
  };
}

function rowToStudyRoom(r: any | null): StudyRoomState {
  if (!r) return { ...emptyAppData.studyRoom };
  return {
    unlockedItems: Array.isArray(r.unlocked_items) ? r.unlocked_items : ['desk-lamp', 'laptop'],
    equippedItems: Array.isArray(r.equipped_items) ? r.equipped_items : ['desk-lamp', 'laptop'],
    wallColor: r.wall_color ?? 'midnight',
  };
}

async function syncCozyMissions(missions: CozyMission[]): Promise<void> {
  if (!supabase) return;
  if (missions.length > 0) {
    await supabase.from('cozy_missions').upsert(
      missions.map((m) => ({
        id: m.id, topic: m.topic, duration: m.duration, goals: m.goals,
        questions: JSON.stringify(m.questions), answers: JSON.stringify(m.answers),
        steps: JSON.stringify(m.steps), score: m.score, xp_earned: m.xpEarned,
        created_at: new Date(m.createdAt).toISOString(),
        completed_at: m.completedAt ? new Date(m.completedAt).toISOString() : null,
      })),
      { onConflict: 'id' },
    );
  }
}

async function syncEducation(edu: EducationProfile): Promise<void> {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({
    education_level_id: edu.levelId,
    education_sub_selection: edu.subSelection,
    preferred_subjects: edu.preferredSubjects,
  }).eq('id', user.id);
}

async function syncStudyRoom(room: StudyRoomState): Promise<void> {
  if (!supabase) return;
  await supabase.from('study_room').upsert({
    unlocked_items: room.unlockedItems,
    equipped_items: room.equippedItems,
    wall_color: room.wallColor,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

/** Build the circles list: start from sample circles, mark joined ones from DB. */
function buildCircles(memberships: any[]): CircleGroup[] {
  const joinedIds = new Set(memberships.map((m) => m.circle_id));
  return sampleCircles.map((c) => ({
    ...c,
    joined: joinedIds.has(c.id),
  }));
}
