import axios from 'axios';
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
 * Queries Google Gemini API if GEMINI_API_KEY is configured in the environment,
 * with resilient multi-model failover and fallback to deterministic grounded forensic reasoning.
 */
export async function synthesizeAiBriefing(params: SynthesizerParams): Promise<AIAnalysis> {
  const { url, riskScore, riskLevel, impersonatedBrand, whois, ssl, redirectsCount, heuristics } = params;

  // Extract key failed/warning heuristics for clear takeaways
  const failedRules = heuristics.filter((h) => h.status === 'failed' || h.status === 'warning');
  const fallbackTactics = failedRules.map((h) => `${h.name}: ${h.description}`);

  // Check if GEMINI_API_KEY is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

    const prompt = `You are PhishLens, an authoritative cybersecurity analyst and forensic URL investigator.
Analyze the following URL telemetry and generate a concise, professional plain-English security briefing for the user:
- Target URL: ${url}
- Threat Score: ${riskScore}/100 (${riskLevel})
- Brand Target: ${impersonatedBrand || 'None identified'}
- Domain Age: ${whois.domainAgeDays} days (${(whois.domainAgeDays / 365).toFixed(1)} years)
- SSL Issuer: ${ssl.issuer || 'None/Unencrypted'} (Valid: ${ssl.isValid})
- Redirect Hops: ${redirectsCount}
- Triggered Rules: ${failedRules.length > 0 ? failedRules.map((r) => r.name).join(', ') : 'None (clean)'}

Return your answer strictly as JSON with this exact schema:
{
  "verdictSummary": "2-3 sentences explaining why this site is safe, suspicious, or dangerous in clear, authoritative plain English.",
  "threatTactics": ["Array of 2-4 key observations or risk signals (e.g. Valid high-assurance SSL, Historical domain age, Typo-squatting attempt, etc.)"],
  "recommendedAction": "Single imperative sentence instructing the user what concrete action to take.",
  "confidenceScore": 95
}`;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await axios.post(
          endpoint,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
            validateStatus: () => true,
          }
        );

        if (res.status === 200) {
          const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const tactics = Array.isArray(parsed.threatTactics) && parsed.threatTactics.length > 0
              ? parsed.threatTactics.slice(0, 4)
              : fallbackTactics.length > 0 ? fallbackTactics.slice(0, 4) : ['Clean telemetry indicators'];

            return {
              verdictSummary: parsed.verdictSummary || 'Target inspected by PhishLens security analysis.',
              impersonatedBrand,
              threatTactics: tactics,
              recommendedAction: parsed.recommendedAction || 'Proceed with standard caution.',
              confidenceScore: typeof parsed.confidenceScore === 'number'
                ? Math.min(99, Math.max(70, parsed.confidenceScore))
                : Math.min(99, Math.max(75, 100 - Math.abs(50 - riskScore))),
              engine: 'gemini',
            };
          }
        } else {
          console.warn(`[AI Synthesizer] Model ${model} returned HTTP ${res.status}:`, res.data?.error?.message || res.statusText);
        }
      } catch (err: any) {
        // Continue to next model if timeout or network failure
        console.warn(`[AI Synthesizer] Model ${model} failed:`, err?.message || err);
        continue;
      }
    }
  }

  // Deterministic Grounded Forensic Synthesis (Fallback when offline or key absent)
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
    threatTactics: fallbackTactics.length > 0 ? fallbackTactics.slice(0, 4) : ['Clean telemetry indicators'],
    recommendedAction,
    confidenceScore,
    engine: 'grounded-engine',
  };
}
