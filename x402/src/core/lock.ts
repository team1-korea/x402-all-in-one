import fs from 'fs';
import path from 'path';

/**
 * Basic file-based locking to prevent race conditions during JSON writes.
 * In production, transition to Redis lock for high concurrency.
 */
export async function withFileLock(filename: string, action: () => Promise<any>) {
  const lockFile = filename + '.lock';
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    if (!fs.existsSync(lockFile)) {
      try {
        fs.writeFileSync(lockFile, 'LOCKED');
        const result = await action();
        if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
        return result;
      } catch (e) {
        if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
        throw e;
      }
    }
    // Wait and retry
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }
  throw new Error('Could not acquire file lock: ' + filename);
}
