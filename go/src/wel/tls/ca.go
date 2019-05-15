// ca contains tools for generating Central Authority certs */
package tls

import (
	"fmt"
	"log"
	"os"
	"time"

	"encoding/pem"
	"math/big"

	"crypto"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
)

var (
	CertsDirPath      = "certs"
	CaCertPath        = CertsDirPath + "/ca-cert.pem"
	CaKeyPath         = CertsDirPath + "/ca-key.pem"
	LocalhostCertPath = CertsDirPath + "/localhost-cert.pem"
	LocalhostKeyPath  = CertsDirPath + "/localhost-key.pem"

	CaCertificate tls.Certificate
)

// If CaCertPath and CaKeyPath do not exist, generate the cert and key for a TLS CA
func ReadOrGenerateCa() error {
	if fileExists(CaCertPath) && fileExists(CaKeyPath) {
		return readCaPEMs()
	}

	os.Mkdir(CertsDirPath, 0777)

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
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
	issuerSerialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		log.Fatalf("failed to generate serial number: %s", err)
	}
	subjectSerialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		log.Fatalf("failed to generate serial number: %s", err)
	}

	template := x509.Certificate{
		SerialNumber: serialNumber,
		Issuer: pkix.Name{
			CommonName:   "WEL",
			Organization: []string{"Web Embed Lab"},
			SerialNumber: fmt.Sprintf("%v", issuerSerialNumber),
		},
		Subject: pkix.Name{
			CommonName:   "WEL",
			Organization: []string{"Web Embed Lab"},
			SerialNumber: fmt.Sprintf("%v", subjectSerialNumber),
		},
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		IsCA:                  true,
	}

	template.DNSNames = append(template.DNSNames, "bogus-wel-bogus.com")

	certBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, publicKey(privateKey), privateKey)
	if err != nil {
		log.Fatalf("Failed to create certificate: %s", err)
	}

	writePEMs(CaCertPath, CaKeyPath, certBytes, privateKey)

	err = readCaPEMs()
	if err != nil {
		return err
	}

	localhostCert, err := SignHost(CaCertificate, []string{"localhost"})
	if err != nil {
		log.Fatalf("error generating a certificate for localhost", err)
	}

	writePEMs(LocalhostCertPath, LocalhostKeyPath, localhostCert.Certificate[0], localhostCert.PrivateKey)

	logger.Printf("Generated new CA PEMs, you will need to add %s to your browser certificates", CaCertPath)
	return nil
}

func readCaPEMs() error {
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

func writePEMs(certPath string, keyPath string, certBytes []byte, priv crypto.PrivateKey) {
	certOut, err := os.Create(certPath)
	if err != nil {
		log.Fatalf("failed to open %s for writing: %s", certPath, err)
	}
	if err := pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: certBytes}); err != nil {
		log.Fatalf("failed to write data to %s: %s", CaCertPath, err)
	}
	if err := certOut.Close(); err != nil {
		log.Fatalf("error closing %s: %s", certPath, err)
	}

	keyOut, err := os.OpenFile(keyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("failed to open %s for writing:", keyPath, err)
	}
	if err := pem.Encode(keyOut, pemBlockForKey(priv)); err != nil {
		log.Fatalf("failed to write data to %s: %s", keyPath, err)
	}
	if err := keyOut.Close(); err != nil {
		log.Fatalf("error closing %s: %s", keyPath, err)
	}
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

/*
Copyright 2019 FullStory, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
