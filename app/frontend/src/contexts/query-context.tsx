import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { ApiResponse } from "@/types";
import { useApi } from "@/hooks/use-api";

interface QueryOptions {
  page?: number;
  pageSize?: number;
}

interface QueryContextType {
  query: string;
  response: ApiResponse | undefined;
  isLoading: boolean;
  page: number;
  pageSize: number;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  executeQuery: (options?: QueryOptions) => Promise<void>;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<ApiResponse | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const { post, isLoading } = useApi();
  const executionTracker = useRef<string>("");

  const executeQuery = useCallback(
    async (options?: QueryOptions) => {
      if (!query) return;

      const currentPage = options?.page ?? page;
      const currentPageSize = options?.pageSize ?? pageSize;
      const currentKey = `${query}:${currentPage}:${currentPageSize}`;

      // Avoid duplicate executions
      if (executionTracker.current === currentKey) return;

      executionTracker.current = currentKey;

      try {
        const { data } = await post("/query/parse", {
          query,
          page_size: currentPageSize,
          page: currentPage,
        });

        setResponse(data);
        if (options?.page !== undefined) setPage(currentPage); // Only update if explicitly provided
        if (options?.pageSize !== undefined) setPageSize(currentPageSize);
      } catch (error) {
        console.error("Failed to execute query:", error);
        setResponse(undefined);
      }
    },
    [query, page, pageSize],
  );

  const contextValue: QueryContextType = {
    query,
    response,
    isLoading,
    page,
    pageSize,
    setQuery,
    setPage,
    setPageSize,
    executeQuery,
  };

  return (
    <QueryContext.Provider value={contextValue}>
      {children}
    </QueryContext.Provider>
  );
};

export const useQuery = (): QueryContextType => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQuery must be used within a QueryProvider");
  }
  return context;
};
