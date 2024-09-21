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
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve graphs from team.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Graph)
        count = session.exec(count_statement).one()
        statement = (
            select(Graph).where(Graph.team_id == team_id).offset(skip).limit(limit)
        )
        graphs = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Graph)
            .join(Team)
            .where(Team.owner_id == current_user.id, Graph.team_id == team_id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Graph)
            .join(Team)
            .where(Team.owner_id == current_user.id, Graph.team_id == team_id)
            .offset(skip)
            .limit(limit)
        )
        graphs = session.exec(statement).all()

    return GraphsOut(data=graphs, count=count)


@router.get("/{id}", response_model=GraphOut)
def read_graph(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    id: int,
) -> Any:
    """
    Get graph by ID.
    """
    if current_user.is_superuser:
        statement = select(Graph).where(Graph.id == id, Graph.team_id == team_id)
        graph = session.exec(statement).first()
    else:
        statement = (
            select(Graph)
            .join(Team)
            .where(
                Graph.id == id,
                Graph.team_id == team_id,
                Team.owner_id == current_user.id,
            )
        )
        graph = session.exec(statement).first()

    if not graph:
        raise HTTPException(status_code=404, detail="Graph not found")
    return graph


@router.post("/", response_model=GraphOut)
def create_graph(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    graph_in: GraphCreate,
    _: bool = Depends(validate_name_on_create),
) -> Any:
    """
    Create new graph.
    """
    if not current_user.is_superuser:
        team = session.get(Team, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found.")
        if team.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    graph = Graph.model_validate(
        graph_in, update={"team_id": team_id, "owner_id": current_user.id}
    )
    session.add(graph)
    session.commit()
    session.refresh(graph)
    return graph


@router.put("/{id}", response_model=GraphOut)
def update_graph(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    id: int,
    graph_in: GraphUpdate,
) -> Any:
    """
    Update graph by ID.
    """
    if not current_user.is_superuser:
        team = session.get(Team, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found.")
        if team.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    graph = session.get(Graph, id)
    if not graph:
        raise HTTPException(status_code=404, detail="Graph not found")
    graph.model_update(graph_in)
    session.commit()
    session.refresh(graph)
    return graph


@router.delete("/{id}")
def delete_graph(
    session: SessionDep,
    current_user: CurrentUser,
    team_id: int,
    id: int,
) -> None:
    """
    Delete graph by ID.
    """
    if not current_user.is_superuser:
        team = session.get(Team, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Team not found.")
        if team.owner_id != current_user.id:
            raise HTTPException(status_code=400, detail="Not enough permissions")
    graph = session.get(Graph, id)
    if not graph:
        raise HTTPException(status_code=404, detail="Graph not found")
    session.delete(graph)
    session.commit()
