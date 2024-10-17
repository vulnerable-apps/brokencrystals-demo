export DOCKER_DEFAULT_PLATFORM=linux/amd64                                          
docker build -f Dockerfile.keycloak -t insecureapps/brokencrystals-keycloak:latest .

docker build -f Dockerfile.client -t insecureapps/brokencrystals-client:latest .

docker build -f Dockerfile.postgres -t insecureapps/brokencrystals-postgres:latest .

docker push insecureapps/brokencrystals-keycloak:latest
docker push insecureapps/brokencrystals-client:latest
docker push insecureapps/brokencrystals-postgres:latest

docker pull neuralegion/brokencrystals:latest
docker tag neuralegion/brokencrystals:latest insecureapps/brokencrystals-api:latest
docker push insecureapps/brokencrystals-api:latest
