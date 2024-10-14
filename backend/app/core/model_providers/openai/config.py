from langchain_openai import ChatOpenAI

PROVIDER_CONFIG = {
    'provider_name': 'openai',
    'base_url': 'https://api.openai.com/v1',
    'api_key': 'your_api_key_here',
    'icon': 'openai_icon',
    'description': 'OpenAI API provider'
}

SUPPORTED_MODELS = [
    'gpt-4',
    'gpt-4-0314',
    'gpt-4-32k',
    'gpt-4-32k-0314',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
]

def init_model(model: str, temperature: float, **kwargs):
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        openai_api_key=PROVIDER_CONFIG['api_key'],
        openai_api_base=PROVIDER_CONFIG['base_url'],
        **kwargs
    )
