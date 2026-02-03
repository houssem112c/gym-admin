# Manual Deployment Script for UrbanGym Admin
# Use this when GitHub Actions is blocked by university permissions.

$acrName = "gymacrgymapp1085"
$appName = "gym-web-gymapp1085"
$rgName = "gym-aca-rg-gymapp1085"

Write-Host "🚀 Starting Manual Deployment..." -ForegroundColor Cyan

# 1. Login
Write-Host "Step 1: Logging into Azure..." -ForegroundColor Yellow
az login -o none
az acr login --name $acrName

# 2. Build & Push
Write-Host "Step 2: Building Docker Image..." -ForegroundColor Yellow
# Get the dynamic API URL from the running container app (optional, or hardcode if known)
$apiUrl = "htttp://localhost:3001/api"

docker build -t "$acrName.azurecr.io/gym-admin:latest" --build-arg NEXT_PUBLIC_API_URL=$apiUrl .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Step 3: Pushing to Registry..." -ForegroundColor Yellow
docker push "$acrName.azurecr.io/gym-admin:latest"

# 3. Deploy
Write-Host "Step 4: Updating Container App..." -ForegroundColor Yellow
az containerapp update --name $appName --resource-group $rgName --image "$acrName.azurecr.io/gym-admin:latest"

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌍 App URL: https://$(az containerapp show --name $appName --resource-group $rgName --query properties.configuration.ingress.fqdn -o tsv)" -ForegroundColor Cyan
