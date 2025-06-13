---
title: "This Website"
date: 2023-12-22
draft: false
description: &description The evolution of this website and how it's built.
tags: &tags ["website", "docker", "nginx", "hugo"]
summary: *description
keywords: *tags
---
## Introduction

I've had a website for a few years now. The first iteration I made was a simple, one page HTML site with just a few links. That evolved to also show off a few projects of mine before devolving to a SvelteKit backend with just a few links again. This was always deployed as a docker container on my home server (which has amounted to a lot of headaches, but that's for another post).

Recently I decided it was time to actually get some work done, make this blog, revamp the site and build my "personal brand" or whatever you want to call it. This post details just the start of the journey to make this website a fountain of knowledge and something to be proud of.

## Decisions, Decisions

As it turns out, there's a lot of ways to make a website nowadays (I'm not that old I promise). For any interactivity, you probably want to go for one of the major frameworks like React or if you like more niche solutions, Svelte(Kit) might be a good bet. Thankfully for this re-imagining of my website, all I need is a blog and a few links; A static site generator would do nicely, please and thank you.

What's a static site generator (SSG) you ask? Well they're quite neat in my opinion. They allow you to take [markdown documents](https://www.markdownguide.org/getting-started/) which are just glorified text files and auto-magically format them into a webpage. (I say magic when I really just mean applying a predefined style and formatting guide).

There's a few SSGs running the blogging side of the internet at the moment:

- Next.js
- Hugo
- Gatsby
- Jekyll
- MkDocs
- a lot more

Each of the big players has a focus in which they excel, for example Next.js is great at combining the features of an SSG with a full featured framework, React in this case. Whereas something like Jekyll is designed more for static blogs.

Hugo caught my eye with it's build process and structure. It makes it easy to setup and then focus on the content with simple templating and taxonomies (e.g. tags and categories). So that's what I ended up with!

## Theming

Having a look through [some themes](https://themes.gohugo.io/), I decided to first try PaperMod since it:

- Was the first one on the list
- Looked good
- Had a lot of stars on GitHub

Unfortunately this turned out to be a bit of a mistake; The installation, configuration and usage process of PaperMod... Could use some work. I found that the documentation wasn't quite up to scratch and I ended up trawling through examples from other people's blogs to find and change what I needed to. 

At some point in this struggle I decided to give up and try a different theme which is when I came across [Congo](https://jpanther.github.io/congo/). The docs are great, the examples are thorough and the configuration was easy. It even comes with a decent set of color schemes out of the box.

## Building

After making an initial page and running the `hugo server` command on my development machine, I found a great looking blog hosted locally.

The Hugo docs tell us to use the `hugo` command to build our site. This command produces a "public" folder which can be served by any webserver of your choosing (Nginx or Apache spring to mind).

Since we want to deploy this site to a container environment (specifically docker-compose on my home server), we'll need to build a container image. I've always used docker build to accomplish this and so that's what we'll do now. I started out with something like this:

```dockerfile
FROM klakegg/hugo AS build
WORKDIR /build
COPY . .
RUN hugo

FROM nginx:alpine
COPY --from=build /build/public /usr/share/nginx/html/
```

The `klakegg/hugo` build image was one I found after searching around online for something popular, I failed to realize it hadn't been updated in a while. While the `hugo` command worked locally (I use Arch btw), this docker build was not happy:

```log
ERROR 2023/12/22 14:27:49 render of "taxonomy" failed: "/build/themes/congo/layouts/_default/baseof.html:5:12": execute of template failed: template: _default/taxonomy.html:5:12: executing "_default/taxonomy.html" at <site>: can't evaluate field LanguageCode in type *langs.Language
ERROR 2023/12/22 14:27:49 render of "taxonomy" failed: "/build/themes/congo/layouts/_default/baseof.html:5:12": execute of template failed: template: _default/taxonomy.html:5:12: executing "_default/taxonomy.html" at <site>: can't evaluate field LanguageCode in type *langs.Language
Total in 20 ms
Error: Error building site: failed to render pages: render of "home" failed: "/build/themes/congo/layouts/_default/baseof.html:5:12": execute of template failed: template: index.html:5:12: executing "index.html" at <site>: can't evaluate field LanguageCode in type *langs.Language
```

What on earth does all that mean!?

Thankfully we don't have to care too much as we have a scenario where it's building just fine, local. ArchLinux usually has particularly up-to-date packages and that holds true for the hugo package. It turns out that the hugo version built by klakegg a few months ago is already so outdated that the above errors are occurring.

So what's the solution? Build the site on Arch, of course!

```dockerfile
FROM archlinux:latest AS build
RUN pacman -Sy hugo --noconfirm
WORKDIR /build
COPY . .
RUN hugo 

FROM nginx:alpine
COPY --from=build /build/public /usr/share/nginx/html/
```

Now, while this works, this has it's downsides:

#### 1. Downloading the hugo package every build isn't exactly quick, nor efficient.

It would be much better to pre-build the build image and store it separately to use here. This means we only have to fetch the hugo package once in a while rather than every build. The problem with this is that it's another repository to manage, and monitor. For something this simple, it's probably just not worth the hassle. Especially with layer caching, the impact isn't really noticeable for subsequent builds.

#### 2. ArchLinux is rolling release

This means that the hugo package can be updated whenever. This might introduce breaking changes which could cause the site to start failing to build with no warning. Ideally we'd want to pin to a specific version of Hugo, likely running it from source with Go at some commit ref or tag.

## Security

Now that we have the site building and running well, we should consider security. I once had a job interview in which my interviewer had looked up my old website and checked it's security. He showed me a [website](https://securityheaders.com/) that verified the existence and configuration of a few headers that I'd never even heard of before:

- Content-Security-Policy
- Permissions-Policy
- Referrer-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options

As it so happens, these headers are core to modern internet security, providing the ability to prevent various attacks such as Cross Site Scripting or ClickJacking and generally improving the safety of your site for your viewer. As an example, [here's the report for this website](https://securityheaders.com/?q=https%3A%2F%yottapanda.com&followRedirects=on).

To set these up with Nginx, we simply have to add the headers to the configuration file (`/etc/nginx/nginx.conf`) under one of three sections:

1. The `http` section covers the entire Nginx server and all routes it serves.
2. The `server` section covers just that one server.
3. The `location` sections covers just that one path/subdomain.

I decided to put mine in the `http` section since this Nginx instance will only ever serve this one site and I want everything to be covered. Here's what my config file looks like:

```nginx
...

http {
    ...

    add_header Strict-Transport-Security 'max-age=31536000; preload';
    add_header Content-Security-Policy "default-src 'self'; font-src *;img-src * data:; script-src *; style-src * 'unsafe-inline'";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header Referrer-Policy "strict-origin";
    add_header Permissions-Policy "geolocation=(),midi=(),sync-xhr=(),microphone=(),camera=(),magnetometer=(),gyroscope=(),fullscreen=(),payment=()";
    add_header X-Content-Type-Options nosniff;

    server {
        listen       80;
        listen  [::]:80;
        server_name  localhost;

        location / {
            root   /usr/share/nginx/html;
        }
    }
}
```

And setting this up in the Docker image we end up with our Dockerfile as such:

```dockerfile
FROM archlinux:latest AS build
RUN pacman -Sy hugo --noconfirm
WORKDIR /build
COPY . .
RUN hugo 

FROM nginx:alpine
COPY target/etc/nginx/nginx.conf /etc/nginx/nginx.conf # Copy our new config file
COPY --from=build /build/public /usr/share/nginx/html/
```

## Running

By running the following command, we get our website running locally on `localhost` using Docker:

```bash
# Assuming you're in the directory with your Dockerfile
docker build -t my-blog . && docker run --rm -p 80:80 my-blog
```

Now you can [publish that image]() and [deploy it]() anywhere you want, which I do in the linked posts (to be written).
