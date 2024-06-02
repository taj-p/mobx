#!/bin/bash

mv ./dist/mobx.esm.production.min.js ./dist/mobx.esm.production.min.mjs

time node --expose-gc ./__tests__/perf/index.mjs $1

mv ./dist/mobx.esm.production.min.mjs ./dist/mobx.esm.production.min.js
