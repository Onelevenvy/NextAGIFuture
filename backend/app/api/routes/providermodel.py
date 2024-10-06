from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep
from app.curd.models import (
    _create_model,
    _delete_model,
    _update_model,
    get_all_models,
    get_models_by_provider,
)
from app.models import Models, ModelsBase, ModelsOut

router = APIRouter()


# Routes for Models
@router.post("/", response_model=ModelsBase)
def create_models(model: ModelsBase, session: SessionDep):
    return _create_model(session, model)


@router.get("/{provider_id}", response_model=ModelsOut)
def read_model(provider_id: int, session: SessionDep):
    return get_models_by_provider(session, provider_id)


@router.get("/", response_model=ModelsOut)
def read_models(session: SessionDep):
    return get_all_models(session)


@router.delete("/{model_id}", response_model=Models)
def delete_model(model_id: int, session: SessionDep):
    model = _delete_model(session, model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


@router.put("/{model_id}", response_model=Models)
def update_model(model_id: int, model_update: ModelsBase, session: SessionDep):
    model = _update_model(session, model_id, model_update)
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    return model
