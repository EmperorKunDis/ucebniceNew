'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Stack } from '@/components/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Mail, Calendar, Trophy, Zap, Target, Edit2, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = useUserStore((state) => state);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Načítání...</div>
      </Box>
    );
  }

  if (!session?.user) {
    return null;
  }

  const memberSince = new Date(session.user.id).toLocaleDateString('cs-CZ', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Box className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <Box className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
        <Box className="max-w-7xl mx-auto px-4 py-4">
          <Stack direction="row" justify="between" align="center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Učebnice AI
            </Link>
            
            <Stack direction="row" gap={4}>
              <Link href="/chapters" className="text-gray-300 hover:text-white transition-colors">
                Kapitoly
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/arena" className="text-gray-300 hover:text-white transition-colors">
                Apex Aréna
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Profile Content */}
      <Box className="max-w-4xl mx-auto px-4 py-12">
        <Stack className="space-y-8">
          {/* Profile Header */}
          <Box className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <Stack className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-800" />
                  </div>
                  
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {session.user.name || 'Uživatel'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                      @{user.username || session.user.email?.split('@')[0]}
                    </p>
                  </div>
                </div>
                
                <Button variant="secondary" size="sm" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Upravit profil
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Box className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="text-white">{session.user.email}</p>
                </Box>
                
                <Box className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Člen od</span>
                  </div>
                  <p className="text-white">{memberSince}</p>
                </Box>
                
                <Box className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-gray-400 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Level</span>
                  </div>
                  <p className="text-white">{user.level}</p>
                </Box>
              </div>
            </Stack>
          </Box>

          {/* Stats */}
          <Box className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Statistiky</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Box className="text-center">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{user.xp}</div>
                <div className="text-sm text-gray-400">Celkem XP</div>
              </Box>
              
              <Box className="text-center">
                <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{user.badges.length}</div>
                <div className="text-sm text-gray-400">Odznaků</div>
              </Box>
              
              <Box className="text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{user.progress?.length || 0}</div>
                <div className="text-sm text-gray-400">Dokončených lekcí</div>
              </Box>
              
              <Box className="text-center">
                <div className="text-3xl mx-auto mb-2">🔥</div>
                <div className="text-2xl font-bold text-white">{user.streak || 0}</div>
                <div className="text-sm text-gray-400">Denní streak</div>
              </Box>
            </div>
          </Box>

          {/* Recent Achievements */}
          <Box className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Poslední úspěchy</h2>
            
            {user.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.badges.slice(0, 4).map((badge) => (
                  <Box
                    key={badge.id}
                    className="text-center p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h3 className="text-sm font-medium text-white">{badge.name}</h3>
                  </Box>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Zatím nemáte žádné odznaky. Začněte s lekcemi a získejte své první úspěchy!
              </p>
            )}
          </Box>

          {/* Actions */}
          <Box className="flex justify-between items-center">
            <Link href="/achievements">
              <Button variant="secondary">
                Zobrazit všechny úspěchy
              </Button>
            </Link>
            
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="ghost"
              className="gap-2 text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}