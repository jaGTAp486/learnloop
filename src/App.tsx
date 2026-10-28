import { useState } from 'react';
import AuthPage from '@/components/AuthPage';
import AppShell from '@/components/AppShell';
import Dashboard from '@/components/Dashboard';
import DoubtSolver from '@/components/DoubtSolver';
import NotesGenerator from '@/components/NotesGenerator';
import QuizGenerator from '@/components/QuizGenerator';
import ExamPrep from '@/components/ExamPrep';
import ChatAssistant from '@/components/ChatAssistant';
import MissionsEngine from '@/components/MissionsEngine';
import MasteryTracker from '@/components/MasteryTracker';
import LearningCircles from '@/components/LearningCircles';
import RevisionQueue from '@/components/RevisionQueue';
import StudyArcade from '@/components/StudyArcade';
import CozyStudyMissions from '@/components/CozyStudyMissions';
import StudyRoom from '@/components/StudyRoom';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import type { Feature } from '@/types';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function App() {
  const [feature, setFeature] = useState<Feature>('dashboard');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { user, loading, signIn, signUp, signOut, resetPassword } = useAuth();
  const { data, update } = useAppData(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
      />
    );
  }

  return (
    <AppShell
      current={feature}
      onNavigate={setFeature}
      user={user}
      onSignOut={signOut}
    >
      {feature === 'dashboard' && <Dashboard data={data} onNavigate={setFeature} onUpdate={update} userName={user.fullName ?? undefined} />}
      {feature === 'doubt' && <DoubtSolver onUpdate={update} />}
      {feature === 'notes' && <NotesGenerator onUpdate={update} />}
      {feature === 'quiz' && <QuizGenerator onUpdate={update} />}
      {feature === 'exam' && <ExamPrep onUpdate={update} />}
      {feature === 'chat' && <ChatAssistant onUpdate={update} />}
      {feature === 'missions' && <MissionsEngine onUpdate={update} data={data} />}
      {feature === 'mastery' && <MasteryTracker data={data} />}
      {feature === 'circles' && <LearningCircles onUpdate={update} data={data} />}
      {feature === 'revision' && <RevisionQueue data={data} onUpdate={update} />}
      {feature === 'arcade' && <StudyArcade data={data} onUpdate={update} />}
      {feature === 'cozy-missions' && <CozyStudyMissions data={data} onUpdate={update} />}
      {feature === 'study-room' && <StudyRoom data={data} onUpdate={update} />}
    </AppShell>
  );
}
