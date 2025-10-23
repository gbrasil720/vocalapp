import { type NextRequest, NextResponse } from 'next/server'

/**
 * Custom handler for Stripe subscription success
 * This intercepts the redirect and captures any relevant IDs
 * before redirecting to the final success page
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    // Try to get ID from various possible parameter names
    const sessionId = searchParams.get('session_id')
    const subscriptionId = searchParams.get('subscriptionId')
    const checkoutId = searchParams.get('checkout_id')

    // Build the success URL with available IDs
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
    // Fallback to success page without session ID
    return NextResponse.redirect(new URL('/success', req.url))
  }
}
