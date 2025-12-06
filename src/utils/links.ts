import { Linking, Platform, Share } from 'react-native';

export interface OpenMapArgs {
  lat: string | number;
  lng: string | number;
}

const getMapLink = ({ lat, lng }: OpenMapArgs) => {
  return Platform.select({
    ios: `maps://?&ll=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}`,
  });
};

export const openMap = (params: OpenMapArgs) => {
  const scheme = getMapLink(params);

  if (scheme) {
    return Linking.openURL(scheme).catch(err =>
      console.error('Error opening map: ', err),
    );
  }
};

export const shareMapLink = (params: OpenMapArgs) => {
  const scheme = getMapLink(params);
  return Share.share({ url: scheme, message: '' });
};
