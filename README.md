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

## Local authentication prototype

The login uses a local SQLite file through Node's built-in `node:sqlite` module and a small development auth service. It needs no database server or database credentials and is separate from RCS production authentication. Never use a real employee password with this prototype.

1. Copy `.env.example` to `.env.local`. Optionally change the local demo password (at least 12 characters), company, or employee type.
2. From PowerShell, run `npm run db:setup` to create `server/data/rcs_employee_dev.sqlite` and seed the `demo` account.
3. In one terminal, run `npm run auth:dev`.
4. In another terminal, run `npm run web` (or `npm start`) and sign in with the configured username and password. The company and employee type come from the account record.

The authenticated account's company and employee type are returned by the server. Usernames are unique across companies so the server can resolve the account without asking the employee to select an organization. Keep `npm run auth:dev` running while signing in. The Android Studio emulator connects to the computer through `10.0.2.2`; a physical phone or Expo Go device uses the computer's LAN address, so start Expo in LAN mode and allow Node.js through the computer's firewall for private networks if prompted. If the auth server was started before these settings were configured, stop and restart it so it listens on the network.

The local demo credentials work only while this development server is reachable. A published app cannot connect to your computer's `localhost`; deploy the auth API over HTTPS and set `EXPO_PUBLIC_AUTH_API_URL` to that hosted endpoint for the build. Never ship the local demo account or use real employee passwords with this prototype. The session token stays in memory and expires after eight hours.

## Standalone offline demo APK

The EAS `preview` profile enables a local-only demo login, so the APK can open the bundled sample screens without a computer or network connection. Build it with:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Use one of the demo usernames shown on the sign-in screen. All use the password `demo1234`. Sample records are bundled with the app; demo submissions are saved only on that device. This mode is for presentations and is not connected to employee accounts or production data. The `production` profile does not enable offline demo sign-in.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)



Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
