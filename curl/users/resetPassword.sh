#!/bin/sh

# make post request and sen user.json
curl -i -X POST http://localhost:3000/user/reset/password/461574466237d1a52a7c216c1f35b6ecab65e76bf0824afb390b46e3187567e0 \
  -H "Content-Type: application/json" \
  --data-binary "@${PWD}/users/data/user.json" |
    sed -e 's/[{}]/''/g' | 
    awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}'