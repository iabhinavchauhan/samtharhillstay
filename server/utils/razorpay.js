const RAZORPAY_KEY_ID_PATTERN = /^rzp_(test|live)_[A-Za-z0-9]{10,}$/;
const PLACEHOLDER_MARKERS = ['samthar', 'placeholder', 'your_', 'yours', 'changeme', 'change_me', 'example', 'dummy', 'xxxx', 'testsecret', 'testsecre', 'secretkey', 'replace'];

const isBlank = (value) => typeof value !== 'string' || value.trim().length === 0;

/**
 * Razorpay's SDK rejects with an error object whose shape varies by failure
 * mode: API rejections carry `error.description`, transport failures carry a
 * plain `message`, and some responses only expose a status code. This pulls a
 * human-readable reason out of all of them so logs are never `undefined`.
 */
export function describeRazorpayError(err) {
  if (!err) return 'Unknown Razorpay error';

  const candidates = [
    err.error?.description,
    typeof err.error === 'string' ? err.error : undefined,
    err.response?.data?.error?.description,
    err.response?.data?.error,
    err.response?.data?.message,
    err.description,
    err.message
  ];

  const reason = candidates.find((c) => typeof c === 'string' && c.trim());
  const status = err.statusCode ?? err.status ?? err.response?.status;

  if (reason) {
    return status ? `${reason} (HTTP ${status})` : reason;
  }
  if (status) {
    return `Razorpay request failed with HTTP ${status}`;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Strips surrounding quotes and whitespace that survive a copy/paste into .env.
 */
export function cleanCredential(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^["']|["']$/g, '').trim();
}

const looksLikePlaceholder = (value) => {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
};

/**
 * Validates a Razorpay key id / key secret pair against the expected formats.
 * Returns the list of problems so the caller can report every issue at once.
 */
export function validateRazorpayCredentials(keyId, keySecret) {
  const id = cleanCredential(keyId);
  const secret = cleanCredential(keySecret);
  const problems = [];

  if (isBlank(id) && isBlank(secret)) {
    return ['RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not set in server/.env'];
  }
  if (isBlank(id)) problems.push('RAZORPAY_KEY_ID is missing');
  if (isBlank(secret)) problems.push('RAZORPAY_KEY_SECRET is missing');

  if (!isBlank(id) && !RAZORPAY_KEY_ID_PATTERN.test(id)) {
    problems.push(
      looksLikePlaceholder(id)
        ? 'RAZORPAY_KEY_ID is a placeholder, not a real Razorpay key id'
        : 'RAZORPAY_KEY_ID does not look like a Razorpay key id (expected rzp_test_… or rzp_live_…)'
    );
  }
  if (!isBlank(secret)) {
    if (secret.length < 16) {
      problems.push('RAZORPAY_KEY_SECRET is too short to be a real Razorpay key secret');
    } else if (looksLikePlaceholder(secret)) {
      problems.push('RAZORPAY_KEY_SECRET is a placeholder, not a real Razorpay key secret');
    }
  }

  return problems;
}

/**
 * True only when both credentials are present and plausibly real. Placeholder
 * keys are rejected so the app does not fire doomed requests at the gateway.
 */
export function hasUsableRazorpayCredentials(keyId, keySecret) {
  return validateRazorpayCredentials(keyId, keySecret).length === 0;
}

/**
 * The message shown when the gateway is not usable, telling the user exactly
 * where to obtain the keys and what to put in .env.
 */
export function razorpaySetupInstructions(problems) {
  return [
    'Razorpay gateway is not configured - running in sandbox checkout mode.',
    ...problems.map((p) => `  * ${p}`),
    'Add real test credentials to server/.env and restart the server:',
    '  RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX',
    '  RAZORPAY_KEY_SECRET=<your 32-character key secret>',
    'Get them from Razorpay Dashboard -> Settings -> API Keys -> Generate Test Key.'
  ].join('\n');
}

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

/**
 * Verifies the configured credentials against the Razorpay API using a
 * read-only request (order list), so no orders are created by the check.
 */
export async function checkRazorpayCredentials(keyId, keySecret) {
  const id = cleanCredential(keyId);
  const secret = cleanCredential(keySecret);

  const problems = validateRazorpayCredentials(id, secret);
  if (problems.length) {
    return {
      ok: false,
      configured: false,
      problems,
      detail: 'Credentials are missing or still placeholders.'
    };
  }

  const authorization = 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');

  try {
    const res = await fetch(`${RAZORPAY_API_BASE}/orders?count=1`, {
      headers: { Authorization: authorization }
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        configured: true,
        problems: [],
        detail: body?.error?.description || `Razorpay rejected the request (HTTP ${res.status})`
      };
    }

    return {
      ok: true,
      configured: true,
      problems: [],
      detail: 'Razorpay credentials verified — live gateway checkout is available.'
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      problems: [],
      detail: `Could not reach the Razorpay API: ${err.message}`
    };
  }
}
