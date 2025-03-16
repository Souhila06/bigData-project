from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from datetime import datetime


class ParsedQueryResponse(BaseModel):
    query_object: Dict[str, Any]
    query_sql: str
    query_string: str


class QueryRequest(BaseModel):
    query: str
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=10, ge=1, le=100, description="Items per page")


class QueryMetadata(BaseModel):
    original_query: str
    parsed_sql: str
    columns_requested: List[str]
    execution_timestamp: datetime


class QueryStats(BaseModel):
    total_rows: int
    query_time: float
    page_size: int
    current_page: int
    total_pages: int


class QueryResponse(BaseModel):
    metadata: QueryMetadata
    stats: QueryStats
    data: List[Any]
