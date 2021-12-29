#!/usr/bin/env node

cd test
node ../bin/rollupx.js --outputs=js,styles,types,docs --input-files=**/*
