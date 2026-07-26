// Determine API URL with smart fallback
const NGROK_FALLBACK_URL = "https://retail-pranker-landless.ngrok-free.dev";

function getApiUrl() {
  const envUrl = import.meta.env.VITE_LOCAL_API_URL;
  const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

  // If running on a deployed site (Vercel etc.) and env var is missing or points to localhost, use ngrok
  if (isProduction && (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
    console.warn("Production detected but API URL is local/missing. Using ngrok fallback:", NGROK_FALLBACK_URL);
    return NGROK_FALLBACK_URL;
  }

  // Otherwise use the env var (for local dev)
  if (envUrl) {
    return envUrl;
  }

  // Last resort fallback
  console.warn("No API URL configured, using ngrok fallback:", NGROK_FALLBACK_URL);
  return NGROK_FALLBACK_URL;
}

const API_URL = getApiUrl();
console.log("PromptVerse API URL resolved to:", API_URL);
console.log("Running on:", window.location.hostname);

export async function generateSceneClip(prompt) {
  console.log("generateSceneClip: Sending request to", `${API_URL}/generate-scene`);

  try {
    const response = await fetch(`${API_URL}/generate-scene`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate scene: ${response.status} ${errorText}`);
    }

    return await response.json(); // Expected to return { clip_id, video_url }
  } catch (error) {
    console.error("Error in generateSceneClip:", error.message);
    throw error;
  }
}

export async function stitchVideoClips(clipIds) {
  console.log("stitchVideoClips: Sending request to", `${API_URL}/stitch-video`);

  try {
    const response = await fetch(`${API_URL}/stitch-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ clip_ids: clipIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to stitch video: ${response.status} ${errorText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error in stitchVideoClips:", error.message);
    throw error;
  }
}

