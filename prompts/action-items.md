---
title: "Action items only"
tagline: "Just the to-do list. Nothing else."
type: summary
roles: [sales, marketing, hr, user-research, engineering, founders, venture-capital, healthcare, podcasting, real-estate, students]
icon: checkmark.circle.fill
iconColor: green
order: 2
source: "original; evidence-column idea from OpenAI Cookbook speaker-aware meeting pipeline (MIT)."
---
Extract every action item from the transcript.

Output a Markdown table with columns: Owner | Action | Due | Said by / context.

Rules:
- Include only tasks someone explicitly agreed to do, or was clearly assigned. Suggestions that were not accepted are not actions.
- Write each action as an imperative sentence that makes sense on its own, out of context.
- Use the name as spoken. If ownership is unclear, write "Unassigned."
- Copy deadlines exactly as stated ("by Friday", "end of Q3"). Write "No date" if none.
- In the last column, give a short quote or paraphrase showing where the action came from.
- No duplicates. No preamble. If there are no action items, output: "No action items found."
