# spark_pool.py
from typing import Optional
from threading import Lock
from pyspark.sql import SparkSession
from core.config import settings


class SparkPool:
    _instance = None
    _lock = Lock()
    _session: Optional[SparkSession] = None
    _in_use = False

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def get_session(self) -> SparkSession:
        """Get or create a Spark session."""
        with self._lock:
            if self._session is None or self._session._jsc.sc().isStopped():
                self._session = (
                    SparkSession.builder.appName("PAMAP2")
                    .config("spark.driver.memory", "4g")
                    .config("spark.executor.memory", "4g")
                    .getOrCreate()
                )
                # Initialize the DataFrame once per session
                df = self._session.read.format("parquet").load(settings.PARQUET_PATH)
                df.createOrReplaceTempView("activities")
            return self._session

    def close(self):
        """Close the Spark session if it exists."""
        with self._lock:
            if self._session:
                self._session.stop()
                self._session = None


# spark_service.py
from typing import List, Dict, Any
from contextlib import contextmanager
from utils.sanitizer import sanitize_document


class SparkService:
    def __init__(self):
        self.pool = SparkPool()
        self.spark = self.pool.get_session()

    def execute_query(self, query: str) -> List[Dict[str, Any]]:
        """Execute SQL query and return sanitized results."""
        try:
            result = self.spark.sql(query).collect()
            return [sanitize_document(row.asDict()) for row in result]
        except Exception as e:
            self.spark.sparkContext.cancelAllJobs()
            raise RuntimeError(f"Query execution failed: {str(e)}")

    def close(self):
        """This is now a no-op as session management is handled by the pool"""
        pass
