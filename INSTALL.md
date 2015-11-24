# Euromeme installation instructions

You'll need several hours and a fast internet connection, plus ~16GB free hard drive space, and Chrome or firefox.

## Pi instructions

It may be convenient to put the server on a Raspberry PI 2. If you do this you still need to use a different machine 
for the "TV" window, as the Pi browsers can't handle it.

You'll need a 16G SD card.

### pi preparation

    diskutil list
    diskutil unmountDisk /dev/disk2
    sudo dd bs=1m if=~/Downloads/2015-05-05-raspbian-wheezy.img of=/dev/rdisk2

### sort the pi out

    sudo raspi-config
    sudo reboot
    sudo apt-get update && sudo apt-get upgrade -y

# add the tft screen
# https://github.com/notro/fbtft/issues/215#issuecomment-69921933

# https://www.danpurdy.co.uk/web-development/raspberry-pi-kiosk-screen-tutorial/

    edit /etc/xdg/lxsession/LXDE-pi/autostart

    @xscreensaver -no-splash
    @xset s off
    @xset -dpms
    @xset s noblank

### change its name to "euromeme" by editing

    /etc/hosts
    /etc/hostname

### install wpa supplicant if not already

edit /etc/network/interfaces

    auto lo
    iface lo inet loopback
    
    auto eth0
    allow-hotplug eth0
    iface eth0 inet manual
    
    auto wlan0
    allow-hotplug wlan0
    iface wlan0 inet manual
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
    
    auto wlan1
    allow-hotplug wlan1
    iface wlan1 inet manual
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf


edit /etc/wpa_supplicant/wpa_supplicant.conf

    network={
      ssid="XXX"
      psk="XXX"
    }

### add to /etc/rc.local

if you like: `cd /home/pi/euromeme && /usr/local/bin/foreman start -f Procfile.development 2>&1 > euromeme.log &`

## General installation

These instructions are for Ubuntu (e.g. Raspian) or Mac OS X.

### install node and avahi

    git clone https://github.com/radiodan/provision
    cd provision
    sudo ./provision node avahi

### install prerequisites

    sudo apt-get install libavahi-compat-libdnssd-dev gifsicle golang ruby1.9.1
    sudo gem install foreman --no-ri --no-rdoc

### install euromeme

    cd
    git clone https://github.com/mediascape/euromeme

### switch to release branch

    cd euromeme
    git fetch origin
    git checkout -b user_test_1 origin/user_test_1

### install and build all the node parts

    ./install_node_modules.sh

### compile media server

    cd apps/media-api/server
    go build serve.go

### copy configs, ensuring you replace sync id (the startup script will fix your ip address for you)

    cd
    cp ./apps/euromeme-ui/static/config.json.example ./apps/euromeme-ui/static/config.json
    cp ./apps/tv-ui/static/config.json.example ./apps/tv-ui/static/config.json

replace

    "appId": "1234567890",
    "msvName": "msvname",

with your msv id and name 

# download gifs and video and untar to apps/media-api/server/public

It will look like this:

    ls apps/media-api/server/public/
    180  eurovision-2015.30.180.mp4  eurovision-2015.30.720.mp4

# run everything

    foreman start -f Procfile.development 

# make a note of the wlan ip address of the machine you are running it on

# test

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


# adding devices

ensure the device is on the correct wifi network - it must be the same as the one you are on

put the ip of your device into the settings screen of the "MediaScape" app on the tablets

go back to the main page and reload using the settings menu top right

double-tap to hide the toolbar

## Troubleshooting

### errors like: 15:19:07 euromeme-ui.1 | sh: line 1: 169.254.19.212: command not found

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


### 15:47:24 euromeme-ui.1 | *** WARNING *** The program 'node' uses the Apple Bonjour compatibility layer of Avahi.

don't worry about it


### App on tablet won't connect

- make double sure they're all on the same network
- check that the tablet hasn't dropped the network (this happens occassionally)
- check the network supports mdns and device to device communication
- check the ip address is correct

### App on tablet can't find the "TV"

- it won't find it unless the TV video is actually playing




