
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    const rand = Math.floor(Math.random() * ALPHABET.length);
    code += ALPHABET[rand];
  }
  return code;
}
