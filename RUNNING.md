# Running EuroMeme

Once you have everything installed - see (INSTALL.md), you need to

  * Ensure all devices are on the same wifi network 
  * Start the servers
  * Make a note of the wlan ip address of the machine you are running it on
  * Test
  * Configure the app on the tablet
  * Plug the computer into an HDMI monitor or TV 

## Ensure all devices are on the same wifi network

The network needs to be one that allows UDP packets otherwise the prototype won't work (because of mDNS).

## Start the servers

    foreman start -f Procfile.development 

## Make a note of the wlan ip address of the machine you are running it on

You'll need this to configure the tablets

## Test

put http://your-ip:5200 full screen e.g. in chrome or firefox

the video should start to play

try http://your-ip:5000 in another browser window

you should be able to
 - see devices to connect to
 - connect to "living room tv"
 - see a synced video in bottom right corner (takes a few seconds, might be jumpy), and blank spaces for the rest
 - click on the live tab
 - use the edit screen to scrub and make a clip
 - clip should appear top left after a few seconds
 - click on the clip to see the share options [share buttons do not work!]

## Configure the app on the tablet

  * Ensure the device is on the correct wifi network - it must be the same as the one you are on
  * Open the "MediaScape Discovery app"
  * Double tap to shpw the toolbar
  * Click on settings
  * Add the full ip address into the top field, including http and the port, so it will look like: http://your-ip:5000
  * Click on teh back arror to go back to the main page and reload using the settings menu top right
  * Double-tap to hide the toolbar

## Plug the computer into an HDMI monitor or TV

The idea is that the TV will look as if it's playing the EuroVision programme. 
You should have sound.

# Troubleshooting

## errors like: 15:19:07 euromeme-ui.1 | sh: line 1: 169.254.19.212: command not found

The config file has been accidentally written over after a crash

    ./apps/euromeme-ui/static/config.json

    {
      "clipsApiEndpoint": "http://192.168.1.10:5001",
      "mediaStoreUrlTemplate": "http://192.168.1.10:17901/$mediaPath?k=12345",
      "frameStoreTemplate": "http://192.168.1.10:17901/$size/$year/$month/$date/$hour/$min/$sec/$frame.gif?k=12345",
      "discoveryIp": "192.168.1.10",
      "discoveryPort": "5000"
    }

    ./apps/tv-ui/static/config.json                                                    

    {
     "relayURI": "ws://192.168.1.10:5100/relay",
     "appId": "1234567890",
     "msvName": "msvname",
     "videoUrl": "http://192.168.1.10:17901/eurovision-2015.30.$size.mp4?k=12345",
     "broadcastStartDate": "2015-05-23T20:00:00Z"
    }


## 15:47:24 euromeme-ui.1 | *** WARNING *** The program 'node' uses the Apple Bonjour compatibility layer of Avahi.

Don't worry about it

## App on tablet won't connect

  - make double sure they're all on the same network
  - check that the tablet hasn't dropped the network (this happens occassionally)
  - check the network supports mdns and device to device communication
  - check the ip address is correct and that the port and "http" are included

## App on tablet can't find the "TV"

  - it won't find it unless the TV video is actually playing

