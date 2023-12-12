FROM archlinux:latest AS build
RUN pacman -Sy hugo --noconfirm
WORKDIR /build
COPY . .
RUN hugo 

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /build/public .
EXPOSE 80/tcp
