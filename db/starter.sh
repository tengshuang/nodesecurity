
mkdir ~/data
mkdir ~/data/db
pushd ~
mongod --dbpath="data/db"
popd 
