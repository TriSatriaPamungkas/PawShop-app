import * as Linking from "expo-linking";

export const createDeepLink = (path: string) => {
  return Linking.createURL(path);
};

export const openDeepLink = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.error(`Cannot open URL: ${url}`);
  }
};

// Generate shareable link
export const generateShareLink = (
  screen: string,
  params?: Record<string, string>
) => {
  const baseUrl = "https://petshop.app";
  let url = `${baseUrl}/${screen}`;

  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url += `?${queryString}`;
  }

  return url;
};
