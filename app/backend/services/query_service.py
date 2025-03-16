from typing import Dict, Any, Tuple, List
import time
from utils.parser import parse_query
from .spark_service import SparkService

class QueryService:
    def __init__(self):
        self.spark_service = SparkService()

    def execute_query(self, query: str) -> Tuple[List[Dict[str, Any]], float]:
        """Execute query and return results with execution time."""
        start_time = time.time()
        results = self.spark_service.execute_query(query)
        query_time = time.time() - start_time
        return results, query_time
