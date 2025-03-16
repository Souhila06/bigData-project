import { useQuery } from "@/contexts/query-context";
import {
  Accordion,
  AccordionItem,
  Divider,
  Code,
  Chip,
  Snippet,
} from "@heroui/react";
import { Bug, Shuffle } from "lucide-react";

const DebugInfos = () => {
  const { response } = useQuery();

  const handleColumnDeletion = () => {
    console.info("TODO: debug-info.tsx => handleColumnDeletion");
  };

  return (
    <Accordion variant="splitted" isCompact className="px-0">
      <AccordionItem
        key="1"
        aria-label="Accordion 1"
        title="Debug informations"
        startContent={<Bug className="text-default-500 w-5 h-5" />}
      >
        <div className="flex gap-4 items-center mt-4">
          <Snippet
            symbol=""
            size="sm"
            color="warning"
            className="font-mono text-[.7rem]"
            classNames={{ copyButton: "min-w-6 w-6 h-6" }}
          >
            {response?.metadata.original_query}
          </Snippet>
          <Shuffle className="h-4 w-4" />
          <Snippet
            size="sm"
            color="success"
            className="font-mono text-[.7rem]"
            classNames={{ copyButton: "min-w-6 w-6 h-6", copyIcon: "w-4 h-4" }}
          >
            {response?.metadata.parsed_sql}
          </Snippet>
        </div>

        <Divider className="my-4" />

        <div
          className="grid grid-cols-2 gap-2 text-[.7rem] pb-2"
          classNames={{ copyButton: "min-w-6 w-6 h-6", copyIcon: "w-4 h-4" }}
        >
          <div>
            <div className="text-default-500">Query Time</div>
            <div className="font-mono text-sm">
              {response?.stats.query_time.toFixed(2)}s
            </div>
          </div>

          <div>
            <div className="text-default-500">Execution Timestamp</div>
            <div className="font-mono text-sm">
              {response?.metadata.execution_timestamp}
            </div>
          </div>

          <div>
            <div className="text-default-500">Page</div>
            <div className="font-mono text-sm">
              {response?.stats.current_page} of {response?.stats.total_pages}
            </div>
          </div>

          <div>
            <div className="text-default-500">Page Size</div>
            <div className="font-mono text-sm">{response?.stats.page_size}</div>
          </div>

          <div>
            <div className="text-default-500">Total Rows</div>
            <div className="font-mono text-sm my-1">
              {response?.stats.total_rows}
            </div>
          </div>

          <div>
            <div className="text-default-500">Columns Requested</div>
            <div className="font-mono text-sm">
              {response?.metadata.columns_requested.map((col, index) => (
                <Chip
                  className="mr-2 my-1"
                  size="sm"
                  variant="flat"
                  key={index}
                  {...(response?.metadata.columns_requested.length > 1 && {
                    onClose: handleColumnDeletion,
                  })}
                >
                  {col}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default DebugInfos;
