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
    Internet[Internet]
    Gateway(Cloud Gateway)
    CGNAT(ISP's CGNAT Router)
    subgraph House [House]
        Router(Router)
        Server(Server)
        Laptop(Laptop)
    end

    Internet --- CGNAT
    CGNAT --- Router
    Internet --- Gateway
    Phone -.-> Gateway
    Phone --- Internet
    Gateway -.- CGNAT
    Gateway -.-> CGNAT
    CGNAT -.- Router
    CGNAT -.-> Router
    Router --> Server
    Router --- Laptop
{{< /mermaid >}}

So that's terrible... Oh well, I'll try my best to explain it.

Firstly, the solid lines indicate normal network connections. The dotted lines indicate a VPN connection.

As you can see, there's one VPN line between My Phone and the Cloud Gateway. That's the trusted VPN that terminates on the Router (which acts as a WireGuard "server"). This line (VPN) traverses the Cloud Gateway, and gets wrapped in another layer of WireGuard.

This second layer of WireGuard (the other dotted line) is the Peer to Peer VPN that allows us to have another WAN. In this case, the Cloud Gateway Server acts as the WireGuard "server" and the Router as the "client". Because we are initiating the connection outward, we circumvent our inability to punch through the CGNAT router from the internet.

From the perspective of the phone, it's initiating a connection directly with the Cloud Gateway('s IP). The Cloud Gateway just happens to be forwarding all its packets across another WireGuard connection to the Router. If you follow the arrows, you can see the path that the Phone's VPN packets take to reach a web server on the Server.

At this point I can't tell if this is extremely complicated or if I've just been overcomplicating it for the past 2 weeks whilst I've been wrangling it together. It could be that I'm just very used to it now 🤷‍♂️.

## Implementation

Ignoring the question of my sanity, let's have a look at how I went about setting this up.

There are 3 entities involved in this dance of firewalls and VPNs that we'll be interacting with:

1. The Phone
2. The Gateway
3. The Router

To simplify the above diagram: The phone communicates with the gateway which, unbeknownst to the phone, forwards everything to the router.

{{< mermaid >}}
graph LR
    Phone(My Phone)
    Gateway(Cloud Gateway)
    subgraph House [House]
        Router(Router)
    end

    Phone --> Gateway
    Gateway --> Router
{{< /mermaid >}}

Between the Cloud Gateway and the Router, we'll set up a VPN connection called the **WAN VPN**; named so because it tunnels traffic from the open internet without discretion (depending on how you configure it).

Between the Phone and the Router, we'll set up a VPN connection called the **Private VPN**. This is because it grants access to the internal network of the router.

Let's go from least to most complex...

### The Phone

All we need to do for the phone is set it up as a WireGuard **client** on our Private VPN.

It does not need to know anything about the WAN VPN since, as I said before, the whole forwarding process is transparent.

We'll configure the Phone as follows:

```
[Interface]

# Address of the client on the VPN
Address = 192.168.17.69/24

# Wireguard client
PrivateKey = ...

[Peer]

# Point to the gateway IP and the port that our private VPN "server" will listen on
Endpoint = <gateway server public ip>:<13131>

# Allow client to connect to VPN endpoint and internal network respectively
AllowedIPs = 192.168.17.1/32, 192.168.16.0/24

# (Optional) Maintain the connection so we can initiate connections out to the device from the internal network
PersistentKeepalive = 25

# Wireguard server
PublicKey = ...
```

### The Gateway

Now we need the Cloud Gateway, acting as the middle man. It will act as a WireGuard server for our router to connect to.

Here's the configuration we're going to want:

```
[Interface]

Address = 10.0.18.1/30

ListenPort = 51820
PrivateKey = ...

# Allow ip forwarding
PreUp = sysctl net.ipv4.ip_forward=1

# Immediately accept connections on 2222 so we can still SSH into the cloud gateway
PreUp = iptables -t nat -A PREROUTING -i enp0s6 -p tcp --dport 2222 -j ACCEPT
PostDown = iptables -t nat -D PREROUTING -i enp0s6 -p tcp --dport 2222 -j ACCEPT

# Destination NAT all other traffic to our router at 10.0.18.2
PreUp = iptables -t nat -A PREROUTING -i enp0s6 -j DNAT --to-destination 10.0.18.2
PostDown = iptables -t nat -D PREROUTING -i enp0s6 -j DNAT --to-destination 10.0.18.2

[Peer]
PublicKey = ....
AllowedIPs = 10.0.18.2/32
```

## Moral Of The Story

All these shenanigans could have been easily avoided if the rest of the internet actually supported IPv6. My brother's friend's ISP simply doesn't have it. And Vodafone's Cellular Network doesn't support it either.

While I was writing this post, I remembered that there's quite a few [transition mechanisms](https://en.wikipedia.org/wiki/IPv6_transition_mechanism) which allow cross-communication between IPv4 and IPv6 networks in different capacities. 

If there exists a mechanism whereby I can have one VPS translate IPv4 packets to IPv6 packets and forward them on to my internal network, that might be the way to go. That way I may not need any crazy VPNs. The only problem left to solve would be the complete ambiguity as to whether or not the IPv6 space that my ISP provides me is actually static...
