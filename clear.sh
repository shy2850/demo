#!/bin/bash

cd ./uploadDir
while (true)
do
    ls -t | awk 'NR>11 {system("rm \"" $0 "\"")}'
    sleep 10
done

