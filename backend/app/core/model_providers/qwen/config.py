from langchain_openai import ChatOpenAI

PROVIDER_CONFIG = {
    "provider_name": "Qwen",
    "base_url": "fakeurl",
    "api_key": "fakeapikey",
    "icon": "qwen_icon",
    "description": "qwen  API provider",
}

SUPPORTED_MODELS = [
    "Qwen2-7B-Instruct",
    "Qwen2.5-70B",
]


def init_model(model: str, temperature: float, **kwargs):
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        openai_api_key=PROVIDER_CONFIG["api_key"],
        openai_api_base=PROVIDER_CONFIG["base_url"],
        **kwargs
    )
