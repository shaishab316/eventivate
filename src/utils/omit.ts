/**
 * Utility function to omit specified fields from an object. It takes an object and a record of fields to omit, creates a shallow copy of the object, and deletes the specified fields from the copy before returning it. This is useful for removing sensitive or unnecessary information from objects before sending them in responses or using them in other parts of the application.
 */
export function omit<T, K extends keyof T>(
  obj: T,
  fields: Record<K, true>,
): Omit<T, K> {
  const clone = { ...obj };

  for (const key in fields) {
    if (fields[key]) {
      delete clone[key];
    }
  }

  return clone;
}
