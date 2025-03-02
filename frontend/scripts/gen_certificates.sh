# brew install mkcert

mkcert --install

mkcert nfties.com "*.nfties.com" nfties.test localhost 127.0.0.1 ::1 -cert-file ../certificates/nfties.com+5.pem -key-file ../certificates/nfties.com+5-key.pem