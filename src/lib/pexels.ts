const PEXELS_API_URL = "https://api.pexels.com/v1";

export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    landscape: string;
    portrait: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

async function pexelsFetch(path: string): Promise<PexelsSearchResponse | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn("PEXELS_API_KEY is not set; skipping Pexels fetch.");
    return null;
  }

  try {
    const res = await fetch(`${PEXELS_API_URL}${path}`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) {
      console.error(`Pexels API error: ${res.status} ${res.statusText}`);
      return null;
    }

    return (await res.json()) as PexelsSearchResponse;
  } catch (err) {
    console.error("Pexels fetch failed:", err);
    return null;
  }
}

export async function searchPhotos(
  query: string,
  perPage = 6
): Promise<PexelsPhoto[]> {
  const data = await pexelsFetch(
    `/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`
  );
  return data?.photos ?? [];
}

export async function getPhoto(query: string): Promise<PexelsPhoto | null> {
  const photos = await searchPhotos(query, 1);
  return photos[0] ?? null;
}
