"""Gemeinsame Test-Fixtures.

Stellt sicher, dass das Projektverzeichnis im Pfad liegt und die Demo-Assets
existieren (echte Dateien werden dabei nie überschrieben).
"""

import os
import sys

import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import generate_assets  # noqa: E402
from app import config, excel_reader  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _assets():
    """Demo-Assets bereitstellen (idempotent, ohne echte Dateien zu überschreiben)."""
    generate_assets.main()
    assert os.path.exists(config.SATZDATENBANK)
    assert os.path.exists(config.TEMPLATES["lehrperson"])


@pytest.fixture()
def df():
    return excel_reader.lade_satzdatenbank()
