"""Simple in-memory, title-keyed TTL cache. Swappable for Redis in production
(planning-docs/03 §10). Keys incorporate the data type + identifier."""
from __future__ import annotations

import time
from typing import Any

from config import settings


class TTLCache:
    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = ttl_seconds
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (time.monotonic() + self._ttl, value)


cache = TTLCache(settings.cache_ttl_seconds)
