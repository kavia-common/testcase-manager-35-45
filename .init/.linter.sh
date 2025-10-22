#!/bin/bash
cd /home/kavia/workspace/code-generation/testcase-manager-35-45/robot_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

