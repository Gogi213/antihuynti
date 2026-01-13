#!/bin/bash
# Start Aider with Antigravity Proxy configuration for Git Bash

# Set API Base to Antigravity Primary (8317)
export OPENAI_API_BASE="http://localhost:8317/v1"
export OPENAI_API_KEY="antigravity"

# Default model
MODEL="openai/gemini-2.5-flash"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting Aider with Antigravity..."
echo "API Base: $OPENAI_API_BASE"
echo "Model: $MODEL"

aider --model "$MODEL" --model-metadata-file "$SCRIPT_DIR/aider_model_metadata.json" "$@"

