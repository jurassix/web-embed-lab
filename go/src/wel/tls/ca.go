// ca contains tools for generating Central Authority certs */
package tls

import (
	"fmt"
	"log"
	"os"
	"time"

	"encoding/pem"
	"math/big"

	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
)

var (
	CertsDirPath = "certs"
	CaCertPath   = CertsDirPath + "/ca-cert.pem"
	CaKeyPath    = CertsDirPath + "/ca-key.pem"

	CaCertificate tls.Certificate
)

// If CaCertPath and CaKeyPath do not exist, generate the cert and key for a TLS CA
func ReadOrGenerateCa() error {
	if fileExists(CaCertPath) && fileExists(CaKeyPath) {
		log.Print("Using existing CA PEMs")
		return ReadCaPEMs()
	}

	os.Mkdir(CertsDirPath, 0777)

	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Fatalf("failed to generate private key: %s", err)
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(30 * 24 * time.Hour)

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		log.Fatalf("failed to generate serial number: %s", err)
	}

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{"Web Embed Lab"},
		},
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		IsCA:                  true,
	}

	template.DNSNames = append(template.DNSNames, "bogus-wel-bogus.com")

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, publicKey(priv), priv)
	if err != nil {
		log.Fatalf("Failed to create certificate: %s", err)
	}

	certOut, err := os.Create(CaCertPath)
	if err != nil {
		log.Fatalf("failed to open %s for writing: %s", CaCertPath, err)
	}
	if err := pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes}); err != nil {
		log.Fatalf("failed to write data to %s: %s", CaCertPath, err)
	}
	if err := certOut.Close(); err != nil {
		log.Fatalf("error closing %s: %s", CaCertPath, err)
	}

	keyOut, err := os.OpenFile(CaKeyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("failed to open %s for writing:", CaKeyPath, err)
	}
	if err := pem.Encode(keyOut, pemBlockForKey(priv)); err != nil {
		log.Fatalf("failed to write data to %s: %s", CaKeyPath, err)
	}
	if err := keyOut.Close(); err != nil {
		log.Fatalf("error closing %s: %s", CaKeyPath, err)
	}

	logger.Printf("Generated new CA PEMs, you will need to add %s to your browser certificates", CaCertPath)

	return ReadCaPEMs()
}

func ReadCaPEMs() error {
	var err error
	CaCertificate, err = tls.LoadX509KeyPair(CaCertPath, CaKeyPath)
	if err != nil {
		return err
	}
	if CaCertificate.Leaf, err = x509.ParseCertificate(CaCertificate.Certificate[0]); err != nil {
		return err
	}
	return nil
}

func fileExists(path string) bool {
	fi, err := os.Lstat(path)
	if err != nil {
		return false
	}
	return fi.Mode().IsRegular()
}

func publicKey(priv interface{}) interface{} {
	switch k := priv.(type) {
	case *rsa.PrivateKey:
		return &k.PublicKey
	case *ecdsa.PrivateKey:
		return &k.PublicKey
	default:
		return nil
	}
}

func pemBlockForKey(priv interface{}) *pem.Block {
	switch k := priv.(type) {
	case *rsa.PrivateKey:
		return &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(k)}
	case *ecdsa.PrivateKey:
		b, err := x509.MarshalECPrivateKey(k)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to marshal ECDSA private key: %v", err)
			os.Exit(2)
		}
		return &pem.Block{Type: "EC PRIVATE KEY", Bytes: b}
	default:
		return nil
	}
}
