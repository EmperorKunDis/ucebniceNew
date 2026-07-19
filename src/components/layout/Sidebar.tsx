'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
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
  Home,
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
  { href: '/dashboard', icon: BookOpen, label: 'Učení' },
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
          isActive
            ? 'bg-[#6747ff] text-white shadow-lg shadow-[#6747ff]/25'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
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
              isActive ? 'bg-white/20 text-white' : 'bg-purple-600 text-white'
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
        'flex flex-col h-full bg-gray-950/95 border-r border-white/10 transition-all duration-300 shadow-2xl shadow-purple-950/20',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
              <Image
                src="/ucebnice-logo.png"
                alt=""
                width={41}
                height={32}
                className="h-8 w-auto shrink-0"
              />
              <span className="truncate text-white font-semibold">Učebnice AI</span>
            </Link>
            <Link
              href="/"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Domů na hlavní stránku"
              title="Domů na hlavní stránku"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={collapsed ? 'Rozbalit postranní navigaci' : 'Sbalit postranní navigaci'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{navItems.map(renderNavItem)}</nav>

      {/* Bottom navigation */}
      <div className="p-3 border-t border-white/10 space-y-1">{bottomItems.map(renderNavItem)}</div>
    </aside>
  )
}
