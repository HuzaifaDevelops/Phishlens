import { HeuristicItem, RiskLevel, SslData, WhoisData, RedirectHop } from '@/lib/types';

// High-value targeted brands and their official base names
const TARGETED_BRANDS = [
  { name: 'PayPal Inc.', token: 'paypal', officialDomain: 'paypal.com' },
  { name: 'Apple Inc.', token: 'apple', officialDomain: 'apple.com' },
  { name: 'Google LLC', token: 'google', officialDomain: 'google.com' },
  { name: 'Microsoft Corporation', token: 'microsoft', officialDomain: 'microsoft.com' },
  { name: 'Chase Bank', token: 'chase', officialDomain: 'chase.com' },
  { name: 'Netflix Inc.', token: 'netflix', officialDomain: 'netflix.com' },
  { name: 'Amazon.com Inc.', token: 'amazon', officialDomain: 'amazon.com' },
  { name: 'Binance Holdings', token: 'binance', officialDomain: 'binance.com' },
  { name: 'Bank of America', token: 'bankofamerica', officialDomain: 'bankofamerica.com' },
  { name: 'Wells Fargo', token: 'wellsfargo', officialDomain: 'wellsfargo.com' },
];

const HIGH_ABUSE_TLDS = ['.top', '.xyz', '.buzz', '.club', '.work', '.click', '.gq', '.cf', '.tk', '.ml', '.cc'];

const SUSPICIOUS_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'verification',
  'account',
  'security',
  'secure',
  'update',
  'banking',
  'auth',
  'authenticate',
  'recover',
  'confirm',
  'wallet',
];

/**
 * Standard Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export interface HeuristicEvaluation {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  impersonatedBrand?: string;
  heuristics: HeuristicItem[];
}

export function evaluateHeuristics(
  targetUrl: string,
  whois: WhoisData,
  ssl: SslData,
  redirects: RedirectHop[]
): HeuristicEvaluation {
  const heuristics: HeuristicItem[] = [];
  let score = 0;
  let impersonatedBrand: string | undefined = undefined;

  let parsed: URL;
  try {
    parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `http://${targetUrl}`);
  } catch {
    parsed = new URL('http://unknown.target');
  }

  const host = parsed.hostname.toLowerCase();
  const hostParts = host.split('.');
  const tld = hostParts.length > 1 ? `.${hostParts[hostParts.length - 1]}` : '';
  const domainCore = hostParts.length > 1 ? hostParts[hostParts.length - 2] : host;

  // 1. BRAND TYPOSQUATTING & HOMOGRAPH DETECTION
  // Normalized string with common number-to-letter substitutions
  const normalizedCore = domainCore
    .replace(/1/g, 'l')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/vv/g, 'w');

  for (const brand of TARGETED_BRANDS) {
    if (host === brand.officialDomain || host.endsWith(`.${brand.officialDomain}`)) {
      // It's the authentic domain!
      heuristics.push({
        id: 'h-auth-brand',
        name: `Authentic Official Domain (${brand.name})`,
        status: 'passed',
        scoreImpact: 0,
        description: `Verified authentic corporate hostname for ${brand.officialDomain}.`,
      });
      break;
    }

    // Check if domainCore contains or closely matches the brand token
    const dist = levenshteinDistance(normalizedCore, brand.token);
    const hasToken = domainCore.includes(brand.token) || normalizedCore.includes(brand.token);

    if (dist <= 2 || (hasToken && !host.endsWith(brand.officialDomain))) {
      impersonatedBrand = brand.name;
      score += 40;
      heuristics.push({
        id: 'h-typosquat',
        name: `Brand Impersonation / Typosquatting (${brand.name})`,
        status: 'failed',
        scoreImpact: +40,
        description: `Domain mimics "${brand.officialDomain}" with distance ${dist} or token substitution.`,
      });
      break;
    }
  }

  // 2. DOMAIN AGE HEURISTIC
  if (whois.domainAgeDays < 7) {
    score += 35;
    heuristics.push({
      id: 'h-age-critical',
      name: 'Critical Fresh Domain (< 7 days old)',
      status: 'failed',
      scoreImpact: +35,
      description: `Domain registered only ${whois.domainAgeDays} days ago. High correlation with disposable phishing infrastructure.`,
    });
  } else if (whois.domainAgeDays < 30) {
    score += 20;
    heuristics.push({
      id: 'h-age-warning',
      name: 'Recently Registered Domain (< 30 days old)',
      status: 'warning',
      scoreImpact: +20,
      description: `Domain is ${whois.domainAgeDays} days old. Heightened probability of unvetted activity.`,
    });
  } else {
    heuristics.push({
      id: 'h-age-ok',
      name: 'Established Domain Age Footprint',
      status: 'passed',
      scoreImpact: 0,
      description: `Domain has been registered for ${whois.domainAgeDays} days.`,
    });
  }

  // 3. SSL / TLS INTEGRITY
  if (!ssl.isValid) {
    score += 25;
    heuristics.push({
      id: 'h-ssl-insecure',
      name: 'Insecure / Missing TLS Encryption',
      status: 'failed',
      scoreImpact: +25,
      description: 'Host operates without valid X.509 TLS certificate or connection failed handshake.',
    });
  } else if (ssl.isSelfSigned) {
    score += 30;
    heuristics.push({
      id: 'h-ssl-selfsigned',
      name: 'Self-Signed Certificate Authority',
      status: 'failed',
      scoreImpact: +30,
      description: 'TLS certificate was generated locally without trusted third-party Root CA verification.',
    });
  } else {
    heuristics.push({
      id: 'h-ssl-ok',
      name: 'Valid Public TLS Certificate',
      status: 'passed',
      scoreImpact: 0,
      description: `Issued by ${ssl.issuer}. Days remaining: ${ssl.daysRemaining}.`,
    });
  }

  // 4. SUSPICIOUS HIGH-ABUSE TLD
  if (HIGH_ABUSE_TLDS.includes(tld)) {
    score += 15;
    heuristics.push({
      id: 'h-tld-abuse',
      name: `High-Abuse Top-Level Domain (${tld})`,
      status: 'warning',
      scoreImpact: +15,
      description: `TLD "${tld}" exhibits disproportionately high malicious registration rates.`,
    });
  }

  // 5. REDIRECT HOP OBFUSCATION
  if (redirects.length > 2) {
    score += 20;
    heuristics.push({
      id: 'h-redirect-hops',
      name: `Multi-Hop Redirection Chain (${redirects.length} hops)`,
      status: 'warning',
      scoreImpact: +20,
      description: 'Multiple intermediate jumps observed, characteristic of URL shortener masking.',
    });
  } else if (redirects.length === 2) {
    score += 10;
    heuristics.push({
      id: 'h-redirect-single',
      name: 'Single Redirect Hop',
      status: 'warning',
      scoreImpact: +10,
      description: 'Target bounced from initial entry URL to secondary host.',
    });
  }

  // 6. PHISHING / URGENCY KEYWORDS
  const fullUrlLower = targetUrl.toLowerCase();
  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((kw) => fullUrlLower.includes(kw));
  if (matchedKeywords.length >= 2) {
    score += 20;
    heuristics.push({
      id: 'h-keywords',
      name: `Multiple Phishing / Urgency Keywords (${matchedKeywords.join(', ')})`,
      status: 'warning',
      scoreImpact: +20,
      description: 'URL contains high-frequency credential-harvesting keywords in domain or path.',
    });
  } else if (matchedKeywords.length === 1) {
    score += 10;
    heuristics.push({
      id: 'h-keyword-single',
      name: `Authentication Keyword in URL ("${matchedKeywords[0]}")`,
      status: 'warning',
      scoreImpact: +10,
      description: 'Target explicitly references authentication or security actions.',
    });
  }

  // 7. EXCESSIVE SUBDOMAIN DEPTH
  if (hostParts.length >= 4) {
    score += 15;
    heuristics.push({
      id: 'h-subdomain-depth',
      name: `Deep Subdomain Hierarchy (${hostParts.length - 2} levels)`,
      status: 'warning',
      scoreImpact: +15,
      description: 'Unusually deep subdomain nesting often used to disguise brand names.',
    });
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Level
  let riskLevel: RiskLevel = 'SAFE';
  if (finalScore >= 70) {
    riskLevel = 'MALICIOUS';
  } else if (finalScore >= 31) {
    riskLevel = 'SUSPICIOUS';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    impersonatedBrand,
    heuristics,
  };
}
