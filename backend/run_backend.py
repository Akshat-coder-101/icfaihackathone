"""
NagaQuest Python Backend Runner
Executes the FastAPI server using uvicorn.
"""
import sys
import os

# Set UTF-8 encoding for stdout on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import uvicorn

if __name__ == "__main__":
    print("=================================================================")
    print("Starting NagaQuest Python Backend on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=================================================================")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
