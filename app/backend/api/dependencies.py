from fastapi import APIRouter
from api.routes import queries
from api.routes import stats
from api.routes import predict


api_router = APIRouter()
api_router.include_router(queries.router, prefix="/query", tags=["Queries parsing"])
api_router.include_router(stats.router, prefix="/stats", tags=["Querie data for charts"])
api_router.include_router(predict.router, prefix="/predict", tags=["Activity prediction"])
