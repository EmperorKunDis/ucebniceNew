import { Box, Stack } from '@/components/ui';
import Link from 'next/link';
import { Trophy, Star, Lock } from 'lucide-react';
import { BADGES, COLORS } from '@/lib/constants';

export const metadata = {
  title: 'Úspěchy | Učebnice programování AI',
  description: 'Přehled všech odznaků a úspěchů',
};

export default function AchievementsPage() {
  // TODO: Načíst skutečné odznaky uživatele z databáze
  const unlockedBadges = ['first-step', 'glitch-hunter']; // Mock data

  const badgesByRarity = Object.entries(BADGES).reduce((acc, [key, badge]) => {
    if (!acc[badge.rarity]) acc[badge.rarity] = [];
    acc[badge.rarity].push({ ...badge, key });
    return acc;
  }, {} as Record<string, typeof BADGES[keyof typeof BADGES] & { key: string }[]>);

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
              <Link href="/lessons" className="text-gray-300 hover:text-white transition-colors">
                Lekce
              </Link>
              <Link href="/chapters" className="text-gray-300 hover:text-white transition-colors">
                Kapitoly
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                Profil
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Header */}
      <Box className="pt-12 pb-8 px-4">
        <Box className="max-w-6xl mx-auto text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-4">
            Úspěchy a odznaky
          </h1>
          <p className="text-xl text-gray-400">
            Sbírejte odznaky za dokončené lekce, výzvy a speciální úspěchy
          </p>
        </Box>
      </Box>

      {/* Stats */}
      <Box className="max-w-6xl mx-auto px-4 mb-12">
        <Box className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <Box>
              <div className="text-3xl font-bold text-white">{unlockedBadges.length}</div>
              <div className="text-sm text-gray-400">Odemčeno</div>
            </Box>
            <Box>
              <div className="text-3xl font-bold text-gray-500">
                {Object.keys(BADGES).length - unlockedBadges.length}
              </div>
              <div className="text-sm text-gray-400">Zamčeno</div>
            </Box>
            <Box>
              <div className="text-3xl font-bold text-yellow-400">
                {Math.round((unlockedBadges.length / Object.keys(BADGES).length) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Dokončeno</div>
            </Box>
            <Box>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.floor(unlockedBadges.length / 2) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-400">Hodnocení</div>
            </Box>
          </div>
        </Box>
      </Box>

      {/* Badges by Rarity */}
      <Box className="max-w-6xl mx-auto px-4 pb-16">
        <Stack className="space-y-8">
          {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as const).map((rarity) => {
            const badges = badgesByRarity[rarity] || [];
            if (badges.length === 0) return null;

            return (
              <Box key={rarity}>
                <h2 
                  className="text-2xl font-bold mb-6 flex items-center gap-3"
                  style={{ color: COLORS.rarity[rarity] }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.rarity[rarity] }} />
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {badges.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    
                    return (
                      <Box
                        key={badge.id}
                        className={`relative bg-gray-800 rounded-xl p-6 border ${
                          isUnlocked 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-700 opacity-50'
                        } transition-all text-center group`}
                      >
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center">
                            <Lock className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        
                        <div className="text-4xl mb-3">{badge.icon}</div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {badge.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {badge.description}
                        </p>
                        <div className="text-xs text-yellow-400">
                          +{badge.xpReward} XP
                        </div>
                      </Box>
                    );
                  })}
                </div>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}