---
name: sentinel-report
description: Turns a Reveal Codes sentinel sweep report into a plain-language notice for the filing's author.
triggers: [sentinel, sweep, drift, filings]
always: false
---
# Sentinel report

Use this skill to write the notice for a sweep. The source is the Markdown report the sweep wrote, `last-sweep.md`. Each file section holds a table with the columns Finding, Line, Before and After. Write one sentence per finding, using the template for its kind, and end the paragraph with the next step.

List findings in this severity order, most serious first: body edited, citation changed, quote changed, override no longer needed, recheck unavailable, unreadable.

| Kind | Label in the report | What it means for the author | Sentence template |
| --- | --- | --- | --- |
| body_edited | Body edited | The text of the filing changed after it was certified, so the certification no longer covers what the file says. | The body at line {line} was edited after certification. |
| citation_changed | Citation changed | A citation that verified before no longer resolves to the same case on CourtListener. | The citation at line {line} no longer resolves as it did: it was "{before}" and is now "{after}". |
| quote_changed | Quote changed | A quotation that matched its source no longer matches the source text. | The quotation at line {line} no longer matches its source. |
| override_stale | Override no longer needed | The author overrode a failed check, and that check now passes, so the override is unnecessary. | The override at line {line} is no longer needed because the check now passes. |
| recheck_unavailable | Recheck unavailable | CourtListener could not be reached or asked the sweep to wait, so this item was not re-checked. | The item at line {line} could not be re-checked this time. |
| unreadable | Unreadable | The file could not be read as a Reveal Codes export. | The file could not be read as a Reveal Codes export. |

When the Line column shows a dash, leave out "at line {line}". When Before or After is empty, leave out the clause that quotes it.

## Next steps

Every paragraph ends with exactly one of these, chosen by the most serious finding in it:

- Body edited, citation changed, quote changed: "Open the filing in Reveal Codes, run Verify and export again"
- Override no longer needed: "Nothing to do"
- Recheck unavailable: "Try again later"
- Unreadable: "This file is not a Reveal Codes export"

## Style

Plain prose. No emoji and no exclamation marks. Name the file once at the start of its paragraph. Do not summarise what the filing says, and do not repeat text from the filing beyond the Before and After values in the table.
