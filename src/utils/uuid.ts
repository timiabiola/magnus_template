
/**
 * Utility functions for UUID generation and management
 */

/**
 * Generate a new UUID v4
 * @returns string - UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get the current session UUID or create a new one
 * @returns string - Session UUID
 */
export const getSessionUUID = (): string => {
  const storedUUID = localStorage.getItem('chat-session-uuid');
  
  if (storedUUID) {
    return storedUUID;
  }
  
  const newUUID = generateUUID();
  localStorage.setItem('chat-session-uuid', newUUID);
  return newUUID;
};
