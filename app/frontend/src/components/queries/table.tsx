import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { APIData } from "@/types";
import TableBottom from "./table-bottom";
import { useQuery } from "@/contexts/query-context";

const QueryTable = () => {
  const { response } = useQuery();
  const columns = response?.metadata.columns_requested || [];
  const data = response?.data || [];

  return (
    <Table
      isHeaderSticky
      aria-label="Example table with custom cells, pagination and sorting"
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      topContentPlacement="outside"
      bottomContent={<TableBottom />}
    >
      <TableHeader>
        {columns.map((col, index) => (
          <TableColumn key={index}>{col}</TableColumn>
        ))}
      </TableHeader>
      <TableBody emptyContent="No results for this query.">
        {data.map((row: APIData, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((col: string, colIndex) => (
              <TableCell key={colIndex}>{row[col]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default QueryTable;
