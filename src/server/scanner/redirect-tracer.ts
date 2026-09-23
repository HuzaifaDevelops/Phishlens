import { RedirectHop } from '@/lib/types';
import { assertSafeTarget } from '../security/ssrf-guard';

export interface RedirectTraceResult {
  finalUrl: string;
  chain: RedirectHop[];
  hasRedirects: boolean;
}

/**
 * Traces HTTP redirects hop-by-hop up to maxHops.
 * Enforces SSRF checks on every intermediate target to prevent redirection into private subnets.
 */
export async function traceRedirects(initialUrl: string, maxHops = 5): Promise<RedirectTraceResult> {
  const chain: RedirectHop[] = [];
  let currentUrl = initialUrl.startsWith('http') ? initialUrl : `http://${initialUrl}`;
  let hopsCount = 0;

  while (hopsCount < maxHops) {
    hopsCount++;

    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      break;
    }

    // SSRF Check on this hop
    const ssrfCheck = await assertSafeTarget(parsed.hostname);
    if (!ssrfCheck.isSafe) {
      chain.push({
        hopNumber: hopsCount,
        url: currentUrl,
        statusCode: 403,
        domain: parsed.hostname,
        ip: ssrfCheck.resolvedIp || 'BLOCKED',
      });
      break;
    }

    try {
      // Use AbortController with 3.5s timeout per hop
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PhishLens-SecurityScanner/1.0',
        },
      });

      clearTimeout(timeoutId);

      const statusCode = response.status;
      chain.push({
        hopNumber: hopsCount,
        url: currentUrl,
        statusCode,
        domain: parsed.hostname,
        ip: ssrfCheck.resolvedIp,
      });

      // Check if this response redirects
      const isRedirect = [301, 302, 303, 307, 308].includes(statusCode);
      const location = response.headers.get('location');

      if (isRedirect && location) {
        // Resolve relative redirects against current URL
        currentUrl = new URL(location, currentUrl).toString();
      } else {
        // Destination reached
        break;
      }
    } catch {
      // If HEAD request fails (some servers block HEAD), try a fallback entry
      if (chain.length === 0) {
        chain.push({
          hopNumber: 1,
          url: currentUrl,
          statusCode: 200,
          domain: parsed.hostname,
          ip: ssrfCheck.resolvedIp,
        });
      }
      break;
    }
  }

  return {
    finalUrl: chain.length > 0 ? chain[chain.length - 1].url : initialUrl,
    chain,
    hasRedirects: chain.length > 1,
  };
}
