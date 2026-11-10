import { assertSafeTarget } from '../src/server/security/ssrf-guard';
import { inspectSslCertificate } from '../src/server/scanner/ssl-inspector';
import { inspectWhois } from '../src/server/scanner/whois-inspector';
import { evaluateHeuristics } from '../src/server/scanner/heuristics';
import { queryVirusTotal } from '../src/server/scanner/virustotal';
import { saveScanRecord, findCachedScan, getRecentScans } from '../src/server/db/scan-service';
import { prisma } from '../src/server/db/prisma';

async function runSystemVerification() {
  console.log('================================================================');
  console.log('       PHISHLENS: COMPREHENSIVE CAPABILITY VERIFICATION         ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 6;

  // 1. SSRF PROTECTION VERIFICATION
  console.log('[TEST 1/6] SSRF Guard & IP Boundary Filter...');
  const localCheck = await assertSafeTarget('localhost');
  const metaCheck = await assertSafeTarget('169.254.169.254');
  const validCheck = await assertSafeTarget('github.com');

  if (!localCheck.isSafe && !metaCheck.isSafe && validCheck.isSafe) {
    console.log('  ✔ PASS: Localhost and Cloud Metadata (169.254.169.254) successfully blocked.');
    console.log('  ✔ PASS: Public internet hostname (github.com) allowed.');
    passed++;
  } else {
    console.log('  ✘ FAIL: SSRF checks did not filter boundaries properly.');
  }

  // 2. REAL TLS SOCKET HANDSHAKE
  console.log('\n[TEST 2/6] Native TLS X.509 Socket Handshake...');
  const ssl = await inspectSslCertificate('github.com', 443);
  if (ssl.isValid && ssl.daysRemaining > 0 && ssl.issuer !== 'Unknown Authority') {
    console.log(`  ✔ PASS: Real TLS socket connected. Issuer: "${ssl.issuer}".`);
    console.log(`  ✔ PASS: Valid certificate with ${ssl.daysRemaining} days remaining.`);
    passed++;
  } else {
    console.log('  ✘ FAIL: TLS handshake did not retrieve valid certificate telemetry.');
  }

  // 3. ICANN RDAP DOMAIN AGE
  console.log('\n[TEST 3/6] ICANN RDAP Domain Age Inspector...');
  const whois = await inspectWhois('github.com');
  if (whois.domainAgeDays > 0) {
    console.log(`  ✔ PASS: ICANN RDAP resolved domain age: ${whois.domainAgeDays} days active.`);
    passed++;
  } else {
    console.log('  ✘ FAIL: RDAP did not resolve domain age.');
  }

  // 4. HEURISTIC ENGINE (TYPOSQUATTING & HOMOGRAPH DETECTION)
  console.log('\n[TEST 4/6] Deterministic Rule Heuristic Engine...');
  const dummyWhois = {
    domain: 'paypa1-security.top',
    registrar: 'NameSilo LLC',
    creationDate: '2026-10-01',
    expiryDate: '2027-10-01',
    domainAgeDays: 4,
    registrantCountry: 'RU',
    isPrivacyProtected: true,
  };
  const dummySsl = {
    issuer: 'None',
    validFrom: 'N/A',
    validTo: 'N/A',
    daysRemaining: 0,
    isValid: false,
    isSelfSigned: false,
    fingerprint: 'NONE',
  };
  const evalResult = evaluateHeuristics('http://paypa1-security.top/login.php', dummyWhois, dummySsl, []);

  if (evalResult.riskLevel === 'MALICIOUS' && evalResult.impersonatedBrand === 'PayPal Inc.') {
    console.log(`  ✔ PASS: Correctly flagged "paypa1" as spoofing "${evalResult.impersonatedBrand}".`);
    console.log(`  ✔ PASS: Score: ${evalResult.riskScore}/100 [${evalResult.riskLevel}].`);
    console.log(`  ✔ PASS: Triggered ${evalResult.heuristics.length} security rules.`);
    passed++;
  } else {
    console.log('  ✘ FAIL: Heuristic engine failed to detect spoofing.');
  }

  // 5. VIRUSTOTAL V3 INTEGRATION
  console.log('\n[TEST 5/6] VirusTotal v3 REST API Engine...');
  const vt = await queryVirusTotal('https://paypa1-security.top', true);
  if (vt.match.source === 'VirusTotal' && typeof vt.totalEngines === 'number') {
    console.log(`  ✔ PASS: VirusTotal client active. Engines: ${vt.totalEngines}. Live API Active: ${vt.isLiveApi}`);
    passed++;
  } else {
    console.log('  ✘ FAIL: VirusTotal client failure.');
  }

  // 6. MYSQL DATABASE & 24-HOUR SCAN CACHE
  console.log('\n[TEST 6/6] Docker MySQL Persistence & 24-Hour Cache...');
  try {
    const testScanId = `verify-${Date.now().toString(36)}`;
    const testScan = {
      id: testScanId,
      inputUrl: 'https://verification-test-domain.xyz',
      normalizedUrl: 'https://verification-test-domain.xyz',
      finalUrl: 'https://verification-test-domain.xyz',
      timestamp: new Date().toISOString(),
      riskScore: 90,
      riskLevel: 'MALICIOUS' as const,
      aiAnalysis: {
        verdictSummary: 'Automated verification test record.',
        threatTactics: ['Test rule'],
        recommendedAction: 'Terminate test.',
        confidenceScore: 98,
      },
      redirectChain: [{ hopNumber: 1, url: 'https://verification-test-domain.xyz', statusCode: 200, domain: 'verification-test-domain.xyz' }],
      whois: dummyWhois,
      ssl: dummySsl,
      threatFeeds: [vt.match],
      heuristics: evalResult.heuristics,
    };

    await saveScanRecord(testScan);
    const cached = await findCachedScan('https://verification-test-domain.xyz', 24);
    const recents = await getRecentScans(10);

    if (cached && cached.id === testScanId && recents.length > 0) {
      console.log(`  ✔ PASS: Successfully wrote to MySQL container (ID: ${testScanId}).`);
      console.log(`  ✔ PASS: 24-Hour Cache query returned instant HIT.`);
      console.log(`  ✔ PASS: Recent scans query verified (${recents.length} records in database).`);
      passed++;
    } else {
      console.log('  ✘ FAIL: Database save or cache lookup failed.');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  ✘ FAIL: Database error (${msg}). Ensure Docker container is running.`);
  }

  await prisma.$disconnect();

  console.log('\n================================================================');
  console.log(`VERIFICATION COMPLETE: ${passed}/${total} SUBSYSTEMS OPERATIONAL`);
  console.log('================================================================');
}

runSystemVerification().catch(console.error);
