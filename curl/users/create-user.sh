#!/bin/sh

# make post request and sen user.json
curl -i -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  --data-binary "@${PWD}/users/user.json" |
    sed -e 's/[{}]/''/g' | 
    awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}'