
#!/usr/bin/env bash
set -euo pipefail
# export OWM_API_KEY=YOUR_KEY  # or set in config.py
uvicorn serve_api:app --host 0.0.0.0 --port 8000
