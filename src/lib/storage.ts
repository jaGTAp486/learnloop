import type { AppData } from '@/types';
import { emptyAppData } from '@/types';

export type AppDataKey = keyof AppData;

const STORAGE_KEY = 'learnloop-data-v1';

/** Migrate old StudyMate data to LearnLoop format if present */
function migrateOldKey(raw: string | null): Partial<AppData> | null {
  if (!raw) return null;
  try {
    const old = JSON.parse(raw);
    return old as Partial<AppData>;
  } catch {
    return null;
  }
}

export function loadData(): AppData {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Try migrating from the old StudyMate key
      raw = localStorage.getItem('ai-studymate-data-v1');
    }
    if (!raw) return { ...emptyAppData };
    const parsed = migrateOldKey(raw);
    if (!parsed) return { ...emptyAppData };
    return {
      ...emptyAppData,
      ...parsed,
      // Ensure circles always have sample data if missing
      circles: parsed.circles && parsed.circles.length > 0 ? parsed.circles : emptyAppData.circles,
      // Ensure arcade stats always have valid structure
      arcade: parsed.arcade && typeof parsed.arcade === 'object' && Array.isArray(parsed.arcade.achievements) && Array.isArray(parsed.arcade.bestScores)
        ? parsed.arcade
        : emptyAppData.arcade,
      cozyMissions: Array.isArray(parsed.cozyMissions) ? parsed.cozyMissions : emptyAppData.cozyMissions,
      studyRoom: parsed.studyRoom && typeof parsed.studyRoom === 'object' && Array.isArray(parsed.studyRoom.unlockedItems)
        ? parsed.studyRoom
        : emptyAppData.studyRoom,
      education: parsed.education && typeof parsed.education === 'object' && 'levelId' in parsed.education
        ? parsed.education
        : emptyAppData.education,
    };
  } catch {
    return { ...emptyAppData };
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function updateData<K extends AppDataKey>(
  key: K,
  updater: (current: AppData[K]) => AppData[K],
): AppData {
  const data = loadData();
  data[key] = updater(data[key]);
  saveData(data);
  return data;
}


