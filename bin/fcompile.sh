#!/bin/sh
DIR="$(pwd)"
echo "Current directory: $DIR"

cd "$(dirname "$0")"
npm run compile:dev -- $@

