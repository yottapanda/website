---
title: Cloud Router in the Wild
date: 2024-05-30
draft: true
description: &description Implementing a cloud router for a client
tags: &tags 
  - networking
  - vpn
  - cloud
summary: *description
keywords: *tags
---

#### Life Update: I've Been Busy

My short hiatus from blogging is over, but I haven't been idle!
I have something big in the works; sneak peeks are on the way 😉.

## Remember When I Made a ["Cloud Router"](cloud-router.md)?

So it turns out, my cloud router exists already under a different guise: a network gateway but in the ✨ cloud ✨. You learn something new every day!

I guess I'll change the name to **Cloud Gateway** instead!

### A Quick TL;DR of my Cloud Router Post

I couldn't reliably reach my home network in order to serve things like email and websites due to CGNAT. I created a VPS in Oracle Cloud (because it was free) and then I routed all my server's traffic across that instance using Wireguard VPN.

## The Client & Problem

Not long after implementing the Cloud Gateway for my Self-Hosting server, I ended up needing to do something similar for a client at work.

We were making a mobile app for this client that showcased their products and allowed owners to manage their warranties and track servicing on the blockchain. The fancy-sounding stuff is irrelevant for this post though 😉.

The client has an existing CMS system (database 🙄) in which they store details about their physical products. Being a less technical company, they opted to host a [FileMaker](https://www.claris.com/filemaker/) "database" on a Mac Mini in their office. _Yeah, I'd never heard of it either._ 

Calling the Mac directly from worldwide mobile devices via this app would likely melt the poor thing. Hence, in order to display all the products in the app, we needed to do an ETL (Extract, Transform, Load) from their on-premises database into a database in AWS.

This FileMaker database wasn't on the public internet so instead when they needed remote access, they utilized a VPN system called [ZeroTier](https://www.zerotier.com/) which their employees used to connect to the database when out of the office.

## Enter the Cloud Gateway

I heard all this from the client and my thoughts went immediately to my Cloud Gateway implementation. It seemed the clear choice given the existing VPN. All I'd have to do was hook it up to an EC2 instance, do some network config and _boom_.

As it turns out, there's a few gotchas when it comes to AWS networking. ZeroTier, though, was quite intuitive.

Here's a diagram which shows the desired network architecture:

{{< mermaid >}}
graph LR
subgraph AWS
Lambda(Lambda) --> EC2(EC2 Instance)
end
EC2 -- ZeroTier --> Mac
subgraph Client
Mac(Mac Mini)
end
{{< /mermaid >}}

## The AWS Side

The first thing I did was spin up an EC2 instance, no need for anything large at all; I decided on a `t3.nano`. After all, it'll only be forwarding packets! Your home router probably has less than half the RAM and CPU of a `t3.nano`.

I also used Amazon Linux just as a standard. Feel free to use whatever you want; just know that some steps will need to be tweaked.

I also added an instance role with the `AmazonSSMManagedInstanceCore` policy to the instance so that I didn't need to fumble with SSH keys (I'll do another short post on this at some point).

### Security Group

Now it's not mandatory but, it's best practice to create a minimally permissive security group for the instance so that we only ever allow expected traffic in or out. This is what we'll need for an instance with ZeroTier and using SSM (not SSH) to connect to it:

#### Inbound

| Port | Protocol | Source       | Description                   |
| ---- | -------- | ------------ | ----------------------------- |
| 9993 | UDP      | 0.0.0.0/0    | ZeroTier Protocol             |
| 443  | TCP      | 10.0.0.10/32 | IP of Mac on ZeroTier (HTTPS) |

#### Outbound

|Port|Protocol|Destination|Description|
|--|--|--|--|
|9993|TCP|0.0.0.0/0|ZeroTier Protocol|
|9993|UDP|0.0.0.0/0|ZeroTier Protocol|
|80|TCP|0.0.0.0/0|ZeroTier Yum Repo (HTTP)|
|443|TCP|0.0.0.0/0|Amazon SSM Endpoints (HTTPS)|

If you're using SSH instead of SSM, you can forego the 443 in outbound and instead put a 22 in inbound.

### Source/Destination Check

Now for the first gotcha, we want this instance to forward packets that are not bound for that instance itself right? Well AWS, has kindly assumed that you usually don't want to do that (a very good idea from a security stand point) so we need to change a setting in the instance configuration to get this working:

`Instance > Actions > Networking > Change source/destination check > Stop` should be checked ✅

This stops AWS filtering out traffic that's not directly bound for that instance's IP address. This lets us send packets to the instance that are destined, in this case, for the ZeroTier network.

### Route Table Entry

Since we're using a lambda to query the database, we need to let the lambda know that it can reach the Mac via the cloud gateway instance. We're assuming the lambda is already being run from within the VPC (which is not the default).

As we saw above, the Mac's IP in the ZeroTier network is `10.0.0.10`, so we'll add an entry in the VPC's route table:

| Destination  | Target         |
| ------------ | -------------- |
| 10.0.0.10/24 | i-blahblahblah |

When you add the route, select the instance. When it shows up in the route table view, it will show as an Elastic Network Interface (e.g. `eni-blahblahblah`). This is normal and if you go into the ENI, you'll see that it is attached to your instance and, it is actually the thing giving your instance it's IP address.

## Configuring the Instance

### Enable Packet Forwarding

Using the following commands, enable IP forwarding and reload sysctl:

```sh
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl --system
```

### Install and Enable nftables

nftables is the successor to iptables. It has not really caught on properly just yet but since this is a brand-new setup, we'll use it.

```sh
dnf update -y
dnf install nftables -y
systemctl enable nftables
```

### Configure nftables

Now that we have nftables, we can configure it to forward packets. We'll start by creating a file `/etc/nftables/zerotier.nft`:

```nft
table ip nat {
	chain postrouting {
		type nat hook postrouting priority srcnat; policy accept;
		oifname "zt*" counter packets 0 bytes 0 masquerade
	}
}
```

The jist of this configuration is that it will masquerade any packets leaving via an interface starting with `zt`. This means that it will change the source IP of the packets to that of itself before sending and upon a response, it will swap the destination back to the original source IP.

It's likely not a perfect configuration but, it gets the job done. If you can recommend any improvements, reach out 😉

We also have to enable this config file so, we need to edit `/etc/sysconfig/nftables.conf`. This file is the one that gets loaded by the systemd unit we enabled earlier.

```
flush ruleset

include "/etc/nftables/zerotier.nft"
```

This does 2 things: Removes all the rules currently in play and then includes the `zerotier.nft` file we just created.

Now we do a quick `systemctl start nftables` to load the file and, we're onto the next step.

### ZeroTier Install and Setup

Zerotier has an installer on [this page](https://www.zerotier.com/download/), we want the steps under **Linux (DEB/RPM)**.

I've copy pasta'd it here for your convenience 😉

```sh
curl -s https://install.zerotier.com | sudo bash
```

Run through that and then run the following:

```
systemctl enable --now zerotier-one
zerotier-cli join <your-zerotier-network-id>
```

Assuming you have a private ZeroTier network, you'll want to now allow your instance access.

## Testing

Now you can run a sanity ping:

```sh
ping 10.0.0.10
```

And hopefully all is well!

Testing from a Lambda is left as an exercise to the reader (AKA. I can't be bothered to write about setting up the Lambda, sue me 😂)