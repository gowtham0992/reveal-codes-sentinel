# Reveal Codes Sentinel

This repository is a Kiro Crew app that schedules and reports the Reveal Codes sentinel sweep over exported .docx filings.
The sweep itself lives in https://github.com/gowtham0992/reveal-codes and is vendored at install time.
Rule: use only fields documented at kiro.dev/docs/crew (apps, manifest, capabilities/agents, features/cron).
If a field you want is not documented, leave it out and say so in the README.
Copy rule: plain prose, no emoji, no exclamation marks, no marketing language.
Notices never summarise a filing's contents.
vendor/ and data/ are never committed; vendor/ is created by scripts/install.sh.
The vendored commit is pinned in scripts/install.sh and changes only on purpose.
Run node --test "test/*.test.mjs" and bash -n scripts/install.sh before every commit.
Do not install or run Crew from a coding session; the owner installs the app.
