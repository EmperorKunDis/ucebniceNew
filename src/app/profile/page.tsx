'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Mail, Calendar, Trophy, Zap, Target, LogOut, Loader2, Award } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { getProgressToNextLevel } from '@/lib/gamification';

interface UserStats {
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    image: string | null;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    createdAt: Date;
  };
  stats: {
    completedChapters: number;
    totalAchievements: number;
    currentStreak: number;
    longestStreak: number;
    levelProgress: ReturnType<typeof getProgressToNextLevel>;
  };
  achievements: Array<{
    id: string;
    badgeId: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: string;
    unlockedAt: Date;
  }>;
  recentCompletions: Array<{
    id: string;
    lessonTitle: string;
    completedAt: Date;
    xpEarned: number;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (status === 'authenticated') {
      fetchUserStats();
    }
  }, [status, router]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Načítání profilu...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !userStats) {
    return null;
  }

  const memberSince = new Date(userStats.user.createdAt).toLocaleDateString('cs-CZ', {
    month: 'long',
    year: 'numeric',
  });

  const levelProgress = userStats.stats.levelProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Navigation */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Učebnice AI
            </Link>

            <div className="flex gap-6">
              <Link href="/chapters" className="text-gray-300 hover:text-purple-300 transition-colors">
                Kapitoly
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-purple-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/arena" className="text-gray-300 hover:text-purple-300 transition-colors">
                Apex Aréna
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10" />
            <div className="relative p-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 p-1">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                          {userStats.user.image ? (
                            <img
                              src={userStats.user.image}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-900" />
                    </div>

                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {userStats.user.name || 'Uživatel'}
                      </h1>
                      <p className="text-gray-400 mt-1">
                        @{userStats.user.username || userStats.user.email?.split('@')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                          <span className="text-sm font-medium text-purple-300">Level {userStats.user.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-3 text-gray-400 mb-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <p className="text-white truncate">{userStats.user.email}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-3 text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Člen od</span>
                    </div>
                    <p className="text-white">{memberSince}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-3 text-gray-400 mb-1">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm">Level</span>
                    </div>
                    <p className="text-white">{userStats.user.level}</p>
                  </div>
                </div>

                {/* Level Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Pokrok do Level {userStats.user.level + 1}</span>
                    <span className="text-sm text-purple-400 font-medium">
                      {Math.round(levelProgress.progressPercent)}%
                    </span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${levelProgress.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {userStats.user.xp} / {levelProgress.nextLevelXP} XP
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10" />
              <div className="relative p-6 text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userStats.user.xp}</div>
                <div className="text-sm text-gray-400">Celkem XP</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10" />
              <div className="relative p-6 text-center">
                <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userStats.achievements.length}</div>
                <div className="text-sm text-gray-400">Odznaků</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10" />
              <div className="relative p-6 text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{userStats.stats.completedChapters}</div>
                <div className="text-sm text-gray-400">Dokončených kapitol</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10" />
              <div className="relative p-6 text-center">
                <div className="text-3xl mx-auto mb-2">🔥</div>
                <div className="text-2xl font-bold text-white">{userStats.user.currentStreak}</div>
                <div className="text-sm text-gray-400">Denní streak</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10" />
            <div className="relative p-8">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Poslední úspěchy</h2>
              </div>

              {userStats.achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userStats.achievements.slice(0, 8).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="group relative p-4 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-purple-500/30"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h3 className="text-sm font-medium text-white mb-1">{achievement.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{achievement.description}</p>
                        <div className="mt-2 text-xs text-purple-400">+{achievement.xpReward} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Zatím nemáte žádné odznaky. Začněte s lekcemi a získejte své první úspěchy!
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Link href="/achievements">
              <Button variant="secondary" className="bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10">
                Zobrazit všechny úspěchy
              </Button>
            </Link>

            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="ghost"
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
