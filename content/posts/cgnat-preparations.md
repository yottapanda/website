---
title: CGNAT Preparations
date: 2023-12-27
draft: false
description: Setting up IPv6 in preparation for CGNAT
summary: Setting up IPv6 in preparation for CGNAT
tags:
  - docker
  - ipv6
  - networking
keywords:
  - docker
  - networking
  - ipv6
categories:
  - IPv6
---
Internet speeds in the UK tend to be rather abysmal for their asking price. 

As of writing, I'm with Plusnet who are charging me ~£20/m for a 36Mb/s down, 10Mb/s up connection with a phone line. This is on a VDSL copper line.

Self hosting somehow survives these speeds just fine for the websites and such that I run but I've been eyeing up a faster connection for some time now.

Unfortunately there is a speed limit on copper wires of 80Mb/s down, 20Mb/s up and that's in a best case scenario. So if my dreams of Gigabit internet are going to require a bit more effort.

Now I think it's safe to get rid of my landline in this day and age, so let's aim for that target of Gigabit internet (ignoring contract length) and see what we can find:

- Virgin Media - 1130/104 - £45
- BT - 900/110 - £43
- Plusnet - 900/115 - £50
- Sky - 900/100 - £58
- Community Fibre - 920/920 - £25

Do you see the odd one out? That's right! Community Fibre woke up and chose violence. 

Now if you're like me, you're probably asking "what's the catch?" That, dear reader, is a great question. 

CGNAT, or Carrier-Grade Network Address Translation is the ISP's solution to dwindling IPv4 address space. Let's take a step back, that's a lot to process.

Network Address Translation (NAT) is the process of allowing many computers to share one IPv4 address. It's very common and in fact, your router is likely doing it now. A standard ISP will give your router one **public** IPv4 address with which it can communicate to the wider internet. Your router will then hand out **private** IPv4 addresses to all your devices. When one of your devices sends a packet to something on the internet, it will include a return address, it's private IP. Without NAT, the return address is useless because no server on the internet is going to know where to send the response. So your router will alter the packet as it passes through, changing the return address to it's public IPv4 address and keeping a log of the origin so it can forward the response on to the sender.

So what's Carrier-Grade NAT then? CGNAT is designed for ISPs or "carriers" (it was originally designed for mobile/cellular networks) to handle huge numbers of devices behind one IPv4 address. Imagine if every mobile phone had a public IPv4 address, we'd have run out many many years ago. CGNAT does the same thing as 