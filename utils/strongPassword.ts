const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const isStrongPassword = (password: string) =>
  STRONG_PASSWORD_REGEX.test(password);