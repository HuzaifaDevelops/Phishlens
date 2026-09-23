import { lookup } from 'node:dns/promises';

/**
 * Checks whether an IPv4 or IPv6 address is private, loopback, link-local, or reserved.
 * Defends against Server-Side Request Forgery (SSRF) and cloud metadata exfiltration.
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 Loopback
  if (ip.startsWith('127.')) return true;

  // RFC 1918 Private IPv4 ranges
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;

  // Link-Local / Cloud Metadata (AWS, GCP, Azure: 169.254.169.254)
  if (ip.startsWith('169.254.')) return true;

  // Zero-conf / Broadcast
  if (ip === '0.0.0.0' || ip === '255.255.255.255') return true;

  // IPv6 Loopback and local ranges
  if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return true;
  }

  return false;
}

export interface SsrfCheckResult {
  isSafe: boolean;
  resolvedIp?: string;
  error?: string;
}

/**
 * Resolves all DNS records for the host and asserts none point to internal/private targets.
 */
export async function assertSafeTarget(hostname: string): Promise<SsrfCheckResult> {
  // Lowercase and reject obvious loopback hostnames
  const normalizedHost = hostname.toLowerCase();
  if (
    normalizedHost === 'localhost' ||
    normalizedHost.endsWith('.localhost') ||
    normalizedHost.endsWith('.local') ||
    normalizedHost.endsWith('.internal')
  ) {
    return { isSafe: false, error: 'SSRF_BLOCKED: Internal hostname resolution rejected.' };
  }

  try {
    const addresses = await lookup(normalizedHost, { all: true });
    if (!addresses || addresses.length === 0) {
      return { isSafe: false, error: 'DNS_RESOLVE_FAILED: Hostname does not resolve to an active IP.' };
    }

    // Check each resolved IP address
    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        return {
          isSafe: false,
          resolvedIp: record.address,
          error: `SSRF_BLOCKED: Target resolved to private/reserved network boundary (${record.address}).`,
        };
      }
    }

    return {
      isSafe: true,
      resolvedIp: addresses[0].address,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown DNS error';
    return { isSafe: false, error: `DNS_ERROR: ${message}` };
  }
}
