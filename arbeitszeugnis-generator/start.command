#!/bin/bash
# Doppelklick-Starter für macOS.
# Legt beim ersten Mal eine venv an, installiert die Abhängigkeiten und startet
# die App. Alles läuft lokal – keine Cloud, keine externe API.

set -e

# In das Verzeichnis dieses Skripts wechseln (funktioniert auch per Doppelklick).
cd "$(dirname "$0")"

PYTHON_BIN="${PYTHON_BIN:-python3}"

# Auf den Streamlit-Entrypoint prüfen, NICHT nur auf das venv-Verzeichnis:
# bricht die Erstinstallation ab (z. B. Netzwerkfehler), bliebe sonst ein
# halbfertiges .venv zurück und der Start würde dauerhaft fehlschlagen.
if [ ! -x ".venv/bin/streamlit" ]; then
  echo "Erstinstallation – das dauert ein bis zwei Minuten ..."
  "$PYTHON_BIN" -m venv .venv
  ./.venv/bin/python -m pip install --upgrade pip >/dev/null 2>&1 || true
  if ! ./.venv/bin/python -m pip install -r requirements.txt; then
    echo "Installation fehlgeschlagen. Bitte dieses Fenster schliessen und"
    echo "start.command erneut starten (Internetverbindung prüfen)."
    rm -rf .venv
    exit 1
  fi
fi

# Erstabfrage nach der E-Mail unterdrücken (lokaler Fix, falls noch nicht gesetzt).
mkdir -p "$HOME/.streamlit"
if [ ! -f "$HOME/.streamlit/credentials.toml" ]; then
  printf '[general]\nemail = ""\n' > "$HOME/.streamlit/credentials.toml"
fi

# Demo-Assets bereitstellen, falls noch keine (echten) Dateien vorhanden sind.
./.venv/bin/python generate_assets.py || true

URL="http://localhost:8501"

# Browser etwas verzögert öffnen, sobald der Server hochgefahren ist.
( sleep 3; open "$URL" >/dev/null 2>&1 || true ) &

echo "App startet unter $URL  (zum Beenden dieses Fenster schliessen)."
exec ./.venv/bin/python -m streamlit run app/main.py \
  --server.headless true \
  --browser.gatherUsageStats false
