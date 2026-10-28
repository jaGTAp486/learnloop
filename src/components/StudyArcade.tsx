import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2, Swords, Brain, Shuffle, Timer, Trophy, Star, Zap,
  RotateCcw, ChevronRight, CheckCircle2, XCircle, Flame, Award,
  Lightbulb, ArrowLeft, Sparkles, Crown,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import type { AppData, ArcadeStats } from '@/types';

type ArcadeProps = {
  data: AppData;
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

// ============ Question Bank (curated sample content) ============

type MCQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

type ScrambleWord = { word: string; hint: string };

const questionBank: Record<string, MCQuestion[]> = {
  Physics: [
    { q: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 1, explanation: 'Force is measured in Newtons (N), named after Sir Isaac Newton.' },
    { q: 'Which law states that for every action there is an equal and opposite reaction?', options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", 'Law of Gravitation'], correct: 2, explanation: 'The Third Law: action and reaction forces are equal and opposite.' },
    { q: 'What is the acceleration due to gravity on Earth (approx)?', options: ['9.8 m/s²', '8.9 m/s²', '10.8 m/s²', '6.7 m/s²'], correct: 0, explanation: 'Standard gravity is approximately 9.8 m/s².' },
    { q: 'Which of these is a scalar quantity?', options: ['Velocity', 'Acceleration', 'Speed', 'Force'], correct: 2, explanation: 'Speed has magnitude only, no direction — it is a scalar.' },
    { q: 'The kinetic energy of an object is given by which formula?', options: ['KE = mgh', 'KE = ½mv²', 'KE = mc²', 'KE = Fd'], correct: 1, explanation: 'Kinetic energy = ½ × mass × velocity².' },
    { q: 'What does Ohm\'s Law state?', options: ['V = IR', 'V = I/R', 'V = R/I', 'V = I²R'], correct: 0, explanation: 'Voltage = Current × Resistance.' },
    { q: 'Which type of wave is light?', options: ['Longitudinal', 'Transverse', 'Standing', 'Mechanical'], correct: 1, explanation: 'Light is a transverse electromagnetic wave.' },
    { q: 'What is the speed of light in vacuum (approx)?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correct: 0, explanation: 'The speed of light is approximately 3×10⁸ m/s.' },
  ],
  Chemistry: [
    { q: 'What is the chemical symbol for gold?', options: ['Go', 'Au', 'Gd', 'Ag'], correct: 1, explanation: 'Gold\'s symbol is Au, from the Latin "aurum".' },
    { q: 'How many protons does a carbon atom have?', options: ['4', '6', '8', '12'], correct: 1, explanation: 'Carbon has atomic number 6, meaning 6 protons.' },
    { q: 'What is the pH of a neutral solution?', options: ['0', '7', '14', '1'], correct: 1, explanation: 'A pH of 7 is neutral (pure water at 25°C).' },
    { q: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correct: 2, explanation: 'Nitrogen makes up about 78% of the atmosphere.' },
    { q: 'What type of bond involves sharing electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correct: 1, explanation: 'Covalent bonds form when atoms share electrons.' },
    { q: 'What is the formula for water?', options: ['H₂O₂', 'HO₂', 'H₂O', 'OH'], correct: 2, explanation: 'Water is H₂O — two hydrogen atoms and one oxygen.' },
    { q: 'Which is the lightest element?', options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'], correct: 1, explanation: 'Hydrogen is the lightest element with atomic number 1.' },
    { q: 'What is Avogadro\'s number?', options: ['6.022×10²³', '3.14×10⁸', '9.8×10⁰', '1.6×10⁻¹⁹'], correct: 0, explanation: 'Avogadro\'s number is 6.022×10²³ particles per mole.' },
  ],
  Mathematics: [
    { q: 'What is the derivative of x²?', options: ['x', '2x', 'x³', '2'], correct: 1, explanation: 'd/dx(x²) = 2x by the power rule.' },
    { q: 'What is the value of π (pi) approximately?', options: ['2.14', '3.14', '4.14', '1.41'], correct: 1, explanation: 'π ≈ 3.14159...' },
    { q: 'What is the area of a circle with radius r?', options: ['2πr', 'πr²', 'πd', 'πr'], correct: 1, explanation: 'Area of a circle = π × radius².' },
    { q: 'What is sin(90°)?', options: ['0', '0.5', '1', '∞'], correct: 2, explanation: 'sin(90°) = 1.' },
    { q: 'What is the integral of 1/x?', options: ['x', 'ln|x| + C', '1/x²', 'e^x'], correct: 1, explanation: '∫(1/x)dx = ln|x| + C.' },
    { q: 'In a right triangle, which theorem relates the sides?', options: ['Pythagorean theorem', 'Newton\'s theorem', 'Euler\'s formula', 'Bayes\' theorem'], correct: 0, explanation: 'The Pythagorean theorem: a² + b² = c².' },
    { q: 'What is 7 × 8?', options: ['54', '56', '58', '64'], correct: 1, explanation: '7 × 8 = 56.' },
    { q: 'What is the square root of 144?', options: ['10', '11', '12', '14'], correct: 2, explanation: '√144 = 12.' },
  ],
  'General Knowledge': [
    { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1, explanation: 'Mars is called the Red Planet due to iron oxide on its surface.' },
    { q: 'Who wrote the play "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correct: 1, explanation: 'Shakespeare wrote Romeo and Juliet in the late 1500s.' },
    { q: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, explanation: 'The Pacific Ocean is the largest, covering about 63 million sq miles.' },
    { q: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2, explanation: 'There are 7 continents: Africa, Antarctica, Asia, Australia, Europe, North America, South America.' },
    { q: 'What is the capital of Japan?', options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'], correct: 2, explanation: 'Tokyo is the capital of Japan.' },
    { q: 'Which language has the most native speakers?', options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'], correct: 2, explanation: 'Mandarin Chinese has the most native speakers globally.' },
    { q: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, explanation: 'WWII ended in 1945.' },
    { q: 'What is the tallest mountain on Earth?', options: ['K2', 'Mount Everest', 'Kilimanjaro', 'Denali'], correct: 1, explanation: 'Mount Everest stands at 8,849 meters.' },
  ],
};

const scrambleWords: ScrambleWord[] = [
  { word: 'PHOTOSYNTHESIS', hint: 'Process by which plants make food from sunlight' },
  { word: 'GRAVITY', hint: 'Force that pulls objects toward each other' },
  { word: 'MITOCHONDRIA', hint: 'Powerhouse of the cell' },
  { word: 'ALGEBRA', hint: 'Branch of math using letters for numbers' },
  { word: 'VELOCITY', hint: 'Speed in a given direction' },
  { word: 'ENTROPY', hint: 'Measure of disorder in a system' },
  { word: 'INERTIA', hint: 'Resistance to change in motion' },
  { word: 'CATALYST', hint: 'Substance that speeds up a reaction without being consumed' },
  { word: 'PYTHAGORAS', hint: 'Greek mathematician known for a famous theorem' },
  { word: 'EQUILIBRIUM', hint: 'State of balance between opposing forces' },
];

const subjects = Object.keys(questionBank);

// ============ Achievements ============

type Achievement = { id: string; label: string; desc: string; icon: typeof Trophy };

const achievements: Achievement[] = [
  { id: 'first-win', label: 'First Win', desc: 'Complete your first arcade game', icon: Trophy },
  { id: 'perfect-round', label: 'Perfect Round', desc: 'Score 100% in Quiz Battle', icon: Crown },
  { id: '100-xp', label: '100 XP', desc: 'Earn 100 total XP', icon: Star },
  { id: '500-xp', label: '500 XP', desc: 'Earn 500 total XP', icon: Sparkles },
  { id: 'speed-demon', label: 'Speed Demon', desc: 'Complete a Speed Challenge', icon: Zap },
  { id: 'memory-master', label: 'Memory Master', desc: 'Complete Memory Match', icon: Brain },
];

// ============ Helper functions ============

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrambleLetters(word: string): string {
  const letters = word.split('');
  let scrambled = letters;
  do {
    scrambled = shuffle(letters);
  } while (scrambled.join('') === word && word.length > 2);
  return scrambled.join('');
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============ Main Component ============

type GameView = 'menu' | 'quiz-battle' | 'memory-match' | 'word-scramble' | 'speed-challenge';

export default function StudyArcade({ data, onUpdate }: ArcadeProps) {
  const [game, setGame] = useState<GameView>('menu');
  const arcade = data.arcade ?? { totalXP: 0, gamesPlayed: 0, achievements: [], bestScores: [] };

  const recordResult = useCallback((gameName: string, score: number, xp: number, perfect: boolean) => {
    onUpdate((d) => {
      const prev = d.arcade ?? { totalXP: 0, gamesPlayed: 0, achievements: [], bestScores: [] };
      const existingBest = prev.bestScores.find((b) => b.game === gameName);
      const newBest = existingBest ? Math.max(existingBest.score, score) : score;
      const bestScores = existingBest
        ? prev.bestScores.map((b) => b.game === gameName ? { ...b, score: newBest, updatedAt: Date.now() } : b)
        : [...prev.bestScores, { game: gameName, score: newBest, updatedAt: Date.now() }];

      let achievementsList = [...prev.achievements];
      const addAch = (id: string) => { if (!achievementsList.includes(id)) achievementsList.push(id); };
      addAch('first-win');
      if (perfect) addAch('perfect-round');
      if (prev.totalXP + xp >= 100) addAch('100-xp');
      if (prev.totalXP + xp >= 500) addAch('500-xp');
      if (gameName === 'Speed Challenge') addAch('speed-demon');
      if (gameName === 'Memory Match') addAch('memory-master');

      return {
        ...d,
        arcade: {
          totalXP: prev.totalXP + xp,
          gamesPlayed: prev.gamesPlayed + 1,
          achievements: achievementsList,
          bestScores,
        },
        activities: [
          { id: crypto.randomUUID(), type: 'arcade' as const, title: `${gameName}: ${score} pts`, detail: `+${xp} XP`, timestamp: Date.now() },
          ...d.activities,
        ].slice(0, 50),
      };
    });
  }, [onUpdate]);

  const gameProps = { onBack: () => setGame('menu'), onResult: recordResult, arcade };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Study Arcade"
        subtitle="Play games, earn XP, and unlock achievements while mastering academic concepts."
        icon={<Gamepad2 className="w-5 h-5" />}
      />

      {game === 'menu' && <GameMenu arcade={arcade} onSelect={setGame} />}
      {game === 'quiz-battle' && <QuizBattle {...gameProps} />}
      {game === 'memory-match' && <MemoryMatch {...gameProps} />}
      {game === 'word-scramble' && <WordScramble {...gameProps} />}
      {game === 'speed-challenge' && <SpeedChallenge {...gameProps} />}

      {game === 'menu' && (
        <div className="mt-6 rounded-xl bg-navy-800/50 border border-navy-600/30 px-4 py-3 text-sm text-navy-300">
          <strong className="text-navy-100">Sample Content:</strong> Question banks are curated educational data — not AI-generated. No real-time multiplayer or paid APIs are used.
        </div>
      )}
    </div>
  );
}

// ============ Game Menu ============

function GameMenu({ arcade, onSelect }: { arcade: ArcadeStats; onSelect: (g: GameView) => void }) {
  const games: { id: GameView; title: string; desc: string; icon: typeof Swords; accent: string }[] = [
    { id: 'quiz-battle', title: 'Quiz Battle', desc: 'Multiple-choice questions with combo streaks and difficulty levels', icon: Swords, accent: 'from-neon-300/15 to-neon-300/5 border-neon-300/20' },
    { id: 'memory-match', title: 'Memory Match', desc: 'Match academic terms to their definitions from memory', icon: Brain, accent: 'from-purple-300/15 to-purple-300/5 border-purple-300/20' },
    { id: 'word-scramble', title: 'Word Scramble', desc: 'Rearrange letters to identify academic terms with hints', icon: Shuffle, accent: 'from-teal-400/15 to-teal-400/5 border-teal-400/20' },
    { id: 'speed-challenge', title: 'Speed Challenge', desc: 'Timed rapid-fire questions — how many can you answer correctly?', icon: Timer, accent: 'from-amber-400/15 to-amber-400/5 border-amber-400/20' },
  ];

  const earnedAch = achievements.filter((a) => arcade.achievements.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <Star className="w-6 h-6 text-neon-300 mx-auto mb-1" />
          <div className="text-2xl font-bold text-navy-50">{arcade.totalXP}</div>
          <div className="text-xs text-navy-300">Total XP</div>
        </div>
        <div className="card p-4 text-center">
          <Gamepad2 className="w-6 h-6 text-purple-300 mx-auto mb-1" />
          <div className="text-2xl font-bold text-navy-50">{arcade.gamesPlayed}</div>
          <div className="text-xs text-navy-300">Games Played</div>
        </div>
        <div className="card p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-navy-50">{earnedAch.length}/{achievements.length}</div>
          <div className="text-xs text-navy-300">Achievements</div>
        </div>
      </div>

      {/* Best scores */}
      {arcade.bestScores.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-neon-300" />
            <h3 className="font-semibold text-navy-50 text-sm">Best Scores</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {arcade.bestScores.map((b) => (
              <div key={b.game} className="flex items-center justify-between px-3 py-2 rounded-lg bg-navy-900">
                <span className="text-sm text-navy-100">{b.game}</span>
                <span className="text-sm font-bold text-neon-300">{b.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`card p-5 text-left bg-gradient-to-br ${g.accent} hover:-translate-y-0.5 transition-all group`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy-800 border border-navy-600/40 flex items-center justify-center flex-shrink-0">
                <g.icon className="w-6 h-6 text-neon-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-navy-50 mb-1 group-hover:text-neon-300 transition-colors">{g.title}</h3>
                <p className="text-sm text-navy-200">{g.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-neon-300 mt-2 font-medium">
                  Play now <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h3 className="font-display text-lg font-bold text-navy-50 mb-3">Achievements</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((a) => {
            const earned = arcade.achievements.includes(a.id);
            return (
              <div key={a.id} className={`card p-4 flex items-center gap-3 ${earned ? 'border-neon-300/30' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${earned ? 'bg-neon-300/10 text-neon-300' : 'bg-navy-900 text-navy-400'}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-50">{a.label}</div>
                  <div className="text-xs text-navy-300">{a.desc}</div>
                </div>
                {earned && <CheckCircle2 className="w-4 h-4 text-teal-400 ml-auto flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ Game Result Screen ============

function GameResult({ title, score, xp, perfect, onBack, onReplay }: { title: string; score: number; xp: number; perfect: boolean; onBack: () => void; onReplay: () => void }) {
  return (
    <div className="card p-8 text-center">
      <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${perfect ? 'bg-teal-400/10 text-teal-400' : 'bg-neon-300/10 text-neon-300'}`}>
        {perfect ? <Crown className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
      </div>
      <h2 className="font-display text-2xl font-bold text-navy-50">{title}</h2>
      <p className="text-navy-200 mt-1">You scored <span className="text-neon-300 font-bold">{score}</span> points</p>
      <p className="text-sm text-purple-300 mt-1">+{xp} XP earned</p>
      {perfect && <p className="text-sm text-teal-300 mt-2 font-semibold">Perfect round!</p>}
      <div className="flex gap-3 justify-center mt-5">
        <button onClick={onReplay} className="btn-primary">
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Arcade
        </button>
      </div>
    </div>
  );
}

// ============ 1. Quiz Battle ============

type QuizBattleProps = { onBack: () => void; onResult: (g: string, s: number, xp: number, p: boolean) => void; arcade: ArcadeStats };

function QuizBattle({ onBack, onResult }: QuizBattleProps) {
  const [subject, setSubject] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [phase, setPhase] = useState<'setup' | 'playing' | 'results'>('setup');
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const qCount = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 7 : 8;
  const timePerQ = difficulty === 'Easy' ? 20 : difficulty === 'Medium' ? 15 : 10;

  const startGame = () => {
    if (!subject) return;
    const pool = questionBank[subject];
    const picked = shuffle(pool).slice(0, Math.min(qCount, pool.length));
    setQuestions(picked);
    setCurrent(0);
    setSelected(null);
    setShowFeedback(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTimeLeft(timePerQ);
    setPhase('playing');
    setRecorded(false);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, current]);

  const handleAnswer = (idx: number | null) => {
    if (showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(idx);
    setShowFeedback(true);
    const q = questions[current];
    const isCorrect = idx !== null && idx === q.correct;
    if (isCorrect) {
      const newCombo = combo + 1;
      const comboBonus = Math.min(newCombo * 5, 25);
      const points = 10 + comboBonus + timeLeft;
      setScore((s) => s + points);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setCorrectCount((c) => c + 1);
    } else {
      setCombo(0);
    }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
      setTimeLeft(timePerQ);
    } else {
      setPhase('results');
    }
  };

  // Record result once
  useEffect(() => {
    if (phase === 'results' && !recorded) {
      setRecorded(true);
      const perfect = correctCount === questions.length && questions.length > 0;
      const xp = score;
      onResult('Quiz Battle', score, xp, perfect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const replay = () => { setPhase('setup'); setSubject(null); };

  // ---- Setup screen ----
  if (phase === 'setup') {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back to Arcade</button>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Swords className="w-6 h-6 text-neon-300" />
            <h2 className="font-display text-xl font-bold text-navy-50">Quiz Battle Setup</h2>
          </div>
          <label className="label-text">Choose Subject</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {subjects.map((s) => (
              <button key={s} onClick={() => setSubject(s)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${subject === s ? 'bg-neon-300/10 text-neon-300 border-neon-300/30' : 'bg-navy-900 text-navy-200 border-navy-600/40 hover:border-navy-500'}`}>
                {s}
              </button>
            ))}
          </div>
          <label className="label-text">Difficulty</label>
          <div className="flex gap-2 mb-5">
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${difficulty === d ? 'bg-purple-300/10 text-purple-300 border-purple-300/30' : 'bg-navy-900 text-navy-200 border-navy-600/40 hover:border-navy-500'}`}>
                {d} <span className="text-xs opacity-60">({d === 'Easy' ? '5Q/20s' : d === 'Medium' ? '7Q/15s' : '8Q/10s'})</span>
              </button>
            ))}
          </div>
          <button onClick={startGame} disabled={!subject} className="btn-primary">
            <Swords className="w-4 h-4" /> Start Battle
          </button>
        </div>
      </div>
    );
  }

  // ---- Results screen ----
  if (phase === 'results') {
    const perfect = correctCount === questions.length;
    return (
      <div>
        <GameResult title="Quiz Battle Complete!" score={score} xp={score} perfect={perfect} onBack={onBack} onReplay={replay} />
        <div className="card p-5 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xl font-bold text-navy-50">{correctCount}/{questions.length}</div><div className="text-xs text-navy-300">Correct</div></div>
            <div><div className="text-xl font-bold text-neon-300 flex items-center justify-center gap-1"><Flame className="w-4 h-4" /> {maxCombo}</div><div className="text-xs text-navy-300">Max Combo</div></div>
            <div><div className="text-xl font-bold text-navy-50">{score}</div><div className="text-xs text-navy-300">Total Score</div></div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Playing screen ----
  const q = questions[current];
  if (!q) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Quit</button>
        <div className="flex items-center gap-4">
          {combo > 1 && <span className="flex items-center gap-1 text-sm font-bold text-amber-400"><Flame className="w-4 h-4" /> {combo}x combo</span>}
          <span className="text-sm font-bold text-neon-300">{score} pts</span>
        </div>
      </div>

      {/* Timer + progress */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-sm font-bold flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-400' : 'text-navy-200'}`}><Timer className="w-4 h-4" /> {timeLeft}s</span>
        <div className="flex-1 h-2 bg-navy-900 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400' : 'bg-neon-400'}`} style={{ width: `${(timeLeft / timePerQ) * 100}%` }} />
        </div>
        <span className="text-xs text-navy-300">{current + 1}/{questions.length}</span>
      </div>

      <div className="card p-5 sm:p-6 mb-4">
        <div className="text-xs text-purple-300 mb-2">{subject} · {difficulty}</div>
        <h3 className="text-base font-semibold text-navy-50 mb-4">{current + 1}. {q.q}</h3>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = i === selected;
            let cls = 'border-navy-600 hover:border-neon-300/50 hover:bg-navy-900 text-navy-100';
            if (showFeedback && isCorrect) cls = 'border-teal-400 bg-teal-400/10 text-teal-300';
            else if (showFeedback && isPicked && !isCorrect) cls = 'border-red-400 bg-red-500/10 text-red-300';
            else if (showFeedback) cls = 'border-navy-600 text-navy-300 opacity-60';
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={showFeedback}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${cls}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-navy-700 text-navy-200 flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                  <span className="text-sm">{opt}</span>
                  {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-teal-400 ml-auto" />}
                  {showFeedback && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className="card p-4 mb-4">
          <div className={`flex items-start gap-2 text-sm ${selected === q.correct ? 'text-teal-300' : 'text-amber-300'}`}>
            {selected === q.correct ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
            <div>
              <p className="font-semibold mb-1">{selected === q.correct ? 'Correct!' : selected === null ? 'Time\'s up!' : 'Incorrect'}</p>
              <p className="text-navy-200">{q.explanation}</p>
            </div>
          </div>
          <button onClick={nextQuestion} className="btn-primary mt-3">
            {current < questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============ 2. Memory Match ============

type Card = { id: number; pairId: number; text: string; matched: boolean };

const memoryPairs: { term: string; def: string }[] = [
  { term: 'Newton', def: 'Unit of force' },
  { term: 'Photosynthesis', def: 'Plants make food' },
  { term: 'H₂O', def: 'Water molecule' },
  { term: 'Mitochondria', def: 'Cell powerhouse' },
  { term: 'π (pi)', def: '≈ 3.14159' },
  { term: 'Entropy', def: 'Measure of disorder' },
];

type MemoryMatchProps = { onBack: () => void; onResult: (g: string, s: number, xp: number, p: boolean) => void; arcade: ArcadeStats };

function MemoryMatch({ onBack, onResult }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matched, setMatched] = useState(0);
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'results'>('setup');
  const [recorded, setRecorded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = () => {
    const picked = shuffle(memoryPairs).slice(0, 6);
    const newCards: Card[] = [];
    picked.forEach((p, i) => {
      newCards.push({ id: i * 2, pairId: i, text: p.term, matched: false });
      newCards.push({ id: i * 2 + 1, pairId: i, text: p.def, matched: false });
    });
    setCards(shuffle(newCards));
    setFlipped([]);
    setAttempts(0);
    setMatched(0);
    setTime(0);
    setPhase('playing');
    setRecorded(false);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (matched > 0 && matched === memoryPairs.length / 1) {
      // 6 pairs = 12 cards, matched counts pairs
    }
  }, [matched]);

  const flipCard = (id: number) => {
    if (flipped.length === 2) return;
    if (flipped.includes(id)) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts((a) => a + 1);
      const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);
      if (a.pairId === b.pairId) {
        setCards((prev) => prev.map((c) => (c.pairId === a.pairId ? { ...c, matched: true } : c)));
        setMatched((m) => m + 1);
        setTimeout(() => setFlipped([]), 600);
      } else {
        setTimeout(() => setFlipped([]), 1200);
      }
    }
  };

  // Check completion
  const totalPairs = cards.length / 2;
  const allMatched = matched >= totalPairs && totalPairs > 0;

  useEffect(() => {
    if (allMatched && phase === 'playing') {
      setPhase('results');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [allMatched, phase]);

  useEffect(() => {
    if (phase === 'results' && !recorded) {
      setRecorded(true);
      const score = Math.max(100, 600 - attempts * 30 - time * 2);
      const perfect = attempts === totalPairs;
      onResult('Memory Match', score, score, perfect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'setup') {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back to Arcade</button>
        <div className="card p-6 text-center">
          <Brain className="w-10 h-10 text-purple-300 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-navy-50 mb-2">Memory Match</h2>
          <p className="text-sm text-navy-200 max-w-md mx-auto mb-5">Flip cards to find matching pairs of academic terms and their definitions. 6 pairs, 12 cards. Fewer attempts = higher score!</p>
          <button onClick={startGame} className="btn-primary"><Brain className="w-4 h-4" /> Start Game</button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const score = Math.max(100, 600 - attempts * 30 - time * 2);
    const perfect = attempts === totalPairs;
    return (
      <div>
        <GameResult title="Memory Match Complete!" score={score} xp={score} perfect={perfect} onBack={onBack} onReplay={startGame} />
        <div className="card p-5 mt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><div className="text-xl font-bold text-navy-50">{attempts}</div><div className="text-xs text-navy-300">Attempts</div></div>
            <div><div className="text-xl font-bold text-navy-50">{fmtTime(time)}</div><div className="text-xs text-navy-300">Time</div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onBack(); }} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Quit</button>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-navy-200">Attempts: <span className="font-bold text-navy-50">{attempts}</span></span>
          <span className="text-navy-200">Time: <span className="font-bold text-neon-300">{fmtTime(time)}</span></span>
          <span className="text-navy-200">Pairs: <span className="font-bold text-teal-300">{matched}/{totalPairs}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <button key={card.id} onClick={() => flipCard(card.id)}
              className={`min-h-[100px] rounded-xl border-2 p-3 text-center transition-all flex items-center justify-center ${card.matched ? 'border-teal-400 bg-teal-400/10' : isFlipped ? 'border-neon-300 bg-navy-800' : 'border-navy-600 bg-navy-900 hover:border-neon-300/40'}`}>
              {isFlipped ? (
                <span className={`text-xs font-medium ${card.matched ? 'text-teal-300' : 'text-navy-50'}`}>{card.text}</span>
              ) : (
                <Brain className="w-6 h-6 text-navy-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ 3. Word Scramble ============

type WordScrambleProps = { onBack: () => void; onResult: (g: string, s: number, xp: number, p: boolean) => void; arcade: ArcadeStats };

function WordScramble({ onBack, onResult }: WordScrambleProps) {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'results'>('setup');
  const [wordList, setWordList] = useState<ScrambleWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [recorded, setRecorded] = useState(false);
  const totalRounds = 5;

  const startGame = () => {
    const picked = shuffle(scrambleWords).slice(0, totalRounds);
    setWordList(picked);
    setCurrentIdx(0);
    setScore(0);
    setSolved(0);
    setPhase('playing');
    setRecorded(false);
    loadWord(picked[0]);
  };

  const loadWord = (w: ScrambleWord) => {
    setScrambled(scrambleLetters(w.word));
    setAnswer('');
    setShowHint(false);
    setUsedHint(false);
    setFeedback(null);
  };

  const checkAnswer = () => {
    const current = wordList[currentIdx];
    if (!current) return;
    if (answer.trim().toUpperCase() === current.word.toUpperCase()) {
      setFeedback('correct');
      const points = usedHint ? 10 : 20;
      setScore((s) => s + points);
      setSolved((s) => s + 1);
      setTimeout(() => nextWord(), 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const nextWord = () => {
    if (currentIdx < wordList.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      loadWord(wordList[nextIdx]);
    } else {
      setPhase('results');
    }
  };

  const skipWord = () => {
    nextWord();
  };

  useEffect(() => {
    if (phase === 'results' && !recorded) {
      setRecorded(true);
      const xp = score;
      const perfect = solved === wordList.length;
      onResult('Word Scramble', score, xp, perfect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'setup') {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back to Arcade</button>
        <div className="card p-6 text-center">
          <Shuffle className="w-10 h-10 text-teal-400 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-navy-50 mb-2">Word Scramble</h2>
          <p className="text-sm text-navy-200 max-w-md mx-auto mb-5">Rearrange the scrambled letters to form an academic term. Use hints if you're stuck — but hints cost points! {totalRounds} rounds.</p>
          <button onClick={startGame} className="btn-primary"><Shuffle className="w-4 h-4" /> Start Game</button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const perfect = solved === wordList.length;
    return (
      <div>
        <GameResult title="Word Scramble Complete!" score={score} xp={score} perfect={perfect} onBack={onBack} onReplay={startGame} />
        <div className="card p-5 mt-4 text-center">
          <div className="text-xl font-bold text-navy-50">{solved}/{wordList.length}</div>
          <div className="text-xs text-navy-300">Words Solved</div>
        </div>
      </div>
    );
  }

  const current = wordList[currentIdx];
  if (!current) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Quit</button>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-navy-200">Word: <span className="font-bold text-navy-50">{currentIdx + 1}/{wordList.length}</span></span>
          <span className="text-navy-200">Score: <span className="font-bold text-neon-300">{score}</span></span>
        </div>
      </div>

      <div className="card p-6 text-center">
        <div className="mb-4">
          <div className="text-xs text-navy-300 mb-2">Rearrange these letters:</div>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {scrambled.split('').map((letter, i) => (
              <span key={i} className="w-9 h-10 rounded-lg bg-navy-700 border border-navy-600 flex items-center justify-center text-lg font-bold text-neon-300">
                {letter}
              </span>
            ))}
          </div>
        </div>

        {showHint && (
          <div className="mb-4 p-3 rounded-xl bg-purple-300/10 border border-purple-300/20">
            <p className="text-sm text-purple-300 flex items-center justify-center gap-2"><Lightbulb className="w-4 h-4" /> {current.hint}</p>
          </div>
        )}

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Type your answer..."
          className={`input-field max-w-xs mx-auto mb-4 text-center font-mono uppercase tracking-wider ${feedback === 'correct' ? 'border-teal-400' : feedback === 'wrong' ? 'border-red-400' : ''}`}
          disabled={feedback === 'correct'}
        />

        {feedback === 'correct' && <p className="text-sm text-teal-300 font-semibold mb-3 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct!</p>}
        {feedback === 'wrong' && <p className="text-sm text-red-400 font-semibold mb-3 flex items-center justify-center gap-1"><XCircle className="w-4 h-4" /> Try again!</p>}

        <div className="flex gap-2 justify-center">
          <button onClick={checkAnswer} disabled={!answer.trim() || feedback === 'correct'} className="btn-primary"><CheckCircle2 className="w-4 h-4" /> Check</button>
          {!showHint && <button onClick={() => { setShowHint(true); setUsedHint(true); }} className="btn-secondary"><Lightbulb className="w-4 h-4" /> Hint (-10pts)</button>}
          <button onClick={skipWord} className="btn-ghost">Skip</button>
        </div>
      </div>
    </div>
  );
}

// ============ 4. Speed Challenge ============

type SpeedChallengeProps = { onBack: () => void; onResult: (g: string, s: number, xp: number, p: boolean) => void; arcade: ArcadeStats };

function SpeedChallenge({ onBack, onResult }: SpeedChallengeProps) {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'results'>('setup');
  const [questions, setQuestions] = useState<MCQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [recorded, setRecorded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTime = 30;

  const startGame = () => {
    const allQs = shuffle([...questionBank.Physics, ...questionBank.Chemistry, ...questionBank.Mathematics, ...questionBank['General Knowledge']]);
    setQuestions(allQs);
    setCurrent(0);
    setSelected(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setTotalCount(0);
    setTimeLeft(totalTime);
    setPhase('playing');
    setRecorded(false);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('results');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setTotalCount((c) => c + 1);
    const q = questions[current];
    if (idx === q.correct) setCorrectCount((c) => c + 1);
    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      setCurrent((c) => (c + 1) % questions.length);
    }, 700);
  };

  useEffect(() => {
    if (phase === 'results' && !recorded) {
      setRecorded(true);
      const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const score = correctCount * 15 + (accuracy >= 80 ? 50 : 0);
      const xp = score;
      const perfect = accuracy === 100 && totalCount >= 5;
      onResult('Speed Challenge', score, xp, perfect);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'setup') {
    return (
      <div>
        <button onClick={onBack} className="btn-ghost mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back to Arcade</button>
        <div className="card p-6 text-center">
          <Timer className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-navy-50 mb-2">Speed Challenge</h2>
          <p className="text-sm text-navy-200 max-w-md mx-auto mb-5">Answer as many mixed-subject questions as you can in {totalTime} seconds. Quick and accurate = high score! Each correct answer = 15 pts. 80%+ accuracy bonus = 50 pts.</p>
          <button onClick={startGame} className="btn-primary"><Timer className="w-4 h-4" /> Start Challenge</button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const score = correctCount * 15 + (accuracy >= 80 ? 50 : 0);
    const perfect = accuracy === 100 && totalCount >= 5;
    return (
      <div>
        <GameResult title="Speed Challenge Complete!" score={score} xp={score} perfect={perfect} onBack={onBack} onReplay={startGame} />
        <div className="card p-5 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xl font-bold text-navy-50">{totalCount}</div><div className="text-xs text-navy-300">Answered</div></div>
            <div><div className="text-xl font-bold text-teal-300">{correctCount}</div><div className="text-xs text-navy-300">Correct</div></div>
            <div><div className="text-xl font-bold text-neon-300">{accuracy}%</div><div className="text-xs text-navy-300">Accuracy</div></div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onBack(); }} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Quit</button>
        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1 font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-navy-200'}`}><Timer className="w-4 h-4" /> {timeLeft}s</span>
          <span className="text-navy-200">Correct: <span className="font-bold text-teal-300">{correctCount}</span></span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-navy-900 rounded-full overflow-hidden mb-4">
        <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-400' : 'bg-amber-400'}`} style={{ width: `${(timeLeft / totalTime) * 100}%` }} />
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-navy-50 mb-4">{q.q}</h3>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = i === selected;
            let cls = 'border-navy-600 hover:border-amber-400/50 hover:bg-navy-900 text-navy-100';
            if (showFeedback && isCorrect) cls = 'border-teal-400 bg-teal-400/10 text-teal-300';
            else if (showFeedback && isPicked && !isCorrect) cls = 'border-red-400 bg-red-500/10 text-red-300';
            else if (showFeedback) cls = 'border-navy-600 text-navy-300 opacity-60';
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={showFeedback}
                className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${cls}`}>
                <span className="text-sm">{opt}</span>
                {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-teal-400 inline ml-2" />}
                {showFeedback && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-red-400 inline ml-2" />}
              </button>
            );
          })}
        </div>
        {showFeedback && (
          <p className="text-xs text-navy-300 mt-3">{q.explanation}</p>
        )}
      </div>
    </div>
  );
}
