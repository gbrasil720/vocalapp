import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  type CreditPackType,
  getCreditPack
} from '@/lib/billing/credit-products'
import { addCredits } from '@/lib/credits'

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { packType, sessionId } = body as {
      packType: CreditPackType
      sessionId?: string
    }

    if (!packType || !['basic', 'popular', 'premium'].includes(packType)) {
      return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 })
    }

    const pack = getCreditPack(packType)

    await addCredits(session.user.id, pack.credits, {
      type: 'purchase',
      description: `Purchased ${pack.name} credit pack (${pack.credits} credits) - DEV MODE`,
      packType: pack.type,
      devMode: true,
      sessionId
    })

    console.log(
      `✅ [DEV MODE] Added ${pack.credits} credits to user ${session.user.id}`
    )

    return NextResponse.json({
      success: true,
      credits: pack.credits,
      newBalance: await getUserNewBalance(session.user.id)
    })
  } catch (error) {
    console.error('Error granting credits:', error)
    return NextResponse.json(
      { error: 'Failed to grant credits' },
      { status: 500 }
    )
  }
}

async function getUserNewBalance(userId: string): Promise<number> {
  const { getUserCredits } = await import('@/lib/credits')
  return await getUserCredits(userId)
}
