export function parseScenes(promptText) {
  if (!promptText) return [];

  // Look for "Scene X", "SCENE X", "Scene X:"
  const sceneRegex = /(?=Scene\s*\d+|SCENE\s*\d+)/i;
  let parts = promptText.split(sceneRegex).map(p => p.trim()).filter(Boolean);

  // If we found scene markers, return them
  if (parts.length > 1 || (parts.length === 1 && /Scene\s*\d+|SCENE\s*\d+/i.test(parts[0]))) {
    return parts.map((text, i) => ({
      id: `scene-${Date.now()}-${i}`,
      text: text
    }));
  }

  // Fallback: split by paragraph (double newlines)
  const paragraphs = promptText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map((text, i) => ({
    id: `scene-${Date.now()}-${i}`,
    text: text
  }));
}
