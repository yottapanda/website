---
title: Introducing FileDepot
date: 2024-06-06
draft: true
description: &description Introducing my side project, a new file sharing and backup system.
tags: &tags 
  - networking
  - storage
  - cloud
  - oauth2
  - opensource
  - docker
summary: *description
keywords: *tags
---

## File What Now?

**FileDepot** is a tool along the lines of Nextcloud or Dropbox, which I alluded to in my [last blog post](./wild-cloud-router.md). I've been working on it since roughly mid-March, and it's coming along well if I do say so myself 🥳.

If we were face-to-face right now, you'd likely be asking me why on earth I'd re-invent the wheel. For that reason, I'll answer it now; FileDepot is designed to be more modern, secure, reliable, integrable, open, and faster than the alternatives.

## File Why Now?

I've been using [Nextcloud](https://github.com/nextcloud) for a few years now and while it "works", it's far from fast, or modern. Unfortunately its worst downfall is reliability. I've had numerous times when an update breaks one feature or another, and the Android app is solely an unfixable, nightmarish torrent of "upload conflict" notifications and [somehow lacks the ability to bidirectionally sync a folder](https://github.com/nextcloud/android/issues/19). And yes, I've spent numerous days trying to solve these problems.

Dropbox/Google Drive/etc. solve a lot of the problems I've seen with Nextcloud, but they're all proprietary, non-self-hostable, and most don't integrate with standards like WebDAV. Plus companies like Google just sell all your data 😇.

In the self-hostable category or under my general requirements, I've been hard-stuck to find anything that's not Nextcloud. Hence, I said "screw it, I'm making my own".

## File How Now?

For now, Filedepot has 2 components itself and relies on a third (any OAuth2 provider with OIDC support). 

### Server

The FileDepot server acts as the central storage location, it serves a WebDAV endpoint and a UI endpoint with further potential protocols in-mind for the future such as SFTP or SSH. All the authentication is currently done with OAuth2/OIDC and hence the server acts as both an OAuth2 Resource Server and Client (the WebDAV and UI endpoints respectively).

It's currently entirely written in Golang, including the UI which is built using [gomponents](https://www.gomponents.com/). I chose Golang for a couple of reasons: I wanted to learn the language, and it is literally built for making APIs from the syntax to the standard library.

I'm contemplating scrapping the UI portion of the server and replacing it with a [Jetpack Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) web build in order to reduce the overhead of 2 separate UI codebases. The server UI is barely an MVP at this point, so I'm perfectly fine with nuking it.

### Android App

I'm making an Android app first because it fits my use case and because, say it with me, ✨ Apple sucks ✨. I'm only half joking, of course; As I alluded to a second ago, I've built the Android app using Jetpack Compose which will allow me (or someone else) to cross-build for Web, Desktop and iOS down the line.

At it's core, the app is simply a WebDAV client. However, its killer feature is the sync system I've designed and begun building into it. The sync system gives the user *ultimate* control over how files are transferred to and from a given device. Want to keep instantly upload any photos you take on your phone but retain the ability to delete them on-device without deleting them from the cloud? DONE. Want to bidirectionally sync your [Obsidian](https://obsidian.md/) vault? DONE. And the bit that makes me the happiest? No more "upload conflict" notifications 🥴, thanks to the conflict resolution rules.

Ideally, I want the app to be compatible with any WebDAV server, not just the FileDepot one. This would allow those who are stuck on Nextcloud, for example, to switch to a superior device client before making the jump on the server side. I'll endeavour to make a migration tool, but that's a long way off at the moment.

### Other Clients

I know I've said it a couple of times but for those who are skimming this; Thanks to Jetpack Compose Multiplatform (JCP) I'll be able to make clients for Android, iOS, Desktop and Web.

The alternatives to JCP this come down to Flutter or a separate codebase for each platform. I initially did start using Flutter but ran into a few issues, namely the lack of solid libraries for WebDAV or OIDC/OAuth2. Also, UI not being my strong suit, I opted for one codebase over multiple.

Now, I'm aware that the conception is that the JVM is particularly slow and bulky compared to compiled languages like Go, Rust, etc. I would have loved to build the entire stack in Golang but alas, the support/community is just not sufficient to build something "real".

If you're yelling "React Native" at me right now, hear this: JavaScript was a mistake. Everything we've built on top of it is like trying to put makeup on a frog. Sure it helps, but you literally could not pay me to kiss it.


