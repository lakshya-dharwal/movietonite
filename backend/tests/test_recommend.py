"""Contract tests for /health and /recommend with Claude + TMDb mocked, so the
pipeline (candidates -> enrich -> score -> floor -> sort) is exercised offline."""
import pytest
from fastapi.testclient import TestClient

import clients.claude as claude_mod
import clients.tmdb as tmdb_mod
from main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_recommend_validation_error():
    # missing required fields -> envelope with VALIDATION_ERROR
    resp = client.post("/recommend", json={"mood": "dark"})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


@pytest.fixture
def mock_pipeline(monkeypatch):
    async def fake_select_titles(prefs):
        return [
            {"title": "Great Film", "year": 2013, "media_type": "movie"},
            {"title": "Mediocre Film", "year": 2015, "media_type": "movie"},
            {"title": "Best Film", "year": 2019, "media_type": "movie"},
        ]

    fake_db = {
        "Great Film": {"rating": 8.2, "votes": 500_000, "id": 1},
        "Mediocre Film": {"rating": 6.9, "votes": 100_000, "id": 2},  # below floor
        "Best Film": {"rating": 8.9, "votes": 200_000, "id": 3},
    }

    async def fake_enrich(http_client, title, year, media_type, region="US"):
        row = fake_db.get(title)
        if row is None:
            return None
        return {
            "tmdb_id": row["id"], "media_type": "movie", "title": title, "year": year or 2020,
            "synopsis": f"Synopsis for {title}.", "imdb_rating": row["rating"], "imdb_votes": row["votes"],
            "genres": ["Thriller"], "runtime_min": 130, "language": "en", "director": "A Director",
            "cast": ["Actor One"], "streaming_on": ["Netflix"], "rent_buy_on": ["Apple TV"],
            "poster_url": "https://image.tmdb.org/t/p/w500/x.jpg", "backdrop_url": None, "budget": 1,
        }

    async def fake_conviction(prefs, summary):
        return {"convince_you": "It's proven.", "why_youll_love_it": "Matches your taste."}

    monkeypatch.setattr(claude_mod, "select_titles", fake_select_titles)
    monkeypatch.setattr("services.recommend.claude.select_titles", fake_select_titles)
    monkeypatch.setattr("services.recommend.claude.write_conviction", fake_conviction)
    monkeypatch.setattr("services.recommend.tmdb.enrich", fake_enrich)
    monkeypatch.setattr(tmdb_mod, "enrich", fake_enrich)


def test_recommend_returns_ranked_and_floored(mock_pipeline):
    body = {
        "mood": "dark", "time": "2h+", "media_type": "movie", "genres": ["thriller"],
        "min_rating": 7.5, "sort_by": "composite",
    }
    resp = client.post("/recommend", json=body)
    assert resp.status_code == 200
    results = resp.json()["results"]

    titles = [r["title"] for r in results]
    assert "Mediocre Film" not in titles            # floor removed the 6.9
    assert titles == ["Best Film", "Great Film"]     # best composite first
    top = results[0]
    assert top["rating_badge"] == "CRITICALLY ACCLAIMED"
    assert top["convince_you"]                        # conviction text present
    assert top["streaming_on"] == ["Netflix"]
