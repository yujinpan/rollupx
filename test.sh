#!/usr/bin/env sh

npm run build
cd test
node ../bin/rollupx.js --outputs=js,styles,types
