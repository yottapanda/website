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
## A Short (I Promise) History Lesson

For longer than I've been alive, programmers have been implementing password authentication into their services and applications. Unfortunately, over the years passwords have to proven to be rather insecure and inconvenient;

The title of the most notorious password dump in history likely goes to the RockYou dump of 2009. It contains **14 341 564** unique passwords spread across **32 603 388** accounts, all of which were stored in plain text. That's a staggering **139.92MB** of just passwords.  
The RockYou dump provided researchers and hackers alike a window into human habits and traits when it comes to crafting a password. The dump is so useful, even to this day, that the Linux distribution designed for hacking, ships the dump pre-packaged in the OS. It is often used as a source for brute-force attacks


- Modern Passwords
  - Complexity & Human limits
  - Hashing
  - Salting
- Re-use
- Identifiable information like DOB or pet's name
- Incrementing numbers by the year
- Devices have permanent access to an account

## Modern Cryptography

Thanks to significant advances in cryptography since the days of MD5, we now have algorithms that can provide near-perfect security such as RSA, a public-key cryptosystem. 

These public-key cryptosystems allow anonymous message authenticity verification... Or in simpler terms: They allow any party to verify the contents of a message are correct and could only have been sent by the expected entity. 

This is possible due to some clever one-way mathematics, whereby using a secret to sign or encrypt something is computationally easy but reversing that process to determine the original secret is effectively impossible.

The point is that there's no human element to this stuff.

## Open Authorization (OAuth2)

The core idea of OAuth is to reduce the number of passwords we need to use (potentially to zero) by using Single Sign On (SSO) whereby you use a _Single_ method of authentication to access all your services from any of your devices. In a nutshell, OAuth2 uses modern cryptography to grant authorization between different computer systems instead of human passwords.

A great example of OAuth and SSO is Google. Ever noticed how almost every website and app allows you to login using your Google account? That's SSO. Each app accepts your google account as an account on its system which means you only need to remember the credentials for your Google Account.

There's a few definitions that will help us understand the rest of this post:

- **Client** - The application that is attempting to get access to the user's account. E.g. YouTube/Spotify/LinkedIn
- **Resource Server** - The API/Server that serves access to a user's information. E.g. Google User Info Endpoint
- **Authorization Server** - This is the IDP that provides the user with an authorization interface. E.g. Google Auth
- **Resource Owner** - The user.


