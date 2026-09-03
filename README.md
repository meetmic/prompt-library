# MeetMic prompt library

Ready-made prompts for [MeetMic](https://meetmic.app): meeting summaries
shaped for a role or a workflow, and dictation modes. Browse them at
[meetmic.app/prompts](https://meetmic.app/prompts), where every card adds
the prompt to MeetMic with one click.

The website reads `index.json` from this repository. Merge to `main` and the
site picks it up within the hour, no deploy needed.

## Adding or editing a prompt

One file per prompt in `prompts/<slug>.md`:

```markdown
---
title: Decision brief                 # the prompt's name in the app (max 200 chars)
tagline: Everything you need to act on, nothing you don't.
type: summary                         # summary | dictation
audience: Founders & executives       # optional, shown on the card
roles: [founders, venture-capital]    # ids from roles.json; who this is for
icon: flag.fill                       # one of the app's preset icons (see scripts/build-index.mjs)
iconColor: orange                     # blue purple pink red orange green mint teal cyan indigo brown
order: 10                             # display order, lower first
source: original                      # attribution
---
The prompt, verbatim. This is what lands in the app.
```

Then:

```bash
npm install
npm run build      # validates every prompt and rewrites index.json
```

Commit `index.json` with your change; CI fails if it is stale.

### Writing rules

- **Instructions only.** Do not end with `Transcript: {{transcript}}` or
  `Text: {{text}}`. MeetMic appends the transcript to a summary prompt and
  wraps your dictation in its own `<DICTATION>` block. There is no
  placeholder substitution: `{{name}}` reaches the model as literal text.
- **Summary prompts** keep three guardrails: use only what is in the
  transcript, write "Not discussed" rather than invent, output Markdown with
  no preamble.
- **Dictation prompts** state that the speaker is never talking to the
  model - questions in the dictation are content, not requests.
- No em dashes in the title, tagline or audience (house style). Inside the
  prompt body, anything goes.
- The whole payload (title + body + icon + colour as JSON) must be under
  16 KB. The build enforces it.

## Not (yet) here

Prompts for lawyers, clinicians and therapists are drafted but held back
until a practitioner has reviewed them. Open an issue if you can help.

## Licence

CC0. Take the prompts anywhere. See `LICENSE` for the MIT attributions.
