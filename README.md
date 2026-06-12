# Traffic Fine System

## Backend configuration

The backend uses JWT authentication. Set a secure `JWT_SECRET` environment variable in production.

Example key generation:

- PowerShell:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

- Bash:

```bash
openssl rand -base64 32
```

Then run the backend with:

```powershell
$env:JWT_SECRET = '<base64-key>'
.\mvnw.cmd spring-boot:run
```

or on Linux/macOS:

```bash
export JWT_SECRET='<base64-key>'
./mvnw spring-boot:run
```

## Local development

If `JWT_SECRET` is not set, the backend falls back to a local development secret.

### Environment files

Copy the example files and fill in your real values:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Set `VITE_API_URL` to the backend URL you are actually running. If the backend is on port `8081`, use `http://localhost:8081/api`. If it stays on the default port, use `http://localhost:8080/api`.

For Supabase, set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in `backend/.env` from the Supabase database connection details.

## Notes

- Do not commit production secrets to source control.
- Use a secure random key for production deployments.
