"""Split TMDb watch-provider data into subscription vs rent/buy lists.
TMDb groups providers under flatrate (subscription), rent, and buy."""
from __future__ import annotations


def split_providers(provider_block: dict | None) -> tuple[list[str], list[str]]:
    """Return (streaming_on, rent_buy_on) provider name lists for one region block."""
    if not provider_block:
        return [], []
    streaming = [p["provider_name"] for p in provider_block.get("flatrate", []) if p.get("provider_name")]
    rent_buy_names: list[str] = []
    seen: set[str] = set()
    for key in ("rent", "buy"):
        for p in provider_block.get(key, []):
            name = p.get("provider_name")
            if name and name not in seen:
                seen.add(name)
                rent_buy_names.append(name)
    return streaming, rent_buy_names
