import DebugInfos from "@/components/queries/debug-infos";
import QueryTable from "@/components/queries/table";
import DefaultLayout from "@/layouts/default";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { QueryProvider, useQuery } from "@/contexts/query-context";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const QueryPage = () => {
  const location = useLocation();
  const initialQuery = location.state?.query || "";
  const { setQuery, executeQuery, response: resp, isLoading } = useQuery();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeQuery();
    }
  }, [initialQuery, setQuery, executeQuery]);

  return (
    <DefaultLayout>
      <div className="p-10">
        <div className="space-y-4">
          <Breadcrumbs>
            <BreadcrumbItem href="/query">Query</BreadcrumbItem>
            <BreadcrumbItem>Result</BreadcrumbItem>
          </Breadcrumbs>
          <DebugInfos />
        </div>
        <div className="mt-5">
          <QueryTable />
        </div>
      </div>
    </DefaultLayout>
  );
};

const QueryPageWithProvider = () => (
  <QueryProvider>
    <QueryPage />
  </QueryProvider>
);

export default QueryPageWithProvider;
