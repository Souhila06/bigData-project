import { useQuery } from "@/contexts/query-context";
import { Pagination } from "@heroui/react";
import { useEffect, useState } from "react";

const TableBottom = () => {
  const { response, setPage, isLoading } = useQuery();
  const [currentPage, setCurrentPage] = useState<number | null>(null);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (response?.stats.current_page !== undefined) {
      setCurrentPage(response.stats.current_page);
    }
  }, [response]);

  return (
    <div className="flex justify-end">
      {currentPage !== null && (
        <Pagination
          page={currentPage}
          total={response?.stats.total_pages || 0}
          isCompact
          showControls
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TableBottom;
