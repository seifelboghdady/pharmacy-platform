"""
Rolling-origin (walk-forward) time-series cross-validation utilities.

MENTOR FEEDBACK THIS FILE IMPLEMENTS
-------------------------------------
"2-way train\\test split is inadequate. It's meant for large datasets.
What if the 30 days is unusually quiet or heavy promotion? -> inductive
reasoning with unverified step."

  A single train/test split gives you exactly ONE 30-day test sample.
  Concluding "the model is X% accurate" from that one sample is inductive
  reasoning on an unverified data point: if that particular 30-day window
  happened to be unusually quiet, or sat inside a heavy promotion, the
  result tells you about that window, not about the model in general.

"Comparison of models should implement Nested Cross-validation (CV) ->
TimeSeriesSplit or sklearn / train and test over multiple 30-Day folds,
or rolling origin or sliding window."

  The fix used throughout this project:
    OUTER loop  -> rolling_origin_folds() below: several non-overlapping
                   30-day test windows walked backward through history, so
                   the reported error is an AVERAGE over multiple different
                   conditions (quiet weeks, promo weeks, holiday weeks...).
    INNER loop  -> inner_time_series_splits() below: sklearn's
                   TimeSeriesSplit, used ONLY on the training portion of
                   each outer fold to tune hyperparameters. The outer
                   fold's test window is never touched by the tuning step,
                   which is what makes this genuinely "nested" CV instead
                   of just re-using the same data for tuning and scoring.
"""
from typing import List, Tuple

import pandas as pd
from sklearn.model_selection import TimeSeriesSplit


def rolling_origin_folds(
    dates: pd.Series,
    n_folds: int = 5,
    test_size_days: int = 30,
    min_train_days: int = 180,
) -> List[Tuple[pd.Timestamp, pd.Timestamp, pd.Timestamp]]:
    """
    Build multiple non-overlapping 30-day (default) test windows, walking
    backward from the most recent date in `dates`. Each fold's test window
    sits at a different point in history instead of relying on a single
    arbitrary 30-day sample.

    Returns a list of (train_end, test_start, test_end) tuples, OLDEST
    fold first, so callers can iterate in chronological order. A fold is
    only included if there is at least `min_train_days` of history before
    it to train on.
    """
    max_date = pd.Timestamp(dates.max())
    min_date = pd.Timestamp(dates.min())

    folds = []
    for i in range(n_folds):
        test_end = max_date - pd.Timedelta(days=i * test_size_days)
        test_start = test_end - pd.Timedelta(days=test_size_days - 1)
        train_end = test_start - pd.Timedelta(days=1)
        if (train_end - min_date) < pd.Timedelta(days=min_train_days):
            break
        folds.append((train_end, test_start, test_end))

    return list(reversed(folds))


def inner_time_series_splits(n_splits: int = 3) -> TimeSeriesSplit:
    """
    Inner-loop splitter for nested CV hyperparameter tuning. Applied only
    to the TRAINING portion of a single outer fold (see module docstring).
    """
    return TimeSeriesSplit(n_splits=n_splits)
