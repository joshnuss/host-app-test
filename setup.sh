#!/bin/bash
set -x
clickhouse-client -d hosting --multiquery < setup.sql
