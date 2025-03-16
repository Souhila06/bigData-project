from pydantic import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "FastAPI with PySpark"
    SPARK_MASTER: str = "local[*]"  # Use local mode for testing, switch to cluster mode for production
    SPARK_DRIVER_MEMORY: str = "2g"  # Amount of memory to allocate for the driver
    SPARK_EXECUTOR_MEMORY: str = "4g"  # Amount of memory per executor
    SPARK_EXECUTOR_CORES: int = 6  # Number of cores per executor
    SPARK_SHUFFLE_PARTITIONS: int = 4  # Default number of partitions for shuffling
    SPARK_MAX_RESULT_SIZE: str = "2g"  # Maximum size of the result returned to the driver
    SPARK_WORKER_MEMORY: str = "1g"  # Memory for Python workers
    SPARK_DEFAULT_PARALLELISM: int = 4  # Default parallelism for operations
    PARQUET_PATH: str = "/activities.parquet"  # Path to save the parquet file

    class Config:
        env_file = ".env"


settings = Settings()
