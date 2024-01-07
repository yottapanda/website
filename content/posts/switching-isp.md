---
title: Switching ISP
date: 2023-12-27
draft: true
description: &description Choosing a new ISP and getting around CGNAT for self-hosting.
tags: &tags 
  - docker
  - ipv6
  - networking
  - cgnat
summary: *description
keywords: *tags
---
## Finding a New ISP

Internet speeds in the UK tend to be rather abysmal for their asking price. 

As of writing, I'm with Plusnet who are charging me ~£20/m for a 36Mb/s down, 10Mb/s up connection with a phone line. This is on a VDSL copper line.

Self hosting somehow survives these speeds just fine for the websites and such that I run but I've been eyeing up a faster connection for some time now to improve my file transferring capabilities.

Unfortunately there is a speed limit on copper wires of 80Mb/s down, 20Mb/s up and that's in a best case scenario. My dreams of Gigabit internet are going to require a bit more effort.

Now, I think it's safe to get rid of my landline in this day and age, so let's aim for that target of Gigabit internet (ignoring contract length and setup fees) and see what we can find:

| ISP | Up/Down Mb/s | Cost/Month |
|---|---|---|
| Virgin Media | 1130/104 | £45 |
| BT | 900/110 | £43 |
| Plusnet | 900/115 | £50 |
| Sky | 900/100 | £58 |
| Community Fibre | 920/920 | £25 |

Do you see the odd one out? Clearly Community Fibre woke up and chose violence. Not only do they have the second highest average down speed, they also boast a **symmetric upload speed**. All for half the price of the other offerings.

"Yeah that's great and all, but there must be a catch..." is what you're probably saying about now. I asked the same question and this post will detail what I found.

## Carrier-Grade Network Address Translation

Also known as CGNAT; It is the ISP's solution to dwindling IPv4 address space. Let's break it down:

Network Address Translation (NAT) is the protocol that allows one public IPv4 address to be used by multiple devices, each with it's own private IPv4 address. Generally, an ISP will hand your router/gateway a public IPv4 address and your router will give each device that connects to it a private one. Then as outgoing packets pass through the router, return addresses are switched from private ones to the public one and vice versa for the responses. It's all very clever, and I suggest learning more about it; Perhaps I'll go into more detail in a future post.

So what makes it _Carrier-Grade_? CGNAT is, at it's core, just a second layer of NAT. Where the usual private IPs are `192.168.0.0/16`, `10.0.0.0/8`, etc., CGNAT has the `100.0.0.0/8` range assigned to it. So it looks something like this:

{{< mermaid >}}
graph LR
A(Internet) <-- 0.0.0.0/0 --> B
B(CGNAT Router) <-- 100.42.42.0/64 --> C
C(Your Router) <-- 192.168.0.0/16 --> D(Your PC)
{{< /mermaid >}}

Rather convoluted if you ask me!

Now the problem with this is that we don't have control over the ISP router that's performing CGNAT so we have no way of port forwarding. That means no self-hosting 😢.

## IPv6 to the Rescue?

We don't give up that easily. IPv6 addresses allow us to go back to the glory days of IPv4 when every computer had a public address. No more NAT, no more CGNAT, just computers and simple (unlikely but we can dream) packet forwarding.

If you come from a NAT background, not unlike myself, you may be screaming about security right now. 

"What do you mean all my devices are on the public internet, that's crazy!"

Don't worry, dear reader. Firewalls were built just for this purpose. Simply block by default and instead of port forwarding with NAT, now you simple allow forwarding to a specific address on a specific port.

And the other benefit is that we can have more than 1 machine serving content on one port!

Unfortunately, while Community Fibre does hand out and route a /56 prefix for you, it's dynamic. This means that it could change at any time and there's a lot of work to get it all to work with Dynamic DNS and SLAAC. To add to that, static IPs sound like a nightmare.

## If You Can't Beat Them, Join Them

Remember how I called CGNAT convoluted a few paragraphs ago? Well I've come up with something just as bad 🥲:

{{< mermaid >}}
graph LR
A(Internet) <-- 0.0.0.0/0 --> B
B(Your Cloud Router) <-- 10.42.42.0/64 --> C
C(Your Router) <-- 192.168.0.0/16 --> D(Your Server)
{{< /mermaid >}}

Looks familiar doesn't it...

The setup above swaps out the ISP-owned CGNAT router with our own VPS router in a public cloud. Then we set up a Wireguard tunnel from our local router to that cloud router. Now if we forward packets via the cloud router, we essentially have a public static IP again!

## Finding a VPS

There's a plethora of options for 
