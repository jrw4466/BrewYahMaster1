# https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

cd
# make sure ubuntu is up to date with the code out there on the web
apt-get update
# curl == make an HTTP request. here we download a file
curl -sL https://deb.nodesource.com/setup_6.x -o nodesource_setup.sh
bash nodesource_setup.sh
# fixes a possible error when running nodesource_setup
dpkg --configure -a
# dpkg is another package manage for debian based linux (like ubuntu, kubuntu, etc)
apt-get install nodejs nodejs-legacy npm build-essential -y
cd /src
git clone https://github.com/jrw4466/BrewYahMaster1.git
cd BrewYahMaster1/
npm i # i == install

cd
sudo npm install -g pm2
