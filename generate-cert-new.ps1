# PowerShell script to generate self-signed SSL certificate for local HTTPS development

Write-Host "🔐 Generating self-signed SSL certificate..." -ForegroundColor Cyan

# Create .cert directory
if (-not (Test-Path ".cert")) {
    New-Item -ItemType Directory -Path ".cert" | Out-Null
    Write-Host "✅ Created .cert directory" -ForegroundColor Green
}

$certDir = Join-Path $PSScriptRoot ".cert"
$certName = "localhost"

try {
    # Create self-signed certificate
    $cert = New-SelfSignedCertificate -DnsName $certName, "192.168.0.101" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeyExportPolicy Exportable
    
    # Export to PFX
    $pwd = ConvertTo-SecureString -String "temp" -Force -AsPlainText
    $pfxPath = Join-Path $certDir "temp.pfx"
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pwd | Out-Null
    
    # Paths for PEM files
    $keyPath = Join-Path $certDir "key.pem"
    $certPath = Join-Path $certDir "cert.pem"
    
    # Try using OpenSSL if available
    $opensslAvailable = $null -ne (Get-Command openssl -ErrorAction SilentlyContinue)
    
    if ($opensslAvailable) {
        Write-Host "Using OpenSSL to convert certificates..." -ForegroundColor Gray
        & openssl pkcs12 -in $pfxPath -nocerts -out $keyPath -nodes -password pass:temp 2>$null
        & openssl pkcs12 -in $pfxPath -clcerts -nokeys -out $certPath -password pass:temp 2>$null
    } else {
        Write-Host "⚠ OpenSSL not found, using alternative method..." -ForegroundColor Yellow
        
        # Export certificate in PEM format
        $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
        $certBase64 = [System.Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        $certPem = "-----BEGIN CERTIFICATE-----`r`n$certBase64`r`n-----END CERTIFICATE-----`r`n"
        [System.IO.File]::WriteAllText($certPath, $certPem)
        
        # Export private key in PEM format
        $pfxCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, "temp", [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
        $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfxCert)
        $keyBytes = $rsa.ExportRSAPrivateKey()
        $keyBase64 = [System.Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
        $keyPem = "-----BEGIN RSA PRIVATE KEY-----`r`n$keyBase64`r`n-----END RSA PRIVATE KEY-----`r`n"
        [System.IO.File]::WriteAllText($keyPath, $keyPem)
    }
    
    # Cleanup
    Remove-Item $pfxPath -Force -ErrorAction SilentlyContinue
    Remove-Item "cert:\CurrentUser\My\$($cert.Thumbprint)" -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Certificate generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Files created:" -ForegroundColor Cyan
    Write-Host "   .cert/key.pem" -ForegroundColor Gray
    Write-Host "   .cert/cert.pem" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run dev" -ForegroundColor White
    Write-Host "2. Access via: https://localhost:3000" -ForegroundColor White
    Write-Host "3. On mobile, use: https://192.168.0.101:3000" -ForegroundColor White
    Write-Host "4. Accept the security warning (self-signed certificate)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Certificate generation failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}
