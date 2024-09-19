---
title: OAuth & Modern Authentication
date: 2024-09-20
draft: true
description: &description The inner workings of OAuth and OIDC.
tags: &tags
  - oauth
  - oidc
summary: *description
keywords: *tags
---
## A Short (I Lie) History Lesson

For longer than I've been alive, programmers have been implementing password authentication into their services and applications. Unfortunately, over the years passwords have to proven to be rather insecure and inconvenient;

The title of the most notorious password dump in history likely goes to the RockYou dump of 2009. It contains **14 341 564** unique passwords spread across **32 603 388** accounts, all of which were stored in plain text. That's a staggering **139.92 MB** of just passwords.  
The RockYou dump provided researchers and hackers alike a window into human habits and traits when it comes to crafting a password. The dump is so useful to this day, that Kali Linux (the Linux distribution designed for hacking), ships the dump pre-packaged in the OS.

### Humans

Let's talk about those human habits; One of the most common things we do with passwords is reuse them on different websites (yes it still counts as re-use if you change the number on the end). Jack Rhysider recently published a [new episode of the Darknet Diaries podcast](https://darknetdiaries.com/episode/148/) (highly recommend), in which he talks to someone who was able to steal unreleased music from artists partially because they re-used their passwords on different websites. One company gets hacked, and suddenly the attackers have access to all your accounts, everywhere.

Another poor security tactic of humans is creating passwords that relate to things they're unlikely to forget such as a pet's name or a significant date. I'm looking at you, Mr `fluffy1995`. All it takes is for someone to look at your Instagram (where you undoubtedly worship your pet and have your age in your bio) and then have a few educated guesses at your password.

### Password Storage

Thankfully nowadays, ([most](https://cybernews.com/security/rockyou2024-largest-password-compilation-leak/)) companies aren't storing your passwords in plaintext. The new standards involve salting and hashing your password. What does that look like? Well let's start with a password like `D0YouH4veLigma?`:

1. The first step is to salt the password, ideally pseudo-randomly. This might end up looking like `8D0YhouH54ve5Lig!ma?v`, here we've interspersed some pseudo-random characters (generated with a seed like the user's ID, basically something that we can recreate at every login). This makes sure the password isn't immediately guessable. 

2. The next step is to hash the password, an (ideally) one way transformation to a standard length output. One of the earlier widely used hashing algorithms was MD5, unfortunately it was and is quite easy to break; The likes of SHA-256 have now superseded it. Hashing our salted password with SHA-256 gives us `03e38186e2037be20bffb263869d6332b3aa42b2349d09aff1a5c7ad5af7a3da`. 

Now even if an attacker gets the database, they could likely never figure out what your original password was.

### Brute Force

Rather than getting at a leaked database of passwords, attackers can always still try the front door by guessing your password. This can be done with tools like [Hydra](https://www.kali.org/tools/hydra/). This is where password complexity rules come in. The less complex a password is, the faster someone can iterate through all the possible password combinations and happen across it.

Many companies implement password rules for this reason. The most effective one against brute force attacks is sheer length of password; Something above 12 characters would simply take too long to brute force. One of the least effective rules is forcing users to change their password every X months. I guarantee you 99% of employees are just changing one number in their password every time. This means that if any of those passwords leak, it takes the attacker less than a second to find your current password. Plus, it's generally _really_ annoying. So if you're a system administrator:

![Machine sizing](/img/stop-it.gif)

## Open Authorization (OAuth)

Now that I've called out passwords for being rather terrible, let's look at the main topic of conversation.

I look at OAuth as a method of Single Sign On (SSO). As the name implies, you use a _Single_ method of authentication to access all your services from any of your devices. Fewer passwords, yay!

A great example of OAuth and SSO is Google. Ever noticed how almost every website and app allows you to login using your Google account? That's SSO. Each app accepts your Google account as an account on its system which means you only need to remember the credentials for your Google Account. One password for Google, and that's it.

In a nutshell, OAuth allows computer systems to authorize each other instead of relying on a human entering human passwords to authenticate themselves.

### Definitions

There's a few definitions that will help us understand the rest of this post:

- **Client** - The application that is attempting to get access to the user's account. E.g. YouTube/Spotify/LinkedIn
- **Resource Server** - The API/Server that serves access to a user's information. E.g. Google User Info Endpoint
- **Authorization Server** - This is the IDP that provides the user with an authorization interface. E.g. Google Auth
- **Resource Owner** - The user. E.g. You 😉

### Access Tokens

Access tokens are the bread and butter of OAuth. They are what get given to the client to prove that it is authorized to access something on a resource server.

According to the OAuth spec, access tokens:
- are generated and managed by the authorization server
- must be kept confidential and secure (only seen by the authorization server and the resource server)
- can be any format (as long as they can be stringified)

### Grant Types

Grant Types (also referred to as Flows) are methods by which a client can acquire an access token.

#### Authorization Code + PKCE

#### Client Credentials

#### Device Code

#### Refresh Token

#### Password Grant (Deprecated)

### Full Example

## OpenID Connect (OIDC)

### RSA

Over the years, we've been blessed with algorithms that can provide near-perfect security. The example most people will know is RSA which has been widely used for decades at this point and (at a sufficient key length) is considered perfectly secure today.

RSA is a "public-key cryptosystem"... yeah I don't like Wikipedia drool either. In human terms; RSA utilises 2 keys, a public and private key, to encrypt and decrypt data using some clever one-way mathematics. I say one-way because trying to break the encryption without the other key is effectively impossible, especially at large key lengths.

For example, here's a private key:

```
-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy1tPf9Cnzj4p4WGeKLs1Pt8Qu
KUpRKfFLfRYC9AIKjbJTWit+CqvjWYzvQwECAwEAAQJAIJLixBy2qpFoS4DSmoEm
o3qGy0t6z09AIJtH+5OeRV1be+N4cDYJKffGzDa88vQENZiRm0GRq6a+HPGQMd2k
TQIhAKMSvzIBnni7ot/OSie2TmJLY4SwTQAevXysE2RbFDYdAiEBCUEaRQnMnbp7
9mxDXDf6AU0cN/RPBjb9qSHDcWZHGzUCIG2Es59z8ugGrDY+pxLQnwfotadxd+Uy
v/Ow5T0q5gIJAiEAyS4RaI9YG8EWx/2w0T67ZUVAw8eOMB6BIUg0Xcu+3okCIBOs
/5OiPgoTdSy7bcF9IGpSE8ZgGKzgYQVZeN97YE00
-----END RSA PRIVATE KEY-----
```

and a public key:

```
-----BEGIN RSA PUBLIC KEY-----
MEgCQQCo9+BpMRYQ/dL3DS2CyJxRF+j6ctbT3/Qp84+KeFhnii7NT7fELilKUSnx
S30WAvQCCo2yU1orfgqr41mM70MBAgMBAAE=
-----END RSA PUBLIC KEY-----
```

As the names suggest, you are supposed to keep your private key to yourself, but you would usually share your public key. You can use either key to encrypt data, but they are used for different things.

Let's say I have my private key and I hand my public key to my friend Donald (Duck).

The typical use-case for RSA is for Donald to send me a secure message. To do this, he would write his message and encrypt it with my public key. He would then send this encrypted message to me. Anyone who tries to read it along the way cannot because it is encrypted. I would then use my private key (that I've hopefully not leaked) to decrypt and read Donald's message. 

The other use-case would be if I've sent a message to Donald, and he wants to be sure it came from me. In this scenario, I would encrypt my message with my private key before sending it to him. Donald would be able to decrypt it with my public key only if the message was encrypted with my private key. This implies that the message did indeed, come from me. (Assuming again, that I haven't accidentally leaked my private key)
