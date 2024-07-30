#!/bin/bash
#export XDG_RUNTIME_DIR=/tmp/runtime-dir
#mkdir -p $XDG_RUNTIME_DIR
#chmod 700 $XDG_RUNTIME_DIR
service dbus start
python3 main.py