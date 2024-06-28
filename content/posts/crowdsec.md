---
title: "Crowdsec"
date: 2024-06-28
draft: true
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

Most appear to just try their luck with the root account, some even try multiple times (I'm looking at you, 68.183.91.213). It's like he thinks my config is just going to magically change one day and let him in 😂.

Another common attack is to just try a bunch of different usernames to see if anything sticks. For example, Mr 174.138.57.202 really wants my server to be an F5 Firewall Device.

Then there are some logs that I don't understand, like the `fatal: Timeout before authentication` lines. My guess is that there's a CVE in a particular version of SSHD (not mine) that 47.95.215.141 wants to exploit.

## What Can I Do About It?

Well option number 1 is _nothing_... After all, they're not getting in and due to the configuration, never will.

But that just isn't satisfying to me, I want to slam the ban hammer and stop them from even trying again.

I had a look through some options including Fail2Ban but ultimately settled on [Crowdsec](https://www.crowdsec.net/) because of its main selling point.

## What's So Special About Crowdsec?

Crowdsec is based around the premise of crowd-sourced security.

Say for example server **A** starts getting attacked by some IP **Q** and blocks it. Server **B**, owned by a completely different person, in a different country, would then be told to block **Q** because it is malicious.

Obviously all of this is anonymized so nobody knows who got attacked, only that the attack happened and who the perpetrator was (alongside some extra non-identifiable metadata).

Anyway, I like this idea. It means that if someone gets attacked by an SSH bruteforce, I don't have to worry about the attacker turning their sights on me because I'll already be blocking them.

## Setting Up

Crowdsec is relatively simple to get started with, there's 2 main components:

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

If you see it, crowdsec is reading your sshd logs!

#### Log Parsing

Now that crowdsec knows where the logs are, we need to tell it what it should be looking for within them. That's where parsers come in.

A parser essentially consists of a set of regex rules and output configs. They categorize each line for the next stage of the process.

Adding a parser is very easy:

```
cscli parsers install crowdsecurity/sshd-logs
```

This will add the official sshd-logs parser from the crowdsec hub. It specifically targets sshd logs which it will get from journald like we configured earlier.

Now we `systemctl reload crowdsec.service` again and check to see if it's working. For this we'll run a:

```
cscli parsers inspect crowdsecurity/sshd-logs
```

If under `Current metrics:`, you don't see anything, don't worry. Open a new terminal and purposely fail to log into your server's SSH. Only do it once if you've got a bouncer installed, or you might get yourself banned. Come back to the original session and run the command again. You should see a table showing a hit and a parsed line.

#### Scenarios


