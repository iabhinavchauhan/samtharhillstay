const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')

function resolveApiUrl(endpoint) {
  if (!endpoint.startsWith('/api/')) {
    throw new Error(`Invalid API endpoint: ${endpoint}`)
  }

  if (import.meta.env.PROD && !configuredBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured for this production build.')
  }

  return configuredBaseUrl ? `${configuredBaseUrl}${endpoint}` : endpoint
}

function getResponsePreview(body) {
  return body
    .replace(/\s+/g, ' ')
    .replace(/("(?:password|token|secret|authorization)"\s*:\s*)"[^"]*"/gi, '$1"[redacted]"')
    .replace(/Bearer\s+[^\s"<>]+/gi, 'Bearer [redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .trim()
    .slice(0, 180)
}

function logResponseProblem(endpoint, status, contentType, body, reason) {
  console.error(`[API] ${reason}`, {
    endpoint,
    status,
    contentType: contentType || '(missing)',
    preview: getResponsePreview(body),
  })
}

export async function apiFetch(endpoint, options) {
  let url
  try {
    url = resolveApiUrl(endpoint)
  } catch (error) {
    console.error('[API] Configuration error', { endpoint, message: error.message })
    throw error
  }

  let response
  try {
    response = await fetch(url, options)
  } catch (error) {
    console.error('[API] Network request failed', {
      endpoint,
      apiOrigin: configuredBaseUrl || window.location.origin,
      message: error.message,
    })
    throw new Error(`Could not reach the API for ${endpoint}. Check the backend URL and service status.`)
  }

  const contentType = response.headers.get('content-type') || ''
  let body
  try {
    body = await response.text()
  } catch (error) {
    console.error('[API] Could not read response body', {
      endpoint,
      status: response.status,
      contentType: contentType || '(missing)',
      message: error.message,
    })
    throw new Error(`Could not read the API response for ${endpoint}.`)
  }
  const isJson = /(?:application|text)\/(?:[\w.+-]*\+)?json\b/i.test(contentType)

  if (!response.ok) {
    let data = null
    if (isJson && body) {
      try {
        data = JSON.parse(body)
      } catch {
        logResponseProblem(endpoint, response.status, contentType, body, 'Invalid JSON error response')
      }
    } else {
      logResponseProblem(endpoint, response.status, contentType, body, 'API returned a non-JSON error response')
    }

    const message = typeof data?.error === 'string'
      ? data.error
      : `API request failed with status ${response.status}.`
    console.error('[API] Request returned an error status', {
      endpoint,
      status: response.status,
      contentType: contentType || '(missing)',
      preview: getResponsePreview(body),
    })
    const requestError = new Error(message)
    requestError.status = response.status
    throw requestError
  }

  if (!isJson) {
    logResponseProblem(endpoint, response.status, contentType, body, 'Expected a JSON response')
    throw new Error(`The API returned ${contentType || 'an unknown content type'} for ${endpoint}.`)
  }

  let data
  try {
    data = body ? JSON.parse(body) : null
  } catch (error) {
    logResponseProblem(endpoint, response.status, contentType, body, 'Invalid JSON response')
    throw new Error(`The API returned invalid JSON for ${endpoint}.`)
  }

  return {
    ok: true,
    status: response.status,
    headers: response.headers,
    json: async () => data,
    text: async () => body,
    blob: async () => new Blob([body], { type: contentType }),
  }
}
