#!/bin/sh

# make post request and sen user.json
curl -i -X POST http://localhost:3000/user/reset/password/3f207c5329fbfc3621bac9242215ff47c2c9b00ba4c718a2773ca707fcaf0353 \
  -H "Content-Type: application/json" \
  --data-binary "@${PWD}/users/data/user.json" |
    sed -e 's/[{}]/''/g' | 
    awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}'