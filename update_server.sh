#!bin/bash

sudo kill -KILL 'ps -e | grep "node"'
git pull origin master
sudo node index.js