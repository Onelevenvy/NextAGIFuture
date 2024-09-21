from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Graph,
    GraphCreate,
    GraphOut,
    GraphsOut,
    GraphUpdate,
    Message,
    Team,
)

router = APIRouter()

async def validate_name_on_create(session: SessionDep, graph_in: GraphCreate) -> None:
    """Validate that graph name is unique"""
    statement = select(Graph).where(Graph.name == graph_in.name)
    graph = session.exec(statement).first()
    if graph:
        raise HTTPException(status_code=400, detail="Graph name already exists")

async def validate_name_on_update(
    session: SessionDep, graph_in: GraphUpdate, id: int
) -> None:
    """Validate that graph name is unique"""
    statement = select(Graph).where(Graph.name == graph_in.name, Graph.id != id)
    graph = session.exec(statement).first()
    if graph:
        raise HTTPException(status_code=400, detail="Graph name already exists")

@router.get("/", response_model=GraphsOut)
def read_graphs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve graphs
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Graph)
        count = session.exec(count_statement).one()
        statement = select(Graph).offset(skip).limit(limit).order_by(col(Graph.id).desc())
        graphs = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Graph)
            .join(Team)
            .where(Team.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Graph)
            .join(Team)
            .where(Team.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
            .order_by(col(Graph.id).desc())
        )
        graphs = session.exec(statement).all()
    return GraphsOut(data=graphs, count=count)

@router.get("/{id}", response_model=GraphOut)
def read_graph(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    """
    Get graph by ID.
    """
    graph = session.get(Graph, id)
    if not graph:
        raise HTTPException(status_code=404, detail="Graph not found")
    team = session.get(Team, graph.team_id)
    if not current_user.is_superuser and (team.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return graph

@router.post("/", response_model=GraphOut)
def create_graph(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    graph_in: GraphCreate,
    _: bool = Depends(validate_name_on_create),
) -> Any:
    """
    Create new graph
    """
    team = session.get(Team, graph_in.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if not current_user.is_superuser and (team.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    graph = Graph.model_validate(graph_in, update={"owner_id": current_user.id})
    session.add(graph)
    session.commit()
    session.refresh(graph)
    return graph

@router.put("/{id}", response_model=GraphOut)
def update_graph(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    graph_in: GraphUpdate,
    _: bool = Depends(validate_name_on_update),
) -> Any:
    """
    Update a graph.
    """
    graph = session.get(Graph, id)
    if not graph:
        raise HTTPException(status_code=404, detail="Graph not found")
    team = session.get(Team, graph.team_id)
    if not current_user.is_superuser and (team.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = graph_in.model_dump(exclude_unset=True)
    graph.sqlmodel_update(update_dict)
    session.add(graph)
    session.commit()
    session.refresh(graph)
    return graph

@router.delete("/{id}")
def delete_graph(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    """
    Delete a graph.
    """
    graph = session.get(Graph, id)
    if not graph:
        raise HTTPException(status_code=404, detail="Graph not found")
    team = session.get(Team, graph.team_id)
    if not current_user.is_superuser and (team.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(graph)
    session.commit()
    return Message(message="Graph deleted successfully")