export interface JWTPayload {
  user_id: number;
  vehicle_id?: number;
  email: string;
  is_admin?: boolean;
  exp: number;
  iat: number;
}

export const decodeJWTPayload = (token: string): JWTPayload | null => {
  try {
    // Split the token and get the payload part
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the base64 payload
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getUserVehicleIdFromToken = async (): Promise<number | null> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const token = await AsyncStorage.default.getItem('auth_token');

    if (!token) {
      return null;
    }

    const payload = decodeJWTPayload(token);
    return payload?.vehicle_id || null;
  } catch (error) {
    console.error('Error getting vehicle ID from token:', error);
    return null;
  }
};
