export type AIResponse = {
  content: string;
  isDemo: boolean;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  isDemo?: boolean;
  timestamp: number;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Quiz = {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: number;
};

export type QuizAttempt = {
  id: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  createdAt: number;
};

export type ExamPlan = {
  subject: string;
  unit: string;
  studyTime: string;
  schedule: StudyBlock[];
  createdAt: number;
};

export type StudyBlock = {
  day: string;
  timeSlot: string;
  topic: string;
  activity: string;
  priority: 'High' | 'Medium' | 'Low';
};

export type StudyGoal = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

export type ActivityItem = {
  id: string;
  type: 'doubt' | 'notes' | 'quiz' | 'exam' | 'chat' | 'mission' | 'circle' | 'arcade';
  title: string;
  detail: string;
  timestamp: number;
};

// ============ LearnLoop New Types ============

export type Mission = {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'active' | 'completed';
  createdAt: number;
  completedAt: number | null;
};

export type MasteryTopic = {
  id: string;
  topic: string;
  attempts: number;
  bestScore: number;
  lastScore: number;
  avgScore: number;
  lastPracticedAt: number | null;
};

export type CircleGroup = {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  joined: boolean;
};

export type CirclePost = {
  id: string;
  circleId: string;
  author: string;
  content: string;
  createdAt: number;
};

export type RevisionItem = {
  id: string;
  topic: string;
  reason: 'weak-score' | 'deadline-approaching' | 'not-practiced';
  priority: number;
  detail: string;
  createdAt: number;
};

export type ArcadeBestScore = {
  game: string;
  score: number;
  updatedAt: number;
};

export type ArcadeStats = {
  totalXP: number;
  gamesPlayed: number;
  achievements: string[];
  bestScores: ArcadeBestScore[];
};

export type CozyMissionStep = {
  type: 'learn' | 'practice' | 'review';
  label: string;
  done: boolean;
};

export type CozyMission = {
  id: string;
  topic: string;
  duration: number;
  goals: string[];
  questions: QuizQuestion[];
  answers: (number | null)[];
  steps: CozyMissionStep[];
  score: number | null;
  xpEarned: number;
  createdAt: number;
  completedAt: number | null;
};

export type RoomItemDef = {
  id: string;
  name: string;
  category: 'furniture' | 'decoration' | 'plant' | 'poster' | 'accessory';
  xpCost: number;
  description: string;
  emoji: string;
};

export type StudyRoomState = {
  unlockedItems: string[];
  equippedItems: string[];
  wallColor: string;
};

// ============ Education Level System ============

export type EduLevelCategory = 'school' | 'college';

export type EducationLevel = {
  /** Unique identifier, e.g. 'class-10', 'eng-first-year', 'mbbs' */
  id: string;
  category: EduLevelCategory;
  label: string;
  /** Parent group label for display, e.g. "School", "College" */
  group: string;
  /** Whether a sub-selection (branch/year) is required */
  subType?: 'engineering-branch' | 'mbbs-year';
  /** Subjects available at this level (static list) */
  subjects: string[];
};

export type EducationProfile = {
  levelId: string | null;
  /** Engineering branch or MBBS year, depending on level.subType */
  subSelection: string | null;
  /** Student's preferred subjects (subset of level subjects) */
  preferredSubjects: string[];
};

export type AppData = {
  quizAttempts: QuizAttempt[];
  activities: ActivityItem[];
  goals: StudyGoal[];
  notesHistory: { id: string; topic: string; createdAt: number }[];
  doubtsHistory: { id: string; question: string; createdAt: number }[];
  missions: Mission[];
  mastery: MasteryTopic[];
  circles: CircleGroup[];
  circlePosts: CirclePost[];
  revisionQueue: RevisionItem[];
  arcade: ArcadeStats;
  cozyMissions: CozyMission[];
  studyRoom: StudyRoomState;
  education: EducationProfile;
};

export type Feature =
  | 'doubt'
  | 'notes'
  | 'quiz'
  | 'exam'
  | 'chat'
  | 'dashboard'
  | 'missions'
  | 'mastery'
  | 'circles'
  | 'revision'
  | 'arcade'
  | 'cozy-missions'
  | 'study-room';

export const sampleCircles: CircleGroup[] = [
  {
    id: 'circle-ds',
    name: 'Data Structures Deep Dive',
    description: 'Master arrays, linked lists, trees, and graphs together. Weekly problem sets and discussions.',
    members: 142,
    category: 'Computer Science',
    joined: false,
  },
  {
    id: 'circle-electronics',
    name: 'Circuit Analysis Crew',
    description: 'From Ohm\'s Law to Kirchhoff\'s Laws — solve circuit problems and share exam tips.',
    members: 89,
    category: 'Electronics',
    joined: false,
  },
  {
    id: 'circle-mechanics',
    name: 'Engineering Mechanics Lab',
    description: 'Statics, dynamics, and strength of materials. Work through real-world examples as a group.',
    members: 76,
    category: 'Physics',
    joined: false,
  },
  {
    id: 'circle-math',
    name: 'Math Mastery Circle',
    description: 'Calculus, linear algebra, and differential equations. No question is too basic here.',
    members: 203,
    category: 'Mathematics',
    joined: false,
  },
];

export const ROOM_ITEMS: RoomItemDef[] = [
  { id: 'desk-lamp', name: 'Warm Desk Lamp', category: 'furniture', xpCost: 0, description: 'A cozy warm lamp to light your study sessions.', emoji: 'lamp' },
  { id: 'laptop', name: 'Study Laptop', category: 'furniture', xpCost: 0, description: 'Your trusty laptop for all learning adventures.', emoji: 'laptop' },
  { id: 'stack-books', name: 'Stack of Books', category: 'furniture', xpCost: 50, description: 'A neat pile of well-loved textbooks.', emoji: 'books' },
  { id: 'potted-plant', name: 'Leafy Potted Plant', category: 'plant', xpCost: 80, description: 'A little green friend to keep you company.', emoji: 'plant' },
  { id: 'wall-poster', name: 'Motivation Poster', category: 'poster', xpCost: 120, description: 'An inspiring quote to keep you going.', emoji: 'poster' },
  { id: 'string-lights', name: 'Fairy String Lights', category: 'decoration', xpCost: 150, description: 'Soft glowing lights for a magical evening vibe.', emoji: 'lights' },
  { id: 'rug', name: 'Cozy Floor Rug', category: 'furniture', xpCost: 200, description: 'A soft rug that ties the room together.', emoji: 'rug' },
  { id: 'cat-plush', name: 'Sleepy Cat Plush', category: 'accessory', xpCost: 250, description: 'A cuddly companion for late-night study.', emoji: 'cat' },
  { id: 'rain-window', name: 'Rain Window Scene', category: 'decoration', xpCost: 300, description: 'Gentle rain streaks on your window pane.', emoji: 'rain' },
  { id: 'star-poster', name: 'Starry Night Poster', category: 'poster', xpCost: 350, description: 'A beautiful starry sky to dream under.', emoji: 'stars' },
  { id: 'tea-mug', name: 'Warm Tea Mug', category: 'accessory', xpCost: 400, description: 'A steaming mug of tea for cozy breaks.', emoji: 'tea' },
  { id: 'bookshelf', name: 'Tall Bookshelf', category: 'furniture', xpCost: 500, description: 'A full bookshelf displaying your knowledge.', emoji: 'shelf' },
];

export const WALL_COLORS = [
  { id: 'midnight', name: 'Midnight Navy', hex: '#0B1020' },
  { id: 'deep-violet', name: 'Deep Violet', hex: '#1A1530' },
  { id: 'forest-dark', name: 'Forest Dark', hex: '#0F1A18' },
  { id: 'twilight', name: 'Twilight Blue', hex: '#0D1428' },
];

export const emptyAppData: AppData = {
  quizAttempts: [],
  activities: [],
  goals: [],
  notesHistory: [],
  doubtsHistory: [],
  missions: [],
  mastery: [],
  circles: sampleCircles,
  circlePosts: [],
  revisionQueue: [],
  arcade: { totalXP: 0, gamesPlayed: 0, achievements: [], bestScores: [] },
  cozyMissions: [],
  studyRoom: { unlockedItems: ['desk-lamp', 'laptop'], equippedItems: ['desk-lamp', 'laptop'], wallColor: 'midnight' },
  education: { levelId: null, subSelection: null, preferredSubjects: [] },
};
