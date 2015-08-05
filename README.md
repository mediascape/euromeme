
# euromeme
Prototype from BBC to clip and share favourite Eurovision moments. Using a second screen application synced with the TV to make selecting and sharing Vine-like clips and images easier.

## Structure

This repo contains the Euromeme applications. Each sub-application is contained in its own subdirectory. Applications that require packages from npm will contain their own `package.json` file. You should run `npm install` in each subdirectory.

## euromeme-ui

Static assets for the Euromeme mobile web app.

Copy the file `static/config.json.example` as `static/config.json` and enter locations of media.

The assets are precompiled from `src` into `static` by running `npm run build`. The precompiled assets should be committed to the repository.

## media-api

A set of scripts that provide HTTP access to Euromeme streaming media.

## tv-bridge

A node.js application that:
- advertises the TV over DNS-SD/mDNS
- provides a WebSocket relay for local and remote web apps

## tv-ui

Static assets for the TV UI.
