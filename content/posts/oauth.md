---
title: OAuth & Modern Authentication
date: 2025-02-14
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

Let's talk about those human habits; One of the most common things we do with passwords is reuse them on different websites (yes it still counts as re-use if you change the number on the end). Jack Rhysider published an  [episode of the Darknet Diaries podcast](https://darknetdiaries.com/episode/148/) (highly recommend), in which he talks to someone who was able to steal unreleased music from artists partially because they re-used their passwords on different websites. One company gets hacked, and suddenly the attackers have access to all your accounts, everywhere.

Another poor security tactic of humans is creating passwords that relate to things they're unlikely to forget such as a pet's name or a significant date. I'm looking at you, Mr `fluffy1995`. All it takes is for someone to look at your Instagram (where you undoubtedly worship your pet and have your age in your bio) and then have a few educated guesses at your password.

### Password Storage

Thankfully nowadays, ([most](https://cybernews.com/security/rockyou2024-largest-password-compilation-leak/)) companies aren't storing your passwords in plaintext. The new standards involve salting and hashing your password. What does that look like? Well let's start with a password like `D0YouH4veLigma?`:

1. The first step is to salt the password, ideally pseudo-randomly. This might end up looking like `8D0YhouH54ve5Lig!ma?v`, here we've interspersed some pseudo-random characters (generated with a seed like the user's ID, basically something that we can recreate at every login). This makes sure the password isn't immediately guessable. 

2. The next step is to hash the password, an (ideally) one way transformation to a standard length output. One of the earlier widely used hashing algorithms was MD5, unfortunately it was and is quite easy to break; The likes of SHA-256 have now superseded it. Hashing our salted password with SHA-256 gives us `03e38186e2037be20bffb263869d6332b3aa42b2349d09aff1a5c7ad5af7a3da`. 

Now even if an attacker gets the database, they could likely never figure out what your original password was.

While I've just explained how this works in principle, the method above still isn't secure. Don't roll this stuff yourself; just use something like bcrypt or argon2id.

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

The authorization code flow invloves a temporary credential (code 🤯) issued by the authorization server to a client application after a user successfully authenticates and grants consent. It serves as an intermediate step before obtaining an access token.

{{< mermaid >}}
sequenceDiagram
    participant User
    participant Client
    participant Authorization Server
    participant Resource Server

    User->>Client: Initiates Authorization Request
    Note over Client: Generate Code Verifier, Code Challenge & State
    Client->>Authorization Server: Authorization Request (with Code Challenge & State)
    Authorization Server->>User: Request User Approval
    User->>Authorization Server: Approves Request
    Authorization Server->>Client: Authorization Code (includes State)

    Note over Client: Verify State, Exchange Code for Token (with Code Verifier)
    Client->>Authorization Server: Token Request (with Code Verifier)
    Authorization Server->>Client: Access Token

    Note over Client: Access Protected Resource
    Client->>Resource Server: Request Resource (with Access Token)
    Resource Server->>Client: Protected Resource
{{< /mermaid >}}

As of OAuth 2.1, PKCE is a required component of an Authorization Code flow, hence we're not going to talk about them separately. Just know that you will probably find auth code flows without code challenges/verifiers in the wild. Without PKCE, a client secret is always required.

#### Client Credentials

This flow is more for machine-to-machine communication; often replacing something simple like a periodic data fetch from an API.

{{< mermaid >}}
sequenceDiagram
    participant Client as Client
    participant AuthServer as Authorization Server
    participant ResourceServer as Resource Server

    Client->>AuthServer: Request access token (with client id and secret)
    Note over AuthServer: Validate client credentials
    AuthServer->>Client: Return access token
    Client->>ResourceServer: API Request with Access Token
    Note over  ResourceServer: Validate access token
    ResourceServer->>Client: Return resource data
{{< /mermaid >}}

This might look like basic auth with extra steps but it does actually provide some benefits if your use-case warrants the complexity overhead:

- Granular access control via scopes
- Short-lived credentials with (almost) built-in rotation
- Better integration with things JWTs for stateless auth

#### Device Code

This flow is used by devices or applications with limited input capabilities like IoT devices. It allows users to authenticate and authorize the application on a secondary device, typically a mobile phone or desktop computer, by using a unique code displayed on the device.

{{< mermaid >}}
sequenceDiagram
    participant Client as Device
    participant User
    participant AuthorizationServer
    participant ResourceServer
    
    Client->>AuthorizationServer: Request device code and user code
    AuthorizationServer->>Client: Return device code and user code
    Client->>User: Display user code and URL
    User->>UserDevice: Open URL and enter user code
    UserDevice->>AuthorizationServer: User enters credentials and authorizes
    AuthorizationServer->>UserDevice: User authenticated and authorized
    Client->>AuthorizationServer: Polling for access token
    AuthorizationServer->>Client: Access token granted
    Client->>ResourceServer: Access resources with token
    ResourceServer->>Client: Return requested resources
{{< /mermaid >}}

I actually think this might be a good way to handle mobile app authentication instead of using weird webview integrations but I have yet to prove out my theory. Reach out if you know how it should work.

#### Refresh Token

Remember how we've said so far that access tokens are short lived? Well I think we can both agree that needing to log into your authentication provider every 5 minutes would be a terrible user experience.

Thankfully this is solved using refresh tokens. When performing an auth code flow, the authorization server can optionally also return a **refresh token**.

Using the refresh token, you can (only) perform a refresh token flow to get a new access token to replace an expired one; all without any user interaction.

{{< mermaid >}}
sequenceDiagram
    participant U as User
    participant C as Client
    participant AS as Authorization Server
    participant RS as Resource Server

    Note over C: Access token expires
    U->>C: Initiate request for data
    C->>AS: Send refresh token
    Note over AS: Validate refresh token
    AS->>C: Issue new access token (and potentially new refresh token)
    C->>RS: API request with new access token
    Note over RS: Validate access token
    RS->>C: API response
    C->>U: Display response for user
{{< /mermaid >}}

Notice how the user doesn't have to interact with the Authorization server this time! Very slick 😉.

#### Password Grant (Deprecated)

This **deprecated** flow essentially just gets the client to pass the user's username and password to the authorization server to get an access token.

This was deprecated because, as you can imagine, it's not the best idea to let the client handle the users actual credentials in case it is malicious.

Do not use this flow if you can help it. I've really wanted to in the past for things like [my work on implementing OAuth](./dms-oauth2.md/#trials-and-deprecations) for [Docker Mailserver](https://github.com/docker-mailserver/docker-mailserver) but it's just not the way.

## OpenID Connect (OIDC)

GPT:
OpenID Connect (OIDC) extends OAuth 2.0 by adding authentication capabilities to the protocol. While OAuth 2.0 focuses on authorization (granting access to resources), OIDC adds a layer on top of OAuth to provide identity verification, allowing clients to authenticate users.

Here's what OIDC brings to OAuth 2.0:

Authentication: OAuth 2.0 alone only allows for authorization (permissions to access resources), but OIDC provides a standardized way for clients to authenticate users (i.e., to verify their identity).

ID Token: OIDC introduces the ID Token, a JWT (JSON Web Token) that contains information about the authenticated user. This token is issued alongside the access token in OAuth 2.0 flows, and it allows the client to get the user's identity details (like their name, email, etc.).

UserInfo Endpoint: OIDC specifies a UserInfo Endpoint that provides additional details about the authenticated user, allowing the client to retrieve more information, such as profile data, beyond what's in the ID token.

Standard Scopes: OIDC introduces a new scope, openid, which signals to the authorization server that the client wants to authenticate the user and receive an ID token. Other standard OIDC scopes (like profile, email, address) let the client request specific user details.

Discovery and Dynamic Registration: OIDC introduces mechanisms for clients to discover information about the identity provider, like authorization endpoints and supported features, through a discovery document (found at .well-known/openid-configuration). This makes integration easier by reducing manual configuration.

Standardized Protocol: While OAuth 2.0 can be used for both authorization and authentication, OIDC standardizes how authentication should be implemented, which helps avoid confusion and inconsistency across implementations.

In essence, OIDC enhances OAuth 2.0 by enabling both authorization (what OAuth does) and authentication (what OIDC adds), providing a complete solution for managing both identity and access control.

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
