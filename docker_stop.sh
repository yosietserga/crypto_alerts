ids=$(docker ps -a -q)
for id in $ids
do
 echo "$id"
 docker stop $id && docker rm $id
done
#docker build
docker build --pull --rm -f "Dockerfile" -t cryptoalerts:latest "." 
#docker run
docker run -d -p 3000:3000 cryptoalerts