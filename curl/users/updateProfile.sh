#!/bin/sh

ACCESS_TOKEN_DIR="${PWD}/curl/access_token.txt"
ACCESS_TOKEN=`cat ${ACCESS_TOKEN_DIR}`

# make post request and sen user.json
curl -i -X POST http://localhost:3000/user/update/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  --data-binary "@${PWD}/curl/users/data/newUser.json" |
    sed -e 's/[{}]/''/g' | 
    awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}'