import tls from 'node:tls';
import { SslData } from '@/lib/types';

/**
 * Performs a raw TLS socket handshake on port 443 to inspect X.509 certificate telemetry.
 */
export async function inspectSslCertificate(hostname: string, port = 443): Promise<SslData> {
  return new Promise((resolve) => {
    const defaultInsecure: SslData = {
      issuer: 'None (Plain Insecure HTTP or Handshake Timeout)',
      validFrom: 'N/A',
      validTo: 'N/A',
      daysRemaining: 0,
      isValid: false,
      isSelfSigned: false,
      fingerprint: 'NONE',
    };

    let settled = false;
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname, // SNI support
        rejectUnauthorized: false, // We inspect even invalid/self-signed certs rather than dropping
        timeout: 4000,
      },
      () => {
        if (settled) return;
        settled = true;

        try {
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;

          if (!cert || Object.keys(cert).length === 0) {
            socket.destroy();
            return resolve(defaultInsecure);
          }

          const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString().split('T')[0] : 'N/A';
          const validTo = cert.valid_to ? new Date(cert.valid_to).toISOString().split('T')[0] : 'N/A';

          let daysRemaining = 0;
          if (cert.valid_to) {
            const expiryTime = new Date(cert.valid_to).getTime();
            const now = Date.now();
            daysRemaining = Math.max(0, Math.floor((expiryTime - now) / (1000 * 60 * 60 * 24)));
          }

          // Format issuer name cleanly (handle string or string array in PeerCertificate)
          const org = Array.isArray(cert.issuer?.O) ? cert.issuer.O.join(', ') : cert.issuer?.O;
          const cn = Array.isArray(cert.issuer?.CN) ? cert.issuer.CN.join(', ') : cert.issuer?.CN;
          let issuerStr = org || cn || 'Unknown Authority';
          if (cn && org && cn !== org) {
            issuerStr = `${org} (${cn})`;
          }

          // Check for self-signed: issuer matches subject
          const subjectCn = Array.isArray(cert.subject?.CN) ? cert.subject.CN.join(', ') : cert.subject?.CN;
          const isSelfSigned = Boolean(cn && subjectCn && cn === subjectCn);

          socket.destroy();
          return resolve({
            issuer: issuerStr,
            validFrom,
            validTo,
            daysRemaining,
            isValid: Boolean(authorized && daysRemaining > 0 && !isSelfSigned),
            isSelfSigned: Boolean(isSelfSigned),
            fingerprint: cert.fingerprint256 || cert.fingerprint || 'RECORDED',
          });
        } catch {
          socket.destroy();
          return resolve(defaultInsecure);
        }
      }
    );

    socket.on('error', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(defaultInsecure);
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(defaultInsecure);
      }
    });
  });
}
