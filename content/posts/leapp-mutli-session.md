---
title: "AWS Native Multi-Session for Leapp"
date: 2026-06-15
draft: false
description: &description Updating Leapp by Noovolari to work with AWS console's native multi-session
tags: &tags
  - cloud
  - aws
  - leapp
  - open-source
summary: *description
keywords: *tags
---
## What is [Leapp](https://leapp.cloud/)?

Leapp is an open-source desktop app that allows you to manage multiple AWS accounts and sessions from a single interface; it makes it easy to switch between accounts. Ideal for people like me who work at an AWS partner and have three client projects going at the same time!

![demo video](https://github.com/keval6b/leapp/raw/master/.github/images/Leapp-animation.gif)

## What's Wrong With It?

Unfortunately Leapp official support ended a good while ago, long before AWS updated the console to support multi-session. As I alluded to, I still need to handle multiple accounts. Leapp is still brilliant for its ability to manage local credentials and quickly open new console sessions for SSO accounts. However, installing and using the browser extension has always been clunky and annoying.

## What's New?

Leapp will now ask AWS to either open an existing session or create a new one (in one of five slots available).

The four major changes required were:
- Remove the websocket that the browser extension calls back to
- Remove the browser extension-related branches and such
- Update the URLs that Leapp opens in your browser to create a new session
- Add a new multi-session hint to let users know how it works

All in all, not a massive change, especially with some help from my pal Claude ;)

I've [forked the repo](https://github.com/keval6b/leapp) and set up a simple pipeline to build the binaries for you to download and use. In the event the Leapp team comes back to life, I've [left a PR](https://github.com/Noovolari/leapp/pull/618) to upstream my work.

## How Can I Get It?

To install my version of Leapp, you can download the binaries from the [GitHub releases page](https://github.com/keval6b/leapp/releases). Just grab the appropriate file for your operating system and run it. For Mac users, there's some magic you need to do to get your device to trust the binary, it's detailed in the [README.md](https://github.com/keval6b/leapp/blob/master/README.md#macos--damaged-and-cant-be-opened).

## Can I Contribute My Fixes/Improvements?

Yep, I'll merge them! Open a PR, and I'll review it as soon as I can :)

## Happy AWSing

If this is helpful to you as well, please let me know! I'm always after validation ;)
