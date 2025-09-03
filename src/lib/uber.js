export async function uberFetch(path) {
  const res = await fetch(`${process.env.UBER_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.UBER_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // avoid caching in Next.js
  });

  if (!res.ok) {
    throw new Error(`Uber API error: ${res.status}`);
  }

  return res.json();
}
