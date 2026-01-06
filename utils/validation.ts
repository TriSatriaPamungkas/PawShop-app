export const validateItem = (name: string, price: string, stock: string) => {
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = "Name is required";
  }

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    errors.price = "Valid price required";
  }

  if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
    errors.stock = "Valid stock required";
  }

  return errors;
};
