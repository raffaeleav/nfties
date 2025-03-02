# brew install mkcert

mkcert --install

mkcert ipfs_node.com "*.ipfs_node.com" ipfs_node.test localhost 127.0.0.1 ::1 -cert-file ../certificates/ipfs_node.com+5.pem -key-file ../certificates/ipfs_node.com+5-key.pem