export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';

export interface RedirectHop {
  hopNumber: number;
  url: string;
  statusCode: number;
  domain: string;
  ip?: string;
}

export interface WhoisData {
  domain: string;
  registrar: string;
  creationDate: string;
  expiryDate: string;
  domainAgeDays: number;
  registrantCountry: string;
  isPrivacyProtected: boolean;
}

export interface SslData {
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isValid: boolean;
  isSelfSigned: boolean;
  fingerprint: string;
}

export interface ThreatFeedMatch {
  source: 'VirusTotal' | 'Google Safe Browsing' | 'URLhaus' | 'PhishTank';
  detected: boolean;
  positives?: number;
  totalEngines?: number;
  details?: string;
}

export interface HeuristicItem {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  scoreImpact: number;
  description: string;
}

export interface AIAnalysis {
  verdictSummary: string;
  impersonatedBrand?: string;
  threatTactics: string[];
  recommendedAction: string;
  confidenceScore: number;
  engine?: 'gemini' | 'grounded-engine';
}

export interface ScanResult {
  id: string;
  inputUrl: string;
  normalizedUrl: string;
  finalUrl: string;
  timestamp: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  aiAnalysis: AIAnalysis;
  redirectChain: RedirectHop[];
  whois: WhoisData;
  ssl: SslData;
  threatFeeds: ThreatFeedMatch[];
  heuristics: HeuristicItem[];
}
