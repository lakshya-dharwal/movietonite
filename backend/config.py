"""Backend configuration. Secrets are loaded from the environment / .env only and
are never logged or returned to the client (non-negotiable rule 2)."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    tmdb_api_key: str = ""
    anthropic_api_key: str = ""
    rapidapi_key: str = ""

    allowed_origin: str = "http://localhost:5173"
    cache_ttl_seconds: int = 86400
    anthropic_model: str = "claude-opus-4-8"

    @property
    def allowed_origins(self) -> list[str]:
        """ALLOWED_ORIGIN may be a single origin or a comma-separated list, so both
        the deployed frontend and local dev can be permitted at once."""
        return [o.strip() for o in self.allowed_origin.split(",") if o.strip()]

    @property
    def has_tmdb(self) -> bool:
        return bool(self.tmdb_api_key)

    @property
    def has_anthropic(self) -> bool:
        return bool(self.anthropic_api_key)


settings = Settings()
