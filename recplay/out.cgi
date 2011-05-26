#!/bin/sh
echo Content-type: text/javascript
echo Content-encoding: gzip
echo
exec gzip -9c <out
