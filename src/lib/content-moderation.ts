const DISALLOWED_PATTERNS = [
  /\b(stupid|idiot|dumb|moron|loser|trash|pathetic)\b/i,
  /\b(hate you|i hate you|worthless|disgusting)\b/i,
  /\b(scammer|fraud|fake story|liar)\b/i,
  /\b(kill yourself|go die|drop dead)\b/i,
  /\b(fuck|shit|bitch|asshole|bastard)\b/i,
];

const SUPPORTIVE_PATTERNS = [
  /\b(hope|praying|prayers|support|care|strength|bless|kindness|love|encourage)\b/i,
  /\b(you can do this|thinking of you|wishing you well|stay strong)\b/i,
  /\b(thank you|appreciate|grateful)\b/i,
];

export function moderateSupportiveContent(content: string) {
  const normalized = content.trim().replace(/\s+/g, ' ');

  if (!normalized) {
    return { allowed: false, reason: 'Content cannot be empty.' };
  }

  const matchedBlockedPattern = DISALLOWED_PATTERNS.find((pattern) => pattern.test(normalized));
  if (matchedBlockedPattern) {
    return {
      allowed: false,
      reason: 'Please keep posts and comments respectful, supportive, and free of abusive language.',
    };
  }

  const hasSupportiveLanguage = SUPPORTIVE_PATTERNS.some((pattern) => pattern.test(normalized));
  const hasExcessiveCaps = normalized.length >= 12 && normalized === normalized.toUpperCase();

  if (!hasSupportiveLanguage && hasExcessiveCaps) {
    return {
      allowed: false,
      reason: 'Please rewrite this in a calmer, more supportive tone before posting.',
    };
  }

  return { allowed: true as const };
}
