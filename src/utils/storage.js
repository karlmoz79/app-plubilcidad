const STORAGE_KEY = "adVariations";

export const saveVariations = (variations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variations));
  } catch (err) {
    console.error("Error guardando en localStorage:", err);
  }
};

export const loadVariations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearVariations = () => {
  localStorage.removeItem(STORAGE_KEY);
};
