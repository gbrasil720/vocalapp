/**
 * Plan-based limits configuration
 */

export interface PlanLimits {
  maxLanguages: number
}

export const PLAN_LIMITS = {
  free: {
    maxLanguages: 10
  },
  pro: {
    maxLanguages: Infinity // Unlimited languages for Pro plan
  }
} as const

/**
 * Get plan limits based on subscription status
 * @param hasActiveSubscription Whether user has active Pro subscription
 * @returns Plan limits object
 */
export function getPlanLimits(hasActiveSubscription: boolean): PlanLimits {
  return hasActiveSubscription ? PLAN_LIMITS.pro : PLAN_LIMITS.free
}

/**
 * Check if user can use a new language
 * @param hasActiveSubscription Whether user has active Pro subscription
 * @param currentLanguageCount Current number of unique languages used
 * @param isNewLanguage Whether this is a new language for the user
 * @returns Object with canUse and reason
 */
export function canUseLanguage(
  hasActiveSubscription: boolean,
  currentLanguageCount: number,
  isNewLanguage: boolean
): { canUse: boolean; reason?: string } {
  const limits = getPlanLimits(hasActiveSubscription)

  // Pro plan has unlimited languages
  if (hasActiveSubscription) {
    return { canUse: true }
  }

  // Free plan: check if adding new language exceeds limit
  if (isNewLanguage && currentLanguageCount >= limits.maxLanguages) {
    return {
      canUse: false,
      reason: `Your free plan supports up to ${limits.maxLanguages} languages. Upgrade to Pro for unlimited languages.`
    }
  }

  return { canUse: true }
}

