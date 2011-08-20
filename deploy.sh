#!/bin/bash
# deploy script for gae

rm -rf war/public/
cp -r public/ war/public/
play gae:deploy
