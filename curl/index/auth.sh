#!/bin/sh
ACCESS_TOKEN_DIR="${PWD}/access_token.txt"
ACCESS_TOKEN=`cat ${ACCESS_TOKEN_DIR}`

#make post request and sen user.json
curl -i -X GET http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer wdwd${ACCESS_TOKEN}" \
    sed -e 's/[{}]/''/g' | 
    awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}'