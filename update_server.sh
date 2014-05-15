#!/bin/bash

PID='ps -e | grep "node" | cut -f 2 -d " "'
sudo kill -KILL PID 
git pull origin master
sudo node index.js