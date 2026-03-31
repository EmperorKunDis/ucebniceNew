'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalChapters: number
    totalAchievements: number
    totalCompletedChapters: number
    totalChapterCompletions: number
    totalQuestionAnswers: number
    totalProjectSubmissions: number
  }
  averages: {
    xp: string
    level: string
    streak: string
  }
  topUsers: Array<{
    id: string
    name: string | null
    username: string | null
    email: string | null
    xp: number
    level: number
  }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching analytics:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading analytics data</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.totalUsers}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Users (7d)</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.activeUsers}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Chapters</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.totalChapters}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Achievements</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.totalAchievements}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Completed Chapters</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.totalCompletedChapters}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Question Answers</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.totalQuestionAnswers}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Project Submissions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.overview.totalProjectSubmissions}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Level</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.averages.level}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Top Users by XP</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.username || user.email || 'Anonymous'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Users</h3>
              <p className="text-sm text-gray-500">View, edit, and manage user accounts</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/chapters" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Chapters</h3>
              <p className="text-sm text-gray-500">Create and edit chapter content</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics" className="block">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-2">View Analytics</h3>
              <p className="text-sm text-gray-500">Detailed insights and statistics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
