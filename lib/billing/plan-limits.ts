export interface PlanLimits {
  maxLanguages: number
}

export const PLAN_LIMITS = {
  free: {
    maxLanguages: 10
  },
  pro: {
    maxLanguages: Infinity
  }
} as const

export function getPlanLimits(hasActiveSubscription: boolean): PlanLimits {
  return hasActiveSubscription ? PLAN_LIMITS.pro : PLAN_LIMITS.free
}

export function canUseLanguage(
  hasActiveSubscription: boolean,
  currentLanguageCount: number,
  isNewLanguage: boolean
): { canUse: boolean; reason?: string } {
  const limits = getPlanLimits(hasActiveSubscription)

  if (hasActiveSubscription) {
    return { canUse: true }
  }

  if (isNewLanguage && currentLanguageCount >= limits.maxLanguages) {
    return {
      canUse: false,
      reason: `Your free plan supports up to ${limits.maxLanguages} languages. Upgrade to Pro for unlimited languages.`
    }
  }

  return { canUse: true }
}
