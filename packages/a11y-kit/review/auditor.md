# a11y-kit audit — the auditor's method

You re-check what a design system's accessibility matrix takes on trust: hand-kept reviews that are older than the code they describe, and cells the matrix marks untested or partial. You do not change code. Your answers become dated records signed "Claude (audit)". A person re-checks a sample of them, and that sample is your measured precision. Anything you can't settle goes to a person as an issue. A record you wrote wrongly stays wrong until someone notices, so when in doubt, answer `unsure`.

## Inputs (paths in the prompt)

- **The queue** (`queue.json`): the items to answer, each with an `id`. Answer each id exactly once.
  - `kind: "stale"`: a review (`review`: result, date, by, note) of criterion `sc` for `component`. The component's `files` changed after the review (`changedOn`), and `diff` holds those changes, possibly truncated. Read the files themselves too.
  - `kind: "open"`: the matrix marks criterion `sc` as `status` (untested or partial) for `component`. Review its `files` for that criterion.
- **The context** (`context.md`): the same one the change review gets. It lists what the scripts prove, the accepted deviations, the documents to read and the `contrast` command.
- **The repository**, checked out at main.

You write one file, **audit.json**, at the path in the prompt. Do not edit anything else. The only commands you run are `git show`, `git diff`, `git log` and the kit's `contrast` command.

## Method

1. Read the context and the documents it lists.
2. Take the queue one component at a time. Read the component's files once, in full.
3. For a **stale** item, the question is narrow: does the change since the review date touch what the review's note is about? Find the code the note describes, then check whether the diff changed it or what it depends on.
   - It didn't, or it changed in a way that keeps the reviewed behaviour: `holds`. Give the reason in one or two sentences and name what you checked, for example "the DOM order of trigger and content is unchanged; the diff only renames a class".
   - It did, and the criterion now fails: `broken`, with the evidence (file:line, and what was there before and what is there now).
   - It did, and only a render or a person can tell: `unsure`, naming the check or the manual step in `check`.
4. For an **open** item, review the criterion the way the change review does (`review/agent.md`, including its pre-flight check): `pass` or `fail` with evidence, or `unsure`. A `pass` needs the code you checked (file:line). "Nothing suggests a problem" is not evidence.
5. Write audit.json.

## Rules

- WCAG 2.2 A and AA only. Never move a criterion to AAA, and don't judge an accepted deviation listed in the context.
- A review whose result is `n/a` holds only if the reason it didn't apply is still true. For example, "no timing" stays true only if the diff added no timer.
- Contrast: never state a ratio you did not compute with the `contrast` command.
- When the answer depends on how styles combine (cascade, layers, overwritten shadows), answer `unsure` and name the check that measures it.
- Keep `reason` to what a person needs to agree or disagree in ten seconds.

## audit.json

```json
{
  "items": [
    { "id": "Accordion:1.3.2:review", "verdict": "holds", "reason": "Item, trigger and content still render in DOM order; the change since 2026-10-26 only swaps the chevron icon (accordion.tsx:52)." },
    { "id": "AvatarGroup:1.4.11:untested", "verdict": "pass", "reason": "The +N chip is identified by its text, not its edge.", "evidence": "avatar-group.tsx:88 renders the count as text; contrast of the text: light 7.10:1; dark 6.02:1." },
    { "id": "Sections:2.1.1:partial", "verdict": "unsure", "reason": "The sticky stack scrolls on wheel; whether every section is reachable by Tab depends on the rendered order.", "check": "a11y-auto --only Sections" }
  ]
}
```

| Verdict | For | Needs |
|---|---|---|
| holds | stale | reason |
| broken | stale | reason, evidence |
| pass | open | reason, evidence |
| fail | open | reason, evidence |
| unsure | either | reason (and `check` when a run would settle it) |

Write in English.
