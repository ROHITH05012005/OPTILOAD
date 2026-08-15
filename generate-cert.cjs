const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const certDir = path.join(__dirname, '.cert');

// Create .cert directory if it doesn't exist
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
    console.log('✅ Created .cert directory');
}

console.log('🔐 Generating self-signed SSL certificate...');

// Using PowerShell New-SelfSignedCertificate (Windows only)
const psScript = `
$certDir = "${certDir.replace(/\\/g, '\\\\')}"
$certName = "localhost"

# Create self-signed certificate
$cert = New-SelfSignedCertificate -DnsName $certName, "192.168.0.101" -CertStoreLocation "cert:\\CurrentUser\\My" -NotAfter (Get-Date).AddYears(1) -KeyExportPolicy Exportable

# Export to PFX
$pwd = ConvertTo-SecureString -String "temp" -Force -AsPlainText
$pfxPath = Join-Path $certDir "temp.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pwd | Out-Null

# Install OpenSSL (if not available, we'll handle it)
try {
    # Convert PFX to PEM format
    $keyPath = Join-Path $certDir "key.pem"
    $certPath = Join-Path $certDir "cert.pem"
    
    # Try using OpenSSL if available
    $null = Get-Command openssl -ErrorAction Stop
    
    & openssl pkcs12 -in $pfxPath -nocerts -out $keyPath -nodes -password pass:temp 2>$null
    & openssl pkcs12 -in $pfxPath -clcerts -nokeys -out $certPath -password pass:temp 2>$null
    
    Remove-Item $pfxPath -Force
    Remove-Item "cert:\\CurrentUser\\My\\$($cert.Thumbprint)" -Force
    
    Write-Host "✅ Certificate generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Files created:" -ForegroundColor Cyan
    Write-Host "   .cert/key.pem" -ForegroundColor Gray
    Write-Host "   .cert/cert.pem" -ForegroundColor Gray
} catch {
    # OpenSSL not available - use alternative approach
    Write-Host "⚠ OpenSSL not found, using alternative method..." -ForegroundColor Yellow
    
    # Export certificate and key in Base64
    $certPath = Join-Path $certDir "cert.pem"
    $keyPath = Join-Path $certDir "key.pem"
    
    # Export certificate
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $certBase64 = [System.Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    $certPem = "-----BEGIN CERTIFICATE-----`n$certBase64`n-----END CERTIFICATE-----`n"
[System.IO.File]:: WriteAllText($certPath, $certPem)
    
    # For the private key, we need to get it from the PFX
    # Read the PFX file
$pfxCert = New - Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, "temp", [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]:: Exportable)
    
    # Get private key
$rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]:: GetRSAPrivateKey($pfxCert)
$keyBytes = $rsa.ExportRSAPrivateKey()
$keyBase64 = [System.Convert]:: ToBase64String($keyBytes, [System.Base64FormattingOptions]:: InsertLineBreaks)
$keyPem = "-----BEGIN RSA PRIVATE KEY-----`n$keyBase64`n-----END RSA PRIVATE KEY-----`n"
[System.IO.File]:: WriteAllText($keyPath, $keyPem)

Remove - Item $pfxPath - Force - ErrorAction SilentlyContinue
Remove - Item "cert:\\CurrentUser\\My\\$($cert.Thumbprint)" - Force - ErrorAction SilentlyContinue

Write - Host "✅ Certificate generated successfully!" - ForegroundColor Green
Write - Host ""
Write - Host "📁 Files created:" - ForegroundColor Cyan
Write - Host "   .cert/key.pem" - ForegroundColor Gray
Write - Host "   .cert/cert.pem" - ForegroundColor Gray
}

Write - Host ""
Write - Host "🚀 Next steps:" - ForegroundColor Cyan
Write - Host "1. Run: npm run dev" - ForegroundColor White
Write - Host "2. Access via: https://localhost:3000" - ForegroundColor White
Write - Host "3. On mobile, use: https://192.168.0.101:3000" - ForegroundColor White
Write - Host "4. Accept the security warning (self-signed certificate)" - ForegroundColor White
    `;

// Execute PowerShell script
const ps = spawn('powershell.exe', [
    '-ExecutionPolicy', 'Bypass',
    '-NoProfile',
    '-Command', psScript
], {
    stdio: 'inherit'
});

ps.on('exit', (code) => {
    if (code !== 0) {
        console.error('\n❌ Certificate generation failed!');
        process.exit(1);
    }
});
