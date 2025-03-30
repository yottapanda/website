---
title: AI is Outdated
date: 2025-03-30
draft: true
description: &description Using an LLM as a software engineer just means you're writing outdated code.
tags: &tags
  - ai
  - llm
  - python
  - database
summary: *description
keywords: *tags
---
## Context

I've recently started working for a new company as a DevOps Engineer 🥳. 
We use Python exclusively for our projects here; Picking it up again has been an... _interesting_ experience.
I am reminded of how little fun I have when getting Python to work for anything beyond scripting.
That's a rant for another time, though.

Soon after I joined the company, I was tasked with introducing separate deployment environments; production, staging, etc.
At the time, they had one database instance handling the live service and their development work simultaneously.
Not the best idea to let your engineers change the schema of the live app.

As I was working on creating separate databases for each environment, I remembered that changes made to a schema in a development environment would not be reflected in a production environment without some manual work, which is always prone to error.
In order to avoid this, I went on the hunt for a migration management tool.

## Alembic

I came across a tool called Alembic. 
It appears to be the standard choice for handling database migrations in Python, like the .Net Entity Framework might be for C#.
Unfortunately, the app was using raw SQL with `pymysql`, the low-level database driver for MySQL databases.
We'd be missing out on half of Alembic's functionality if we stuck with what we had.
Thankfully, we had a single file with all the database queries written in raw SQL and there wasn't that many.
So we decided to tweak our approach to database logic early.

## SQLAlchemy

Alembic is designed to use SQLAlchemy under the hood to achieve things like automatic migration generation.
Based on minimal internet browsing, SQLAlchemy appears to be the de facto option for Python database work, which makes sense given the Alembic integration.
As such I had us adopt and migrate our codebase to it.

SQLAlchemy has 2 usage patterns: 

### Core

The first component, "Core", is a SQL wrapper of sorts where queries look like:

```
with engine.connect() as conn:
    result = conn.execute(text("SELECT x, y FROM some_table WHERE y > :y"), {"y": 2})
    for row in result:
        print(f"x: {row.x}  y: {row.y}")
```

Very simple, we just execute raw SQL with some fancy parameter insertion done for us.

### ORM

The ORM portion (what we're using at my new company) allows us to specify almost everything in a Pythonic manner such as our schema:

```
from typing import Optional
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

class User(Base):
    __tablename__ = "user_account"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    fullname: Mapped[Optional[str]]
    def __repr__(self) -> str:
        return f"User(id={self.id!r}, name={self.name!r}, fullname={self.fullname!r})"
```

and our queries:

```
from sqlalchemy import select
stmt = select(User).where(User.name == "spongebob")
with Session(engine) as session:
    for row in session.execute(stmt):
        print(row) # (User(id=1, name='spongebob', fullname='Spongebob Squarepants'),)
```

While I enjoy raw SQL, this seamless, Pythonic way of interacting with the database is a joy to work with.

We opted for the ORM option since it allowed us to declaratively write our database schema and have Alembic automatically generate migrations when we changed it.

## LLMs Make Us FAST

As with almost all software engineers nowadays, rewriting our queries was a breeze.
Simply do a little prompt tweaking with a sample database query:

> Hey ChatGPT! Could you pretty please translate this SQL query into SQLAlchemy ORM language for me. Please and thank you. You're the best btw ;)

Then feed it the rest of the file and copy pasta into your code...

Lastly, test it? Then again, LLMs are always right so maybe there's no need to waste more time 😂💀.

To be fair it worked quite well. Only some minor tweaks required to tidy up after ChatGPT.

## Where's the "But"?

Here's the thing, LLMs are great for things that don't change.

> Hey ChatGPT, old chum! Could you please explain to me why the sky is blue?

This is a great prompt. Unless physics is upturned tomorrow, the LLM will be correct in its answer.

Code on the other hand, boy does that change FAST.

## AI is Only as Good as its Dataset

As it turns out, SQLAlchemy had a major release sometime between when ChatGPT 3.5 was trained and when I asked it to translate my SQL queries.

Everything it wrote was out of date by a mile. The only reason it worked is because the SQLAlchemy team managed to maintain near perfect backwards compatibility. Unfortunately "near" is not enough.

Recently, I went to the up-to-date docs to write a specific type of query (I needed some weird join syntax).
Lo and behold, I found my copy pasta'd example spitting errors back at me.

I trawled through stack traces for hours trying to find where I'd screwed up.

I also searched the docs but half the time, Google brings up the outdated docs too! I guess it's an age old problem 🤷‍♂️.

Finally I found it, the docs for creating a schema. Was it completely different to the old way? No. But was it using a completely different function to create relationships? Yes, yes it was.

## Conclusion

In the end, I don't know how much time the LLM saved me.
It did speed up the initial implementation by a huge factor, I have no doubt about that.
However, the time I had to spend debugging and then manually updating the schema code? 
Likely about the same as if I had just checked the docs in the first place.

That said, perhaps if I had more closely validated what the LLM was spitting out... Perhaps cross referencing the docs and actually understanding the code that I was writing...

Nah, AI go brrrr.
