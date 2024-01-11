---
title: Cloud Router
date: 2023-12-27
draft: true
description: &description Getting around CGNAT for self-hosting with a Cloud Router.
tags: &tags 
  - docker
  - networking
  - cgnat
summary: *description
keywords: *tags
---
## Act 1: Finding a New ISP

Internet speeds in the UK tend to be rather abysmal for their asking price. 

I'm currently buying an internet connection from Plusnet who are charging me ~£20/m for a 36Mb/s down, 10Mb/s up connection (with landline). They also charged me a small, one time setup fee (a few quid) for a static IPv4 address which I've been happily using for a while now. This is all provided over my copper phone line (very old).

Self hosting somehow survives these speeds just fine for the websites and such that I run but I've been eyeing up a faster connection for some time now to improve my file transferring capabilities. Unfortunately there is a speed limit on copper wires of 80Mb/s down, 20Mb/s up and that's in a best case scenario. So my dreams of Gigabit internet are going to require a bit more effort.

Let's aim for that "Gigabit internet" target and see what we can find (ignoring contract length and setup fees):

| ISP | Up/Down Mb/s | Cost/Month |
|---|---|---|
| Virgin Media | 1130/104 | £45 |
| BT | 900/110 | £43 |
| Plusnet | 900/115 | £50 |
| Sky | 900/100 | £58 |
| Community Fibre | 920/920 | £25 |

"Do _you_ see the odd one out?", said Dora the Explorer.

Clearly Community Fibre woke up and chose violence. Not only do they have the second highest average down speed, they also boast a **symmetric upload speed**. All for half the price of the other offerings.

"Yeah that's great but what's the catch?" is what you're probably asking right about now. I asked it too.

### Carrier-Grade Network Address Translation (CGNAT)

CGNAT is the ISP's solution to dwindling IPv4 address space. Let's break it down:

Network Address Translation (NAT) is the protocol that allows one public IPv4 address to be used by multiple devices, each with it's own private IPv4 address. Generally, an ISP will hand your router/gateway a public IPv4 address and your router will give each device that connects to it a private one. Then as outgoing packets pass through the router, return addresses are switched from private ones to the public one and vice versa for the responses. It's all very clever, and I suggest learning more about it; Perhaps I'll go into more detail in a future post.

So what makes it _Carrier-Grade_? At it's core, CGNAT is just a second layer of NAT. Where your home router may use the usual private IPs such as `192.168.0.0/16` or `10.0.0.0/8`, CGNAT has the `100.0.0.0/8` range assigned to it. So it looks something like this:

{{< mermaid >}}
graph LR
A(Internet) <-- 0.0.0.0/0 --> B
B(CGNAT Router) <-- 100.42.42.0/24 --> C
C(Your Router) <-- 192.168.0.0/24 --> D(Your Server)
{{< /mermaid >}}

Rather convoluted if you ask me!

Now the problem with this is that we don't have control over the ISP router that's performing CGNAT so we have no way of port forwarding. That means no self-hosting 😢.

## Act 2: A Challenger Approaches

Since we're saving so much on our internet connection, what's stopping us from spending a little money on implementing an equally convoluted way of getting around CGNAT?

If we add our own NAT gateway (router) in a public cloud, it will have a public static IPv4 address, a public static IPv6 address, and likely a fast internet connection too. 
We can then set up a Wireguard tunnel from our local server to that cloud router. 
We then forward all our packets via the new Cloud Router at which point we have essentially given our server a public static IPv4 address again!

Confused? Yeah me too, so I made a diagram:

{{< mermaid >}}
graph LR
A(Internet) <-- 0.0.0.0/0 --> B
B(CGNAT Router) <-- 100.42.42.0/24 --> C
C(Your Router) <-- 192.168.0.0/24 --> D(Your Server)
A <-- 0.0.0.0/0 --> Q(Cloud Router)
Q <-- 10.69.69.0/24 --> D
{{< /mermaid >}}

Physically, the wireguard tunnel (10.69.69.0/24) goes over our existing CGNAT connection but logically, the CGNAT connection is abstracted away and isn't something we need to worry about just yet.

### Finding a VPS

We'll need something to act as our Cloud Router so I've compiled a list of some various VPS options below. Each assumes that savings plans (or equivalent) have been applied up to 1 year in duration, excluding any upfront payments. I've also gone for the smallest VPS from each provider as we barely need any raw power.

| Cloud | vCPU | RAM (GiB) | Disk (GB) | Data Transfer (GB) | Network Speed (Gb/s)| Monthly Cost ($) | Cost Calculator Link (or equivalent) |
|--|--|--|--|--|--|--|--|
| AWS | 2.0 | 0.5 | 8 | 25 | < 5.0 | 8.83 | [Link](https://calculator.aws/#/estimate?id=c0a919b7d379af5382fd0466a713a3702edf0e04) (New Elastic IP charge considered) |
| GCP | 0.25 | 1.0 | 10 | 200 | 1.0 | 5.44 | [Link](https://cloud.google.com/products/calculator?dl=CiQ0MzA1YTBiNi1jNDcxLTQxNzAtYjgyYi02NDc5ZjRkODFmYWIQCBokQTUzMENDQTYtMzdBOS00OEQ1LTlGODYtQzM4REU0NjBDREVF) |
| Azure | 1.0 | 0.75 | 8 | 100 | < 6.25 | 4.74 | [Link](https://azure.com/e/3959b516818e4ce7b81179d039b449c9) |
| Oracle Cloud* | 2.0 | 1.0 | 200 | 10 000 | 0.48 | 0.00 | [Generic Link](https://www.oracle.com/uk/cloud/costestimator.html) |
| Linode | 1.0 | 1.0 | 25 | 1000 | 1.0 | 5.00 | [Link](https://www.linode.com/pricing/#compute-shared)

\* Oracle has an ARM free tier in regions other than London. They give an "equivalent" x86 VM in London which is shown here

I see 3 potential solutions here in my personal order of preference:
1. Oracle for their $0 per month free tier and insane 10TB free egress. One potential downside is the network speed of half a Gigabit. Also, their management UI is poo poo tier.
2. Linode for their apparent lack of immediately obvious problems and their extra features (which I'll explain soon).
3. Azure for simply being the cheapest on the board. A potential worry here is hitting the 100GB free data transfer limit in one month. (Azure also gets no points for their calculator, it's _slow_).

AWS appears far too expensive for this use case. However it wasn't the compute, the transfer cost is what's stinging us. 

AWS loses in this battle because they don't offer some free transfer every month. Egress transfer costs are expensive across the board beyond free amounts so if you're looking to do multiple TB per month, Oracle is your choice.

GCP doesn't make the cut due to their high vCPU price, perhaps they have _extremely_ fast CPUs but I've not dug into it so for now... we'll leave them be.

#### Linode's "Extra Features"

Since we're making a Cloud _Router_, wouldn't it be nice if we could do some IPv6 routing? Linode is the only provider (from what I can tell) that allows us to assign a prefix larger than a /64 to our VPS. This means we can have it run SLAAC with RA and assign downstream clients public static IPv6 addresses.

If instead of putting the wireguard endpoint on our server, we could put it on our usual router and it would almost act as just another WAN connection!

Another nicety of Linode is the easy setup of Reverse DNS (PTR) records for our v4 IP. They have this functionality built into their management console, unlike Oracle. This is important if you host an email server like I do.

### Choice

We'll go with Oracle for now since:
- It's free
- I don't particularly need public static IPv6 addresses at the moment
- I ended up going for Community Fibre's 150Mb package so the 0.5Gb of the VPS is sufficient
- They still do offer RDNS via a support request

## Act 3: Implementation

I won't be mad if you skipped to this, I've been known to waffle.

Let's take an inventory of what we'll need:

- A Wireguard "server" on the VPS since it's the only thing with a public IP.
- A set of iptables rules to forward traffic correctly on the VPS.
- A Wireguard "client" on our local server.
- A set of iptables rules to route traffic back over the wireguard

### VPS

Let's 
