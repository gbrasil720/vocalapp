import { NextResponse } from 'next/server'
import { dodoPayments } from '@/lib/billing/dodo-payments'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const subscriptionId = searchParams.get('subscriptionId')

    if (!paymentId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing paymentId or subscriptionId' },
        { status: 400 }
      )
    }

    let data: any = null
    let type = ''

    if (paymentId) {
      type = 'payment'
      data = await dodoPayments.payments.retrieve(paymentId)
    } else if (subscriptionId) {
      type = 'subscription'
      data = await dodoPayments.subscriptions.retrieve(subscriptionId)
    }

    return NextResponse.json({
      type,
      data
    })
  } catch (error: any) {
    console.error('Error fetching billing details:', error)

    // Check for 404 or specific Dodo error codes if available
    if (error?.status === 404 || error?.code === 'resource_missing') {
      return NextResponse.json(
        { error: 'Payment or subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to fetch billing details' },
      { status: 500 }
    )
  }
}
