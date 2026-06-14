export async function onRequest({ request }) {
  const url = new URL(request.url)
  const targetPath = url.pathname.replace(/^\/api\/nominatim/, "")
  const targetUrl = `https://nominatim.openstreetmap.org${targetPath}${url.search}`

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "User-Agent": "Stratum3D/0.0.1",
        Accept: "application/json",
      },
    })
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to proxy request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
