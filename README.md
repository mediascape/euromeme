
# euromeme
Prototype from BBC to clip and share favourite Eurovision moments. Using a second screen application synced with the TV to make selecting and sharing Vine-like clips and images easier.

# running
`foreman start -f Procfile.development` starts everything, replacing the IP address in the config file with the urrent one.
a sample rc.local file might contain `cd /home/pi/euromeme && /usr/local/bin/foreman start -f Procfile.development 2>&1 > euromeme.log &`


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

The TV UI requires several configuration settings to be defined. Copy the file `static/config.json.example` as `static/config.json` and replace each value in the file as appropriate
for your local setup:

* `appId`: The application ID for the MediaScape shared motion sync server
* `msvName`: The name of the MediaScape shared motion sync object to use
* `videoUrl`: The URL of the video to play on the TV

The assets are precompiled from `src` into `static` by running `npm run build`. The precompiled assets should be committed to the repository.

# License

Except as noted below, this software is released under the Apache 2.0 License. See LICENSE for details.

The mediasync.js library is used under the LGPL license. See lgpl-3.0.txt for details.

## Copyright

Copyright 2015 British Broadcasting Corporation

The mediasync.js library is Copyright 2015 Motion Corporation

