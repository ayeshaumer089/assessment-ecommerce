import { setDefaultResultOrder } from 'node:dns';
import { promises as dns } from 'node:dns';
import * as dotenv from 'dotenv';

/**
 * MongoDB Atlas uses `mongodb+srv://` URIs that rely on DNS SRV record lookups.
 * On some networks (notably Windows with certain ISPs) the local resolver
 * fails to resolve these records, causing ECONNREFUSED. Pointing Node at
 * Google's public DNS works around that.
 *
 * We ONLY do this for SRV (Atlas) URIs — forcing public DNS would break
 * local development against `mongodb://localhost`, where the host must be
 * resolved by the OS hosts file / local resolver.
 */
export function configureDns(): void {
  // ConfigModule hasn't initialised yet at this point, so load .env ourselves
  // to read MONGO_URI before deciding whether to override DNS.
  dotenv.config();
  const uri = process.env.MONGO_URI ?? '';
  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    setDefaultResultOrder('ipv4first');
  }
}
