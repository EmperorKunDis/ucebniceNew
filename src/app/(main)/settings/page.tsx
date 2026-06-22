'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  Moon,
  Volume2,
  Globe,
  LogOut,
  ChevronRight,
  Save,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingItemProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function SettingItem({ icon, title, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400">
          {icon}
        </div>
        <div>
          <div className="font-medium text-white">{title}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors',
        enabled ? 'bg-indigo-600' : 'bg-gray-600'
      )}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    sound: true,
    streakReminder: true,
    weeklyReport: true,
    language: 'cs',
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Save settings to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Show success toast
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Nastavení</h1>
        <p className="text-gray-400">Přizpůsob si aplikaci podle sebe</p>
      </motion.div>

      {/* Profile Section */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Profil
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Jméno</label>
            <input
              type="text"
              defaultValue={session?.user?.name ?? ''}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Uživatelské jméno</label>
            <input
              type="text"
              defaultValue={session?.user?.username ?? ''}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              defaultValue={session?.user?.email ?? ''}
              disabled
              className="w-full px-4 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </motion.section>

      {/* Preferences Section */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-400" />
          Vzhled
        </h2>

        <SettingItem
          icon={<Moon className="w-5 h-5" />}
          title="Tmavý režim"
          description="Šetři oči"
        >
          <Toggle
            enabled={settings.darkMode}
            onChange={v => setSettings({ ...settings, darkMode: v })}
          />
        </SettingItem>

        <SettingItem
          icon={<Volume2 className="w-5 h-5" />}
          title="Zvuky"
          description="Zvukové efekty při učení"
        >
          <Toggle enabled={settings.sound} onChange={v => setSettings({ ...settings, sound: v })} />
        </SettingItem>

        <SettingItem
          icon={<Globe className="w-5 h-5" />}
          title="Jazyk"
          description="Jazyk aplikace"
        >
          <select
            value={settings.language}
            onChange={e => setSettings({ ...settings, language: e.target.value })}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="cs">Čeština</option>
            <option value="en">English</option>
          </select>
        </SettingItem>
      </motion.section>

      {/* Notifications Section */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-400" />
          Notifikace
        </h2>

        <SettingItem
          icon={<Bell className="w-5 h-5" />}
          title="Push notifikace"
          description="Připomínky a novinky"
        >
          <Toggle
            enabled={settings.notifications}
            onChange={v => setSettings({ ...settings, notifications: v })}
          />
        </SettingItem>

        <SettingItem
          icon={<span className="text-lg">🔥</span>}
          title="Streak reminder"
          description="Připomínka k udržení streak"
        >
          <Toggle
            enabled={settings.streakReminder}
            onChange={v => setSettings({ ...settings, streakReminder: v })}
          />
        </SettingItem>

        <SettingItem
          icon={<span className="text-lg">📊</span>}
          title="Týdenní report"
          description="Shrnutí tvého pokroku"
        >
          <Toggle
            enabled={settings.weeklyReport}
            onChange={v => setSettings({ ...settings, weeklyReport: v })}
          />
        </SettingItem>
      </motion.section>

      {/* Security Section */}
      <motion.section
        className="bg-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Účet
        </h2>

        <button className="w-full flex items-center justify-between py-4 text-gray-300 hover:text-white transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span>Změnit heslo</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-between py-4 text-red-400 hover:text-red-300 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span>Odhlásit se</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.section>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Ukládám...' : 'Uložit změny'}
      </motion.button>
    </div>
  )
}
