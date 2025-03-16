import math
from typing import Dict, Any


def sanitize_document(document: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize document by replacing NaN and Inf values with None."""

    def is_invalid_float(value: float) -> bool:
        return isinstance(value, float) and (math.isnan(value) or math.isinf(value))

    def sanitize_value(value: Any) -> Any:

        if is_invalid_float(value):
            return None
        if isinstance(value, list):
            return [None if is_invalid_float(v) else v for v in value]
        if isinstance(value, dict):
            return sanitize_document(value)
        return value

    if "_id" in document and hasattr(document["_id"], "oid"):
        document["_id"] = document["_id"].oid

    return {key: sanitize_value(value) for key, value in document.items()}
