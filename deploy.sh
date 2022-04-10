sudo ssh -i ~/projects/aws/ec2-instances-key.pem ubuntu@ec2-3-10-4-9.eu-west-2.compute.amazonaws.com << EOF
cd ~/microlaunch

sudo forever stopall
sudo fuser -k -n tcp 80

eval "$(ssh-agent -s)"
git restore .
git pull origin main


npm install
npm run build


sudo forever start -c "npm start -p 80" .

# for running process on port 80
# sudo chown -R root .

EOF
