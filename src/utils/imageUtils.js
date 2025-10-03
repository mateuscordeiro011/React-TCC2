// src/utils/imageUtils.js
export const getBase64ImageSrc = (imageData) => {
  const fallbackSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";

  if (!imageData) return fallbackSVG;

  const imageDataStr = String(imageData).trim();
  if (imageDataStr === "") return fallbackSVG;

  if (imageDataStr.startsWith('data:image/')) return imageDataStr;

  if (imageDataStr.startsWith('http://') || imageDataStr.startsWith('https://')) {
    return imageDataStr; // Retorna URL direto se for um link
  }

  if (imageDataStr.startsWith("iVBOR")) return `data:image/png;base64,${imageDataStr}`;
  if (imageDataStr.startsWith("R0lGO")) return `data:image/gif;base64,${imageDataStr}`;
  if (imageDataStr.startsWith("/9j/")) return `data:image/jpeg;base64,${imageDataStr}`;

  try {
    atob(imageDataStr);
    return `data:image/jpeg;base64,${imageDataStr}`;
  } catch (e) {
    return fallbackSVG;
  }
};