# Traffic Fine Mobile

Expo React Native starter for the traffic fine system.

## Run locally

Copy the example env file:

```powershell
Copy-Item mobile\.env.example mobile\.env
```

Then install and start the app:

```powershell
cd mobile
npm install
npm start
```

If you keep the backend on port `8081`, set `EXPO_PUBLIC_API_URL=http://localhost:8081/api` in `mobile/.env`.
