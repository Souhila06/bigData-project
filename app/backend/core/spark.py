from pyspark.sql import SparkSession
from .config import settings


def create_spark_session() -> SparkSession:
    """Create and configure Spark session."""
    return (
        SparkSession.builder.appName(settings.APP_NAME)
        .config("spark.driver.memory", settings.SPARK_DRIVER_MEMORY)
        .config("spark.executor.memory", settings.SPARK_EXECUTOR_MEMORY)
        .config("spark.sql.shuffle.partitions", settings.SPARK_SHUFFLE_PARTITIONS)
        .config("spark.driver.maxResultSize", settings.SPARK_MAX_RESULT_SIZE)
        .config("spark.python.worker.memory", settings.SPARK_WORKER_MEMORY)
        .config("spark.executor.cores", settings.SPARK_EXECUTOR_CORES)  # Specify the number of cores per executor
        .config("spark.default.parallelism", settings.SPARK_DEFAULT_PARALLELISM)  # Set default parallelism
        .master(settings.SPARK_MASTER)
        .getOrCreate()
    )

    
