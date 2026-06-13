export async function onRequest({ request }) {
  const url = new URL(request.url)
  const targetPath = url.pathname.replace(/^\/api\/nominatim/, "")
  const targetUrl = `https://nominatim.openstreetmap.org${targetPath}${url.search}`

  // Nominatim actively blocks requests from Cloudflare Worker IP ranges (Status 403)
  // because serverless proxies are frequently used for scraping. 
  // By returning a 302 Redirect, we offload the fetch to the end-user's browser.
  // The browser will directly request Nominatim using the user's IP and their auto-generated 
  // 'Referer' header (which satisfies Nominatim's policy) and avoid the proxy block entirely!
  return Response.redirect(targetUrl, 302)
}
