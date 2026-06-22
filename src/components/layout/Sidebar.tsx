'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  Trophy,
  Target,
  Users,
  ShoppingBag,
  Bot,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Domů' },
  { href: '/learn', icon: BookOpen, label: 'Učení' },
  { href: '/leagues', icon: Trophy, label: 'Ligy' },
  { href: '/quests', icon: Target, label: 'Úkoly' },
  { href: '/friends', icon: Users, label: 'Přátelé' },
  { href: '/shop', icon: ShoppingBag, label: 'Obchod' },
  { href: '/ai-tutor', icon: Bot, label: 'AI Tutor' },
]

const bottomItems: NavItem[] = [
  { href: '/certificate', icon: Award, label: 'Certifikát' },
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/settings', icon: Settings, label: 'Nastavení' },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group',
          isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        )}
      >
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
            layoutId="sidebar-indicator"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="font-medium truncate">{item.label}</span>}
        {item.badge && item.badge > 0 && (
          <span
            className={cn(
              'ml-auto px-2 py-0.5 text-xs font-bold rounded-full',
              isActive ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-gray-900 border-r border-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-white font-semibold">Učebnice AI</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{navItems.map(renderNavItem)}</nav>

      {/* Bottom navigation */}
      <div className="p-3 border-t border-gray-800 space-y-1">{bottomItems.map(renderNavItem)}</div>
    </aside>
  )
}
