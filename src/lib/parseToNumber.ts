export function parseToNumber(value: string | number): number {
  if (typeof value === "number") {
    // If the value is already a number, simply return it
    return value;
  } else if (typeof value === "string") {
    // If the value is a string, parse it using parseInt
    const parsedValue = parseInt(value, 10);
    // Check if the parsing was successful (not NaN)
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  // If the value is neither a number nor a valid parsable string, return a default value (e.g., 0)
  return 0;
}
