Set-Location -Path "$PSScriptRoot"

Write-Host 'Starting backend with local profile...'
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:DB_URL = 'jdbc:postgresql://localhost:5432/postgres'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = 'postgres'
$env:STRIPE_API_KEY = 'sk_test_change_me'
$env:STRIPE_WEBHOOK_SECRET = 'test_webhook_secret'
$env:STRIPE_SUCCESS_URL = 'http://localhost:3000/payment-success?sessionId={CHECKOUT_SESSION_ID}'
$env:STRIPE_CANCEL_URL = 'http://localhost:3000/payment-cancelled'
$env:TWILIO_ACCOUNT_SID = 'TWILIO_ACCOUNT_SID'
$env:TWILIO_AUTH_TOKEN = 'your_auth_token'
$env:TWILIO_PHONE_NUMBER = '+1234567890'

# Use Maven wrapper to run the Spring Boot app.
& "$PSScriptRoot\mvnw.cmd" "spring-boot:run" "-Dspring-boot.run.profiles=local"
