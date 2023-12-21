#!/bin/sh

curl -i -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  --data-binary "@/home/gaston/Documents/node/evaluate-me/curl/users/users.json"