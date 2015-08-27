#Clips API
A simple API to request and create clips from the Euromeme app.

## Installation
`npm install`

Clipping requires `ffmpeg` and `imagemagick` to be installed on your system.

## Usage
`MEDIA_PATH=<path to media API public directory> npm start`

## Multi-core

The clipping functionality is CPU intensive. To run the api across the full
cores of your CPU, use the cluster command:

`MEDIA_PATH=<path to media API public directory> npm run cluster`
