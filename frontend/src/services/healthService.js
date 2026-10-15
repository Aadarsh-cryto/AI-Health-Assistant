export async function getHealthStatus() {
  const response = await fetch('/api/health')

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}.`)
  }

  const result = await response.json()

  if (result.status !== 'ok') {
    throw new Error('The backend returned an unexpected health response.')
  }

  return result
}
