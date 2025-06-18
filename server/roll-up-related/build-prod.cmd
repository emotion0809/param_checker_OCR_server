@echo off
call build.cmd
call rollup -c
call uglifyjs bundle.js -o bundle.min.js -m
REM del bundle.js