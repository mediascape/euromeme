# Euromeme installation instructions

You'll need 1-2 hours and a fast internet connection, plus ~16GB free hard drive space (mostly for the media), and Chrome or firefox.

Once installed, see [RUNNING.md] for multi-device set-up and troubleshooting.

## General installation

These instructions are for Ubuntu (e.g. Raspian) or Mac OS X (for Mac OS X you'll need to use brew instead of apt-get, and you'll need dev tools).

### install node and avahi (just node for Mac OS X)

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

See [RUNNING.md] for multi-device set-up and troubleshooting.

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
This is useful for finding out the ip address

 * https://github.com/notro/fbtft/issues/215#issuecomment-69921933

Useful for non-blanking instructions

 * https://www.danpurdy.co.uk/web-development/raspberry-pi-kiosk-screen-tutorial/

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


