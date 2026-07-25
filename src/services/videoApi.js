export async function generateSceneClip(prompt) {
  const apiUrl = import.meta.env.VITE_LOCAL_API_URL;
  if (!apiUrl) {
    throw new Error("VITE_LOCAL_API_URL is not defined in environment variables.");
  }

  const response = await fetch(`${apiUrl}/generate-scene`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate scene: ${response.status} ${errorText}`);
  }

  return response.json(); // Expected to return { clip_id, video_url }
}

export async function stitchVideoClips(clipIds) {
  const apiUrl = import.meta.env.VITE_LOCAL_API_URL;
  if (!apiUrl) {
    throw new Error("VITE_LOCAL_API_URL is not defined in environment variables.");
  }

  const response = await fetch(`${apiUrl}/stitch-video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clip_ids: clipIds }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to stitch video: ${response.status} ${errorText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
