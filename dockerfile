FROM archlinux:latest AS build
RUN pacman -Sy hugo --noconfirm
WORKDIR /build
COPY . .
RUN hugo 

FROM nginx:alpine
COPY target/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /build/public /usr/share/nginx/html/
