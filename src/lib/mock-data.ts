import { ScanResult } from './types';

export const MOCK_SCANS: Record<string, ScanResult> = {
  malicious: {
    id: 'scan-mal-883921',
    inputUrl: 'http://paypa1-security-verification.top/login.php?ref=auth',
    normalizedUrl: 'http://paypa1-security-verification.top/login.php',
    finalUrl: 'http://paypa1-security-verification.top/login.php',
    timestamp: new Date().toISOString(),
    riskScore: 88,
    riskLevel: 'MALICIOUS',
    aiAnalysis: {
      verdictSummary:
        'This website is actively impersonating PayPal to harvest user account credentials and financial data. It uses a deceptive typosquatted domain registered only 4 days ago with an anonymous registrar.',
      impersonatedBrand: 'PayPal Inc.',
      threatTactics: [
        'Typosquatting using number "1" instead of "l" (paypa1)',
        'Domain registered only 4 days ago in a high-risk TLD (.top)',
        'Insecure HTTP connection attempting to collect payment authentication',
        'Multiple malicious detections reported by security vendors',
      ],
      recommendedAction:
        'Do NOT submit passwords, 2FA codes, or card details. Close this browser tab immediately and report the URL.',
      confidenceScore: 96,
    },
    redirectChain: [
      {
        hopNumber: 1,
        url: 'http://bit.ly/pay-verify-302',
        statusCode: 301,
        domain: 'bit.ly',
        ip: '67.199.248.11',
      },
      {
        hopNumber: 2,
        url: 'http://paypa1-security-verification.top/login.php?ref=auth',
        statusCode: 200,
        domain: 'paypa1-security-verification.top',
        ip: '194.87.112.55',
      },
    ],
    whois: {
      domain: 'paypa1-security-verification.top',
      registrar: 'NameSilo LLC (Offshore Privacy)',
      creationDate: '2026-09-20',
      expiryDate: '2027-09-20',
      domainAgeDays: 4,
      registrantCountry: 'RU',
      isPrivacyProtected: true,
    },
    ssl: {
      issuer: 'None (Plain Insecure HTTP)',
      validFrom: 'N/A',
      validTo: 'N/A',
      daysRemaining: 0,
      isValid: false,
      isSelfSigned: false,
      fingerprint: 'NONE',
    },
    threatFeeds: [
      {
        source: 'VirusTotal',
        detected: true,
        positives: 18,
        totalEngines: 92,
        details: '18 security vendors flagged this URL as Phishing / Malicious',
      },
      {
        source: 'Google Safe Browsing',
        detected: true,
        details: 'Flagged for Deceptive Web Content / Social Engineering',
      },
      {
        source: 'URLhaus',
        detected: true,
        details: 'Active phishing payload URL',
      },
      {
        source: 'PhishTank',
        detected: true,
        details: 'Verified phishing submission #827103',
      },
    ],
    heuristics: [
      {
        id: 'h-1',
        name: 'Brand Typosquatting / Homograph',
        status: 'failed',
        scoreImpact: +35,
        description: 'Levenshtein distance match for "paypal" using character substitution (1 -> l).',
      },
      {
        id: 'h-2',
        name: 'Freshly Registered Domain (< 30 days)',
        status: 'failed',
        scoreImpact: +25,
        description: 'Domain was created 4 days ago. >90% of malicious phishing domains are under 14 days old.',
      },
      {
        id: 'h-3',
        name: 'Suspicious High-Abuse TLD',
        status: 'warning',
        scoreImpact: +15,
        description: '.top top-level domain frequently utilized in phishing syndicates due to cheap pricing.',
      },
      {
        id: 'h-4',
        name: 'Insecure Credential Transmission',
        status: 'failed',
        scoreImpact: +20,
        description: 'Login form found serving over unencrypted HTTP protocol.',
      },
      {
        id: 'h-5',
        name: 'URL Shortener Masquerading',
        status: 'warning',
        scoreImpact: +10,
        description: 'Initial entry point was masked with a bit.ly shortened redirect link.',
      },
    ],
  },

  suspicious: {
    id: 'scan-susp-55102',
    inputUrl: 'https://verify-account-update2026.cloud/auth',
    normalizedUrl: 'https://verify-account-update2026.cloud/auth',
    finalUrl: 'https://verify-account-update2026.cloud/auth',
    timestamp: new Date().toISOString(),
    riskScore: 54,
    riskLevel: 'SUSPICIOUS',
    aiAnalysis: {
      verdictSummary:
        'This site exhibits multiple warning signals often associated with account phishing, including generic urgency keywords ("verify-account-update") and a recently issued free certificate, though it has not yet appeared on public blocklists.',
      impersonatedBrand: 'Generic Cloud / Email Provider',
      threatTactics: [
        'Generic high-urgency keywords in domain name',
        'Domain registered only 19 days ago',
        'Valid free Let\'s Encrypt certificate with no organization verification (DV)',
      ],
      recommendedAction:
        'Proceed with extreme caution. Do not input primary credentials until verifying authenticity through your provider\'s direct portal.',
      confidenceScore: 82,
    },
    redirectChain: [
      {
        hopNumber: 1,
        url: 'https://verify-account-update2026.cloud/auth',
        statusCode: 200,
        domain: 'verify-account-update2026.cloud',
        ip: '104.21.44.18',
      },
    ],
    whois: {
      domain: 'verify-account-update2026.cloud',
      registrar: 'Hostinger Operations, UAB',
      creationDate: '2026-09-05',
      expiryDate: '2027-09-05',
      domainAgeDays: 19,
      registrantCountry: 'US',
      isPrivacyProtected: true,
    },
    ssl: {
      issuer: "Let's Encrypt Authority R3",
      validFrom: '2026-09-05',
      validTo: '2026-12-04',
      daysRemaining: 71,
      isValid: true,
      isSelfSigned: false,
      fingerprint: '3F:9A:88:B2:D1:43...',
    },
    threatFeeds: [
      {
        source: 'VirusTotal',
        detected: false,
        positives: 1,
        totalEngines: 92,
        details: '1 vendor flagged as suspicious, 91 clean',
      },
      {
        source: 'Google Safe Browsing',
        detected: false,
        details: 'Not currently listed in blacklist',
      },
      {
        source: 'URLhaus',
        detected: false,
        details: 'No active malicious payload observed',
      },
    ],
    heuristics: [
      {
        id: 'h-1',
        name: 'Urgency / Phishing Keywords',
        status: 'warning',
        scoreImpact: +20,
        description: 'Contains high-frequency phishing keywords: "verify", "account", "update".',
      },
      {
        id: 'h-2',
        name: 'Recent Registration (< 30 days)',
        status: 'warning',
        scoreImpact: +20,
        description: 'Registered 19 days ago.',
      },
      {
        id: 'h-3',
        name: 'Basic Domain Validation SSL',
        status: 'passed',
        scoreImpact: +5,
        description: 'Valid SSL present, but only standard domain validation without identity proof.',
      },
    ],
  },

  safe: {
    id: 'scan-safe-10294',
    inputUrl: 'https://github.com/explore',
    normalizedUrl: 'https://github.com/explore',
    finalUrl: 'https://github.com/explore',
    timestamp: new Date().toISOString(),
    riskScore: 4,
    riskLevel: 'SAFE',
    aiAnalysis: {
      verdictSummary:
        'This domain is verified as the authentic, official website for GitHub Inc. It has an established 18-year registration history, enterprise-grade DigiCert EV SSL encryption, and is universally trusted across all threat intelligence databases.',
      impersonatedBrand: undefined,
      threatTactics: [],
      recommendedAction:
        'This website is safe to browse and interact with normally.',
      confidenceScore: 99,
    },
    redirectChain: [
      {
        hopNumber: 1,
        url: 'https://github.com/explore',
        statusCode: 200,
        domain: 'github.com',
        ip: '140.82.112.3',
      },
    ],
    whois: {
      domain: 'github.com',
      registrar: 'MarkMonitor Inc.',
      creationDate: '2007-10-09',
      expiryDate: '2028-10-09',
      domainAgeDays: 6925,
      registrantCountry: 'US',
      isPrivacyProtected: false,
    },
    ssl: {
      issuer: 'DigiCert High Assurance TLS Hybrid ECC SHA256 2020 CA1',
      validFrom: '2026-03-01',
      validTo: '2027-03-15',
      daysRemaining: 172,
      isValid: true,
      isSelfSigned: false,
      fingerprint: '7A:D2:11:45:90:BB...',
    },
    threatFeeds: [
      {
        source: 'VirusTotal',
        detected: false,
        positives: 0,
        totalEngines: 94,
        details: '0/94 security engines detected any threat',
      },
      {
        source: 'Google Safe Browsing',
        detected: false,
        details: 'Clean, verified legitimate software development platform',
      },
      {
        source: 'URLhaus',
        detected: false,
        details: 'Clean record',
      },
    ],
    heuristics: [
      {
        id: 'h-1',
        name: 'Established Domain History',
        status: 'passed',
        scoreImpact: 0,
        description: 'Registered over 18 years ago with reputable corporate registrar.',
      },
      {
        id: 'h-2',
        name: 'Enterprise Extended SSL',
        status: 'passed',
        scoreImpact: 0,
        description: 'Issued by DigiCert with rigorous organizational validation.',
      },
      {
        id: 'h-3',
        name: 'No Redirect Obfuscation',
        status: 'passed',
        scoreImpact: 0,
        description: 'Direct 200 OK HTTP response without redirection jumps.',
      },
    ],
  },
};
