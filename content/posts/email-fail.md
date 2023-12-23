---
title: "Email Fail"
date: 2023-11-29
draft: false
description: "A mailserver incident post-mortem"
summary: "A mailserver incident post-mortem"
tags: ["email", "postfix", "docker", "incident", "firewall", "trust"]
keywords: ["email", "postfix", "docker", "incident", "firewall", "trust"]
categories: ["Incidents"]
---
So I recently managed to make my Self-Hosted mailserver an **Open Relay**. This is bad.

My mailserver (dockerized mailcow) currently runs on a little NUC under my stairs. It has worked well with only minor problems over the 3 or so years I've had it running; I got spamhaused once, etc.

The problem all started with me trying to patch a percieved security hole. See, docker doesn't respect firewalls like UFW or firewalld (all based on iptables of course), instead opting to allow ports through iptables as you add `-p` flags to your containers in spite of any other rules you may have.

Now I thought this was rather terrible. I don't want to have to look both at my firewall and at all my docker port bindings to check if something is open. So as many of us would do, I started trawling the internet for solutions and started to learn about why this behaviour existed.

According to some articles/stackoverflows/etc. the way to stop docker messing with iptables and creating its own rules is to disable the feature in the daemon.json. Seems simple enough. The only caveat that I found mentioned was that container networking would break (in terms of internet reachability) but that's ok because I just had to add a firewalld rule to allow masquerading and that problem was solved.

Now the problem I failed to see was that of NAT changing. Prior to disabling the iptables flag, the mailserver would see connections' IPs as their real public ones. However afterwards, every single IP was that of the internal docker network default route.

I didn't think much of it at the time, merely that it would be more annoying to see who was connecting but that was fine because I had what I wanted. Firewalld was now the sole controller of my ports 🎉

Little did I know (or maybe I did and just forgot) that postfix has a trusted list of IPs and it will relay anything from them without question. These IPs include internal IPs such as that of the default route...

So essentially every SMTP request was being NATed to have a sender address of 172.22.1.1 and postfix started sending EVERYTHING 😵‍💫

It wasn't long before a plethora of bots had saturated my poor NUC with HUNDERDS OF THOUSANDS of emails.

I got home this evening to lag spikes in Tarkov which prompted me to check the server where I found this mess.

After taking everything down, re-enabling the iptables and flushing all the postfix queues, I was able to spin back up and not have the whole thing start spiralling again.

Some tips for those hosting mailservers:

- Use a mail server checker like https://mxtoolbox.com/SuperTool.aspx
- Setup monitoring and alerts for server CPU usage/spikes in requests/etc
- Don't fix what ain't broke

I'm gonna go cry myself to sleep now and pray that the big mail hosts like Google and Microsoft take pity on me and my screw up. (We all know I'll never be able to send another email to Microsoft again, who am I kidding)