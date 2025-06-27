FROM nginx:alpine
COPY ./dist/petricator/browser/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf