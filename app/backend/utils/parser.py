"""
query_parser.py: A custom made SQL-like query language parser designed to request PAMAP2
========================================================

This module provides a parser for a custom SQL-like query language that supports:
- Column selection
- WHERE clauses with nested conditions
- Sorting
- Limit clauses

The query language syntax is designed to be more human-readable than SQL:
Example: "Show me column1, column2 where value > 10 sorted by column1 ascending limit 5"

Version: 1.0.0
"""

from dataclasses import dataclass
from typing import Dict, List, Any, Union, Optional as Opt
from pyparsing import (
    ParseResults,
    Word,
    alphas,
    nums,
    alphanums,
    delimitedList,
    Group,
    Optional,
    Forward,
    QuotedString,
    oneOf,
    ZeroOrMore,
    Combine,
    CaselessLiteral,
    ParseException,
    Suppress,
    StringEnd,
)


ALL_COLUMNS = [
    "timestamp",
    "activity_id",
    "hand_temp",
    "hand_acc_16_x",
    "hand_acc_16_y",
    "hand_acc_16_z",
    "hand_gyro_x",
    "hand_gyro_y",
    "hand_gyro_z",
    "hand_mag_x",
    "hand_mag_y",
    "hand_mag_z",
    "chest_temp",
    "chest_acc_16_x",
    "chest_acc_16_y",
    "chest_acc_16_z",
    "chest_gyro_x",
    "chest_gyro_y",
    "chest_gyro_z",
    "chest_mag_x",
    "chest_mag_y",
    "chest_mag_z",
    "ankle_temp",
    "ankle_acc_16_x",
    "ankle_acc_16_y",
    "ankle_acc_16_z",
    "ankle_gyro_x",
    "ankle_gyro_y",
    "ankle_gyro_z",
    "ankle_mag_x",
    "ankle_mag_y",
    "ankle_mag_z",
    "subject_id",
]


@dataclass
class SortClause:
    """Represents sorting configuration for the query."""

    column: str
    direction: str = "ascending"

    def dict(self):
        return {"column": self.column, "direction": self.direction}


@dataclass
class Condition:
    """Represents a single condition in the query."""

    column: str
    operator: str
    value: Any

    def dict(self):
        return {
            "column": self.column,
            "operator": self.operator,
            "value": self.value,
        }


@dataclass
class CompoundCondition:
    """Represents a group of conditions joined by a logical operator."""

    logic: str
    conditions: List[Union["CompoundCondition", Condition]]

    def dict(self):
        return {
            "logic": self.logic,
            "conditions": [c.dict() for c in self.conditions],
        }


@dataclass
class QueryResult:
    """Represents the parsed query result."""

    columns: List[str]
    conditions: Opt[Union[Condition, CompoundCondition]]
    sort: Opt[SortClause]
    limit: Opt[int]

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the QueryResult object to a dictionary suitable for JSON serialization.

        Returns:
            dict: A dictionary representation of the query result
        """
        return {
            "columns": self.columns,
            "conditions": self.conditions.dict() if self.conditions else None,
            "sort": self.sort.dict() if self.sort else None,
            "limit": self.limit,
        }

    def to_sql(self):
        return to_sql(self)


class QueryParseError(Exception):
    """Custom exception for query parsing errors."""

    pass


class QueryGrammar:
    """Defines the grammar rules for parsing the query language."""

    def __init__(self):
        """Initialize the grammar components."""
        # Keywords
        self.SHOW = CaselessLiteral("Show me").setName("SHOW")
        self.WHERE = CaselessLiteral("where").setName("WHERE")
        self.SORTED = CaselessLiteral("sorted by").setName("SORTED BY")
        self.LIMIT = CaselessLiteral("limit").setName("LIMIT")
        self.ROWS = Optional(CaselessLiteral("rows")).setName("ROWS")
        self.IS = CaselessLiteral("is").setName("IS")
        self.IN = CaselessLiteral("in").setName("IN")
        self.AND = CaselessLiteral("and").setName("AND")
        self.OR = CaselessLiteral("or").setName("OR")
        self.ASCENDING = CaselessLiteral("ascending").setName("ASCENDING")
        self.DESCENDING = CaselessLiteral("descending").setName("DESCENDING")

        # Basic elements
        self.integer = Word(nums).setName("integer")
        self.identifier = Word(alphas + "_", alphanums + "_" + ".").setName(
            "identifier"
        )
        self.quoted_string = QuotedString("'") | QuotedString('"')
        self.number = Combine(Optional("-") + Word(nums) + Optional("." + Word(nums)))
        self.value = (self.number | self.quoted_string | self.identifier).setName(
            "value"
        )

        # Build the complete grammar
        self.parser = self._build_grammar()

    def _build_grammar(self):
        """Construct the complete grammar for the query language."""
        # Value lists and operators
        value_list = (
            Suppress("[") + delimitedList(self.value) + Suppress("]")
        ).setName("value_list")
        comparison_operator = oneOf("> < >= <= = != is").setName("operator")

        # Conditions
        simple_condition = Group(
            (self.value | self.identifier)
            + comparison_operator
            + (self.value | self.identifier)
        ).setName("condition")

        in_condition = Group(self.identifier + self.IS + self.IN + value_list).setName(
            "in_condition"
        )

        # Handle nested conditions
        condition = Forward()
        nested_condition = Group(Suppress("(") + condition + Suppress(")")).setName(
            "nested_condition"
        )

        condition << (
            (simple_condition | in_condition | nested_condition)
            + ZeroOrMore(
                (self.AND | self.OR)
                + (simple_condition | in_condition | nested_condition)
            )
        )

        # Sort and limit clauses
        sort_direction = Group(
            Optional(self.ASCENDING | self.DESCENDING, default="ascending")
        ).setName("sort_direction")

        columns = delimitedList(self.identifier | "*")
        where_clause = Optional(self.WHERE + Group(condition))
        sort_clause = Optional(
            self.SORTED.suppress() + Group(self.identifier + sort_direction)
        )
        limit_clause = Optional(self.LIMIT.suppress() + self.integer + self.ROWS)

        # Complete query
        return (
            self.SHOW
            + Group(columns)("columns")
            + where_clause("where")
            + sort_clause("sort")
            + limit_clause("limit")
            + StringEnd()
        )


class QueryParser:
    """Parser for the custom query language."""

    def __init__(self, query: str):
        """
        Initialize the parser with a query string.

        Args:
            query (str): The query string to parse
        """
        self.query = query
        self.grammar = QueryGrammar()

    def _expand_columns(self, columns: List[str]) -> List[str]:
        """Expand * to all available columns, otherwise return the original columns."""
        if "*" in columns:
            return ALL_COLUMNS
        return columns

    def parse(self) -> QueryResult:
        """
        Parse the query string into a structured format.

        Returns:
            QueryResult: The parsed query information

        Raises:
            QueryParseError: If the query cannot be parsed
        """
        query_string = self.query.strip()

        try:
            parsed = self.grammar.parser.parseString(query_string, parseAll=True)

            result = QueryResult(
                columns=self._expand_columns(list(parsed.columns)),
                conditions=None,
                sort=None,
                limit=None,
            )

            if parsed.where:
                conditions = parsed.where[1]
                result.conditions = self._parse_conditions(conditions)

            if parsed.sort:
                sort_data = parsed.sort[0]
                result.sort = SortClause(
                    column=sort_data[0],
                    direction=sort_data[1][0] if sort_data[1] else "ascending",
                )

            if parsed.limit:
                result.limit = int(parsed.limit[0])

            return result

        except ParseException as e:
            raise QueryParseError(f"Failed to parse query at position {e.loc}: {e.msg}")

    def _parse_conditions(
        self, conditions: ParseResults
    ) -> Union[Condition, CompoundCondition, None]:
        """
        Recursively parse conditions into a structured format.

        Args:
            conditions (ParseResults): The conditions to parse

        Returns:
            Union[Condition, CompoundCondition, None]: The parsed condition structure
        """
        if isinstance(conditions, ParseResults):
            # Handle nested conditions in parentheses
            if len(conditions) == 1 and isinstance(conditions[0], ParseResults):
                return self._parse_conditions(conditions[0])

            # Handle simple conditions
            if len(conditions) == 3 and isinstance(conditions[0], str):
                return Condition(
                    column=conditions[0], operator=conditions[1], value=conditions[2]
                )

            # Handle multiple conditions with AND/OR
            elif len(conditions) > 3 or (
                len(conditions) == 3 and isinstance(conditions[0], ParseResults)
            ):
                compound = CompoundCondition(logic=conditions[1].lower(), conditions=[])

                # Add first condition
                first_condition = conditions[0]
                compound.conditions.append(self._parse_conditions(first_condition))

                # Process remaining conditions
                i = 1
                while i < len(conditions):
                    if conditions[i].lower() in ("and", "or"):
                        compound.logic = conditions[i].lower()
                        next_condition = conditions[i + 1]
                        compound.conditions.append(
                            self._parse_conditions(next_condition)
                        )
                    i += 2

                return compound

            # Handle IN conditions
            elif (
                len(conditions) == 4
                and conditions[1].lower() == "is"
                and conditions[2].lower() == "in"
            ):
                return Condition(
                    column=conditions[0], operator="in", value=list(conditions[3])
                )

        return None


def to_sql(query_result: QueryResult) -> str:
    """
    Convert a QueryResult object to a SQL query string.

    Args:
        query_result (QueryResult): The parsed query result to convert

    Returns:
        str: The SQL query string
    """
    # Start with SELECT and columns
    sql_parts = ["SELECT", ", ".join(query_result.columns)]

    # Add FROM clause - assuming a placeholder table name since it's not in the original parser
    sql_parts.extend(["FROM", "activities"])

    # Add WHERE clause if conditions exist
    if query_result.conditions:
        sql_parts.append("WHERE")
        sql_parts.append(_conditions_to_sql(query_result.conditions))

    # Add ORDER BY clause if sort exists
    if query_result.sort:
        direction = (
            "ASC" if query_result.sort.direction.lower() == "ascending" else "DESC"
        )
        sql_parts.extend(["ORDER BY", f"{query_result.sort.column} {direction}"])

    # Add LIMIT clause if it exists
    if query_result.limit is not None:
        sql_parts.extend(["LIMIT", str(query_result.limit)])

    return " ".join(sql_parts)


def _conditions_to_sql(condition: Union[Condition, CompoundCondition]) -> str:
    """
    Convert conditions to SQL WHERE clause syntax.

    Args:
        condition (Union[Condition, CompoundCondition]): The condition to convert

    Returns:
        str: The SQL condition string
    """
    if isinstance(condition, Condition):
        # Handle simple conditions
        if condition.operator.lower() == "in":
            values = [
                f"'{v}'" if isinstance(v, str) else str(v) for v in condition.value
            ]
            return f"{condition.column} IN ({', '.join(values)})"
        else:
            # Convert 'is' operator to '='
            operator = "=" if condition.operator.lower() == "is" else condition.operator

            # Handle string values
            value = (
                f"'{condition.value}'"
                if isinstance(condition.value, str)
                else condition.value
            )
            return f"{condition.column} {operator} {value}"

    elif isinstance(condition, CompoundCondition):
        # Handle compound conditions
        subconditions = [_conditions_to_sql(cond) for cond in condition.conditions]
        join_operator = f" {condition.logic.upper()} "
        return f"({join_operator.join(subconditions)})"


def parse_query(query: str) -> QueryResult:
    """
    Convenience function to parse a query string.

    Args:
        query (str): The query string to parse

    Returns:
        QueryResult: The parsed query information

    Raises:
        QueryParseError: If the query cannot be parsed
    """
    parser = QueryParser(query)
    return parser.parse()
