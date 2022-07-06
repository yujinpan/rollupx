#!/usr/bin/env sh

cd test
node ../bin/rollupx.js --outputs=js,styles,types,docs
