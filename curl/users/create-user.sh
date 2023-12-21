#!/bin/sh

# make post request and sen user.json
curl -i -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  --data-binary "@${PWD}/users/user.json"