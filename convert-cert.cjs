const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '.cert');
const pfxPath = path.join(certDir, 'cert.pfx');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

console.log('🔐 Converting PFX to PEM format...');

try {
    // Read the PFX file
    const pfxData = fs.readFileSync(pfxPath);
    const pfxBase64 = pfxData.toString('base64');

    // Convert PFX to ASN.1
    const pfxAsn1 = forge.asn1.fromDer(forge.util.decode64(pfxBase64));
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, 'temp123');

    // Get the private key
    const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const pkcs8Bag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    const privateKey = pkcs8Bag.key;

    // Get the certificate
    const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag][0];
    const certificate = certBag.cert;

    // Convert to PEM format
    const keyPem = forge.pki.privateKeyToPem(privateKey);
    const certPem = forge.pki.certificateToPem(certificate);

    // Write to files
    fs.writeFileSync(keyPath, keyPem);
    fs.writeFileSync(certPath, certPem);

    // Clean up PFX file
    fs.unlinkSync(pfxPath);

    console.log('✅ Conversion successful!');
    console.log('');
    console.log('📁 Files created:');
    console.log('   .cert/key.pem');
    console.log('   .cert/cert.pem');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Access via: https://localhost:3000');
    console.log('3. On mobile, use: https://192.168.0.101:3000');
    console.log('4. Accept the security warning (self-signed certificate)');

} catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
}
