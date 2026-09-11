const stripCurrency = (value: any) => {
  if (value === null || value === undefined) return 0;

  // if already a number, return it
  if (typeof value === "number") return value;

  // if string, clean it
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }

  return 0;
};

export default stripCurrency;