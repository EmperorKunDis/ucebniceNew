import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminShell } from '@/components/layout/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isAdmin: true },
  })

  if (user?.role !== 'ADMIN' && !user?.isAdmin) {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
