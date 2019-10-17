#!/bin/bash

# Changes the runner's page formula 
# usage: ./scripts/change-formula.sh {formula-name}

curl http://127.0.0.1:9190/__wel_control -X PUT --data "{\"current-formula\":\"$1\"}"
