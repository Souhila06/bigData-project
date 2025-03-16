import { Tooltip } from "@heroui/react";
import { CopyPlus, X } from "lucide-react";
import { useState } from "react";

interface HistoryProps {
  setSearch: (query: any) => void;
  searchHistory: string[];
  setSearchHistory: (history: string[]) => void;
}

const History = ({
  setSearch,
  searchHistory,
  setSearchHistory,
}: HistoryProps) => {
  const handleDeletion = (queryToDelete: string) => {
    console.log(searchHistory);
    const updatedHistory = searchHistory.filter(
      (query) => query !== queryToDelete,
    );
    console.log(updatedHistory);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  return (
    <div className="space-y-4 mt-5">
      <div className="grid gap-2">
        {searchHistory.length > 0 &&
          searchHistory.map((historicalQuery, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-lg border border-divider text-default-600 hover:bg-default-100 flex justify-between items-center transition-colors duration-200 ease-in-out"
            >
              <div
                className="flex gap-x-4 items-center flex-grow p-3"
                onClick={() => setSearch(historicalQuery)}
              >
                <CopyPlus className="h-5 w-5" />
                <p className="font-mono text-[.7rem]">{historicalQuery}</p>
              </div>
              <Tooltip content="Remove from history" closeDelay={100}>
                <X
                  className="w-5 h-5 mx-3"
                  onClick={() => handleDeletion(historicalQuery)}
                />
              </Tooltip>
            </div>
          ))}

        {searchHistory.length === 0 && (
          <div className="w-full flex justify-center">
            The previous queries will be shown here.
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
