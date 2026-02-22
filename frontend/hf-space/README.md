---
title: KodBank AI Assistant
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: "4.44.0"
app_file: app.py
pinned: false
license: mit
short_description: KodBank financial AI assistant powered by DeepSeek
---

# 🤖 KodBank AI Assistant

A financial AI assistant for the KodBank banking application.

## Model
- **DeepSeek-R1-Distill-Qwen-1.5B** (free, runs on CPU)

## Using the API
This Space exposes a Gradio API. Your KodBank backend calls:
```
POST https://YOUR-USERNAME-kodbank-ai.hf.space/api/predict
```
