import { useState } from 'react';
import { GraduationCap, School, BookOpen, ChevronRight, Check, Stethoscope, Cpu } from 'lucide-react';
import { EDUCATION_LEVELS, ENGINEERING_BRANCHES, MBBS_YEARS, getSubjectsForLevel } from '@/lib/curriculum';
import type { EducationProfile } from '@/types';

type EducationLevelSelectorProps = {
  value: EducationProfile;
  onChange: (profile: EducationProfile) => void;
  /** When true, renders in compact mode (used in settings, not onboarding) */
  compact?: boolean;
};

export default function EducationLevelSelector({ value, onChange, compact }: EducationLevelSelectorProps) {
  const [category, setCategory] = useState<'school' | 'college'>('school');

  const schoolLevels = EDUCATION_LEVELS.filter((l) => l.category === 'school');
  const collegeLevels = EDUCATION_LEVELS.filter((l) => l.category === 'college');

  const selectedLevel = EDUCATION_LEVELS.find((l) => l.id === value.levelId) ?? null;
  const needsBranch = selectedLevel?.subType === 'engineering-branch';
  const needsMbbsYear = selectedLevel?.subType === 'mbbs-year';

  const handleSelectLevel = (levelId: string) => {
    onChange({ ...value, levelId, subSelection: null, preferredSubjects: [] });
  };

  const handleSelectBranch = (branch: string) => {
    onChange({ ...value, subSelection: branch, preferredSubjects: [] });
  };

  const handleSelectMbbsYear = (year: string) => {
    onChange({ ...value, subSelection: year, preferredSubjects: [] });
  };

  const toggleSubject = (subject: string) => {
    const current = value.preferredSubjects;
    const updated = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    onChange({ ...value, preferredSubjects: updated });
  };

  const availableSubjects = getSubjectsForLevel(value.levelId, value.subSelection);

  return (
    <div className={compact ? '' : 'card-cozy p-6'}>
      {!compact && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-lavender-300/10 border border-lavender-300/15 flex items-center justify-center text-lavender-300">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-navy-50">Select Your Education Level</h2>
            <p className="text-sm text-navy-200">This personalizes your quizzes and study missions.</p>
          </div>
        </div>
      )}

      {/* Category toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setCategory('school')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            category === 'school'
              ? 'bg-lavender-300/10 text-lavender-300 border border-lavender-300/20'
              : 'text-navy-200 hover:bg-navy-700/40 border border-transparent'
          }`}
        >
          <School className="w-4 h-4" /> School
        </button>
        <button
          onClick={() => setCategory('college')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            category === 'college'
              ? 'bg-lavender-300/10 text-lavender-300 border border-lavender-300/20'
              : 'text-navy-200 hover:bg-navy-700/40 border border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" /> College
        </button>
      </div>

      {/* Level cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {(category === 'school' ? schoolLevels : collegeLevels).map((level) => {
          const selected = value.levelId === level.id;
          return (
            <button
              key={level.id}
              onClick={() => handleSelectLevel(level.id)}
              className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2 transition-all text-center ${
                selected
                  ? 'border-lavender-300 bg-lavender-300/10 text-navy-50'
                  : 'border-navy-600 hover:border-lavender-300/50 text-navy-100'
              }`}
            >
              {level.id === 'mbbs' ? (
                <Stethoscope className={`w-5 h-5 ${selected ? 'text-lavender-300' : 'text-navy-300'}`} />
              ) : level.category === 'college' ? (
                <Cpu className={`w-5 h-5 ${selected ? 'text-lavender-300' : 'text-navy-300'}`} />
              ) : (
                <School className={`w-5 h-5 ${selected ? 'text-lavender-300' : 'text-navy-300'}`} />
              )}
              <span className="text-xs font-semibold leading-tight">{level.label}</span>
            </button>
          );
        })}
      </div>

      {/* Engineering branch selector */}
      {needsBranch && (
        <div className="mb-5">
          <label className="label-text flex items-center gap-2">
            <Cpu className="w-4 h-4 text-lavender-300" /> Select Your Branch
          </label>
          <div className="flex flex-wrap gap-2">
            {ENGINEERING_BRANCHES.map((branch) => {
              const selected = value.subSelection === branch;
              return (
                <button
                  key={branch}
                  onClick={() => handleSelectBranch(branch)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? 'bg-lavender-300/10 text-lavender-300 border border-lavender-300/20'
                      : 'text-navy-200 hover:bg-navy-700/40 border border-navy-600/30'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {branch}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MBBS year selector */}
      {needsMbbsYear && (
        <div className="mb-5">
          <label className="label-text flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-lavender-300" /> Select Your Year
          </label>
          <div className="flex flex-wrap gap-2">
            {MBBS_YEARS.map((year) => {
              const selected = value.subSelection === year;
              return (
                <button
                  key={year}
                  onClick={() => handleSelectMbbsYear(year)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? 'bg-lavender-300/10 text-lavender-300 border border-lavender-300/20'
                      : 'text-navy-200 hover:bg-navy-700/40 border border-navy-600/30'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject selection */}
      {availableSubjects.length > 0 && (
        <div>
          <label className="label-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-lavender-300" /> Select Your Subjects
            <span className="text-xs text-navy-300 font-normal">(optional — select to personalize suggestions)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.map((subject) => {
              const selected = value.preferredSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? 'bg-teal-400/10 text-teal-300 border border-teal-400/20'
                      : 'text-navy-200 hover:bg-navy-700/40 border border-navy-600/30'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation indicator */}
      {value.levelId && !needsBranch && !needsMbbsYear && (
        <div className="mt-4 flex items-center gap-2 text-sm text-teal-300">
          <Check className="w-4 h-4" />
          Level selected: {selectedLevel?.label}
        </div>
      )}
      {value.levelId && (needsBranch || needsMbbsYear) && value.subSelection && (
        <div className="mt-4 flex items-center gap-2 text-sm text-teal-300">
          <Check className="w-4 h-4" />
          {selectedLevel?.label} — {value.subSelection}
        </div>
      )}
      {value.levelId && (needsBranch || needsMbbsYear) && !value.subSelection && (
        <div className="mt-4 flex items-center gap-2 text-sm text-lamp-200">
          <ChevronRight className="w-4 h-4" />
          Please select your {needsBranch ? 'branch' : 'year'} above.
        </div>
      )}
    </div>
  );
}
