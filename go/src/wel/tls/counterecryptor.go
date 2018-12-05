package tls

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"errors"
)

type CounterEncryptorRand struct {
	cipher  cipher.Block
	counter []byte
	rand    []byte
	ix      int
}

func NewCounterEncryptorRandFromKey(key interface{}, seed []byte) (r CounterEncryptorRand, err error) {
	var keyBytes []byte
	switch key := key.(type) {
	case *rsa.PrivateKey:
		keyBytes = x509.MarshalPKCS1PrivateKey(key)
	default:
		err = errors.New("only RSA keys supported")
		return
	}
	h := sha256.New()
	if r.cipher, err = aes.NewCipher(h.Sum(keyBytes)[:aes.BlockSize]); err != nil {
		return
	}
	r.counter = make([]byte, r.cipher.BlockSize())
	if seed != nil {
		copy(r.counter, h.Sum(seed)[:r.cipher.BlockSize()])
	}
	r.rand = make([]byte, r.cipher.BlockSize())
	r.ix = len(r.rand)
	return
}

func (c *CounterEncryptorRand) Seed(b []byte) {
	if len(b) != len(c.counter) {
		panic("SetCounter: wrong counter size")
	}
	copy(c.counter, b)
}

func (c *CounterEncryptorRand) refill() {
	c.cipher.Encrypt(c.rand, c.counter)
	for i := 0; i < len(c.counter); i++ {
		if c.counter[i]++; c.counter[i] != 0 {
			break
		}
	}
	c.ix = 0
}

func (c *CounterEncryptorRand) Read(b []byte) (n int, err error) {
	if c.ix == len(c.rand) {
		c.refill()
	}
	if n = len(c.rand) - c.ix; n > len(b) {
		n = len(b)
	}
	copy(b, c.rand[c.ix:c.ix+n])
	c.ix += n
	return
}

/*
Copyright (c) 2012 Elazar Leibovich. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of Elazar Leibovich. nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
