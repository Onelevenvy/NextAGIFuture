from fastapi import APIRouter

from app.api.routes import (
    login,
    members,
    skills,
    teams,
    threads,
    uploads,
    users,
    utils,
    provider,
    providermodel,
    graphs
)



api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(
    members.router, prefix="/teams/{team_id}/members", tags=["members"]
)
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(
    threads.router, prefix="/teams/{team_id}/threads", tags=["threads"]
)
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])


api_router.include_router(provider.router, prefix="/provider", tags=["provider"])

api_router.include_router(providermodel.router, prefix="/model", tags=["model"])
api_router.include_router(graphs.router, prefix="/graphs", tags=["graphs"])  
