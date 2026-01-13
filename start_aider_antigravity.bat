@echo off
REM Start Aider with Antigravity Proxy configuration

REM Set API Base to Antigravity Primary (8317) or Load Balancer (8319)
set OPENAI_API_BASE=http://localhost:8317/v1
set OPENAI_API_KEY=antigravity

REM Default model
set MODEL=openai/gemini-2.5-flash

echo Starting Aider with Antigravity...
echo API Base: %OPENAI_API_BASE%
echo Model: %MODEL%
echo Metadata File: aider_model_metadata.json

aider --model %MODEL% --model-metadata-file aider_model_metadata.json %*
