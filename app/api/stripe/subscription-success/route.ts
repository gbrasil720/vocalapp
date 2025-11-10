import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    const sessionId = searchParams.get('session_id')
    const subscriptionId = searchParams.get('subscriptionId')
    const checkoutId = searchParams.get('checkout_id')

    const successUrl = new URL('/success', req.url)
    const idToUse = sessionId || subscriptionId || checkoutId

    if (idToUse) {
      successUrl.searchParams.set('checkout_id', idToUse)
    }

    console.log('Subscription success redirect:', {
      sessionId,
      subscriptionId,
      checkoutId,
      redirectTo: successUrl.toString()
    })

    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('Error handling subscription success redirect:', error)
    return NextResponse.redirect(new URL('/success', req.url))
  }
}
