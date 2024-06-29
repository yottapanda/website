---
title: "Crowdsec"
date: 2024-06-29
draft: false
description: &description A short foray into the world of Crowdsec
tags: &tags
  - security
summary: *description
keywords: *tags
---
## Everyone Wants Access to My Server

My server is accessible from the public internet, it has to be for people on the internet to read this blog! That's all well and good, but I also made the decision to keep SSH open to the internet on port 22 as well.

Now don't worry, my config is tighter than a nun's you-know-what. I have it set to disable password auth and to utilise an AllowList of users. Nobody except me is getting into this thing, assuming I don't leak my keys one day 😬.

That's not a challenge by the way, please don't hack me 👉👈.

Regardless, looking at the logs shows numerous bad actors constantly trying to get their grubby little fingers into my server:

```
Jun 28 22:16:10 sshd[811268]: User root from 68.183.91.213 not allowed because not listed in AllowUsers
Jun 28 22:16:11 sshd[811268]: Connection closed by invalid user root 68.183.91.213 port 58890 [preauth]
Jun 28 22:16:51 sshd[811908]: Invalid user admin from 174.138.57.202 port 45720
Jun 28 22:16:51 sshd[811908]: Connection closed by invalid user admin 174.138.57.202 port 45720 [preauth]
Jun 28 22:19:25 sshd[814066]: User root from 68.183.91.213 not allowed because not listed in AllowUsers
Jun 28 22:19:26 sshd[814066]: Connection closed by invalid user root 68.183.91.213 port 40382 [preauth]
Jun 28 22:21:01 sshd[815334]: error: kex_exchange_identification: read: Connection reset by peer
Jun 28 22:21:01 sshd[815334]: Connection reset by 139.59.1.230 port 37034
Jun 28 22:22:45 sshd[816640]: User root from 68.183.91.213 not allowed because not listed in AllowUsers
Jun 28 22:22:45 sshd[816640]: Connection closed by invalid user root 68.183.91.213 port 36576 [preauth]
Jun 28 22:23:20 sshd[817161]: User root from 174.138.57.202 not allowed because not listed in AllowUsers
Jun 28 22:23:20 sshd[817161]: Connection closed by invalid user root 174.138.57.202 port 52472 [preauth]
Jun 28 22:26:04 sshd[819289]: User root from 68.183.91.213 not allowed because not listed in AllowUsers
Jun 28 22:26:05 sshd[819289]: Connection closed by invalid user root 68.183.91.213 port 55956 [preauth]
Jun 28 22:29:25 sshd[822046]: User root from 68.183.91.213 not allowed because not listed in AllowUsers
Jun 28 22:29:25 sshd[822046]: Connection closed by invalid user root 68.183.91.213 port 46956 [preauth]
Jun 28 22:29:50 sshd[822336]: Invalid user ossuser from 174.138.57.202 port 44322
Jun 28 22:29:50 sshd[822336]: Connection closed by invalid user ossuser 174.138.57.202 port 44322 [preauth]
Jun 28 22:36:19 sshd[828809]: Invalid user admin from 174.138.57.202 port 42276
Jun 28 22:36:19 sshd[828809]: Connection closed by invalid user admin 174.138.57.202 port 42276 [preauth]
Jun 28 22:37:48 sshd[830252]: banner exchange: Connection from 47.95.215.141 port 50584: invalid format
Jun 28 22:39:59 sshd[830546]: fatal: Timeout before authentication for 47.95.215.141 port 55398
Jun 28 22:41:18 sshd[831937]: fatal: Timeout before authentication for 47.95.215.141 port 40214
Jun 28 22:42:02 sshd[832636]: fatal: Timeout before authentication for 47.95.215.141 port 42336
Jun 28 22:42:48 sshd[835468]: Invalid user f5 from 174.138.57.202 port 60250
Jun 28 22:42:48 sshd[835468]: Connection closed by invalid user f5 174.138.57.202 port 60250 [preauth]
Jun 28 22:45:51 sshd[838779]: Connection closed by 91.92.251.164 port 10000
Jun 28 22:49:18 sshd[841414]: Invalid user f5user from 174.138.57.202 port 56700
Jun 28 22:49:18 sshd[841414]: Connection closed by invalid user f5user 174.138.57.202 port 56700 [preauth]
```

Most appear to just try their luck with the root account, some even try multiple times; I'm looking at you, Mr 68.183.91.213. It's like he thinks my config is just going to magically change one day and let him in 😂.

Another common attack is to just try a bunch of different usernames to see if anything sticks. For example, Mr 174.138.57.202 really wants my server to be an F5 Firewall Device.

Then there are some logs that I don't understand, like the `fatal: Timeout before authentication` lines. My guess is that there's a CVE in a particular version of SSHD (not mine) that 47.95.215.141 wants to exploit.

## What Can I Do About It?

Well option number 1 is _nothing_... After all, they're not getting in and due to the configuration, never will.

But that just isn't satisfying to me, I want to slam the ban hammer and stop them from ever trying again.

I had a look through some options including Fail2Ban but ultimately settled on [Crowdsec](https://www.crowdsec.net/) because of its main selling point.

## What's So Special About Crowdsec?

Crowdsec is based around the premise of crowd-sourced security.

Say for example server **A** starts getting attacked by some IP **Q** and blocks it. Server **B**, owned by a completely different person, in a different country, would then be told to block **Q** because it is malicious.

Obviously all of this is anonymized so nobody knows who got attacked, only that the attack happened and who the perpetrator was (alongside some extra non-identifiable metadata).

Anyway, I like this idea. It means that if someone gets attacked by an SSH brute-force, I don't have to worry about the attacker turning their sights on me because I'll already be blocking them.

## Setting Up

Crowdsec is relatively simple to get started with, there are 2 main components:

- The crowdsec package itself. It comes with a systemd service that should be enabled and started.

- A crowdsec remediation component or _bouncer_ to enact any suggestions that come out of the crowdsec service.

### Crowdsec Package

The crowdsec package is actually relatively useless right out of the box. We haven't told it where to look or what to do if it finds something. Let's start with the first problem.

#### Log Acquisition

We can tell crowdsec where to look by configuring the `/etc/crowdsec/acquis.yaml` file (short for acquisition). You may not need to do this if all the log files you want to look at are already listed in the file. However, I did have to make some changes. My server runs ArchLinux which doesn't put SSHD logs in a file, it instead uses the systemd journal. I had to add the following to get crowdsec to look for sshd logs in journald:

```yml
...
---
source: journalctl
journalctl_filter:
 - "_SYSTEMD_UNIT=sshd.service"
labels:
  type: syslog
```

If you're following along, you'll want to do a quick `systemctl reload crowdsec.service` to get it to reload the config and start searching the right place. To check that this is working, we'll look at the crowdsec logs using `tail /var/log/crowdsec.log`. You're looking for the line that looks like:

```
time="2024-06-28T22:56:54+01:00" level=info msg="Running journalctl command: /usr/bin/journalctl [journalctl --follow -n 0 _SYSTEMD_UNIT=sshd.service]" src="journalctl-_SYSTEMD_UNIT=sshd.service" type=journalctl
```

If you see it, crowdsec is reading your SSHD logs!

#### Log Parsing

Now that crowdsec knows where the logs are, we need to tell it what it should be looking for within them. That's where parsers come in.

A parser essentially consists of a set of regex rules and output configs. They categorize each line for the next stage of the process.

Adding a parser is very easy:

```
cscli parsers install crowdsecurity/whitelists
```

This will add the whitelist parser, it essentially drops all events whose source is within internal network CIDRs (192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12), that is assuming you trust them. 

Next we'll add one to actually read the SSHD logs that we set up earlier:

```
cscli parsers install crowdsecurity/sshd-logs
```

This will add the official sshd-logs parser from the crowdsec hub. It specifically targets sshd logs which it will get from journald like we configured earlier.

Now we `systemctl reload crowdsec.service` again and check to see if it's working. For this we'll run a:

```
cscli parsers inspect crowdsecurity/sshd-logs
```

If under `Current metrics:`, you don't see anything, don't worry. Log out of your SSH session and back in then re-run the command above. You should see 1 or more hits now.

#### Scenarios

So we've seen how we get the logs and how we read them, now what? Well we want to decide what to do about the information we now have. Enter Scenarios.

Scenarios are the meat of Crowdsec. They ingest events from the parsing stage and then, using a configurable set of rules, they tell us when to ban a given IP.

We'll add 2 scenarios that both handle sshd events and determine whether an IP is performing a brute-force attack:

```
cscli scenarios install crowdsecurity/ssh-bf
cscli scenarios install crowdsecurity/ssh-slow-bf
```

Once again, don't forget to reload the crowdsec service.

Now let's test these scenarios, shall we?

##### Testing

If you've already installed a bouncer, you will likely ban yourself. **You've been warned**.

This testing won't work if you're connecting from a trusted CIDR as we discussed before.

In one SSH session, start tailing the crowdsec log:

```
tail -f /var/log/crowdsec.log
```

In another terminal, you're going to try to brute force your own server:

```
ssh root@myawseomserver
ssh root@myawseomserver
ssh root@myawseomserver
ssh root@myawseomserver
ssh root@myawseomserver
```

Now if you check your logs, you'll see that crowdsec wants to ban you!

```
time="2024-06-29T09:55:19+01:00" level=info msg="(6ae4ae5d27c646438d9444fa526b0a41/crowdsec) ssh-bf by ip 14.29.197.54 (CN/4134) : 4h ban on Ip 14.29.197.54"
```

Here's Mr 14.29.197.54 getting banned on my server a little while ago.

Now before we install a bouncer (that will actually ban you), let's undo that decision:

```
cscli decision list
```

Grab the `id` of that decision and then stuff it into:

```
cscli decision delete --id <id>
```

And just to make sure you're not going to be banned as soon as we install the bouncer, this should return nothing:

```
cscli decision list
```

### Bouncer (Remediation Component)

Crowdsec is now making decisions on who to block and for how long but as we've seen in testing, it doesn't actually block anything. This is because crowdsec is missing a remediation component; Something to do the blocking.

Since we're looking to secure SSH, we'll want to get crowdsec to block IPs in the firewall on our machine. This is where the `cs-firewall-bouncer` comes in. It makes itself at home in either your nftables or iptables firewall and links out to the crowdsec service to receive block lists.

You'll want to install it via your package manager as it's not a part of the crowdsec service itself.

```
# ArchLinux AUR
yay -Syu cs-firewall-bouncer
```

Since it's on the same machine, it should auto-connect to the crowdsec service.

Now you have a working crowdsec installation. It will block anyone trying to brute-force their way into your server via SSH!

## I Want A Bigger Hammer

What we've just installed works great and will stop most attacks. However, I'm not satisfied. The 2 scenarios we installed are still quite lenient, and so I still see a lot of attempts, the most common of which are root login attempts.

Logging in as root is disabled, so I can safely assume that anyone trying to log in as root is a bad actor.

So I created my own scenario `/etc/crowdsec/scenarios/ssh-root.yaml`:

```yaml
# ssh root attempt
type: trigger
name: ssh-root
description: "Detect root login attempt"
filter: "evt.Meta.log_type == 'ssh_failed-auth' && evt.Parsed.sshd_invalid_user == 'root'"
groupby: evt.Meta.source_ip
blackhole: 1m
reprocess: true
labels:
  service: ssh
  confidence: 3
  spoofable: 0
  label: "SSH Root Attempt"
  behavior: "ssh:bruteforce"
  remediation: true
```

Take a look at the filter, it specifies events that have failed ssh auth where the user is also root. The type is `trigger`, so the action occurs as soon as this scenario is triggered.

So this new scenario will immediately ban anyone who attempts to login as root. We have our _bigger hammer_.

## Where's The Crowd-Sourced Block-list?

Having run through all this, we haven't actually touched on the main point of crowdsec, the community block-list.

That's because we don't have to! The crowdsec service automatically updates the community block-list in the background and applies it to the bouncer for you.

You can confirm this by counting the lines in the list:

```
ipset list crowdsec-blacklists | wc -l
```

The reason we set up all the above is so that we can block live threats ourselves. The blocklist update frequency depends on how much we contribute. So if we parse and block locally, we'll get faster updates and more up-to-date security.

## Conclusion

In this post, we've learned how to install and configure crowdsec on a server to protect it from SSH brute-force attacks using crowd sourced blocklists and live log reading.

There's still a lot to learn around crowdsec, I've barely scratched the surface with this post. Hopefully you found it useful; I look forward to seeing your contributions to the community block-list soon 😉.
