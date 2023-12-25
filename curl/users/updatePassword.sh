#!/bin/sh

ACCESS_TOKEN_DIR="${PWD}/access_token.txt"
ACCESS_TOKEN=`cat ${ACCESS_TOKEN_DIR}`

# make post request and sen user.json
curl -i -X POST http://localhost:3000/update/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  --data-binary "@${PWD}/users/data/newPassword.json" |
    sed -e 's/[{}]/''/g' | 
    awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}'