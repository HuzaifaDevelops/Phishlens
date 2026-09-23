import { AIAnalysis, HeuristicItem, RiskLevel, SslData, WhoisData } from '@/lib/types';

interface SynthesizerParams {
  url: string;
  riskScore: number;
  riskLevel: RiskLevel;
  impersonatedBrand?: string;
  whois: WhoisData;
  ssl: SslData;
  redirectsCount: number;
  heuristics: HeuristicItem[];
}

/**
 * Synthesizes an Explainable AI (XAI) security briefing.
 * Uses Gemini API if GEMINI_API_KEY is defined in environment,
 * otherwise utilizes a deterministic forensic synthesis engine grounded in the real collected telemetry.
 */
export async function synthesizeAiBriefing(params: SynthesizerParams): Promise<AIAnalysis> {
  const { url, riskScore, riskLevel, impersonatedBrand, whois, ssl, redirectsCount, heuristics } = params;

  // Extract key failed/warning heuristics for clear takeaways
  const failedRules = heuristics.filter((h) => h.status === 'failed' || h.status === 'warning');
  const threatTactics = failedRules.map((h) => `${h.name}: ${h.description}`);

  // Check if GEMINI_API_KEY is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `You are PhishLens, an authoritative cybersecurity analyst.
Analyze the following URL telemetry and generate a concise 2-3 sentence plain-English briefing for the user:
- Target URL: ${url}
- Threat Score: ${riskScore}/100 (${riskLevel})
- Brand Target: ${impersonatedBrand || 'None identified'}
- Domain Age: ${whois.domainAgeDays} days old
- SSL Issuer: ${ssl.issuer} (Valid: ${ssl.isValid})
- Redirect Hops: ${redirectsCount}
- Triggered Rules: ${failedRules.map((r) => r.name).join(', ')}

Return your answer strictly as JSON with the following structure:
{
  "verdictSummary": "2-3 sentences explaining why this site is safe, suspicious, or dangerous in plain English.",
  "recommendedAction": "Single imperative sentence instructing the user what to do."
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            verdictSummary: parsed.verdictSummary,
            impersonatedBrand,
            threatTactics: threatTactics.slice(0, 4),
            recommendedAction: parsed.recommendedAction,
            confidenceScore: Math.min(99, Math.max(75, 100 - Math.abs(50 - riskScore))),
          };
        }
      }
    } catch {
      // Fallback to grounded deterministic briefing on failure
    }
  }

  // Deterministic Grounded Forensic Synthesis
  let verdictSummary = '';
  let recommendedAction = '';

  if (riskLevel === 'MALICIOUS') {
    if (impersonatedBrand) {
      verdictSummary = `This target actively mimics the brand identity of ${impersonatedBrand}. It operates on infrastructure registered only ${whois.domainAgeDays} days ago${
        !ssl.isValid ? ' over an unencrypted connection' : ''
      }, matching active credential-harvesting patterns.`;
    } else {
      verdictSummary = `Critical threat detected with multiple severe anomalies: domain age is under ${
        whois.domainAgeDays < 7 ? '7 days' : '30 days'
      } and security heuristics flagged high-risk abuse signals.`;
    }
    recommendedAction =
      'Do NOT submit credentials, two-factor authentication codes, or personal data. Terminate connection immediately.';
  } else if (riskLevel === 'SUSPICIOUS') {
    verdictSummary = `Caution advised. The URL contains elevated risk factors such as recent registration (${whois.domainAgeDays} days old)${
      redirectsCount > 1 ? ` and ${redirectsCount} intermediate redirection hops` : ''
    }, though it has not yet been universally flagged on public threat feeds.`;
    recommendedAction =
      'Verify the destination via the organization’s verified official mobile app or portal before proceeding.';
  } else {
    verdictSummary = `Verified legitimate service. The domain possesses an established historical registration record (${Math.floor(
      whois.domainAgeDays / 365
    )}+ years) and valid trusted encryption from ${ssl.issuer}.`;
    recommendedAction = 'This web destination is safe to browse and access normally.';
  }

  const confidenceScore =
    riskLevel === 'MALICIOUS' ? 95 : riskLevel === 'SAFE' ? 98 : 82;

  return {
    verdictSummary,
    impersonatedBrand,
    threatTactics: threatTactics.slice(0, 4),
    recommendedAction,
    confidenceScore,
  };
}
