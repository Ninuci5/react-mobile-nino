# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

The home screen loads products from the public Fake Store API. Select a product to see its details. An internet connection is required.

The cart is available without signing in and is stored locally across app restarts. Add products from the home or detail screen, then use the cart to change quantities or remove items. This demo does not submit orders or sync carts between devices.

## Login

The login form uses [Fake Store API](https://fakestoreapi.com/docs), a prototype service. Use only its test accounts, never real passwords. The returned token is stored with Expo SecureStore on Android and iOS, and in browser local storage on web. Log out from the home header to remove the saved token. Web local storage is accessible to scripts on the same origin and is not suitable for production authentication.

Remember me retains its setting across restarts. After a successful login, it saves the username and password in Expo SecureStore on Android and iOS; on web, it saves only the username and relies on the browser's password manager for the password. Unchecking it removes the app's saved login details. Logging out does not remove them.

Registration posts fictional details to Fake Store's demo `/users` endpoint. It does not persist accounts or create credentials for login.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
