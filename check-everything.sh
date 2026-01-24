#!/usr/bin/env bash
deno check --config frontend/deno.json frontend/src
deno check --config backend/deno.json backend/src
deno fmt --config frontend/deno.json frontend/src
deno fmt --config backend/deno.json backend/src
