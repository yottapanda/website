---
title: OAuth2 for Docker Mailserver
date: 2024-01-28
draft: true
description: My first major open source contribution to docker-mailserver involving OAuth2.
tags:
  - email
  - oauth2
  - opensource
summary: My first major open source contribution to docker-mailserver involving OAuth2.
keywords:
  - email
  - oauth2
  - opensource
---
## Introduction to OAuth2.0

I self-host a multitude of applications, many of which require authentication. This usually entails as many usernames and passwords as there are apps. To solve this problem, I set up most of my applications to use OAuth2.0 for authentication. This means that I have one identity provider (in my case [Authentik](https://goauthentik.io)) that handles logging into all the apps; One password, one 2FA code, and by logging into one app, I'm automatically logged into all of them. Neat, right?

## The Problem

Among the list of apps that I self-host is a mailserver. 

Yes, it's the most time consuming one of them all but I have learnt a lot by setting it up and it's more free and flexible than most other solutions. 

Anyway, self-hosted email simply never caught up with big tech email in terms of authentication. While the likes of Google and Microsoft moved to XOAuth (a variation of OAuth), they stuck with simple old passwords.

Now this is not a big deal, passwords are secure when done right and they work with everything under the sun. However, when my dad inevitably forgets his password, I have to now change it for him in 2 places, not just one. Still not a big deal you say? I have OCD I don't care, I have to fix it.

But wait! Doesn't Docker Mailserver (DMS) have LDAP support?

Well yes, my dear reader, it does... While LDAP would do the job, it's something that just doesn't fit well into a more modern stack. 

There's 2 ways of having both LDAP and OAuth2:

- Use LDAP as the source of truth and the main authentication provider. Tack on an OAuth2 frontend and pray.
- Use an OAuth2 provider as the source of truth, tacking on an LDAP adapter of some sort.

Authentik can work in either scenario but not well (not the fault of Authentik's creator). OAuth2.0 is simply a much more lightweight specification, lacking things like user queries (foreshadowing) and 

## The Solution

"I'll just implement it for Docker Mailserver myself!" I said. "How hard can it be?"

Famous last words...

If you want to skip the shenanigans, here's the [GitHub PR](https://github.com/docker-mailserver/docker-mailserver/pull/3480).



