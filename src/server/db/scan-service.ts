import { prisma } from './prisma';
import { ScanResult, RiskLevel } from '@/lib/types';
import { Prisma } from '@prisma/client';

/**
 * Checks MySQL for an existing scan of this normalized URL within the last maxAgeHours.
 * Returns the cached ScanResult or null if none found.
 */
export async function findCachedScan(
  normalizedUrl: string,
  maxAgeHours = 24
): Promise<ScanResult | null> {
  try {
    const cutoffDate = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    const record = await prisma.scan.findFirst({
      where: {
        normalizedUrl,
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!record) return null;

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);

    return {
      id: record.id,
      inputUrl: record.inputUrl,
      normalizedUrl: record.normalizedUrl,
      finalUrl: record.finalUrl,
      timestamp: record.createdAt.toISOString(),
      riskScore: record.riskScore,
      riskLevel: record.riskLevel as RiskLevel,
      aiAnalysis: {
        verdictSummary: record.aiSummary,
        impersonatedBrand: record.impersonatedBrand || undefined,
        threatTactics: (record.threatTactics as string[]) || [],
        recommendedAction: record.recommendedAction,
        confidenceScore: record.confidenceScore,
        engine: hasGemini ? 'gemini' : 'grounded-engine',
      },
      redirectChain: record.redirectChain as unknown as ScanResult['redirectChain'],
      whois: record.whoisData as unknown as ScanResult['whois'],
      ssl: record.sslData as unknown as ScanResult['ssl'],
      threatFeeds: record.threatFeeds as unknown as ScanResult['threatFeeds'],
      heuristics: record.heuristics as unknown as ScanResult['heuristics'],
    };
  } catch {
    // If DB is offline or table not yet migrated, gracefully fall back to live scan
    return null;
  }
}

/**
 * Persists a completed scan result to MySQL, linked to a specific visitorId.
 */
export async function saveScanRecord(
  scan: ScanResult,
  visitorId = 'anonymous'
): Promise<string | null> {
  try {
    const record = await prisma.scan.create({
      data: {
        id: scan.id,
        visitorId: visitorId || 'anonymous',
        inputUrl: scan.inputUrl,
        normalizedUrl: scan.normalizedUrl,
        finalUrl: scan.finalUrl,
        riskScore: scan.riskScore,
        riskLevel: scan.riskLevel,
        impersonatedBrand: scan.aiAnalysis.impersonatedBrand,
        confidenceScore: scan.aiAnalysis.confidenceScore,
        aiSummary: scan.aiAnalysis.verdictSummary,
        threatTactics: scan.aiAnalysis.threatTactics as unknown as Prisma.InputJsonValue,
        recommendedAction: scan.aiAnalysis.recommendedAction,
        redirectChain: scan.redirectChain as unknown as Prisma.InputJsonValue,
        whoisData: scan.whois as unknown as Prisma.InputJsonValue,
        sslData: scan.ssl as unknown as Prisma.InputJsonValue,
        threatFeeds: scan.threatFeeds as unknown as Prisma.InputJsonValue,
        heuristics: scan.heuristics as unknown as Prisma.InputJsonValue,
      },
    });

    return record.id;
  } catch {
    // Silently continue if DB write fails so user scanning is never blocked
    return null;
  }
}

/**
 * Fetches an archived scan by its ID for permalinks (/scan/[id]).
 */
export async function getScanRecordById(id: string): Promise<ScanResult | null> {
  try {
    const record = await prisma.scan.findUnique({
      where: { id },
    });

    if (!record) return null;

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);

    return {
      id: record.id,
      inputUrl: record.inputUrl,
      normalizedUrl: record.normalizedUrl,
      finalUrl: record.finalUrl,
      timestamp: record.createdAt.toISOString(),
      riskScore: record.riskScore,
      riskLevel: record.riskLevel as RiskLevel,
      aiAnalysis: {
        verdictSummary: record.aiSummary,
        impersonatedBrand: record.impersonatedBrand || undefined,
        threatTactics: (record.threatTactics as string[]) || [],
        recommendedAction: record.recommendedAction,
        confidenceScore: record.confidenceScore,
        engine: hasGemini ? 'gemini' : 'grounded-engine',
      },
      redirectChain: record.redirectChain as unknown as ScanResult['redirectChain'],
      whois: record.whoisData as unknown as ScanResult['whois'],
      ssl: record.sslData as unknown as ScanResult['ssl'],
      threatFeeds: record.threatFeeds as unknown as ScanResult['threatFeeds'],
      heuristics: record.heuristics as unknown as ScanResult['heuristics'],
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the most recent scan records, optionally filtered by visitorId.
 */
export async function getRecentScans(
  limit = 50,
  visitorId?: string
): Promise<ScanResult[]> {
  try {
    const records = await prisma.scan.findMany({
      where: visitorId ? { visitorId } : undefined,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);

    return records.map((record) => ({
      id: record.id,
      inputUrl: record.inputUrl,
      normalizedUrl: record.normalizedUrl,
      finalUrl: record.finalUrl,
      timestamp: record.createdAt.toISOString(),
      riskScore: record.riskScore,
      riskLevel: record.riskLevel as RiskLevel,
      aiAnalysis: {
        verdictSummary: record.aiSummary,
        impersonatedBrand: record.impersonatedBrand || undefined,
        threatTactics: (record.threatTactics as string[]) || [],
        recommendedAction: record.recommendedAction,
        confidenceScore: record.confidenceScore,
        engine: hasGemini ? 'gemini' : 'grounded-engine',
      },
      redirectChain: record.redirectChain as unknown as ScanResult['redirectChain'],
      whois: record.whoisData as unknown as ScanResult['whois'],
      ssl: record.sslData as unknown as ScanResult['ssl'],
      threatFeeds: record.threatFeeds as unknown as ScanResult['threatFeeds'],
      heuristics: record.heuristics as unknown as ScanResult['heuristics'],
    }));
  } catch {
    return [];
  }
}
