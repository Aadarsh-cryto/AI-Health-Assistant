export function errorMiddleware(error, _request, response, _next) {
  if (response.headersSent) {
    return
  }

  if (error?.type === 'entity.parse.failed') {
    return response
      .status(400)
      .json({ success: false, message: 'Request body must contain valid JSON.' })
  }

  if (error?.type === 'entity.too.large') {
    return response
      .status(413)
      .json({ success: false, message: 'Request body is too large.' })
  }

  console.error(`Request failed: ${error?.name ?? 'UnknownError'}`)
  return response
    .status(500)
    .json({ success: false, message: 'An unexpected server error occurred.' })
}
