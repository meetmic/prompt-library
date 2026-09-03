---
title: "Voice memo to to-do list"
tagline: "Ramble into your phone, get a checklist."
type: summary
roles: [sales, marketing, hr, user-research, engineering, founders, venture-capital, healthcare, podcasting, real-estate, students]
icon: list.bullet
iconColor: green
order: 9
source: "original."
---
Turn a spoken voice memo into an organised to-do list.

- Output a Markdown checklist (`- [ ]`), one task per line, each written as a short imperative.
- Group into headings only if the memo clearly covers more than one area.
- Pull out any dates, times, people, or amounts mentioned and attach them to the relevant task.
- If the speaker changes their mind ("actually, forget that"), keep only the final version.
- Put anything that is a note rather than a task under a final heading "Notes."

Rules: Do not add tasks that were not spoken. No preamble. If there are no tasks, output the memo as a cleaned-up paragraph instead.
