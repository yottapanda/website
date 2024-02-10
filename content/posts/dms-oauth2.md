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
## OAuth2.0

I self-host a multitude of applications, many of which require authentication. This usually entails as many usernames and passwords as there are apps. To solve this problem, I set up most of my applications to use OAuth2.0 for authentication. This means that I have one identity provider (in my case [Authentik](https://goauthentik.io)) that handles logging into all the apps; One password, one 2FA code, and by logging into one app, I'm automatically logged into all of them. Neat, right?

## The Problem

Among the list of apps that I self-host is an email server. 

Yes, it's the most time consuming one of them all but I have learnt a lot by setting it up and it's more free and flexible than most other solutions like Proton (which appears to be a great alternative from what I've heard). 

Anyway, self-hosted email simply never caught up with big tech email in terms of authentication. While the likes of Google and Microsoft moved to XOAuth (a variation of OAuth), they stuck with simple old passwords.

Now this is not a big deal, passwords are secure when done right and they work with everything under the sun. However, when my dad inevitably forgets his password, I have to now change it for him in 2 places, not just one. Still not a big deal you say? I have OCD I don't care, I have to fix it.

Famous last words...

### But What About LDAP?

Docker Mailserver (DMS) already has solid support for LDAP but while LDAP would do the job, I don't really want 2 different auth systems to deal with even if only one acts as a source of truth. Since OAuth2 is the newer protocol, I'm going to stick with that.

Honestly, I'm probably wrong in hindsight, but when I decided to make the pull request, I didn't want to bother learning and using LDAP.
### Dovecot

DMS uses a program called Dovecot as it's Mail Deliver Agent (MDA). It's responsible for receiving email from Mail Transfer Agents (MTAs) like Postfix (that DMS also uses) and putting it in the relevant mailboxes for the users of the server and then serving those mailboxes to users via the IMAP or POP3 protocols.

The core of the problem lies in getting Dovecot to use an OAuth provider for it's "userdb" and "passdb". For our purposes, the userdb is a mechanism to look up a user's/mailbox's existence and ability to log in. Similarly, the passdb is used to check that a user's credentials are valid and are authorized to access the service. This distinction will be important later, I'm not just telling you for fun 😉.

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

This is a standard OAuth flow, and worked quite well apart from 2 rather annoying issues:

1. There is no way to use an email client that doesn't support generic OAuth.

This is because I had disabled all other authentication mechanisms and so a password is simply no longer accepted.

2. Emails sent to a valid user won't arrive unless that user has previously logged into the system.

This is because Dovecot/Postfix, I don't actually know which, has no way of querying users from Authentik via OAuth2 and so only knows of your existence once you log in for the first time. This is obviously a nuisance to put it mildly and something the DMS maintainers weren't quite fond of.

### Trials and Deprecations

In an attempt to solve problem 1, I tried OAuth**1.0**'s _Password Grant_ feature. This allows an authentication client to take a username and password from the user and pass them along to the authentication server to verify. (Un)fortunately this got deprecated quite quickly as, sneaky clients can just steal your credentials and impersonate you.

### Mildly Maiming 2 Birds With 1 Sad Excuse for a Pebble

So problem 2 boils down to the Dovecot userdb (told you it would come back to haunt us). OAuth simply provides no way of querying users which is something we need.

Now there is a way to solve this problem but it's not pretty. It involves the API of whatever OAuth provider you're using, more specifically, using _it_ to query the users instead of the relying on the OAuth2 protocol to have all the answers.