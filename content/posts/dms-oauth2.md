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

Among the list of apps that I self-host is an email server. 

Yes, it's the most time consuming one of them all but I have learnt a lot by setting it up and it's more free and flexible than most other solutions (for my situation). 

Anyway, self-hosted email simply never caught up with big tech email in terms of authentication. While the likes of Google and Microsoft moved to XOAuth (a variation of OAuth), they stuck with simple old passwords.

Now this is not a big deal, passwords are secure when done right and they work with everything under the sun. However, when my dad inevitably forgets his password, I have to now change it for him in 2 places, not just one. Still not a big deal you say? I have OCD I don't care, I have to fix it.

## But What About LDAP?

While LDAP would do the job, it's 

There's 2 ways of setting up LDAP and OAuth2 together:

- Use LDAP as the source of truth and the main authentication provider. Tack on an OAuth2 frontend and pray.
- Use an OAuth2 provider as the source of truth, tacking on an LDAP adapter of some sort.

Authentik can work in either scenario but not well (not the fault of Authentik's creator). OAuth2 is more of an authorization provider rather than an authentication provider. Yeah, I barely understand the difference myself... ChatGPT to the rescue!

> Authentication in LDAP involves verifying the identity of a user, typically through a username and password, ensuring they are who they claim to be. Authorization in OAuth2, on the other hand, deals with granting access to specific resources or functionalities based on the permissions associated with a user's OAuth token, allowing them to perform certain actions within a system or application.

"I'll just implement it for Docker Mailserver myself!" I said. "How hard can it be?"

Famous last words...

## Context

### Dovecot

The core of the solution lies in getting Dovecot (the Mail Deliver Agent) to use an OAuth provider for it's "userdb" and "passdb". For our purposes, the userdb is a mechanism to look up a user's/mailbox's existence and ability to log in. Similarly, the passdb is used to check that a user's credentials are valid and are authorized to access the service.

## The Solution

If you want a less coherent view of what went down, here's the [GitHub PR](https://github.com/docker-mailserver/docker-mailserver/pull/3480). Otherwise, enjoy the ride...

### Initial Implementation

So I started the PR quite strong, utilizing the knowledge of those before me who commented on the [original issue](https://github.com/docker-mailserver/docker-mailserver/issues/2713). I setup DMS, Roundcube and Authentik like this:

{{< mermaid >}}
sequenceDiagram
actor User
User ->> Roundcube: Request login 
Roundcube ->> User: Redirect user
User ->> Authentik: Log in
Authentik ->> Roundcube: Return token
Roundcube ->> Dovecot: Login with token
Dovecot ->> Authentik: Validate Token
Authentik ->> Dovecot: Respond with user info
Dovecot ->> Roundcube: Respond with mailbox
Roundcube ->> User: Display mailbox
{{< /mermaid >}}

Hopefully that diagram makes sense because that's the best I've got!

### Trials and Deprecations

My initial idea involved using OAuth**1.0**'s _Password Grant_ feature. This allows an authentication client to take a username and password from the user and pass them along to the authentication server to verify. Unfortunately this got deprecated quite quickly as, as you can imagine, sneaky clients can just steal your credentials and impersonate you.

With that idea out the window, I trawled docs and other sources in search of an alternative way to let dovecot utilize 

