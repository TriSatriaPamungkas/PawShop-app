import * as Linking from "expo-linking";

export const linking = {
  prefixes: [
    Linking.createURL("/"),
    "petshop://",
    "https://petshop.app",
    "https://*.petshop.app",
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
