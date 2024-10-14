from langchain_ollama import ChatOllama

PROVIDER_CONFIG = {
    'provider_name': 'Ollama',
    'base_url': 'http://host.docker.internal:11434',
    'api_key': 'fakeapikey',
    'icon': 'ollama_icon',
    'description': 'Ollama API provider'
}

SUPPORTED_MODELS = [
    'llama3.1:8b',
]

def init_model(model: str, temperature: float, **kwargs):
    return ChatOllama(
        model=model,
        temperature=temperature,
        base_url=PROVIDER_CONFIG['base_url'],
        **kwargs
    )
