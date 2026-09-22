export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple deterministic fallback for non-subtle contexts
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-NG').format(val);
}

export function generateFingerprint(): string {
  const chars = '0123456789abcdef';
  let hex = '';
  for (let i = 0; i < 16; i++) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `sig_ed25519_${hex}`;
}
