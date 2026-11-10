# Reveal Codes Sentinel

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

## What it does

Reveal Codes Sentinel is a Kiro Crew app that re-checks court filings exported by [Reveal Codes](https://github.com/gowtham0992/reveal-codes) every night and turns the result into a plain-language notice. It reports six kinds of finding: body edited, citation changed, quote changed, override no longer needed, recheck unavailable, and unreadable. A filing with none of these is reported as no drift.

## How it works

When you enable the app it clones the Reveal Codes repository into `vendor/` and pins it to one commit, installing only the packages the sweep needs. The sweep CLI (`pnpm sentinel sweep <dir> --json <file>`) reads the Provenance Appendix in each exported .docx and re-verifies every citation and quotation against CourtListener. The `sentinel` agent runs that command over the folder named in `data/config.json`, then uses the `sentinel-report` skill to write the notice from the Markdown report. The `nightly-sweep` job runs the agent at 06:00 every day; it is registered paused, so nothing runs until you resume it.

## Install

1. Run `kirocrew app install /path/to/reveal-codes-sentinel`, or install from the folder in Library in the desktop app.
2. In Library choose Enable, then "Trust this app and enable". Crew blocks every third-party app until it is trusted. Trust is per app and can be withdrawn in Settings → Security → Third-party apps.
3. Enabling runs `scripts/install.sh`, which clones reveal-codes at the pinned commit into `vendor/` and installs its dependencies. The first enable can take a few minutes.
4. Create the config at `~/.kiro/crew/apps/reveal-codes-sentinel/data/config.json`. Replace the folder with the one that holds your exported filings:

   ```bash
   mkdir -p ~/.kiro/crew/apps/reveal-codes-sentinel/data
   printf '{ "filings": "%s" }\n' "$HOME/Filings" > ~/.kiro/crew/apps/reveal-codes-sentinel/data/config.json
   ```

5. `kirocrew cron list` shows `reveal-codes-sentinel/nightly-sweep` paused. Resume it in Schedule, or run it once with `kirocrew cron trigger <job-id>`.
6. Approvals: in Normal mode the run stops and asks you to approve the sweep command under Notifications. To let the nightly job run unattended, run `kirocrew cron update <job-id> --approval-mode auto`. This approves one thing: the `pnpm ... sentinel sweep` command, which reads the filings folder and writes two report files (`last-sweep.json` and `last-sweep.md`) in the app's `data/` folder.

The cron entry leaves timezone empty, so 06:00 is in the gateway's timezone.

## Live mode

By default the sweep reads recorded CourtListener responses. For live checks, set `COURTLISTENER_TOKEN` in the environment Crew starts from, and leave `REVEAL_CODES_FIXTURES_ONLY` unset. Restart Crew after changing either.

## What a notice looks like

The sweep writes a Markdown report like this:

```markdown
# Sentinel sweep — 2026-11-10 06:00

3 files · 2 with findings · live mode

## motion-to-dismiss.docx

| Finding | Line | Before | After |
| --- | --- | --- | --- |
| Citation changed | 14 | 410 U.S. 113 | 410 U.S. 114 |
| Quote changed | 22 | the right is fundamental | the right is not fundamental |

## reply-brief.docx

| Finding | Line | Before | After |
| --- | --- | --- | --- |
| Recheck unavailable | 9 | 347 U.S. 483 | - |

## notice-of-appearance.docx

No drift.
```

The agent turns it into this notice:

```text
Sentinel: 3 files swept, 2 with findings

motion-to-dismiss.docx: The citation at line 14 no longer resolves as it did: it was "410 U.S. 113" and is now "410 U.S. 114". The quotation at line 22 no longer matches its source. Open the filing in Reveal Codes, run Verify and export again.

reply-brief.docx: The item at line 9 could not be re-checked this time. Try again later.
```

## Limits

- The sweep does not recurse into subfolders.
- Only .docx files are read.
- Files must be Reveal Codes exports. Other .docx files are reported as unreadable.
- In fixtures mode, a citation outside the recorded set reads as not found.
- A job that fires while the Crew gateway is down is missed, not replayed.
- Tested on Kiro Crew 0.12.0 on macOS.

## Fields left out

This app uses only fields documented at kiro.dev/docs/crew. Some things have no documented field, so they are left out:

- No per-job timeout in the manifest cron entry. The job uses Crew's default.
- No typed setting for the filings folder. `setup.configSchema` is `{}`, and the folder is set in `data/config.json`.
- The docs describe `repo` as a repository name; this manifest sets it to the full GitHub URL as the project asked.
- The cron entry leaves timezone empty, so 06:00 is in the gateway's timezone.

Built with Kiro for Kiroween 2026; the sweep itself and its tests live in the reveal-codes repository.
