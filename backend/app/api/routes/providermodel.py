from app.api.deps import SessionDep
from fastapi import APIRouter, HTTPException

from app.models import (
    Models,
    ModelsBase,
    ModelsOut,
)
from app.curd.models import (
    get_all_models,
    update_model,
    create_model,
    get_models_by_provider,
    delete_model,
)

router = APIRouter()


# Routes for Models
@router.post("/", response_model=ModelsBase)
def create_models(model: ModelsBase, session: SessionDep):
    return create_model(session, model)


@router.get("/{provider_id}", response_model=ModelsOut)
def read_model(provider_id: int, session: SessionDep):
    return get_models_by_provider(session, provider_id)


@router.get("/", response_model=ModelsOut)
def read_models(session: SessionDep):
    return get_all_models(session)


@router.delete("/{model_id}", response_model=Models)
def delete_model(model_id: int, session: SessionDep):
    model = delete_model(session, model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.put("/{model_id}", response_model=Models)
def update_model(model_id: int, model_update: ModelsBase, session: SessionDep):
    model = update_model(session, model_id, model_update)
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return model
