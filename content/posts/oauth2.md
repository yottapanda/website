---
title: OAuth2 & Modern Authentication
date: 2024-07-24
draft: true
description: &description The inner workings of OAuth2 and OIDC.
tags: &tags
  - oauth2
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

Another poor security tactic of humans is creating passwords that relate to things they're unlikely to forget such as a pet's name or a significant date. I'm looking at you, Mr `fluffy1995`. All it takes is for someone to look at your Instagram where you undoubtedly worship your pet and have your age in your bio, and then have a few educated guesses at your password.

### Password Storage

Thankfully nowadays, ([most](https://cybernews.com/security/rockyou2024-largest-password-compilation-leak/)) companies aren't storing your passwords in plaintext. The new standards involve salting and hashing your password. What does that look like? Well let's start with a password like `D0YouH4veLigma?`:

1. The first step is to salt the password, ideally pseudo-randomly. This might end up looking like `8D0YhouH54ve5Lig!ma?v`, here we've interspersed some pseudo-random characters (generated with a seed like the user's ID, basically something that we can recreate at every login). This makes sure the password isn't immediately guessable. 

2. The next step is to hash the password, an (ideally) one way transformation to a standard length output. One of the first hashing algorithms was MD5; The likes of SHA-256 superseded it because it was rather easy to break. Hashing our salted password with SHA-256 gives us `03e38186e2037be20bffb263869d6332b3aa42b2349d09aff1a5c7ad5af7a3da`. 

Now even if an attacker gets the database, they could likely never figure out what your original password was.

### Brute Force

Rather than getting at a leaked database of passwords, attackers can always still try the front door by guessing your password. This can be done with tools like [Hydra](https://www.kali.org/tools/hydra/). This is where password complexity rules come in. The less complex a password is, the faster someone can iterate through all the possible password combinations and happen across it.

Many companies implement password rules for this reason. The most effective one against brute force attacks is sheer length of password; Something above 12 characters would simply take too long to brute force. One of the least effective rules is forcing users to change their password every X months. I guarantee you 99% of employees are just changing one number in their password every time. This means that if any of those passwords leak, it takes the attacker less than a second to find your current password. Plus, it's generally _really_ annoying. So if you're a system administrator:

![Machine sizing](/img/stop-it.gif)

## Modern Cryptography

Thanks to significant advances in cryptography since the days of MD5, we now have algorithms that can provide near-perfect security such as RSA, a public-key cryptosystem. 

These public-key cryptosystems allow anonymous message authenticity verification... Or in simpler terms: They allow any party to verify the contents of a message are correct and could only have been sent by the expected entity. 

This is possible due to some clever one-way mathematics, whereby using a secret to sign or encrypt something is computationally easy but reversing that process to determine the original secret is effectively impossible.

The point is that there's no human element to this stuff.

## Open Authorization (OAuth2)

The core idea of OAuth is to reduce the number of passwords we need to use (potentially to zero) by using Single Sign On (SSO) whereby you use a _Single_ method of authentication to access all your services from any of your devices. In a nutshell, OAuth2 uses modern cryptography to grant authorization between different computer systems instead of human passwords.

A great example of OAuth and SSO is Google. Ever noticed how almost every website and app allows you to login using your Google account? That's SSO. Each app accepts your Google account as an account on its system which means you only need to remember the credentials for your Google Account.

There's a few definitions that will help us understand the rest of this post:

- **Client** - The application that is attempting to get access to the user's account. E.g. YouTube/Spotify/LinkedIn
- **Resource Server** - The API/Server that serves access to a user's information. E.g. Google User Info Endpoint
- **Authorization Server** - This is the IDP that provides the user with an authorization interface. E.g. Google Auth
- **Resource Owner** - The user. E.g. You 😉


