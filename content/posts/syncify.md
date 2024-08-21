---
title: "Side Quest: Syncify"
date: 2024-06-21
draft: false
description: &description Making a tool that finally lets you share your Liked Songs.
tags: &tags
  - docker
  - spotify
  - golang
  - opensource
summary: *description
keywords: *tags
---
## All I Want To Do Is Share My Songs

I have a friend who's musical taste is a real mixed-bag. He's simultaneously stuck in the 2000s pop era and somehow also has an absolute blast listening to _my_ music. On numerous occasions he has asked me to share my playlist with him, but alas I've had to remind him each time that it's impossible.

Are you trying to share your "Liked Songs" now? Don't worry, I'll explain what's going on.

Your "Liked Songs" may appear like they're in a regular Spotify playlist, but as it turns out, it's completely faked. Spotify managed to create a whole different concept with half the features of a regular playlist. You can't share, or start a Jam using your Liked Songs "playlist" 🙄.

My friend isn't an isolated instance, many people I know have also tried sharing their Liked Songs in vain. One resorted to manually adding all their liked songs to a separate playlist and never using the "Like" button again...

## I'm a Programmer... I Can Fix This

Last weekend, I had a stroke of determination and slapped together a solution using the Spotify API. All it does is copy your Liked Songs to a new, regular playlist that you can actually share. After a brief foray with the name "Spotisync", I realised that Spotify doesn't like tools that start with "Spot" 🙄😂 and dubbed mine **Syncify**.

If I did my job right, you're wondering what my music taste is... And thanks to my tool, you can now see for yourself!

<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/57K0rskLJ3VKuVHJK1hXlQ?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

And no, I didn't copy them all manually, there's over 1000 songs in that playlist. You think I have the time for that crap? That's why I'm a programmer! 😎

## How I Built It

I chose a relatively simple tech stack for a relatively simple project:

- Golang (with Chi & Gomponents)
- HTMX
- Tailwind

These tools don't have any fluff. They are there to get the job done and nothing more. No fancy crap, just simple and to the point. Minimal abstraction to provide the most efficient developer experience while maintaining safety and maintainability.

I started by setting up authentication via Spotify. This was a breeze thanks to my OAuth2 experience, so much so that I did it manually. I didn't even realise that the Spotify library I intended to use had authentication abstracted away for me already 🥴. I left it using my manual method in the end, it works, doesn't it!

The next step was to get the songs syncing. This involved a lot of playing around with the Spotify API (which happens to be particularly well documented 👏). After a few hours, I had a rather janky system working. The process ended up as follows:

1. Create or find an existing Syncify playlist
2. Truncate the playlist (songs get duplicated otherwise)
3. Read the user's Liked Songs
4. Write them into the empty playlist

Lastly came polishing. I went to [v0.dev](https://v0.dev) and generated a simple but well styled ui (which I converted to Gomponents), setup some feedback with HTMX and set it up to build to a Docker container.

## Links

For those who want to see all the nitty-gritty details, the source code is freely available [here](https://github.com/thechubbypanda/syncify).

Unfortunately as of writing this post, Spotify has not gotten around to approving the tool for public use. When the time comes though, it's hosted and ready to go: [Syncify](https://syncify.thechubbypanda.dev).

If you really want to use the tool now:

- You can follow the instructions on the GitHub page to host it yourself.
- Or you can get in touch with me and I can add you to the testers list.

**UPDATE**: It has been approved! [syncify.thechubbypanda.dev](https://syncify.thechubbypanda.dev)

## Conclusion

I doubt it would take Spotify long to fix this themselves, but they're not doing it so...

Hopefully this helps you music lovers out there. Enjoy 🫡.
