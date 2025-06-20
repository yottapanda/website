---
title: "{{ replace .Name "-" " " | title }}"
date: '{{ .Date }}'
draft: false
description: &description ""
tags: &tags
  - default
summary: *description
keywords: *tags
---