#!/bin/bash
set -e
DIST_PACKAGE="./package-dist"

# Look for a semver git tag
GIT_TAG=`git describe --tags --abbrev=0`
if [[ ! $GIT_TAG =~ ^v ]]; then
	echo "Could not read a git semver tag starting with v"
	exit 1
fi
GIT_TAG="${GIT_TAG:1}" # remove the v from a semver tag like v0.1.0

# Delete any existing dist dir
if [ -d "${DIST_PACKAGE}" ]; then
	rm -rf "${DIST_PACKAGE}"
fi
# Create a new dist dir
mkdir "${DIST_PACKAGE}"

# Copy over the source files
cp -r ./package-src/* "${DIST_PACKAGE}/"

# Copy over the static files
mkdir "${DIST_PACKAGE}/static"
cp -r ./fe/dist/* "${DIST_PACKAGE}/static/"

# Copy over the example files
cp -r ./examples/test-probes "${DIST_PACKAGE}/test-probes"

# Write the correct version into the package.json
sed -i -e "s/XXX_VERSION_XXX/${GIT_TAG}/" "${DIST_PACKAGE}/package.json"
if [[ -f "${DIST_PACKAGE}/package.json-e" ]]; then
	rm "${DIST_PACKAGE}/package.json-e"
fi

