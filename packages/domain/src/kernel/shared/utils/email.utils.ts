export function validateEmail(email: string): boolean {
  const re = /\S[^\s@]*@\S+\.\S+/
  return re.test(String(email).toLowerCase())
}
