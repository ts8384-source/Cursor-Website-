# rag/cli.py

from __future__ import annotations

import argparse
import json
import sys

from rag import DOMAIN, GROUNDS
from rag.ask import latest_site, run_ask
from rag.ingest import ingest_all_local
from rag.retrieve import lookup_idea, rebuild_all_grounds


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Hybrid RAG CLI (Chroma + BM25 + RRF)")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("seed", help="Ingest architecture + handbook + drop folders")
    p_r = sub.add_parser("rebuild", help="Rebuild isolated indexes")
    p_r.add_argument("--grounds", nargs="+", help="Limit to these grounds (default: all)")
    sub.add_parser("site", help="Print latest article + diagram JSON")

    p_s = sub.add_parser("search", help="Per-ground retrieve, labeled merge")
    p_s.add_argument("--query", required=True)
    p_s.add_argument("--k", type=int, default=6)

    p_a = sub.add_parser("ask", help="Ingest scribble, retrieve, write md + diagram")
    p_a.add_argument("--query", default="")
    p_a.add_argument("--rebuild", action="store_true")

    args = p.parse_args(argv)
    if args.cmd == "seed":
        print(json.dumps(ingest_all_local(DOMAIN), indent=2))
        return 0
    if args.cmd == "rebuild":
        grounds = tuple(args.grounds) if args.grounds else GROUNDS
        print(json.dumps(rebuild_all_grounds(DOMAIN, grounds), indent=2))
        return 0
    if args.cmd == "search":
        print(json.dumps(lookup_idea(args.query, domain=DOMAIN, grounds=GROUNDS, k=args.k), indent=2))
        return 0
    if args.cmd == "ask":
        print(json.dumps(run_ask(args.query or None, rebuild=args.rebuild), indent=2))
        return 0
    if args.cmd == "site":
        print(json.dumps(latest_site(), indent=2))
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
