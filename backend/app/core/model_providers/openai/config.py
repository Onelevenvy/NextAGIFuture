from langchain_openai import ChatOpenAI

PROVIDER_CONFIG = {
    "provider_name": "openai",
    "base_url": "https://api.openai.com/v1",
    "api_key": "your_api_key_here",
    "icon": "openai_icon",
    "description": "OpenAI API provider",
}

SUPPORTED_MODELS = [
    "gpt-4",
    "gpt-4-0314",
    "gpt-4-32k",
    "gpt-4-32k-0314",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k",
    "gpt-4o-mini",
]


def init_model(
    model: str, temperature: float, openai_api_key: str, openai_api_base: str, **kwargs
):
    return ChatOpenAI(
        model=model, temperature=temperature, openai_api_key=openai_api_key, **kwargs
    )
