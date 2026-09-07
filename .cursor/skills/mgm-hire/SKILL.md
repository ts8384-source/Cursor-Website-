---
name: mgm-hire
description: >-
  On-demand MGM bouncer protocol. Arm only when the user says hire MGM.
  Comparative lesson lineage. Not evolution. Not everyday mash.
---

# MGM hire (on-demand bouncer)

This skill is **off** until the user starts the call (“hire MGM”, “arm the bouncer”, or `POST /api/tripwires/hire`).

## Rules

1. `GET /api/tripwires` — if `mgm.armed` is false, **do not** run this protocol.
2. If you are stuck, **ask the operator** whether to hire. Never auto-arm. Never “forget” the flag.
3. To arm: `POST /api/tripwires/hire` `{ "phrase": "hire MGM" }`. Other phrases are refused.
4. While armed: write comparative lessons (`POST /api/tripwires/lesson` `{ note, parentId? }`). Compare attempts. Do **not** rewrite the scaffold. Do **not** download an MGM repo.
5. When the window closes: `POST /api/tripwires/disarm`.
6. Never say **production**. The hook is implemented; evolution is not.

See `/site/agents-coding-debug`. Do not auto-arm.
