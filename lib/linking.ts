import * as Linking from "expo-linking";

export const linking = {
  prefixes: [
    Linking.createURL("/"),
    "pawshop://",
    "https://pawshop.app",
    "https://*.pawshop.app",
  ],
  config: {
    screens: {
      "(tabs)": {
        screens: {
          home: "home",
          cart: "cart",
          history: "history",
          profile: "profile",
          users: "users",
        },
      },
      "items/add": "items/add",
      "items/[id]": "items/:id",
    },
  },
};
