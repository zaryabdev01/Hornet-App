import * as Location from 'expo-location';

// Précision du brouillage géographique public (environ 1-2 km)
const PUBLIC_PRECISION = 2; // décimales

function blurCoordinate(coord) {
  return Math.round(coord * 10 ** PUBLIC_PRECISION) / 10 ** PUBLIC_PRECISION;
}

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const exact = {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };

  const blurred = {
    latitude: blurCoordinate(loc.coords.latitude),
    longitude: blurCoordinate(loc.coords.longitude),
  };

  return { exact, blurred };
}

export async function getCityFromCoords(latitude, longitude) {
  try {
    const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (geo?.[0]) {
      return geo[0].city || geo[0].subregion || geo[0].region || 'France';
    }
  } catch {}
  return 'Position inconnue';
}

export async function getCoordsFromCity(cityName) {
  try {
    const coords = await Location.geocodeAsync(cityName);
    if (coords?.[0]) {
      return {
        latitude: coords[0].latitude,
        longitude: coords[0].longitude,
      };
    }
  } catch {}
  return null;
}
