import { useState } from 'react';
import {
  Sparkles, Lock, Check, Plus, Minus, Palette, Sofa, Lightbulb,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { EmptyState } from '@/components/ui';
import { StudyMascot } from '@/components/StudyMascot';
import { ROOM_ITEMS, WALL_COLORS } from '@/types';
import type { AppData, RoomItemDef, StudyRoomState } from '@/types';

type StudyRoomProps = {
  data: AppData;
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

const categoryIcon: Record<string, typeof Sofa> = {
  furniture: Sofa,
  decoration: Lightbulb,
  plant: Lightbulb,
  poster: Lightbulb,
  accessory: Lightbulb,
};

const categoryColors: Record<string, string> = {
  furniture: 'bg-lavender-300/10 text-lavender-300',
  decoration: 'bg-neon-300/10 text-neon-300',
  plant: 'bg-teal-400/10 text-teal-400',
  poster: 'bg-lamp-200/10 text-lamp-200',
  accessory: 'bg-purple-400/10 text-purple-400',
};

export default function StudyRoom({ data, onUpdate }: StudyRoomProps) {
  const [tab, setTab] = useState<'shop' | 'walls'>('shop');
  const totalXP = data.arcade.totalXP;
  const room = data.studyRoom;

  const setRoom = (updater: (r: StudyRoomState) => StudyRoomState) => {
    onUpdate((d) => ({ ...d, studyRoom: updater(d.studyRoom) }));
  };

  const isUnlocked = (id: string) => room.unlockedItems.includes(id);
  const isEquipped = (id: string) => room.equippedItems.includes(id);

  const unlockItem = (item: RoomItemDef) => {
    if (isUnlocked(item.id) || totalXP < item.xpCost) return;
    setRoom((r) => ({
      ...r,
      unlockedItems: [...r.unlockedItems, item.id],
      equippedItems: [...r.equippedItems, item.id],
    }));
  };

  const toggleEquip = (id: string) => {
    setRoom((r) => ({
      ...r,
      equippedItems: isEquipped(id)
        ? r.equippedItems.filter((i) => i !== id)
        : [...r.equippedItems, id],
    }));
  };

  const selectWall = (wallId: string) => {
    setRoom((r) => ({ ...r, wallColor: wallId }));
  };

  const wallHex = WALL_COLORS.find((w) => w.id === room.wallColor)?.hex ?? '#0B1020';
  const equippedItems = ROOM_ITEMS.filter((i) => isEquipped(i.id));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Build Your Study Room"
        subtitle="Spend your hard-earned XP to unlock cozy decorations and personalize your virtual bedroom."
        icon={<Sofa className="w-5 h-5" />}
      />

      {/* XP display */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lavender-300/8 border border-lavender-300/15">
          <Sparkles className="w-4 h-4 text-lavender-300" />
          <span className="text-sm font-bold text-navy-50">{totalXP}</span>
          <span className="text-xs text-navy-200">total XP available</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400/8 border border-teal-400/15">
          <Check className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-bold text-navy-50">{room.unlockedItems.length}</span>
          <span className="text-xs text-navy-200">items unlocked</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* === Room Preview === */}
        <div className="card-cozy p-5">
          <h3 className="font-display text-base font-bold text-navy-50 mb-3">Your Room</h3>
          <RoomScene wallHex={wallHex} equippedItems={equippedItems.map((i) => i.id)} />

          {/* Equipped items list */}
          <div className="mt-4 pt-4 border-t border-navy-600/30">
            <p className="text-xs font-semibold text-navy-300 mb-2 uppercase tracking-wider">Equipped</p>
            {equippedItems.length === 0 ? (
              <p className="text-sm text-navy-300">Nothing equipped yet. Unlock items to fill your room!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {equippedItems.map((item) => (
                  <span
                    key={item.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-navy-900/60 text-navy-100 border border-navy-600/30"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === Shop / Wall Colors === */}
        <div>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('shop')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === 'shop'
                  ? 'bg-lavender-300/10 text-lavender-300 border border-lavender-300/20'
                  : 'text-navy-200 hover:bg-navy-700/40 border border-transparent'
              }`}
            >
              Decorations
            </button>
            <button
              onClick={() => setTab('walls')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === 'walls'
                  ? 'bg-lavender-300/10 text-lavender-300 border border-lavender-300/20'
                  : 'text-navy-200 hover:bg-navy-700/40 border border-transparent'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-1" /> Wall Colors
            </button>
          </div>

          {tab === 'shop' && (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {ROOM_ITEMS.map((item) => {
                const unlocked = isUnlocked(item.id);
                const equipped = isEquipped(item.id);
                const canAfford = totalXP >= item.xpCost;
                const Icon = categoryIcon[item.category] ?? Lightbulb;

                return (
                  <div
                    key={item.id}
                    className={`card-cozy p-4 flex items-center gap-4 transition-all ${
                      !unlocked && !canAfford ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Item icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[item.category]}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-navy-50 truncate">{item.name}</h4>
                      <p className="text-xs text-navy-200 line-clamp-1">{item.description}</p>
                      <span className="text-[10px] text-navy-300 uppercase tracking-wide mt-0.5 inline-block">
                        {item.category}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {unlocked ? (
                        equipped ? (
                          <button
                            onClick={() => toggleEquip(item.id)}
                            className="btn-secondary text-xs px-3 py-2"
                          >
                            <Minus className="w-3.5 h-3.5" /> Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleEquip(item.id)}
                            className="btn-primary text-xs px-3 py-2"
                          >
                            <Plus className="w-3.5 h-3.5" /> Place
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => unlockItem(item)}
                          disabled={!canAfford}
                          className="btn-secondary text-xs px-3 py-2"
                        >
                          {canAfford ? (
                            <><Sparkles className="w-3.5 h-3.5" /> {item.xpCost} XP</>
                          ) : (
                            <><Lock className="w-3.5 h-3.5" /> {item.xpCost} XP</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'walls' && (
            <div className="card-cozy p-5">
              <p className="text-sm text-navy-200 mb-4">Choose a wall color to set the mood of your study space.</p>
              <div className="grid grid-cols-2 gap-3">
                {WALL_COLORS.map((wall) => {
                  const selected = room.wallColor === wall.id;
                  return (
                    <button
                      key={wall.id}
                      onClick={() => selectWall(wall.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-lavender-300 bg-lavender-300/10'
                          : 'border-navy-600 hover:border-lavender-300/50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 border border-navy-600/40"
                        style={{ backgroundColor: wall.hex }}
                      />
                      <span className={`text-sm font-medium ${selected ? 'text-lavender-300' : 'text-navy-100'}`}>
                        {wall.name}
                      </span>
                      {selected && <Check className="w-4 h-4 text-lavender-300 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hint when no XP */}
      {totalXP < 50 && tab === 'shop' && (
        <div className="card-cozy mt-6">
          <EmptyState
            icon={<Sparkles className="w-7 h-7" />}
            title="Earn XP to unlock more"
            description="Complete Cozy Study Missions, quizzes, and arcade games to earn XP. Each item unlocks at a specific XP threshold — keep studying to fill your room!"
          />
        </div>
      )}
    </div>
  );
}

/** Visual room scene rendered as an SVG illustration. */
function RoomScene({ wallHex, equippedItems }: { wallHex: string; equippedItems: string[] }) {
  const has = (id: string) => equippedItems.includes(id);
  const isDarkWall = true; // all wall options are dark

  return (
    <div
      className="rounded-2xl overflow-hidden border border-navy-600/30 relative"
      style={{ background: wallHex }}
    >
      <svg viewBox="0 0 400 280" className="w-full h-auto block">
        <defs>
          <linearGradient id="floor-grad" x1="0" y1="200" x2="0" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#19243B" />
            <stop offset="1" stopColor="#101A30" />
          </linearGradient>
          <linearGradient id="wall-shadow" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#000000" stopOpacity="0.15" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lamp-light" cx="0.5" cy="0.3" r="0.5">
            <stop stopColor="#FFD7A0" stopOpacity="0.25" />
            <stop offset="1" stopColor="#FFD7A0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Wall */}
        <rect x="0" y="0" width="400" height="200" fill={wallHex} />
        <rect x="0" y="0" width="400" height="200" fill="url(#wall-shadow)" />

        {/* Floor */}
        <rect x="0" y="200" width="400" height="80" fill="url(#floor-grad)" />
        {/* Floor edge line */}
        <line x1="0" y1="200" x2="400" y2="200" stroke="#080D1B" strokeWidth="1" opacity="0.5" />

        {/* === Window (rain window item) === */}
        {has('rain-window') ? (
          <g>
            <rect x="40" y="30" width="90" height="70" rx="4" fill="#0A0F1E" stroke="#2A3450" strokeWidth="2" />
            <line x1="85" y1="30" x2="85" y2="100" stroke="#2A3450" strokeWidth="1.5" />
            <line x1="40" y1="65" x2="130" y2="65" stroke="#2A3450" strokeWidth="1.5" />
            {/* Rain drops */}
            <line x1="55" y1="40" x2="53" y2="48" stroke="#78E5F5" strokeWidth="0.8" opacity="0.6" />
            <line x1="100" y1="45" x2="98" y2="53" stroke="#78E5F5" strokeWidth="0.8" opacity="0.6" />
            <line x1="70" y1="75" x2="68" y2="83" stroke="#78E5F5" strokeWidth="0.8" opacity="0.6" />
            <line x1="115" y1="70" x2="113" y2="78" stroke="#78E5F5" strokeWidth="0.8" opacity="0.6" />
          </g>
        ) : (
          <g>
            <rect x="40" y="30" width="90" height="70" rx="4" fill="#0A0F1E" stroke="#2A3450" strokeWidth="2" />
            <line x1="85" y1="30" x2="85" y2="100" stroke="#2A3450" strokeWidth="1.5" />
            <line x1="40" y1="65" x2="130" y2="65" stroke="#2A3450" strokeWidth="1.5" />
            {/* Stars through plain window */}
            <circle cx="60" cy="50" r="1" fill="#78E5F5" opacity="0.5" />
            <circle cx="105" cy="55" r="1" fill="#B9A5FF" opacity="0.4" />
            <circle cx="75" cy="80" r="0.8" fill="#78E5F5" opacity="0.3" />
          </g>
        )}

        {/* === Wall poster === */}
        {has('wall-poster') && (
          <g>
            <rect x="160" y="35" width="50" height="65" rx="2" fill="#1A1530" stroke="#2A3450" strokeWidth="1.5" />
            <text x="185" y="62" textAnchor="middle" fill="#B9A5FF" fontSize="7" fontFamily="sans-serif" opacity="0.7">YOU CAN</text>
            <text x="185" y="72" textAnchor="middle" fill="#78E5F5" fontSize="7" fontFamily="sans-serif" opacity="0.7">DO IT!</text>
            <rect x="165" y="80" width="40" height="3" rx="1" fill="#B9A5FF" opacity="0.3" />
          </g>
        )}

        {/* === Star poster === */}
        {has('star-poster') && (
          <g>
            <rect x="225" y="30" width="55" height="70" rx="2" fill="#0D1428" stroke="#2A3450" strokeWidth="1.5" />
            <circle cx="252" cy="50" r="1.5" fill="#78E5F5" opacity="0.7" />
            <circle cx="240" cy="65" r="1" fill="#B9A5FF" opacity="0.6" />
            <circle cx="265" cy="60" r="1.2" fill="#78E5F5" opacity="0.5" />
            <circle cx="255" cy="78" r="0.8" fill="#B9A5FF" opacity="0.5" />
            <circle cx="245" cy="85" r="1.5" fill="#78E5F5" opacity="0.4" />
            <path d="M250 90 L252 95 L257 95 L253 98 L255 103 L250 100 L245 103 L247 98 L243 95 L248 95 Z" fill="#FFD7A0" opacity="0.6" />
          </g>
        )}

        {/* === String lights === */}
        {has('string-lights') && (
          <g>
            <path d="M10 15 Q100 30 200 15 Q300 5 390 20" stroke="#3A4660" strokeWidth="1" fill="none" />
            {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={20 + Math.sin(i * 0.8) * 8} r="3" fill="#FFD7A0" opacity="0.8" />
                <circle cx={x} cy={20 + Math.sin(i * 0.8) * 8} r="6" fill="#FFD7A0" opacity="0.15" />
              </g>
            ))}
          </g>
        )}

        {/* === Bookshelf === */}
        {has('bookshelf') && (
          <g>
            <rect x="300" y="40" width="70" height="155" rx="2" fill="#1E2840" stroke="#2A3450" strokeWidth="1.5" />
            <line x1="300" y1="78" x2="370" y2="78" stroke="#2A3450" strokeWidth="1" />
            <line x1="300" y1="116" x2="370" y2="116" stroke="#2A3450" strokeWidth="1" />
            <line x1="300" y1="154" x2="370" y2="154" stroke="#2A3450" strokeWidth="1" />
            {/* Books */}
            <rect x="305" y="48" width="6" height="26" rx="0.5" fill="#78E5F5" opacity="0.6" />
            <rect x="313" y="50" width="5" height="24" rx="0.5" fill="#B9A5FF" opacity="0.6" />
            <rect x="320" y="46" width="7" height="28" rx="0.5" fill="#FFD7A0" opacity="0.5" />
            <rect x="329" y="49" width="5" height="25" rx="0.5" fill="#5eead4" opacity="0.5" />
            <rect x="308" y="86" width="6" height="26" rx="0.5" fill="#B9A5FF" opacity="0.5" />
            <rect x="316" y="88" width="6" height="24" rx="0.5" fill="#78E5F5" opacity="0.5" />
            <rect x="325" y="84" width="5" height="28" rx="0.5" fill="#FFD7A0" opacity="0.4" />
            <rect x="333" y="87" width="6" height="25" rx="0.5" fill="#5eead4" opacity="0.4" />
            <rect x="306" y="124" width="5" height="26" rx="0.5" fill="#78E5F5" opacity="0.4" />
            <rect x="313" y="126" width="6" height="24" rx="0.5" fill="#FFD7A0" opacity="0.4" />
            <rect x="322" y="122" width="5" height="28" rx="0.5" fill="#B9A5FF" opacity="0.4" />
            <rect x="330" y="125" width="6" height="25" rx="0.5" fill="#5eead4" opacity="0.4" />
            <rect x="340" y="124" width="5" height="26" rx="0.5" fill="#78E5F5" opacity="0.3" />
          </g>
        )}

        {/* === Desk === */}
        <rect x="100" y="170" width="140" height="6" rx="1" fill="#19243B" />
        <rect x="105" y="176" width="6" height="24" rx="1" fill="#19243B" />
        <rect x="229" y="176" width="6" height="24" rx="1" fill="#19243B" />

        {/* === Desk lamp === */}
        {has('desk-lamp') && (
          <g>
            {/* Lamp glow */}
            <ellipse cx="120" cy="165" rx="35" ry="25" fill="url(#lamp-light)" />
            {/* Base */}
            <rect x="116" y="168" width="8" height="3" rx="1" fill="#2A3450" />
            {/* Arm */}
            <line x1="120" y1="168" x2="120" y2="150" stroke="#2A3450" strokeWidth="2" />
            <line x1="120" y1="150" x2="108" y2="142" stroke="#2A3450" strokeWidth="2" />
            {/* Shade */}
            <path d="M100 142 L116 142 L113 152 L103 152 Z" fill="#FFD7A0" opacity="0.8" />
            <path d="M100 142 L116 142 L113 152 L103 152 Z" fill="none" stroke="#2A3450" strokeWidth="1" />
          </g>
        )}

        {/* === Laptop === */}
        {has('laptop') && (
          <g>
            <rect x="150" y="155" width="40" height="15" rx="1.5" fill="#19243B" stroke="#2A3450" strokeWidth="0.8" />
            <rect x="152" y="157" width="36" height="11" rx="0.5" fill="#101A30" />
            <rect x="155" y="159" width="14" height="2" rx="0.3" fill="#78E5F5" opacity="0.5" />
            <rect x="155" y="162" width="22" height="1.5" rx="0.3" fill="#3A4660" />
            <rect x="155" y="165" width="18" height="1.5" rx="0.3" fill="#3A4660" />
            {/* Keyboard base */}
            <path d="M148 170 L192 170 L196 175 L144 175 Z" fill="#19243B" stroke="#2A3450" strokeWidth="0.8" />
          </g>
        )}

        {/* === Stack of books === */}
        {has('stack-books') && (
          <g>
            <rect x="210" y="160" width="25" height="5" rx="0.5" fill="#78E5F5" opacity="0.5" />
            <rect x="208" y="165" width="28" height="5" rx="0.5" fill="#B9A5FF" opacity="0.5" />
            <rect x="212" y="155" width="22" height="5" rx="0.5" fill="#FFD7A0" opacity="0.4" />
          </g>
        )}

        {/* === Tea mug === */}
        {has('tea-mug') && (
          <g>
            <rect x="195" y="160" width="10" height="10" rx="1.5" fill="#FFD7A0" opacity="0.7" />
            <path d="M205 162 Q210 162 210 167 Q210 170 205 170" stroke="#FFD7A0" strokeWidth="1.5" fill="none" opacity="0.6" />
            {/* Steam */}
            <path d="M198 158 Q197 154 199 152 Q201 150 198 148" stroke="#FFD7A0" strokeWidth="0.8" fill="none" opacity="0.3" />
            <path d="M202 158 Q201 154 203 152 Q205 150 202 148" stroke="#FFD7A0" strokeWidth="0.8" fill="none" opacity="0.2" />
          </g>
        )}

        {/* === Potted plant === */}
        {has('potted-plant') && (
          <g>
            {/* Pot */}
            <path d="M280 180 L300 180 L297 195 L283 195 Z" fill="#2A3450" />
            <rect x="278" y="178" width="24" height="4" rx="1" fill="#19243B" />
            {/* Leaves */}
            <ellipse cx="285" cy="165" rx="6" ry="12" fill="#1a5c4a" opacity="0.7" transform="rotate(-15 285 165)" />
            <ellipse cx="295" cy="162" rx="5" ry="14" fill="#1a5c4a" opacity="0.6" transform="rotate(10 295 162)" />
            <ellipse cx="290" cy="158" rx="5" ry="11" fill="#1a5c4a" opacity="0.5" transform="rotate(-5 290 158)" />
          </g>
        )}

        {/* === Cat plush === */}
        {has('cat-plush') && (
          <g>
            {/* Body */}
            <ellipse cx="255" cy="192" rx="12" ry="8" fill="#2A3450" />
            {/* Head */}
            <circle cx="255" cy="182" r="8" fill="#2A3450" />
            {/* Ears */}
            <path d="M248 176 L246 170 L251 174 Z" fill="#2A3450" />
            <path d="M262 176 L264 170 L259 174 Z" fill="#2A3450" />
            {/* Eyes — sleepy */}
            <path d="M251 182 L253 182" stroke="#78E5F5" strokeWidth="1" strokeLinecap="round" />
            <path d="M257 182 L259 182" stroke="#78E5F5" strokeWidth="1" strokeLinecap="round" />
            {/* Tail */}
            <path d="M266 195 Q275 190 273 180" stroke="#2A3450" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* === Rug === */}
        {has('rug') && (
          <g>
            <ellipse cx="200" cy="235" rx="90" ry="18" fill="#4a2c9e" opacity="0.25" />
            <ellipse cx="200" cy="235" rx="80" ry="14" fill="#5a37b8" opacity="0.15" />
            <ellipse cx="200" cy="235" rx="70" ry="10" fill="#B9A5FF" opacity="0.08" />
          </g>
        )}

        {/* === Mascot character (always present, sitting at desk) === */}
        <g transform="translate(160, 125) scale(0.7)">
          {/* Mascot body simplified */}
          <path d="M28 55 C28 40, 40 32, 60 32 C80 32, 92 40, 92 55 L92 75 L28 75 Z" fill="#5a37b8" />
          <path d="M42 35 C42 30, 50 26, 60 26 C70 26, 78 30, 78 35 L78 38 C78 38, 70 35, 60 35 C50 35, 42 38, 42 38 Z" fill="#4a2c9e" />
          {/* Head */}
          <circle cx="60" cy="20" r="14" fill="#F0C885" />
          {/* Hair */}
          <path d="M46 18 C46 11, 52 7, 60 7 C68 7, 74 11, 74 18 C74 15, 70 12, 65 12 C63 9, 60 8, 60 8 C57 8, 53 9, 51 12 C47 12, 46 15, 46 18 Z" fill="#3A2D1E" />
          {/* Headphones */}
          <path d="M44 16 C44 8, 50 4, 60 4 C70 4, 76 8, 76 16" stroke="#2A3450" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="44" cy="20" rx="4" ry="6" fill="#2A3450" />
          <ellipse cx="76" cy="20" rx="4" ry="6" fill="#2A3450" />
          {/* Eyes — gentle smile */}
          <path d="M54 20 C55 19, 57 19, 58 20" stroke="#3A2D1E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M62 20 C63 19, 65 19, 66 20" stroke="#3A2D1E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Smile */}
          <path d="M55 24 C57 26, 63 26, 65 24" stroke="#3A2D1E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>

        {/* Foreground shadow grounding */}
        <ellipse cx="200" cy="245" rx="120" ry="8" fill="#000000" opacity={isDarkWall ? '0.2' : '0.1'} />
      </svg>
    </div>
  );
}
