---
title: Recursive Wireguard
date: 2024-07-09
draft: true
description: &description VPNs inside VPNs inside VPNs inside VPNs.
tags: &tags 
  - networking
  - cgnat
  - vpn
  - cloud
summary: *description
keywords: *tags
---
## What In The Seven Hells...?

No, I haven't finally lost my marbles.  
\*_shakes head vigorously_\*  
Yep, still there.

Remember how [I said](cloud-router#linodes-extra-features) that you could probably link up a [Cloud Gateway](cloud-router) with your home router instead of straight to your server? Well, I finally racked up enough reasons to give the whole house a publicly routable IPv4 address instead of just my server. 

1. My brother wanted to host a Minecraft server on his laptop 🙄.
2. I need to re-setup a VPN to my internal network so my dad and I can reach our smart devices from the outside without exposing them publicly. This one pertains specifically to the title of this post 😉.
3. It's cooler to say "I gave my house another WAN address" than "I routed traffic to my server".

## Why Didn't You Just Use Tailscale?

I like [Tailscale](https://tailscale.com/) a lot. However, it limits the number of free users you can have. I.e. people with separate logins.

Everyone that should have access to the VPN is already set up on an IDP and unless I pay the big bucks ($6/user/month at time of writing), I can't connect them up. Plus it's not self-hosted, which goes against the whole ethos with which I build all this cool stuff.

I like [Headscale](https://headscale.net/) even more, which is self-hosted, and would likely be a great option. The only reason I didn't opt for it is that hindsight is 20-20 😂. Plus I would still have wanted to host it locally which is basically the same as what I've ended up with anyway, just without some bells and whistles. I might swap to Headscale in the future, we'll see.

## What Did You Actually Build?

Firstly, I've set up a relatively simple Cloud Gateway, similar to what I described in my [other post](cloud-router). On top of that I've created another Wireguard server which acts as a tunnel into my internal network for trusted user devices like my phone when I'm out of the house. Let me draw it out for you:

{{< mermaid >}}
graph LR
    Phone(My Phone)
    Internet(Internet)
    Gateway(Cloud Gateway)
    CGNAT(ISP's CGNAT Router)

    subgraph House [My House]
        Router(Mikrotik Home Router)
        D(My Server)
        E(Brother's Laptop)
    end

    Internet --- CGNAT
    CGNAT --- Router
    Internet --- Gateway
    Phone -.- Router
    Phone --- Internet
    Gateway -.- Router
    Router --- D
    Router --- E

{{< /mermaid >}}
