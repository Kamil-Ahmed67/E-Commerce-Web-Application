// utils/generateTranId.js
export const generateTranId = () => {
  // Current timestamp in milliseconds
  const timestamp = Date.now().toString(36);

  // Random number between 0 and 1, converted to base36, slice a few digits
  const randomNum = Math.floor(Math.random() * 1e8).toString(36);

  // Random letters
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');

  // Optional microsecond-style random number
  const microRandom = Math.floor(Math.random() * 1e6).toString(36);

  return `${timestamp}${randomNum}${letters}${microRandom}`;
};