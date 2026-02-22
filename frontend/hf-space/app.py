"""
KodBank AI - Hugging Face Space
================================
Deploy this file to a Hugging Face Space (Gradio SDK).
This Space runs DeepSeek model and exposes an API for your KodBank app.

Steps to deploy:
  1. Go to https://huggingface.co → Spaces → Create new Space
  2. Name it: kodbank-ai
  3. SDK: Gradio
  4. Hardware: CPU Basic (free)
  5. Upload this file as app.py + requirements.txt
  6. Your API URL will be: https://YOUR-USERNAME-kodbank-ai.hf.space/api/chat
"""

import gradio as gr
from huggingface_hub import InferenceClient

# ── Model Configuration ──────────────────────────────────────────────────
# Using DeepSeek R1 Distill - free to run on HF CPU
# You can change to any HF chat model
MODEL_ID = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"

# Fallback model (smaller, faster on CPU)
FALLBACK_MODEL = "HuggingFaceH4/zephyr-7b-beta"

client = InferenceClient(MODEL_ID)

# ── System Prompt ────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are the KodBank AI Assistant, a helpful and knowledgeable 
financial advisor integrated into the KodBank banking application.

Your responsibilities:
- Answer questions about banking, finance, savings, investments, and budgeting
- Provide financial advice tailored to the user's queries
- Help users understand banking products, interest rates, credit scores, and loans
- Explain fund transfers, bill payments, and account management
- Be concise, professional, yet friendly
- Use ₹ (Indian Rupee) for currency examples

Always respond in a helpful, clear, and structured manner."""


# ── Chat Function ─────────────────────────────────────────────────────────
def chat(message: str, history: list, username: str = "User") -> str:
    """
    Main chat function - takes a message and history, returns AI reply.
    This is also exposed as an API endpoint by Gradio automatically.
    """
    if not message.strip():
        return "Please ask me something!"

    # Build messages array
    messages = [{"role": "system", "content": SYSTEM_PROMPT.replace("User", username or "User")}]

    # Add conversation history
    for user_msg, ai_msg in history:
        if user_msg:
            messages.append({"role": "user", "content": user_msg})
        if ai_msg:
            messages.append({"role": "assistant", "content": ai_msg})

    # Add current user message
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat_completion(
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=0.95,
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}. Please try again."


# ── Gradio Interface ─────────────────────────────────────────────────────
with gr.Blocks(
    title="KodBank AI Assistant",
    theme=gr.themes.Soft(
        primary_hue="blue",
        secondary_hue="slate",
    ),
    css="""
    .gradio-container { max-width: 800px; margin: auto; }
    .chat-message { border-radius: 12px; }
    footer { display: none !important; }
    """
) as demo:

    gr.Markdown("""
    # 🤖 KodBank AI Assistant
    **Powered by DeepSeek** · Your personal banking & finance advisor
    ---
    """)

    chatbot = gr.Chatbot(
        label="KodBank AI",
        height=500,
        bubble_full_width=False,
        avatar_images=["👤", "🤖"],
        show_label=True,
    )

    with gr.Row():
        msg_box = gr.Textbox(
            placeholder="Ask me anything about banking, finance, savings or investments…",
            show_label=False,
            scale=9,
            container=False,
        )
        send_btn = gr.Button("Send ➤", scale=1, variant="primary")

    username_box = gr.Textbox(
        value="User",
        label="Your Name (optional)",
        scale=1,
        visible=False,
    )

    clear_btn = gr.Button("🗑 Clear Chat", variant="secondary", size="sm")

    gr.Examples(
        examples=[
            "How can I save more money each month?",
            "Explain how bank interest works",
            "How do I improve my credit score?",
            "Give me a monthly budget plan for ₹50,000 salary",
            "What is the safest way to invest my savings?",
        ],
        inputs=msg_box,
        label="💡 Try these questions",
    )

    # ── Event Handlers ─────────────────────────────────────────────────
    def respond(message, chat_history, username):
        if not message.strip():
            return chat_history, ""
        reply = chat(message, chat_history, username)
        chat_history.append((message, reply))
        return chat_history, ""

    send_btn.click(
        respond,
        inputs=[msg_box, chatbot, username_box],
        outputs=[chatbot, msg_box],
    )

    msg_box.submit(
        respond,
        inputs=[msg_box, chatbot, username_box],
        outputs=[chatbot, msg_box],
    )

    clear_btn.click(lambda: ([], ""), outputs=[chatbot, msg_box])

# ── Launch ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
