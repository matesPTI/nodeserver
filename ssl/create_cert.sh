#!/bin/bash

USAGE="USAGE: create_cert.sh name"

if [ $# -ne 1 ]; then
	echo $USAGE
else
	openssl genrsa -out $1key.pem 1024
	openssl req -new -key $1key.pem -out $1req.csr
	openssl x509 -req -days 365 -in $1req.csr -out $1cert.pem -signkey $1key.pem
fi