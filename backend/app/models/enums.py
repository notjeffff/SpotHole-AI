from enum import Enum

class PotholeStatus(str, Enum):
    detected = "detected"
    active = "active"
    resolved = "resolved"
    archived = "archived"

class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"
