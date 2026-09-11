export const formatEnumsCapital = (text: string): string => {
  if (!text) return "";
  return text.replaceAll("_", " ").toUpperCase();
};