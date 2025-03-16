from enum import Enum
from typing import Generator, List
from fastapi import APIRouter, Depends
from fastapi.params import Query
from services.query_service import QueryService
from contextlib import contextmanager

from pydantic import BaseModel, Field

router = APIRouter()


def get_query_service() -> Generator[QueryService, None, None]:
    service = QueryService()
    try:
        yield service
    finally:
        # The close() is now a no-op, so this won't affect other requests
        service.spark_service.close()


activity_names = {
    1: "lying",
    2: "sitting",
    3: "standing",
    4: "walking",
    5: "running",
    6: "cycling",
    7: "Nordic walking",
    9: "watching TV",
    10: "computer work",
    11: "car driving",
    12: "ascending stairs",
    13: "descending stairs",
    16: "vacuum cleaning",
    17: "ironing",
    18: "folding laundry",
    19: "house cleaning",
    20: "playing soccer",
    24: "rope jumping",
}


@router.get("/activities")
def get_activities():
    return {
        "activities": activity_names,
    }


@router.get("/features_cat")
def get_features():
    return {
        "features": {
            "IMU Hand": [
                {"id": "hand_temp", "name": "Hand Temperature"},
                {"id": "hand_acc_16_x", "name": "Hand Acceleration X (16g)"},
                {"id": "hand_acc_16_y", "name": "Hand Acceleration Y (16g)"},
                {"id": "hand_acc_16_z", "name": "Hand Acceleration Z (16g)"},
                {"id": "hand_gyro_x", "name": "Hand Gyroscope X"},
                {"id": "hand_gyro_y", "name": "Hand Gyroscope Y"},
                {"id": "hand_gyro_z", "name": "Hand Gyroscope Z"},
                {"id": "hand_mag_x", "name": "Hand Magnetometer X"},
                {"id": "hand_mag_y", "name": "Hand Magnetometer Y"},
                {"id": "hand_mag_z", "name": "Hand Magnetometer Z"},
            ],
            "IMU Chest": [
                {"id": "chest_temp", "name": "Chest Temperature"},
                {"id": "chest_acc_16_x", "name": "Chest Acceleration X (16g)"},
                {"id": "chest_acc_16_y", "name": "Chest Acceleration Y (16g)"},
                {"id": "chest_acc_16_z", "name": "Chest Acceleration Z (16g)"},
                {"id": "chest_gyro_x", "name": "Chest Gyroscope X"},
                {"id": "chest_gyro_y", "name": "Chest Gyroscope Y"},
                {"id": "chest_gyro_z", "name": "Chest Gyroscope Z"},
                {"id": "chest_mag_x", "name": "Chest Magnetometer X"},
                {"id": "chest_mag_y", "name": "Chest Magnetometer Y"},
                {"id": "chest_mag_z", "name": "Chest Magnetometer Z"},
            ],
            "IMU Ankle": [
                {"id": "ankle_temp", "name": "Ankle Temperature"},
                {"id": "ankle_acc_16_x", "name": "Ankle Acceleration X (16g)"},
                {"id": "ankle_acc_16_y", "name": "Ankle Acceleration Y (16g)"},
                {"id": "ankle_acc_16_z", "name": "Ankle Acceleration Z (16g)"},
                {"id": "ankle_gyro_x", "name": "Ankle Gyroscope X"},
                {"id": "ankle_gyro_y", "name": "Ankle Gyroscope Y"},
                {"id": "ankle_gyro_z", "name": "Ankle Gyroscope Z"},
                {"id": "ankle_mag_x", "name": "Ankle Magnetometer X"},
                {"id": "ankle_mag_y", "name": "Ankle Magnetometer Y"},
                {"id": "ankle_mag_z", "name": "Ankle Magnetometer Z"},
            ],
            "Labels": [
                {"id": "activity", "name": "Activity ID"},
                {"id": "subject", "name": "Subject ID"},
            ],
            "Time": [
                {"id": "timestamp", "name": "Timestamp"},
            ],
        }
    }


@router.get("/features")
def get_columns(query_service: QueryService = Depends(get_query_service)):
    """
    Get the available columns as a list of strings.
    """
    try:
        query = """
        SHOW COLUMNS FROM activities;
        """

        results, query_time = query_service.execute_query(query)

        column_names = [row["col_name"] for row in results]

        return {
            "status": "success",
            "execution_time": query_time,
            "data": column_names,
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        query_service.spark_service.close()


@router.get("/activity-duration")
def get_activity_duration(query_service: QueryService = Depends(get_query_service)):
    """
    Get the duration of each activity across all subjects.
    """
    try:
        query = """
        WITH activity_durations AS (
            SELECT 
                activity_id,
                subject_id,
                (MAX(timestamp) - MIN(timestamp)) as duration
            FROM activities
            WHERE activity_id != 0  -- Excluding transient activities
            GROUP BY activity_id, subject_id
        )
        SELECT 
            activity_id,
            COUNT(DISTINCT subject_id) as num_subjects,
            SUM(duration) as total_duration
        FROM activity_durations
        GROUP BY activity_id
        ORDER BY activity_id;
        """
        results, query_time = query_service.execute_query(query)

        # Map activity IDs to their names based on the documentation

        formatted_results = [
            {
                "activity": activity_names.get(
                    row["activity_id"], f"Unknown ({row['activity_id']})"
                ),
                "duration": round(float(row["total_duration"]), 2),
                "subjects": int(row["num_subjects"]),
            }
            for row in results
        ]

        return {
            "status": "success",
            "execution_time": query_time,
            "data": formatted_results,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        query_service.spark_service.close()


@router.get("/sensor-acceleration-comparison")
def get_sensor_acceleration(
    activity_id: int,
    subject_id: int,
    query_service: QueryService = Depends(get_query_service),
):
    """
    Compare acceleration data from hand, chest, and ankle for a specific activity.
    Shows the magnitude of acceleration across different body positions.
    """
    try:
        subject_filter = f"AND subject_id = {subject_id}" if subject_id else ""
        query = f"""
        SELECT 
            timestamp,
            SQRT(POWER(hand_acc_16_x, 2) + POWER(hand_acc_16_y, 2) + POWER(hand_acc_16_z, 2)) as hand_acc_magnitude,
            SQRT(POWER(chest_acc_16_x, 2) + POWER(chest_acc_16_y, 2) + POWER(chest_acc_16_z, 2)) as chest_acc_magnitude,
            SQRT(POWER(ankle_acc_16_x, 2) + POWER(ankle_acc_16_y, 2) + POWER(ankle_acc_16_z, 2)) as ankle_acc_magnitude
        FROM activities
        WHERE activity_id = {activity_id} {subject_filter}
        ORDER BY timestamp
        LIMIT 1000;  -- Limiting for performance, adjust as needed
        """
        results, query_time = query_service.execute_query(query)

        formatted_results = [
            {
                "timestamp": str(row["timestamp"]),
                "hand": float(row["hand_acc_magnitude"]),
                "chest": float(row["chest_acc_magnitude"]),
                "ankle": float(row["ankle_acc_magnitude"]),
            }
            for row in results
        ]

        return {
            "status": "success",
            "execution_time": query_time,
            "data": formatted_results,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        query_service.spark_service.close()


@router.get("/temperature-comparison")
def get_temperature_comparison(
    activity_id: int,
    subject_id: int,
    query_service: QueryService = Depends(get_query_service),
):
    """
    Compare temperature readings across different body positions.
    """
    try:
        subject_filter = f"AND subject_id = {subject_id}" if subject_id else ""
        query = f"""
        SELECT 
            timestamp,
            hand_temp,
            chest_temp,
            ankle_temp
        FROM activities
        WHERE activity_id = {activity_id} {subject_filter}
        ORDER BY timestamp
        LIMIT 1000;
        """
        results, query_time = query_service.execute_query(query)

        formatted_results = [
            {
                "timestamp": str(row["timestamp"]),
                "hand": float(row["hand_temp"]),
                "chest": float(row["chest_temp"]),
                "ankle": float(row["ankle_temp"]),
            }
            for row in results
        ]

        return {
            "status": "success",
            "execution_time": query_time,
            "data": formatted_results,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        query_service.spark_service.close()


class ChartType(str, Enum):
    LINE = "0"
    BAR = "1"


class ChartRequest(BaseModel):
    x_features: List[str]
    y_features: List[str]
    chart_type: ChartType
    activity_id: int  # Add activity_id as an optional parameter


@router.post("/chart-data")
def get_chart_data(
    request: ChartRequest, query_service: QueryService = Depends(get_query_service)
):
    """
    Generate chart data based on selected features.
    X-axis is always timestamp, Y-axis can be any selected features.
    """
    try:
        # Build the feature selection part of the query
        selected_features = []
        for feature in request.y_features:
            # Handle special cases for calculated fields if needed
            if feature in [
                "hand_acc_magnitude",
                "chest_acc_magnitude",
                "ankle_acc_magnitude",
            ]:
                if feature == "hand_acc_magnitude":
                    selected_features.append(
                        "SQRT(POWER(hand_acc_16_x, 2) + POWER(hand_acc_16_y, 2) + POWER(hand_acc_16_z, 2)) as hand_acc_magnitude"
                    )
                elif feature == "chest_acc_magnitude":
                    selected_features.append(
                        "SQRT(POWER(chest_acc_16_x, 2) + POWER(chest_acc_16_y, 2) + POWER(chest_acc_16_z, 2)) as chest_acc_magnitude"
                    )
                elif feature == "ankle_acc_magnitude":
                    selected_features.append(
                        "SQRT(POWER(ankle_acc_16_x, 2) + POWER(ankle_acc_16_y, 2) + POWER(ankle_acc_16_z, 2)) as ankle_acc_magnitude"
                    )
            else:
                selected_features.append(feature)

        # Construct the query with optional activity_id filter
        where_clause = ""
        if request.activity_id is not None:
            where_clause = f"WHERE activity_id = {request.activity_id}"

        query = f"""
        SELECT 
            timestamp,
            {', '.join(selected_features)}
        FROM activities
        {where_clause}
        ORDER BY timestamp
        LIMIT 1000;
        """

        results, query_time = query_service.execute_query(query)

        # Process the results into a format suitable for recharts
        formatted_results = []
        for row in results:
            data_point = {
                "timestamp": str(row["timestamp"]),
            }

            # Add Y features
            for feature in request.y_features:
                data_point[feature] = float(row[feature])

            formatted_results.append(data_point)

        return {
            "status": "success",
            "execution_time": query_time,
            "data": formatted_results,
            "metadata": {
                "y_features": request.y_features,
                "chart_type": request.chart_type,
                "activity_id": request.activity_id,
            },
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        query_service.spark_service.close()
