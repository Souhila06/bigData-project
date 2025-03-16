from datetime import datetime, timedelta
from typing import Dict, Tuple, List, Any, Optional
from dataclasses import dataclass
from fastapi import APIRouter, HTTPException, Query, Depends
from models.schemas import QueryMetadata, QueryRequest, QueryResponse, QueryStats
from services.query_service import QueryService
from utils.parser import CompoundCondition, parse_query
from core.logger import logger


router = APIRouter()


@dataclass
class CacheEntry:
    data: List[Any]
    query_time: float
    timestamp: datetime
    parsed_sql: str
    columns_requested: List[str]


class QueryCache:
    def __init__(self, ttl_minutes: int = 30):
        self.cache: Dict[str, CacheEntry] = {}
        self.ttl = timedelta(minutes=ttl_minutes)

    def get_cache_key(self, query: str) -> str:
        """Generate a cache key from the query string"""
        return query.strip().lower()

    def is_valid(self, entry: CacheEntry) -> bool:
        """Check if cache entry is still valid based on TTL"""
        return datetime.now() - entry.timestamp < self.ttl

    def get(self, query: str) -> Optional[CacheEntry]:
        """Retrieve cache entry if it exists and is valid"""
        key = self.get_cache_key(query)
        if key in self.cache:
            entry = self.cache[key]
            if self.is_valid(entry):
                return entry
            del self.cache[key]
        return None

    def set(self, query: str, entry: CacheEntry):
        """Store new cache entry"""
        key = self.get_cache_key(query)
        self.cache[key] = entry


# Global cache instance
query_cache = QueryCache()


async def get_query_service():
    service = QueryService()
    try:
        yield service
    finally:
        service.spark_service.close()


@router.post("/parse", response_model=QueryResponse)
async def parse_query_endpoint(
    request: QueryRequest, query_service: QueryService = Depends(get_query_service)
) -> QueryResponse:
    """
    Parse and execute the provided query string with pagination support and caching.
    """
    try:
        # Check cache first
        cache_entry = query_cache.get(request.query)

        if cache_entry is None:
            parsed_result = parse_query(request.query)
            sql_query = parsed_result.to_sql()
            full_data, query_time = query_service.execute_query(sql_query)

            # Store in cache
            cache_entry = CacheEntry(
                data=full_data,
                query_time=query_time,
                timestamp=datetime.now(),
                parsed_sql=sql_query,
                columns_requested=parsed_result.columns,
            )
            query_cache.set(request.query, cache_entry)

        # Calculate pagination metrics
        total_rows = len(cache_entry.data)
        total_pages = (total_rows + request.page_size - 1) // request.page_size

        # Validate requested page
        if request.page > total_pages and total_pages > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Page {request.page} exceeds total pages {total_pages}",
            )

        # Apply pagination
        start_index = (request.page - 1) * request.page_size
        end_index = min(start_index + request.page_size, total_rows)
        paginated_data = cache_entry.data[start_index:end_index]

        return QueryResponse(
            metadata=QueryMetadata(
                original_query=request.query,
                parsed_sql=cache_entry.parsed_sql,
                columns_requested=cache_entry.columns_requested,
                execution_timestamp=datetime.now(),
            ),
            stats=QueryStats(
                total_rows=total_rows,
                query_time=cache_entry.query_time,
                page_size=request.page_size,
                current_page=request.page,
                total_pages=total_pages,
            ),
            data=paginated_data,
        )

    except Exception as e:
        logger.error(f"Failed to retrieve data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to parse query: {str(e)}")
