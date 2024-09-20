#!/usr/bin/env sh

npm run build
cd test

if [ "$1" = "vue2" ]
then
  npm i --no-save vue@2 rollup-plugin-vue@5
fi;

node ../bin/rollupx.js --outputs=js,styles,types
