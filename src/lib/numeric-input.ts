export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isDigitsOnly(value: string) {
  return /^\d+$/.test(value);
}
