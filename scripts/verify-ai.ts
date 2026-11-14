import dotenv from 'dotenv';
dotenv.config();

import { synthesizeAiBriefing } from '../src/server/scanner/ai-synthesizer';

async function main() {
  console.log('Testing live AI Briefing synthesis with configured GEMINI_API_KEY...\n');

  const testParams = {
    url: 'https://youtube.com',
    riskScore: 0,
    riskLevel: 'SAFE' as const,
    impersonatedBrand: undefined,
    whois: {
      domain: 'youtube.com',
      registrar: 'MarkMonitor Inc.',
      creationDate: '2005-02-15T00:00:00Z',
      expiryDate: '2026-02-15T00:00:00Z',
      domainAgeDays: 7120,
      registrantCountry: 'US',
      isPrivacyProtected: false,
    },
    ssl: {
      issuer: 'Google Trust Services LLC',
      validFrom: '2024-01-01T00:00:00Z',
      validTo: '2025-01-01T00:00:00Z',
      daysRemaining: 180,
      isValid: true,
      isSelfSigned: false,
      fingerprint: 'AB:CD:EF:...',
    },
    redirectsCount: 0,
    heuristics: [],
  };

  const briefing = await synthesizeAiBriefing(testParams);

  console.log('=== Synthesized AI Briefing Result ===');
  console.log(`Engine:              ${briefing.engine}`);
  console.log(`Confidence Score:    ${briefing.confidenceScore}%`);
  console.log(`Verdict Summary:     ${briefing.verdictSummary}`);
  console.log(`Tactics / Signals:   ${JSON.stringify(briefing.threatTactics)}`);
  console.log(`Recommended Action:  ${briefing.recommendedAction}`);
  console.log('======================================');

  if (briefing.engine === 'gemini') {
    console.log('\nSUCCESS: Google Gemini AI is actively generating plain-English briefings!');
  } else {
    console.log('\nNOTE: Running on deterministic grounded engine.');
  }
}

main().catch(console.error);
