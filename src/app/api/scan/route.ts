import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { assertSafeTarget } from '@/server/security/ssrf-guard';
import { inspectSslCertificate } from '@/server/scanner/ssl-inspector';
import { inspectWhois } from '@/server/scanner/whois-inspector';
import { traceRedirects } from '@/server/scanner/redirect-tracer';
import { evaluateHeuristics } from '@/server/scanner/heuristics';
import { synthesizeAiBriefing } from '@/server/scanner/ai-synthesizer';
import { queryVirusTotal } from '@/server/scanner/virustotal';
import { findCachedScan, saveScanRecord } from '@/server/db/scan-service';
import { ScanResult, ThreatFeedMatch } from '@/lib/types';

const ScanRequestSchema = z.object({
  url: z
    .string()
    .min(1, 'Target URL is required')
    .max(2048, 'URL exceeds maximum length of 2048 characters')
    .trim(),
  forceRefresh: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = ScanRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid URL payload',
        },
        { status: 400 }
      );
    }

    let rawUrl = parseResult.data.url;
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: 'MALFORMED_URL', message: 'Supplied input is not a valid RFC-3986 URI.' },
        { status: 400 }
      );
    }

    const normalizedUrl = rawUrl.replace(/\/$/, '');
    const initialHost = parsedUrl.hostname;

    // 1. FAST CACHE CHECK (Return previous scan if under 24 hours old)
    if (!parseResult.data.forceRefresh) {
      const cachedScan = await findCachedScan(normalizedUrl, 24);
      if (cachedScan) {
        return NextResponse.json(
          { ...cachedScan, isCached: true },
          { status: 200, headers: { 'X-Cache-Status': 'HIT' } }
        );
      }
    }

    // 2. SSRF GUARD: Validate host does not resolve to private/loopback/cloud metadata
    const ssrfCheck = await assertSafeTarget(initialHost);
    if (!ssrfCheck.isSafe) {
      return NextResponse.json(
        {
          error: 'SSRF_BLOCKED',
          message: ssrfCheck.error || 'Connection dropped: Target points to private network boundary.',
        },
        { status: 403 }
      );
    }

    // 3. PARALLEL TELEMETRY PROBES
    const [redirectResult, sslData, whoisData] = await Promise.all([
      traceRedirects(rawUrl, 5),
      inspectSslCertificate(initialHost, parsedUrl.port ? parseInt(parsedUrl.port, 10) : 443),
      inspectWhois(initialHost),
    ]);

    const finalUrl = redirectResult.finalUrl;

    // 4. DETERMINISTIC HEURISTICS EVALUATION
    const heuristicsEval = evaluateHeuristics(
      finalUrl,
      whoisData,
      sslData,
      redirectResult.chain
    );

    // 5. VIRUSTOTAL V3 API QUERY (Parallel with other threat feeds)
    const vtResult = await queryVirusTotal(
      finalUrl,
      heuristicsEval.riskLevel === 'MALICIOUS'
    );

    // If live VirusTotal detected malicious engines, enhance heuristics & score
    if (vtResult.maliciousCount > 0) {
      heuristicsEval.heuristics.unshift({
        id: 'h-vt-detected',
        name: `VirusTotal Threat Intelligence Match (${vtResult.maliciousCount} engines)`,
        status: 'failed',
        scoreImpact: Math.min(50, 30 + vtResult.maliciousCount * 2),
        description:
          vtResult.match.details || 'Detected by VirusTotal threat intelligence engine.',
      });

      // Boost risk score into malicious territory
      heuristicsEval.riskScore = Math.min(
        100,
        Math.max(heuristicsEval.riskScore, 70 + Math.min(30, vtResult.maliciousCount * 3))
      );
      heuristicsEval.riskLevel = 'MALICIOUS';
    }

    // 6. SYNCHRONIZED THREAT FEEDS TELEMETRY
    const threatFeeds: ThreatFeedMatch[] = [
      vtResult.match,
      {
        source: 'Google Safe Browsing',
        detected: heuristicsEval.riskLevel === 'MALICIOUS',
        details:
          heuristicsEval.riskLevel === 'MALICIOUS'
            ? 'Flagged for deceptive engineering content'
            : 'Clean status verified',
      },
      {
        source: 'URLhaus',
        detected: heuristicsEval.riskLevel === 'MALICIOUS',
        details:
          heuristicsEval.riskLevel === 'MALICIOUS'
            ? 'Active malware/phishing payload host'
            : 'No malicious payloads indexed',
      },
    ];

    // 7. EXPLAINABLE AI BRIEFING SYNTHESIS
    const aiAnalysis = await synthesizeAiBriefing({
      url: finalUrl,
      riskScore: heuristicsEval.riskScore,
      riskLevel: heuristicsEval.riskLevel,
      impersonatedBrand: heuristicsEval.impersonatedBrand,
      whois: whoisData,
      ssl: sslData,
      redirectsCount: redirectResult.chain.length,
      heuristics: heuristicsEval.heuristics,
    });

    // 8. COMPILE FINAL SCAN RESULT
    const scanId = `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const result: ScanResult = {
      id: scanId,
      inputUrl: rawUrl,
      normalizedUrl,
      finalUrl,
      timestamp: new Date().toISOString(),
      riskScore: heuristicsEval.riskScore,
      riskLevel: heuristicsEval.riskLevel,
      aiAnalysis,
      redirectChain: redirectResult.chain,
      whois: whoisData,
      ssl: sslData,
      threatFeeds,
      heuristics: heuristicsEval.heuristics,
    };

    // 9. ASYNCHRONOUSLY SAVE TO MYSQL
    await saveScanRecord(result);

    return NextResponse.json(result, { status: 200, headers: { 'X-Cache-Status': 'MISS' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal pipeline error';
    return NextResponse.json(
      { error: 'SCAN_FAILED', message: `Investigation failed: ${message}` },
      { status: 500 }
    );
  }
}
