import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  CheckSquare, 
  RefreshCw, 
  Zap, 
  BarChart2, 
  User, 
  Plus, 
  Trophy, 
  Brain, 
  BookOpen,
  Settings,
  LogOut,
  LogIn,
  Flame,
  Star,
  ChevronRight,
  Clock,
  Calendar,
  Smile,
  Meh,
  Frown,
  PenTool,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Award,
  Circle,
  CheckCircle2,
  Trash2,
  Bell,
  BellOff,
  Apple,
  Palette,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Shield,
  UserCircle,
  Dna,
  Shirt,
  Palette as ColorIcon
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { soundManager } from './lib/sounds';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  getDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { Task, Habit, Skill, JournalEntry, Category, Priority, Mood, Frequency, Subtask, FocusSession, Achievement, UserProfile, DailyQuest } from './types';
import { getAICoachAdvice } from './services/aiCoach';
import { format, isAfter, parseISO, subHours, subDays } from 'date-fns';

// --- Components ---

const Avatar = ({ settings, size = "md" }: { settings?: UserProfile['avatar']; size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const bodyColors = {
    normal: "#FFDBAC",
    slim: "#F1C27D",
    buff: "#E0AC69",
    athletic: "#D2B48C",
    curvy: "#C68642",
    tall: "#E8BEAC",
    short: "#D1A384"
  };

  const outfitColors = {
    warrior: "#E53E3E",
    mage: "#3182CE",
    rogue: "#38A169",
    casual: "#718096",
    noble: "#805AD5",
    scholar: "#319795",
    explorer: "#D69E2E",
    assassin: "#2D3748",
    knight: "#A0AEC0",
    monk: "#ED8936",
    merchant: "#ECC94B"
  };

  const bodyType = settings?.bodyType || 'normal';
  const outfit = settings?.outfit || 'casual';
  const color = settings?.color || bodyColors[bodyType as keyof typeof bodyColors] || bodyColors.normal;
  const hairColor = settings?.hairColor || "#4A5568";
  const hairStyle = settings?.hairStyle || 'short';
  const accessory = settings?.accessory || 'none';

  const headY = bodyType === 'tall' ? 30 : bodyType === 'short' ? 45 : 35;

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center group`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        {/* Shadow */}
        <ellipse cx="50" cy="95" rx="30" ry="5" fill="black" opacity="0.1" />
        
        {/* Cape (Behind Body) */}
        {accessory === 'cape' && (
          <path d="M20 60 L10 95 Q50 105 90 95 L80 60 Z" fill="rgba(0,0,0,0.1)" />
        )}

        {/* Body */}
        {bodyType === 'buff' ? (
          <path d="M20 50 Q50 30 80 50 L85 90 Q50 100 15 90 Z" fill={color} />
        ) : bodyType === 'slim' ? (
          <path d="M30 50 Q50 40 70 50 L75 90 Q50 100 25 90 Z" fill={color} />
        ) : bodyType === 'athletic' ? (
          <path d="M22 50 Q50 32 78 50 L82 90 Q50 100 18 90 Z" fill={color} />
        ) : bodyType === 'curvy' ? (
          <path d="M28 50 Q50 38 72 50 L85 90 Q50 105 15 90 Z" fill={color} />
        ) : bodyType === 'tall' ? (
          <path d="M28 45 Q50 30 72 45 L75 95 Q50 105 25 95 Z" fill={color} />
        ) : bodyType === 'short' ? (
          <path d="M25 60 Q50 45 75 60 L80 90 Q50 100 20 90 Z" fill={color} />
        ) : (
          <path d="M25 50 Q50 35 75 50 L80 90 Q50 100 20 90 Z" fill={color} />
        )}

        {/* Head */}
        <circle cx="50" cy={headY} r="22" fill={color} />
        
        {/* Outfit */}
        <path d={`M25 ${headY + 25} Q50 ${headY + 15} 75 ${headY + 25} L80 95 Q50 105 20 95 Z`} fill={outfitColors[outfit as keyof typeof outfitColors] || outfitColors.casual} />
        
        {/* Outfit Details */}
        {outfit === 'warrior' && <path d={`M45 ${headY + 30} L55 ${headY + 30} L50 ${headY + 50} Z`} fill="rgba(255,255,255,0.2)" />}
        {outfit === 'mage' && <circle cx="50" cy={headY + 40} r="5" fill="rgba(255,255,255,0.3)" />}
        {outfit === 'rogue' && <path d={`M30 ${headY + 30} L70 ${headY + 30}`} stroke="rgba(0,0,0,0.2)" strokeWidth="4" />}
        {outfit === 'noble' && <path d={`M40 ${headY + 25} L60 ${headY + 25} L50 95 Z`} fill="gold" opacity="0.3" />}
        {outfit === 'assassin' && <path d={`M35 ${headY + 25} L65 ${headY + 25} L50 ${headY + 35} Z`} fill="rgba(255,0,0,0.2)" />}
        {outfit === 'knight' && <rect x="40" y={headY + 30} width="20" height="20" fill="rgba(255,255,255,0.1)" />}
        {outfit === 'monk' && <path d={`M50 ${headY + 25} L50 95`} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />}
        {outfit === 'merchant' && <circle cx="50" cy={headY + 35} r="4" fill="gold" />}

        {/* Hair Styles */}
        {hairStyle === 'short' && (
          <path d={`M28 ${headY - 5} Q50 ${headY - 25} 72 ${headY - 5} Q72 ${headY - 20} 28 ${headY - 20} Z`} fill={hairColor} />
        )}
        {hairStyle === 'long' && (
          <path d={`M25 ${headY - 5} Q50 ${headY - 30} 75 ${headY - 5} L80 ${headY + 25} Q50 ${headY + 20} 20 ${headY + 25} Z`} fill={hairColor} />
        )}
        {hairStyle === 'spiky' && (
          <path d={`M25 ${headY} L35 ${headY - 20} L50 ${headY - 10} L65 ${headY - 20} L75 ${headY} Z`} fill={hairColor} />
        )}
        {hairStyle === 'ponytail' && (
          <>
            <path d={`M28 ${headY - 5} Q50 ${headY - 25} 72 ${headY - 5} Q72 ${headY - 20} 28 ${headY - 20} Z`} fill={hairColor} />
            <path d={`M70 ${headY - 5} Q85 ${headY + 5} 75 ${headY + 25}`} stroke={hairColor} strokeWidth="8" fill="none" strokeLinecap="round" />
          </>
        )}
        {hairStyle === 'mohawk' && (
          <path d={`M45 ${headY - 25} L55 ${headY - 25} L55 ${headY} L45 ${headY} Z`} fill={hairColor} />
        )}
        {hairStyle === 'braids' && (
          <>
            <path d={`M28 ${headY - 5} Q50 ${headY - 25} 72 ${headY - 5} Q72 ${headY - 20} 28 ${headY - 20} Z`} fill={hairColor} />
            <path d={`M30 ${headY} L20 ${headY + 30}`} stroke={hairColor} strokeWidth="6" strokeDasharray="4 2" />
            <path d={`M70 ${headY} L80 ${headY + 30}`} stroke={hairColor} strokeWidth="6" strokeDasharray="4 2" />
          </>
        )}
        {hairStyle === 'curly' && (
          <g fill={hairColor}>
            <circle cx="35" cy={headY - 10} r="8" />
            <circle cx="50" cy={headY - 15} r="8" />
            <circle cx="65" cy={headY - 10} r="8" />
            <circle cx="30" cy={headY} r="8" />
            <circle cx="70" cy={headY} r="8" />
          </g>
        )}
        {hairStyle === 'undercut' && (
          <path d={`M30 ${headY - 10} Q50 ${headY - 25} 70 ${headY - 10} L70 ${headY} Q50 ${headY - 5} 30 ${headY} Z`} fill={hairColor} />
        )}
        {hairStyle === 'bald' && null}
        
        {/* Accessories */}
        {accessory === 'glasses' && (
          <g stroke="black" strokeWidth="1" fill="none">
            <circle cx="42" cy={headY} r="5" />
            <circle cx="58" cy={headY} r="5" />
            <path d={`M47 ${headY} L53 ${headY}`} />
          </g>
        )}
        {accessory === 'crown' && (
          <path d={`M35 ${headY - 20} L40 ${headY - 30} L50 ${headY - 23} L60 ${headY - 30} L65 ${headY - 20} Z`} fill="gold" stroke="#B8860B" strokeWidth="1" />
        )}
        {accessory === 'scarf' && (
          <path d={`M30 ${headY + 20} Q50 ${headY + 30} 70 ${headY + 20} L75 ${headY + 30} Q50 ${headY + 40} 25 ${headY + 30} Z`} fill="#E53E3E" />
        )}
        {accessory === 'eyepatch' && (
          <circle cx="42" cy={headY} r="4" fill="black" />
        )}

        {/* Eyes */}
        <g className="animate-pulse">
          <circle cx="42" cy={headY} r="3" fill="white" />
          <circle cx="58" cy={headY} r="3" fill="white" />
          <circle cx="42" cy={headY} r="1.5" fill="black" />
          <circle cx="58" cy={headY} r="1.5" fill="black" />
        </g>
        
        {/* Mouth */}
        <path d={`M43 ${headY + 10} Q50 ${headY + 15} 57 ${headY + 10}`} stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const SkillNode = ({ skill, delay, onUnlock }: { skill: Skill; delay: number; onUnlock?: () => void; key?: any }) => (
  <motion.div 
    initial={{ scale: 0, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ 
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay 
    }}
    className={`relative z-10 flex flex-col items-center group ${!skill.unlocked ? 'opacity-50 grayscale' : ''}`}
  >
    <div className={`w-24 h-24 ${skill.unlocked ? 'bg-purple-600 shadow-purple-500/40' : 'bg-gray-400 shadow-gray-400/20'} rounded-[2rem] flex flex-col items-center justify-center text-white shadow-2xl relative overflow-hidden transition-all duration-500`}>
      {/* Animated Background for Unlocked Skills */}
      {skill.unlocked && (
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent pointer-events-none"
        />
      )}
      
      <div className="relative z-10 flex flex-col items-center">
        {skill.icon ? (
          <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{skill.icon}</span>
        ) : (
          <Zap className="w-8 h-8 mb-1 fill-current group-hover:scale-110 transition-transform" />
        )}
        <span className="text-[10px] font-black uppercase">Lvl {skill.level}</span>
      </div>
      
      {/* Progress Ring */}
      {skill.unlocked && (
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
          <circle
            cx="44" cy="44" r="40"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <motion.circle
            cx="44" cy="44" r="40"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * (skill.xp % 100)) / 100 }}
            transition={{ duration: 2, delay: delay + 0.5, ease: "easeOut" }}
          />
        </svg>
      )}

      {/* Unlock Animation Overlay */}
      <AnimatePresence>
        {skill.unlocked && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-white z-20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
    <div className="mt-4 text-center">
      <p className="font-black text-sm text-gray-800 dark:text-white tracking-tight">{skill.name}</p>
      {skill.unlocked ? (
        <div className="flex items-center justify-center gap-1 mt-1">
          <div className="w-1 h-1 bg-purple-500 rounded-full" />
          <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest">{skill.xp % 100}% Mastery</span>
        </div>
      ) : (
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Locked</span>
      )}
    </div>
  </motion.div>
);

const FocusTimer = ({ user, onComplete }: { user: any; onComplete: (xp: number) => void }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    if (!user) return;
    const xp = mode === 'work' ? 25 : 5;
    
    await addDoc(collection(db, `users/${user.uid}/focusSessions`), {
      uid: user.uid,
      duration: mode === 'work' ? 25 : 5,
      type: mode === 'work' ? 'work' : 'short-break',
      startTime: new Date().toISOString(),
      completed: true
    }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/focusSessions`));

    soundManager.play('complete');
    onComplete(xp);
    setMode(mode === 'work' ? 'break' : 'work');
    setTimeLeft(mode === 'work' ? 5 * 60 : 25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 text-center shadow-xl">
      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${mode === 'work' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${mode === 'break' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
        >
          Break
        </button>
      </div>
      
      <div className="text-7xl font-black mb-8 font-mono tabular-nums tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
        </button>
        <button 
          onClick={() => { setIsActive(false); setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60); }}
          className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-2xl flex items-center justify-center"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

const XPBar = ({ xp, level }: { xp: number; level: number }) => {
  const xpNeeded = level * 100 + (level - 1) * 50;
  const progress = (xp / xpNeeded) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
        {xp} / {xpNeeded} XP
      </div>
    </div>
  );
};

const LevelBadge = ({ level }: { level: number }) => (
  <div className="relative flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-lg transform rotate-45 shadow-lg">
    <div className="transform -rotate-45 text-white font-bold text-xl">
      {level}
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const { user, profile, loading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [aiAdvice, setAiAdvice] = useState<{ advice: string; dailyQuest: string; rewardXP: number } | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Reminder Logic
  useEffect(() => {
    if (!profile?.settings?.notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.reminderTime) {
          const reminderDate = parseISO(task.reminderTime);
          // Check if reminder is within the last minute to avoid double notifications
          const diff = now.getTime() - reminderDate.getTime();
          if (diff >= 0 && diff < 60000) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`LevelUp Pro: ${task.title}`, {
                body: `Your quest is due soon! Priority: ${task.priority}`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, profile?.settings?.notificationsEnabled]);

  // Fetch Data
  useEffect(() => {
    if (!user) return;

    const qTasks = query(collection(db, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/tasks`));

    const qHabits = query(collection(db, `users/${user.uid}/habits`));
    const unsubHabits = onSnapshot(qHabits, (snap) => {
      setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/habits`));

    const qSkills = query(collection(db, `users/${user.uid}/skills`));
    const unsubSkills = onSnapshot(qSkills, (snap) => {
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() } as Skill)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/skills`));

    const qJournal = query(collection(db, `users/${user.uid}/journal`), orderBy('date', 'desc'));
    const unsubJournal = onSnapshot(qJournal, (snap) => {
      setJournal(snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/journal`));

    const qAchievements = query(collection(db, `users/${user.uid}/achievements`));
    const unsubAchievements = onSnapshot(qAchievements, (snap) => {
      setAchievements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/achievements`));

    return () => {
      unsubTasks();
      unsubHabits();
      unsubSkills();
      unsubJournal();
      unsubAchievements();
    };
  }, [user]);

  // Daily Quest and Habit Penalty Logic
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!user || !profile) return;

    const checkDailyQuest = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (profile.dailyQuest?.date !== today) {
        // Generate new quest
        const advice = await getAICoachAdvice(tasks, habits, journal);
        const newQuest: DailyQuest = {
          id: Math.random().toString(36).substr(2, 9),
          title: advice.dailyQuest || "Complete 3 Tasks",
          description: "Your AI Coach has set a new challenge for you today!",
          xpReward: advice.rewardXP || 100,
          completed: false,
          date: today
        };
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { dailyQuest: newQuest }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
      }
    };

    const checkHabitPenalties = async () => {
      const today = new Date();
      const habitsToUpdate = habits.filter(h => {
        if (!h.lastCompleted) return false;
        const lastDate = new Date(h.lastCompleted);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (h.frequency === 'daily' && diffDays > 1) return true;
        if (h.frequency === 'weekly' && diffDays > 7) return true;
        return false;
      });

      for (const h of habitsToUpdate) {
        const habitRef = doc(db, `users/${user.uid}/habits`, h.id);
        const penalty = Math.min(h.strength, 10);
        await updateDoc(habitRef, {
          streak: 0,
          strength: Math.max(0, h.strength - penalty),
          lastCompleted: new Date().toISOString() // Reset to avoid repeated penalties
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/habits/${h.id}`));
      }
    };

    checkDailyQuest();
    checkHabitPenalties();
  }, [user, profile?.uid]);

  const claimDailyQuest = async () => {
    if (!user || !profile?.dailyQuest || profile.dailyQuest.completed) return;
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'dailyQuest.completed': true,
      'stats.lastDailyQuestCompleted': new Date().toISOString()
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
    
    soundManager.play('complete');
    await addXP(profile.dailyQuest.xpReward);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const theme = profile?.settings?.theme || 'system';
    const applyTheme = (t: string) => {
      if (t === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      } else {
        document.documentElement.classList.toggle('dark', t === 'dark');
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    if (profile?.settings?.sfxEnabled !== undefined) {
      soundManager.setEnabled(profile.settings.sfxEnabled);
    } else {
      soundManager.setEnabled(true);
    }
  }, [profile?.settings]);

  // Achievement Logic
  useEffect(() => {
    if (!profile || !user) return;

    const checkAchievements = async () => {
      const milestones = [
        { id: 'task_10', type: 'tasks', requirement: 10, title: 'Quest Initiate', description: 'Complete 10 tasks', icon: '🎯' },
        { id: 'task_50', type: 'tasks', requirement: 50, title: 'Quest Master', description: 'Complete 50 tasks', icon: '⚔️' },
        { id: 'level_5', type: 'level', requirement: 5, title: 'Rising Hero', description: 'Reach Level 5', icon: '🚀' },
        { id: 'habit_7', type: 'habits', requirement: 7, title: 'Consistent Hero', description: 'Maintain a 7-day streak', icon: '🔥' },
        { id: 'skill_5', type: 'skills', requirement: 5, title: 'Skillful Apprentice', description: 'Reach Level 5 in any skill', icon: '📚' },
        { id: 'skill_10', type: 'skills', requirement: 10, title: 'Skill Master', description: 'Reach Level 10 in any skill', icon: '🎓' },
        { id: 'habit_strength_80', type: 'habit_strength', requirement: 80, title: 'Iron Will', description: 'Reach 80% strength on any habit', icon: '💎' },
        { id: 'habit_strength_100', type: 'habit_strength', requirement: 100, title: 'Unstoppable', description: 'Reach 100% strength on any habit', icon: '👑' },
        { id: 'task_streak_3', type: 'task_streak', requirement: 3, title: 'Disciplined', description: 'Complete tasks for 3 consecutive days', icon: '📅' }
      ];

      for (const m of milestones) {
        const alreadyUnlocked = achievements.find(a => a.id === m.id);
        if (alreadyUnlocked) continue;

        let met = false;
        if (m.type === 'tasks' && profile.stats.tasksCompleted >= m.requirement) met = true;
        if (m.type === 'level' && profile.level >= m.requirement) met = true;
        if (m.type === 'habits' && habits.some(h => h.streak >= m.requirement)) met = true;
        if (m.type === 'skills' && skills.some(s => s.level >= m.requirement)) met = true;
        if (m.type === 'habit_strength' && habits.some(h => h.strength >= m.requirement)) met = true;
        
        if (m.type === 'task_streak') {
          // Simple streak check: group completed tasks by date
          const completedDates = Array.from(new Set(
            tasks
              .filter(t => t.completed && (t as any).completedAt)
              .map(t => (t as any).completedAt.split('T')[0])
          )).sort().reverse();
          
          let streak = 0;
          if (completedDates.length > 0) {
            streak = 1;
            for (let i = 0; i < completedDates.length - 1; i++) {
              const d1 = new Date(completedDates[i] as string);
              const d2 = new Date(completedDates[i + 1] as string);
              const diffTime = Math.abs(d1.getTime() - d2.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 1) streak++;
              else break;
            }
          }
          if (streak >= m.requirement) met = true;
        }

        if (met) {
          await setDoc(doc(db, `users/${user.uid}/achievements`, m.id), {
            ...m,
            uid: user.uid,
            unlockedAt: new Date().toISOString()
          }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/achievements/${m.id}`));
          soundManager.play('achievement');
        }
      }
    };

    checkAchievements();
  }, [profile?.stats.tasksCompleted, profile?.level, habits, skills, tasks]);

  // AI Coach Advice
  useEffect(() => {
    if (profile && tasks.length > 0) {
      getAICoachAdvice(profile, tasks, habits).then(setAiAdvice);
    }
  }, [profile?.level]);

  // Habit Penalty Logic: Check for missed habits on load
  useEffect(() => {
    if (!user || habits.length === 0) return;

    const checkMissedHabits = async () => {
      const now = new Date();
      const updates = habits.map(async (habit) => {
        if (!habit.lastCompleted) return;
        
        const lastDate = new Date(habit.lastCompleted);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let missed = false;
        if (habit.frequency === 'daily' && diffDays > 1) missed = true;
        if (habit.frequency === 'weekly' && diffDays > 7) missed = true;

        if (missed) {
          const habitRef = doc(db, `users/${user.uid}/habits`, habit.id);
          const penalty = Math.min(habit.strength, 10); // Lose 10 strength
          await updateDoc(habitRef, {
            streak: 0,
            strength: Math.max(0, habit.strength - penalty),
            // We don't update lastCompleted here to avoid repeated penalties if they don't fix it
          }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/habits/${habit.id}`));
        }
      });
      await Promise.all(updates);
    };

    checkMissedHabits();
  }, [user, habits.length]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("Google Sign-In is not enabled in the Firebase Console. Please enable it in the Authentication > Sign-in method tab.");
      } else if (error.code !== 'auth/cancelled-popup-request') {
        alert("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Apple Login Error:", error);
      if (error.code !== 'auth/cancelled-popup-request') {
        alert("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const isDailyQuestCompletedToday = profile?.stats.lastDailyQuestCompleted?.split('T')[0] === new Date().toISOString().split('T')[0];

  const completeDailyQuest = async () => {
    if (!user || !profile || !aiAdvice || isDailyQuestCompletedToday) return;
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      'stats.lastDailyQuestCompleted': new Date().toISOString()
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
    await addXP(aiAdvice.rewardXP || 100);
  };

  const addXP = async (amount: number) => {
    if (!user || !profile) return;
    const userRef = doc(db, 'users', user.uid);
    
    let newXP = profile.xp + amount;
    let newLevel = profile.level;
    const xpNeeded = newLevel * 100 + (newLevel - 1) * 50;

    if (newXP >= xpNeeded) {
      newXP -= xpNeeded;
      newLevel += 1;
    }

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      'stats.totalXP': increment(amount)
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const completeTask = async (task: Task) => {
    if (task.completed || !user || !profile) return;

    const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
    const userRef = doc(db, 'users', user.uid);

    await updateDoc(taskRef, { 
      completed: true,
      completedAt: new Date().toISOString()
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/tasks/${task.id}`));
    
    soundManager.play('complete');
    await addXP(task.xpReward);
    await updateDoc(userRef, {
      'stats.tasksCompleted': increment(1)
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  const toggleSubtask = async (task: Task, subtaskIndex: number) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
    const newSubtasks = [...(task.subtasks || [])];
    newSubtasks[subtaskIndex].completed = !newSubtasks[subtaskIndex].completed;
    await updateDoc(taskRef, { subtasks: newSubtasks }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/tasks/${task.id}`));
  };

  const addHabitXP = async (habit: Habit) => {
    if (!user || !profile) return;
    
    const habitRef = doc(db, `users/${user.uid}/habits`, habit.id);
    const userRef = doc(db, 'users', user.uid);

    // Habit Strength Logic: +5 strength per completion, -10 if missed (handled by backend or app load)
    // For now, let's just do the positive logic
    const newStrength = Math.min(100, habit.strength + 5);
    const bonusXP = Math.floor(habit.xpReward * (1 + habit.streak * 0.1)); // 10% bonus per streak day

    await updateDoc(habitRef, { 
      streak: increment(1),
      strength: newStrength,
      lastCompleted: new Date().toISOString()
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/habits/${habit.id}`));

    soundManager.play('complete');
    await addXP(bonusXP);
    await updateDoc(userRef, {
      'stats.habitsMaintained': increment(1)
    }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto">
          <Zap className="w-12 h-12 text-white fill-current" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">LevelUp Pro</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Turn your real-world progress into an epic RPG adventure.
        </p>
      </motion.div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>
        <button 
          onClick={handleAppleLogin}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
        >
          <Apple className="w-5 h-5 fill-current" />
          Continue with Apple
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 text-gray-900 dark:text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => setActiveTab('profile')}>
              <Avatar settings={profile?.avatar} size="sm" />
              <div className="absolute -bottom-1 -right-1 scale-[0.4] origin-bottom-right">
                <LevelBadge level={profile?.level || 1} />
              </div>
              {!isOnline && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900"
                  title="Offline Mode"
                />
              )}
            </div>
            <div className="flex-1 min-w-[120px]">
              <h2 className="font-bold text-sm truncate">{profile?.displayName}</h2>
              <XPBar xp={profile?.xp || 0} level={profile?.level || 1} />
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Daily Quest Section */}
              {profile?.dailyQuest && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[40px] text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">Daily Quest</span>
                      {profile.dailyQuest.completed && (
                        <span className="px-3 py-1 bg-green-500 rounded-full text-[10px] font-black uppercase tracking-wider">Completed</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black mb-1">{profile.dailyQuest.title}</h3>
                    <p className="text-indigo-100 text-sm font-medium mb-4">{profile.dailyQuest.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-black">{profile.dailyQuest.xpReward} XP</span>
                      </div>
                      {!profile.dailyQuest.completed && (
                        <button 
                          onClick={claimDailyQuest}
                          className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-transform"
                        >
                          Claim Reward
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* AI Coach Card */}
              {aiAdvice && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Coach Advice</span>
                    </div>
                    <p className="text-lg font-medium mb-4 leading-tight">{aiAdvice.advice}</p>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                          <span className="text-xs font-bold text-yellow-300 uppercase">Daily Quest</span>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3 text-yellow-300 fill-current" />
                          <span className="text-[10px] font-black text-yellow-300">+{aiAdvice.rewardXP || 100} XP</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold mb-3">{aiAdvice.dailyQuest}</p>
                      
                      <button 
                        onClick={completeDailyQuest}
                        disabled={isDailyQuestCompletedToday}
                        className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          isDailyQuestCompletedToday 
                            ? 'bg-green-500/30 text-green-200 cursor-default' 
                            : 'bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95'
                        }`}
                      >
                        {isDailyQuestCompletedToday ? 'Quest Completed' : 'Claim Reward'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Tasks</span>
                  </div>
                  <p className="text-2xl font-black">{profile?.stats.tasksCompleted}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Habits</span>
                  </div>
                  <p className="text-2xl font-black">{profile?.stats.habitsMaintained}</p>
                </div>
              </div>

              {/* Focus Mode Trigger */}
              <button 
                onClick={() => setIsFocusMode(true)}
                className="w-full bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/20 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Focus Mode</h3>
                    <p className="text-xs opacity-80">Start a Pomodoro session</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Recent Tasks */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Today's Tasks</h3>
                  <button onClick={() => setActiveTab('tasks')} className="text-indigo-500 text-sm font-bold flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                    <motion.div 
                      key={task.id}
                      layout
                      className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 group"
                    >
                      <button 
                        onClick={() => completeTask(task)}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-indigo-500 transition-colors"
                      >
                        <div className="w-3 h-3 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-20" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{task.title}</h4>
                          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                            task.priority === 'medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                          }`}>
                            {task.priority}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500">
                            {task.category}
                          </span>
                          {task.deadline && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(task.deadline), 'MMM d, HH:mm')}
                            </div>
                          )}
                          {task.reminderTime && (
                            <Bell className="w-3 h-3 text-indigo-500" />
                          )}
                          <span className="text-[10px] font-bold text-indigo-500">+{task.xpReward} XP</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {tasks.filter(t => !t.completed).length === 0 && (
                    <div className="text-center py-12 bg-gray-100/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500 font-medium">All tasks completed! 🎉</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Quest Log</h2>
                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-4 rounded-2xl border ${task.completed ? 'bg-gray-100 dark:bg-gray-800/50 border-transparent opacity-60' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'} flex flex-col gap-3`}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={task.completed}
                        onClick={() => completeTask(task)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}
                      >
                        {task.completed && <Star className="w-3 h-3 text-white fill-current" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-sm ${task.completed ? 'line-through' : ''}`}>{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                              task.priority === 'medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                            }`}>
                              {task.priority}
                            </div>
                            {!task.completed && (
                              <button 
                                onClick={() => {
                                  setEditingTask(task);
                                  setIsTaskModalOpen(true);
                                }}
                                className="p-1 text-gray-400 hover:text-indigo-500"
                              >
                                <PenTool className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500">
                            {task.category}
                          </span>
                          {task.deadline && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(task.deadline), 'MMM d, HH:mm')}
                            </div>
                          )}
                          {task.reminderTime && (
                            <Bell className="w-3 h-3 text-indigo-500" />
                          )}
                          <span className={`text-[10px] font-bold ${task.priority === 'high' ? 'text-red-500' : 'text-gray-400'}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="pl-10 space-y-2">
                        {task.subtasks.map((sub, idx) => (
                          <button 
                            key={idx}
                            onClick={() => toggleSubtask(task, idx)}
                            className="flex items-center gap-2 w-full text-left group"
                          >
                            {sub.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300 group-hover:text-indigo-400" />
                            )}
                            <span className={`text-xs font-medium ${sub.completed ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-300'}`}>
                              {sub.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div 
              key="habits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Habit Tracker</h2>
                <button 
                  onClick={() => setIsHabitModalOpen(true)}
                  className="p-2 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/30"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {habits.map(habit => (
                  <div key={habit.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{habit.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
                          <RefreshCw className="w-3 h-3" /> {habit.frequency}
                        </div>
                      </div>
                      <button 
                        onClick={() => addHabitXP(habit)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl font-bold hover:bg-orange-200 transition-colors"
                      >
                        <Flame className="w-4 h-4 fill-current" />
                        {habit.streak}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${habit.strength}%` }}
                          className={`h-full transition-all duration-1000 ${
                            habit.strength > 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                            habit.strength > 50 ? 'bg-orange-500' :
                            'bg-gray-400'
                          }`}
                        />
                        {habit.strength > 80 && (
                          <motion.div 
                            animate={{ x: ["0%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className={`w-4 h-4 ${habit.strength > 80 ? 'text-orange-500 fill-current' : 'text-gray-400'}`} />
                        <span className="text-[10px] font-black text-gray-500 uppercase">{habit.strength}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Habit Strength</span>
                      <span>{habit.strength > 80 ? 'Elite' : habit.strength > 50 ? 'Strong' : 'Developing'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div 
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Skill Tree</h2>
                <button 
                  onClick={() => setIsSkillModalOpen(true)}
                  className="p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/30"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Visual Skill Tree */}
              <div className="relative p-8 bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 min-h-[600px] overflow-x-auto custom-scrollbar">
                {skills.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <Zap className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold">No skills unlocked yet.</p>
                  </div>
                )}
                
                <div className="relative min-w-[600px]">
                  {/* Skill Tree SVG Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    {skills.map((skill) => {
                      if (!skill.parentId) return null;
                      const parent = skills.find(s => s.id === skill.parentId);
                      if (!parent) return null;
                      
                      // This is a simplified tree layout logic
                      // In a real app, we'd use a library like d3-hierarchy
                      return (
                        <motion.path
                          key={`line-${skill.id}`}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: skill.unlocked ? 0.4 : 0.1 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          d={`M ${parent.id === skills[0].id ? '300' : '300'} ${skills.indexOf(parent) * 150 + 50} Q ${skills.indexOf(skill) % 2 === 0 ? '200' : '400'} ${skills.indexOf(skill) * 150} ${skills.indexOf(skill) % 2 === 0 ? '150' : '450'} ${skills.indexOf(skill) * 150 + 50}`}
                          stroke={skill.unlocked ? "#8B5CF6" : "#94A3B8"}
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="8 8"
                        />
                      );
                    })}
                  </svg>

                  {/* Skill Nodes in a Branching Tree Layout */}
                  <div className="relative flex flex-col items-center gap-24">
                    {/* Root */}
                    {skills[0] && (
                      <div className="relative">
                        <SkillNode skill={skills[0]} delay={0} />
                      </div>
                    )}
                    
                    {/* Level 1 Branches */}
                    <div className="flex justify-center gap-32">
                      {skills.filter(s => s.parentId === skills[0]?.id).map((s, i) => (
                        <div key={s.id} className="relative flex flex-col items-center gap-24">
                          <SkillNode skill={s} delay={(i + 1) * 0.2} />
                          
                          {/* Level 2 Branches */}
                          <div className="flex justify-center gap-16">
                            {skills.filter(sub => sub.parentId === s.id).map((sub, j) => (
                              <SkillNode key={sub.id} skill={sub} delay={(i + j + 2) * 0.2} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                {/* Unparented Skills (Fallback) */}
                <div className="flex flex-wrap justify-center gap-8 pt-12 border-t border-gray-100 dark:border-gray-700 w-full">
                  {skills.filter(s => !s.parentId && s.id !== skills[0]?.id).map((s, i) => (
                    <SkillNode key={s.id} skill={s} delay={(i + 5) * 0.2} />
                  ))}
                </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black">Analytics</h2>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-500" />
                  XP Progression
                </h3>
                <div className="h-48 flex items-end gap-2 px-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="w-full bg-indigo-500/20 rounded-t-lg relative overflow-hidden group"
                      >
                        <div className="absolute bottom-0 w-full bg-indigo-500 h-1/2 group-hover:h-full transition-all" />
                      </motion.div>
                      <span className="text-[10px] font-bold text-gray-400">D{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold">Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-bold text-sm">{achievement.title}</h4>
                        <p className="text-[10px] text-gray-500">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="col-span-2 text-center text-gray-400 py-8 font-bold">No achievements yet. Keep grinding!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <Avatar settings={profile?.avatar} size="lg" />
                </div>
                <h2 className="text-2xl font-black">{profile?.displayName}</h2>
                <p className="text-gray-500 font-medium">Level {profile?.level} Master</p>
              </div>

              <div className="space-y-3">
                <button onClick={() => setIsJournalModalOpen(true)} className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between font-bold">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-indigo-500" />
                    Daily Journal
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Settings
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="font-bold mb-4">Total Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-bold uppercase">Total XP Earned</span>
                    <span className="font-black text-indigo-600">{profile?.stats.totalXP}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-bold uppercase">Quests Completed</span>
                    <span className="font-black text-indigo-600">{profile?.stats.tasksCompleted}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label="Home" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare />} label="Tasks" />
          <NavButton active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} icon={<RefreshCw />} label="Habits" />
          <NavButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} icon={<Zap />} label="Skills" />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart2 />} label="Stats" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User />} label="Profile" />
        </div>
      </nav>

      {/* Modals */}
      <Modal 
        isOpen={isFocusMode} 
        onClose={() => setIsFocusMode(false)} 
        title="Focus Mode"
      >
        <FocusTimer user={user} onComplete={(xp) => { addXP(xp); setIsFocusMode(false); }} />
      </Modal>

      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }} 
        title={editingTask ? "Edit Quest" : "New Quest"}
      >
        <TaskForm 
          user={user} 
          task={editingTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }} 
        />
      </Modal>

      <Modal 
        isOpen={isHabitModalOpen} 
        onClose={() => setIsHabitModalOpen(false)} 
        title="New Habit"
      >
        <HabitForm user={user} onClose={() => setIsHabitModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isSkillModalOpen} 
        onClose={() => setIsSkillModalOpen(false)} 
        title="New Skill"
      >
        <SkillForm user={user} onClose={() => setIsSkillModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isJournalModalOpen} 
        onClose={() => setIsJournalModalOpen(false)} 
        title="Journal Entry"
      >
        <JournalForm user={user} onClose={() => setIsJournalModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        title="Settings"
      >
        <SettingsForm user={user} profile={profile} onClose={() => setIsSettingsModalOpen(false)} />
      </Modal>
    </div>
  );
}

// --- Helper Components ---

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <div className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl' : ''}`}>
      {cloneElement(icon, { size: 20, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

import { cloneElement } from 'react';

const Modal = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[40px] z-50 p-8 max-w-xl mx-auto border-t border-gray-200 dark:border-gray-800"
        >
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
          <h3 className="text-2xl font-black mb-6">{title}</h3>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- Forms ---

const TaskForm = ({ user, task, onClose }: any) => {
  const [title, setTitle] = useState(task?.title || '');
  const [category, setCategory] = useState<Category>(task?.category || 'personal');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [deadline, setDeadline] = useState(task?.deadline || '');
  const [reminder, setReminder] = useState('none');

  const addSubtask = () => {
    if (!newSubtask) return;
    setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
    setNewSubtask('');
  };

  const removeSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const toggleSubtaskInForm = async (idx: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks[idx].completed = !newSubtasks[idx].completed;
    setSubtasks(newSubtasks);

    // If editing an existing task, update the database immediately
    if (task && user) {
      const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
      await updateDoc(taskRef, { subtasks: newSubtasks }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/tasks/${task.id}`));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title || !user) return;
    
    let reminderTime = null;
    if (deadline && reminder !== 'none') {
      const deadlineDate = parseISO(deadline);
      if (reminder === '1h') reminderTime = subHours(deadlineDate, 1).toISOString();
      if (reminder === '1d') reminderTime = subDays(deadlineDate, 1).toISOString();
    }

    const taskData = {
      uid: user.uid,
      title,
      category,
      priority,
      completed: task?.completed || false,
      xpReward: priority === 'high' ? 50 : priority === 'medium' ? 30 : 15,
      createdAt: task?.createdAt || new Date().toISOString(),
      subtasks,
      deadline: deadline || null,
      reminderTime
    };

    if (task) {
      const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
      await updateDoc(taskRef, taskData).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/tasks/${task.id}`));
    } else {
      await addDoc(collection(db, `users/${user.uid}/tasks`), taskData).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/tasks`));
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <input 
        autoFocus
        placeholder="What's your next quest?"
        className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase">Subtasks</label>
        <div className="flex gap-2">
          <input 
            placeholder="Add a subtask..."
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-none text-sm font-bold"
            value={newSubtask}
            onChange={e => setNewSubtask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
          />
          <button 
            type="button"
            onClick={addSubtask}
            className="p-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1">
          {subtasks.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl group border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => toggleSubtaskInForm(i)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    s.completed 
                      ? 'bg-indigo-500 border-indigo-500 text-white' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                  }`}
                >
                  {s.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <span className={`text-sm font-bold ${s.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{s.title}</span>
              </div>
              <button 
                type="button"
                onClick={() => removeSubtask(i)} 
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Deadline</label>
          <input 
            type="datetime-local"
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-none text-xs font-bold"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Reminder</label>
          <select 
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border-none text-xs font-bold"
            value={reminder}
            onChange={e => setReminder(e.target.value)}
          >
            <option value="none">None</option>
            <option value="1h">1 Hour Before</option>
            <option value="1d">1 Day Before</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['study', 'health', 'coding', 'personal'].map(cat => (
          <button 
            key={cat}
            type="button"
            onClick={() => setCategory(cat as Category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap ${category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {['low', 'medium', 'high'].map(p => (
          <button 
            key={p}
            type="button"
            onClick={() => setPriority(p as Priority)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase ${priority === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
          >
            {p}
          </button>
        ))}
      </div>
      <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30">
        Add Quest
      </button>
    </form>
  );
};

const HabitForm = ({ user, onClose }: any) => {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title || !user) return;
    
    await addDoc(collection(db, `users/${user.uid}/habits`), {
      uid: user.uid,
      title,
      frequency,
      streak: 0,
      strength: 0,
      xpReward: frequency === 'daily' ? 20 : 50
    }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/habits`));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        autoFocus
        placeholder="Build a new habit..."
        className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-orange-500 font-bold"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <div className="flex gap-2">
        {['daily', 'weekly'].map(f => (
          <button 
            key={f}
            type="button"
            onClick={() => setFrequency(f as Frequency)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase ${frequency === f ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <button type="submit" className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30">
        Start Habit
      </button>
    </form>
  );
};

const SkillForm = ({ user, onClose }: any) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name || !user) return;
    
    await addDoc(collection(db, `users/${user.uid}/skills`), {
      uid: user.uid,
      name,
      level: 1,
      xp: 0
    }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/skills`));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        autoFocus
        placeholder="What skill are you mastering?"
        className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-purple-500 font-bold"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button type="submit" className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30">
        Unlock Skill
      </button>
    </form>
  );
};

const JournalForm = ({ user, onClose }: any) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!content || !user) return;
    
    await addDoc(collection(db, `users/${user.uid}/journal`), {
      uid: user.uid,
      content,
      mood,
      date: new Date().toISOString()
    }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/journal`));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center gap-6 mb-4">
        <button type="button" onClick={() => setMood('happy')} className={`p-4 rounded-2xl transition-all ${mood === 'happy' ? 'bg-green-100 dark:bg-green-900/30 scale-110' : 'opacity-40'}`}>
          <Smile className="w-8 h-8 text-green-600" />
        </button>
        <button type="button" onClick={() => setMood('neutral')} className={`p-4 rounded-2xl transition-all ${mood === 'neutral' ? 'bg-gray-100 dark:bg-gray-800/30 scale-110' : 'opacity-40'}`}>
          <Meh className="w-8 h-8 text-gray-600" />
        </button>
        <button type="button" onClick={() => setMood('sad')} className={`p-4 rounded-2xl transition-all ${mood === 'sad' ? 'bg-red-100 dark:bg-red-900/30 scale-110' : 'opacity-40'}`}>
          <Frown className="w-8 h-8 text-red-600" />
        </button>
      </div>
      <textarea 
        autoFocus
        placeholder="How was your day, hero?"
        className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-indigo-500 font-bold h-32 resize-none"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30">
        Save Entry
      </button>
    </form>
  );
};

const SettingsForm = ({ user, profile, onClose }: any) => {
  const [notifications, setNotifications] = useState(profile?.settings?.notificationsEnabled ?? false);
  const [theme, setTheme] = useState(profile?.settings?.theme ?? 'system');
  const [sfxEnabled, setSfxEnabled] = useState(profile?.settings?.sfxEnabled ?? true);
  
  // Avatar state
  const [bodyType, setBodyType] = useState(profile?.avatar?.bodyType ?? 'normal');
  const [outfit, setOutfit] = useState(profile?.avatar?.outfit ?? 'casual');
  const [color, setColor] = useState(profile?.avatar?.color ?? '#FFDBAC');
  const [hairColor, setHairColor] = useState(profile?.avatar?.hairColor ?? '#4A5568');
  const [hairStyle, setHairStyle] = useState(profile?.avatar?.hairStyle ?? 'short');
  const [accessory, setAccessory] = useState(profile?.avatar?.accessory ?? 'none');

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifications(true);
      } else {
        alert("Notification permission denied. Please enable it in your browser settings.");
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    
    if (notifications && "Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    // Use setDoc with merge: true to ensure nested objects are created if they don't exist
    await setDoc(userRef, {
      settings: {
        notificationsEnabled: notifications,
        theme: theme,
        sfxEnabled: sfxEnabled,
      },
      avatar: {
        bodyType: bodyType,
        outfit: outfit,
        color: color,
        hairColor: hairColor,
        hairStyle: hairStyle,
        accessory: accessory
      }
    }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
    
    soundManager.play('click');
    onClose();
  };

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Avatar Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserCircle className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Avatar Customization</h4>
        </div>
        
        <div className="flex justify-center mb-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl">
          <Avatar settings={{ bodyType, outfit, color, hairColor, hairStyle, accessory }} size="lg" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Dna className="w-3 h-3" /> Body Type
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['slim', 'normal', 'buff', 'athletic', 'curvy', 'tall', 'short'].map(t => (
                <button
                  key={t}
                  onClick={() => setBodyType(t as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${bodyType === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Shirt className="w-3 h-3" /> Outfit
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['warrior', 'mage', 'rogue', 'casual', 'noble', 'scholar', 'explorer', 'assassin', 'knight', 'monk', 'merchant'].map(o => (
                <button
                  key={o}
                  onClick={() => setOutfit(o as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${outfit === o ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <UserCircle className="w-3 h-3" /> Hair Style
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['short', 'long', 'spiky', 'bald', 'ponytail', 'mohawk', 'braids', 'curly', 'undercut'].map(s => (
                <button
                  key={s}
                  onClick={() => setHairStyle(s as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${hairStyle === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Award className="w-3 h-3" /> Accessory
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {['none', 'glasses', 'scarf', 'crown', 'eyepatch', 'cape'].map(a => (
                <button
                  key={a}
                  onClick={() => setAccessory(a as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${accessory === a ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                <ColorIcon className="w-3 h-3" /> Skin Color
              </label>
              <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                <Palette className="w-3 h-3" /> Hair Color
              </label>
              <input 
                type="color" 
                value={hairColor} 
                onChange={e => setHairColor(e.target.value)}
                className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Appearance</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
            { id: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
            { id: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${theme === t.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
            >
              {t.icon}
              <span className="text-[10px] font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Sound Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Sound Effects</h4>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center gap-3">
            {sfxEnabled ? <Volume2 className="text-indigo-500" /> : <VolumeX className="text-gray-400" />}
            <div>
              <p className="font-bold text-sm">Game Sounds</p>
              <p className="text-[10px] text-gray-500">SFX for leveling and tasks</p>
            </div>
          </div>
          <button 
            onClick={() => setSfxEnabled(!sfxEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${sfxEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <motion.div 
              animate={{ x: sfxEnabled ? 24 : 4 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Notifications</h4>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center gap-3">
            {notifications ? <Bell className="text-indigo-500" /> : <BellOff className="text-gray-400" />}
            <div>
              <p className="font-bold text-sm">Push Notifications</p>
              <p className="text-[10px] text-gray-500">Reminders for your quests</p>
            </div>
          </div>
          <button 
            onClick={notifications ? () => setNotifications(false) : requestPermission}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <motion.div 
              animate={{ x: notifications ? 24 : 4 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 sticky bottom-0"
      >
        Save All Changes
      </button>
    </div>
  );
};
