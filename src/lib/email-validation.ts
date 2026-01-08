// Email validation - block disposable/fake email providers

// List of known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  // Popular disposable email services
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'tempmail.net',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.org',
  'guerrillamail.net',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'mailinator.com',
  'mailinator.net',
  'mailinator2.com',
  'mailinater.com',
  'maildrop.cc',
  'getairmail.com',
  'throwaway.email',
  'throwawaymail.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'emailondeck.com',
  'getnada.com',
  'mohmal.com',
  'dispostable.com',
  'mintemail.com',
  'tempinbox.com',
  'trashmail.com',
  'trashmail.net',
  'mailnesia.com',
  'mailcatch.com',
  'yopmail.com',
  'yopmail.fr',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'hide.biz.st',
  'mytrashmail.com',
  'mt2009.com',
  'thankyou2010.com',
  'trash2009.com',
  'mt2014.com',
  'tempsky.com',
  'tempr.email',
  'discard.email',
  'discardmail.com',
  'spambog.com',
  'spambog.de',
  'spambog.ru',
  'spamavert.com',
  'spamex.com',
  'spamfree24.org',
  'spamgourmet.com',
  'spamhole.com',
  'spamify.com',
  'spaml.com',
  'spamoff.de',
  'spamslicer.com',
  'spamspot.com',
  'spam.la',
  'spamtroll.net',
  'superrito.com',
  'superstachel.de',
  'suremail.info',
  'teleworm.com',
  'teleworm.us',
  'tempalias.com',
  'tempe-mail.com',
  'tempemail.biz',
  'tempemail.co.za',
  'tempemail.com',
  'tempemail.net',
  'tempinbox.co.uk',
  'tempmail.co',
  'tempmailer.com',
  'tempmailer.de',
  'tempomail.fr',
  'temporarily.de',
  'temporarioemail.com.br',
  'temporaryemail.net',
  'temporaryforwarding.com',
  'temporaryinbox.com',
  'thankyou2010.com',
  'thisisnotmyrealemail.com',
  'throam.com',
  'tilien.com',
  'tmailinator.com',
  'tradermail.info',
  'trash-amil.com',
  'trash-mail.at',
  'trash-mail.com',
  'trash-mail.de',
  'trash2.de',
  'trashbox.eu',
  'trashdevil.com',
  'trashdevil.de',
  'trashemail.de',
  'trashmail.at',
  'trashmail.de',
  'trashmail.me',
  'trashmail.org',
  'trashmail.ws',
  'trashmailer.com',
  'trashymail.com',
  'trashymail.net',
  'trbvm.com',
  'uggsrock.com',
  'upliftnow.com',
  'uplipht.com',
  'venompen.com',
  'veryrealemail.com',
  'viditag.com',
  'viewcastmedia.com',
  'viewcastmedia.net',
  'viewcastmedia.org',
  'viralplays.com',
  'vkcode.ru',
  'wegwerfadresse.de',
  'wegwerfemail.com',
  'wegwerfemail.de',
  'wegwerfmail.de',
  'wegwerfmail.info',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'wetrainbayarea.com',
  'wetrainbayarea.org',
  'wh4f.org',
  'whopy.com',
  'willselfdestruct.com',
  'winemaven.info',
  'wronghead.com',
  'wuzup.net',
  'wuzupmail.net',
  'wwwnew.eu',
  'xagloo.com',
  'xemaps.com',
  'xents.com',
  'xmaily.com',
  'xoxy.net',
  'yapped.net',
  'yeah.net',
  'yep.it',
  'yogamaven.com',
  'yuurok.com',
  'za.com',
  'zehnminuten.de',
  'zehnminutenmail.de',
  'zetmail.com',
  'zippymail.info',
  'zoaxe.com',
  'zoemail.com',
  'zoemail.net',
  'zoemail.org',
  'zomg.info',
  'zxcv.com',
  'zxcvbnm.com',
  'zzz.com',
  // Generic suspicious patterns
  'example.com',
  'test.com',
  'fake.com',
  'noemail.com',
  'nobody.com',
];

// Suspicious email patterns
const SUSPICIOUS_PATTERNS = [
  /^test\d*@/i,
  /^fake\d*@/i,
  /^spam\d*@/i,
  /^noreply@/i,
  /^no-reply@/i,
  /^asdf+@/i,
  /^qwerty+@/i,
  /^aaa+@/i,
  /^xxx+@/i,
  /^123+@/i,
  /^abc+@/i,
  /^\d{10,}@/,  // 10+ digits before @
  /^[a-z]{1,2}\d{5,}@/i,  // 1-2 letters followed by 5+ digits
];

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate email address - check if it's from a disposable provider
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email) {
    return { valid: false, reason: 'Email is required' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  // Extract domain
  const domain = normalizedEmail.split('@')[1];
  
  // Check against disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed. Please use a real email.' };
  }

  // Check for suspicious patterns in the local part
  const localPart = normalizedEmail.split('@')[0];
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(localPart + '@')) {
      return { valid: false, reason: 'This email address appears to be fake. Please use a real email.' };
    }
  }

  // Check for very short domains (likely fake)
  if (domain.length < 4) {
    return { valid: false, reason: 'Invalid email domain' };
  }

  // All checks passed
  return { valid: true };
}

/**
 * Check if email domain is from a known provider
 */
export function isKnownEmailProvider(email: string): boolean {
  const knownProviders = [
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.co.za',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'zoho.com',
    'mail.com',
    'gmx.com',
    'gmx.net',
    'yandex.com',
    'fastmail.com',
    'tutanota.com',
    'pm.me',
  ];

  const domain = email.toLowerCase().split('@')[1];
  return knownProviders.includes(domain);
}
