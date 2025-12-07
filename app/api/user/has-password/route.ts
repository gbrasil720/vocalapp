import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { account } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user has a credential account (password account)
    const credentialAccount = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, 'credential'))
      )
      .limit(1)

    const hasPassword =
      credentialAccount.length > 0 && credentialAccount[0].password !== null

    return NextResponse.json({ hasPassword })
  } catch (error) {
    console.error('Error checking password status:', error)
    return NextResponse.json(
      { error: 'Failed to check password status' },
      { status: 500 }
    )
  }
}
