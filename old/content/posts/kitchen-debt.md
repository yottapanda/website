---
title: "Kitchen Debt"
date: 2024-10-05
draft: false
description: &description An analogy for tech debt for your non-tech peers.
tags: &tags
  - human interaction
summary: *description
keywords: *tags
---
## The Predicament

Recall a time when your _manager_ (non-tech stakeholder) wants a feature done _muy rapido_ (very fast), and you've got to mutilate your otherwise "perfect" codebase to do it. Never a fun time but nonetheless, we both know the possible solutions to this problem:

1. Succumb to the pressure and implement it as fast as possible, leaving a huge mess that will haunt the next poor sod who dares need to make a change in the future.
2. Make your objections known, implement it quickly and vow to fix it afterwards&trade;. You know full well that your manager will have another urgent feature ready to shove down your throat immediately after this one.
3. Agree to implement it, but explicitly state that it will not be done in time. This little maneuver's gonna cost you 2 years on your next promotion.
4. Quit immediately, become a YouTuber, realise you can't make videos, beg for your job back, implement the feature.

None of these are ideal. These are the options because the root of the problem is your stakeholder's lack of understanding of the situation. I'm reaching here, I know. But I came up with an analogy that I wanted to share.

## Kitchen Debt

Usually I'm quite tidy in the kitchen. I have no cleaning up to do at the end because I clean as I go. It means I can eat, throw my bowl in the dishwasher, and not have someone yelling at me to clean up so that they can use the kitchen. It does take a little longer to work like this, but the food turns out better when I fuss over it and there's no mess.

I was rushing to make dinner yesterday (my famous ragù), because my friend called to go bouldering with an hour's notice. Needless to say, my etiquette went straight out the window. I left onion peels on the counter, knives in precarious locations, and numerous unwashed pots/pans sprawled around the cooker. Having inhaled my food and put on my shoes to leave, my mother comes down. She takes one look at the kitchen and says "I'm about to make a cake, clean up your mess". I love my mother dearly, and so I left for climbing. She was not happy.

This sounds a lot like tech debt to me. I needed to implement a feature (cook ragù) in a short period of time (bouldering in an hour), leaving technical debt (a mess). The next poor sod (my mum) needed to make a change (cook something else), and was haunted by it (had to clean up my mess first).

## Technical Debt

Usually technical debt isn't actually as clear-cut as I've made out. It's often difficult to even realise that you're creating it, especially the earlier you are in your career. Some might go to the extreme either way when dealing with technical debt:

Person 1 might decide the best course of action is to prevent any and all possible tech debt. This is the person who tries to account for every single possible use-case that could ever arise and could turn something as benign as a "Hello World" app into a nightmare that needs 3 on-call principal engineers at all times to maintain.

Person 2 implements things... _as fast as humanly possible_. Ignore all best practices just get the thing working and ship it. They would tack a horse onto a horsefly if it made the horse... fly. Unsurprisingly, this also ends up being a 3 on-call principal engineers nightmare.

I've been on both sides of this curve. I've gone from being person 2 right at the beginning of my coding life, very quickly almost all the way to person 1 after I learned how annoying it was to change 10 instances of the same code that all do one thing slightly differently. Then transitioning back towards person 2 because implementing a generic-ridden, extensible, recursive iterator for 2 possible use-cases is a nightmare. Nowadays, I'm somewhere in the middle, and I've realised that I've started to abide by some rules that help me stay there.

1. The simpler something is, the easier it is to: debug, change, or rewrite. For you or someone else. Elegant is not simple.
2. Implement it fast, copy it once, implement it "properly" (documented, easy to use, easy to understand, not repeated) the 3rd time and fix the first 2 while you're there.
3. Be conservative in your time estimates, you never know what kinds of problems will spring up. I go for 1.25x my first estimate.

## Conclusion

Code and associated technologies are a living thing, you can't expect to get things right the first time or to never have to change anything. Hopefully this helps you deal with your managers and tech debt in general.
