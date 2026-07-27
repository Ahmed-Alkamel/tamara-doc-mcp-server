import { fetchDocFile } from '../fetcher.js';

const endpointConfig: Record<string, { method: string; path: string; file: string }> = {
  'pre-checkout': {
    method: 'POST',
    path: '/pre-checkout/v1/eligibility',
    file: 'reference/pre-checkout-eligibility',
  },
  'checkout': {
    method: 'POST',
    path: '/checkout',
    file: 'reference/createcheckoutsession',
  },
  'authorise': {
    method: 'POST',
    path: '/orders/{order_id}/authorise',
    file: 'reference/authoriseorder',
  },
  'capture': {
    method: 'POST',
    path: '/payments/capture',
    file: 'reference/captureorder',
  },
  'cancel': {
    method: 'POST',
    path: '/orders/{order_id}/cancel',
    file: 'reference/cancelorder',
  },
  'refund': {
    method: 'POST',
    path: '/orders/{order_id}/refund',
    file: 'reference/simplifiedrefund',
  },
  'get-order': {
    method: 'GET',
    path: '/orders/{order_id}',
    file: 'reference/getorderdetails',
  },
  'in-store-sms': {
    method: 'POST',
    path: '/in-store/checkout/sms',
    file: 'reference/createinstorecheckoutsession',
  },
  'in-store-qr': {
    method: 'POST',
    path: '/in-store/checkout/qr-code',
    file: 'reference/createinstoreqrcode',
  },
  'void': {
    method: 'POST',
    path: '/in-store/checkout/void',
    file: 'reference/voidcheckoutsession',
  },
};

const validEndpoints = Object.keys(endpointConfig);

export async function getApiEndpoint(endpoint: string): Promise<string> {
  const key = endpoint.toLowerCase().replace(/\s+/g, '-');

  const ep = endpointConfig[key];
  if (!ep) {
    return `Unknown endpoint: "${endpoint}".\nAvailable endpoints: ${validEndpoints.join(', ')}`;
  }

  let rawContent: string;
  try {
    rawContent = await fetchDocFile(ep.file);
  } catch {
    rawContent = '(Full documentation content could not be fetched from remote)';
  }

  const summary = extractSummary(rawContent);

  return `# ${ep.method} ${ep.path}

**Endpoint**: ${key}
**Method**: ${ep.method}
**Path**: ${ep.path}
**URL**: https://api-sandbox.tamara.co${ep.path} (Sandbox) / https://api.tamara.co${ep.path} (Production)

---

**Summary**: ${summary}

---

**Full documentation**: https://docs.tamara.co/${ep.file}

**Raw Documentation Content**:
${rawContent.slice(0, 4000)}${rawContent.length > 4000 ? '\n...(truncated)' : ''}
`;
}

function extractSummary(content: string): string {
  const match = content.match(/^#\s+.+\n\n((?:.|\n)+?)(?:\n#|\n##|$)/);
  if (match) {
    return match[1].trim().slice(0, 300);
  }
  return 'See full documentation for details.';
}
