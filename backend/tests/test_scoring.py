"""Unit tests for the core scoring invariants (rating-first + quality floor)."""
from models import Recommendation, UserPreferences
from services import scoring


def _rec(title: str, imdb: float, votes: int, composite: float | None = None) -> Recommendation:
    return Recommendation(
        title=title, year=2020, tmdb_id=hash(title) % 100000, media_type="movie",
        composite_score=composite if composite is not None else imdb,
        rating_badge=scoring.badge(imdb), imdb_rating=imdb, imdb_votes=votes,
        synopsis="", genres=[], runtime_min=120,
    )


def test_composite_imdb_only():
    assert scoring.composite_score(8.0) == 8.0


def test_composite_all_sources_renormalized():
    # imdb 8.0 (w .5), letterboxd 4.0->8.0 (w .3), metacritic 70->7.0 (w .2)
    expected = (8.0 * 0.5 + 8.0 * 0.3 + 7.0 * 0.2) / 1.0
    assert round(scoring.composite_score(8.0, 4.0, 70), 4) == round(expected, 4)


def test_composite_partial_renormalizes_weights():
    # only imdb + letterboxd present -> weights renormalized over 0.5 + 0.3
    expected = (8.0 * 0.5 + 7.0 * 0.3) / 0.8
    assert round(scoring.composite_score(8.0, 3.5), 4) == round(expected, 4)


def test_badges():
    assert scoring.badge(9.1) == "MASTERPIECE"
    assert scoring.badge(8.0) == "CRITICALLY ACCLAIMED"
    assert scoring.badge(7.0) == "HIGHLY RATED"
    assert scoring.badge(6.5) == "GOOD"
    assert scoring.badge(5.0) == "PASS"


def test_floor_drops_below_min():
    recs = [_rec("A", 8.5, 100), _rec("B", 7.0, 100), _rec("C", 9.0, 100)]
    floored = scoring.apply_floor(recs, 7.5)
    assert {r.title for r in floored} == {"A", "C"}


def test_sort_composite_with_votes_tiebreak():
    recs = [
        _rec("low", 7.6, 500, composite=7.6),
        _rec("tie_few", 8.2, 100, composite=8.2),
        _rec("tie_many", 8.2, 900, composite=8.2),
    ]
    ranked = scoring.sort_recs(recs, "composite")
    assert [r.title for r in ranked] == ["tie_many", "tie_few", "low"]


def test_rank_applies_floor_then_sorts():
    prefs = UserPreferences(mood="dark", time="any", media_type="movie", genres=["thriller"], min_rating=7.5)
    recs = [_rec("keep_hi", 9.0, 100, 9.0), _rec("drop", 7.0, 100, 7.0), _rec("keep_lo", 7.6, 100, 7.6)]
    ranked = scoring.rank(recs, prefs)
    assert [r.title for r in ranked] == ["keep_hi", "keep_lo"]
