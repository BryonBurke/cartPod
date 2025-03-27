import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance: Loader | null = null;

export const getGoogleMapsLoader = () => {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    });
  }
  return loaderInstance;
};

export const loadGoogleMaps = async () => {
  try {
    const loader = getGoogleMapsLoader();
    const google = await loader.load();
    return google;
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
}; 