from app.api.deps import SessionDep
from fastapi import APIRouter, HTTPException

from app.models import (
    ModelProvider,
    ModelProviderCreate,
    ModelProviderUpdate,
    ModelProviderWithModelsListOut,
)
from app.curd.modelprovider import (
    create_model_provider,
    get_model_provider,
    get_model_provider_with_models_list,
    update_model_provider,
    delete_model_provider,
)

router = APIRouter()


# Routes for ModelProvider
@router.post("/", response_model=ModelProvider)
def create_provider(model_provider: ModelProviderCreate, session: SessionDep):
    return create_model_provider(session, model_provider)


@router.get("/{model_provider_id}", response_model=ModelProvider)
def read_provider(model_provider_id: int, session: SessionDep):
    model_provider = get_model_provider(session, model_provider_id)
    if model_provider is None:
        raise HTTPException(status_code=404, detail="ModelProvider not found")
    return model_provider


@router.get(
    "/withmodels/{model_provider_id}", response_model=ModelProviderWithModelsListOut
)
def read_provider_with_model_list(model_provider_id: int, session: SessionDep):
    model_provider_with_models = get_model_provider_with_models_list(
        session, model_provider_id
    )
    if model_provider_with_models is None:
        raise HTTPException(status_code=404, detail="ModelProvider not found")
    return model_provider_with_models


@router.put("/{model_provider_id}", response_model=ModelProvider)
def update_provider(
    model_provider_id: int,
    model_provider_update: ModelProviderUpdate,
    session: SessionDep,
):
    model_provider = update_model_provider(
        session, model_provider_id, model_provider_update
    )
    if model_provider is None:
        raise HTTPException(status_code=404, detail="ModelProvider not found")
    return model_provider


@router.delete("/{model_provider_id}", response_model=ModelProvider)
def delete_provider(model_provider_id: int, session: SessionDep):
    model_provider = delete_model_provider(session, model_provider_id)
    if model_provider is None:
        raise HTTPException(status_code=404, detail="ModelProvider not found")
    return model_provider
