import { useApi } from "@/hooks/use-api";
import { Button, Card, Chip, Divider, Input } from "@heroui/react";
import { indexOf } from "lodash";
import { CopyPlus, Divide, PlayCircle, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface SearchBarProps {
  query: string;
  searchHistory: string[];
  setQuery: (query: any) => void;
  setSearchHistory: (newHistory: string[]) => void;
}

const suggestions = [
  {
    query: "Show me activityID limit 10",
    description: "View the latest 10 activities",
  },
  {
    query: "Show me * where heart_rate > 100 limit 50",
    description: "Find high heart rate events",
  },
  {
    query: "Show me * where steps > 10000",
    description: "Find days with high step counts",
  },
  {
    query: "Show me avg(heart_rate) group by date",
    description: "Average heart rate by day",
  },
];

const availableRows = [
  "activityID",
  "ankle_acc_6_x",
  "ankle_acc_6_y",
  "ankle_acc_6_z",
  "ankle_acc_16_x",
  "ankle_acc_16_y",
  "ankle_acc_16_z",
  "ankle_gyro_x",
  "ankle_gyro_y",
  "ankle_gyro_z",
  "ankle_mag_x",
  "ankle_mag_y",
  "ankle_mag_z",
  "ankle_orient_w",
  "ankle_orient_x",
  "ankle_orient_y",
  "ankle_orient_z",
  "ankle_temp",
  "chest_acc_6_x",
  "chest_acc_6_y",
  "chest_acc_6_z",
  "chest_acc_16_x",
  "chest_acc_16_y",
  "chest_acc_16_z",
  "chest_gyro_x",
  "chest_gyro_y",
  "chest_gyro_z",
  "chest_mag_x",
  "chest_mag_y",
  "chest_mag_z",
  "chest_orient_w",
  "chest_orient_x",
  "chest_orient_y",
  "chest_orient_z",
  "chest_temp",
  "hand_acc_6_x",
  "hand_acc_6_y",
  "hand_acc_6_z",
  "hand_acc_16_x",
  "hand_acc_16_y",
  "hand_acc_16_z",
  "hand_gyro_x",
  "hand_gyro_y",
  "hand_gyro_z",
  "hand_mag_x",
  "hand_mag_y",
  "hand_mag_z",
  "hand_orient_w",
  "hand_orient_x",
  "hand_orient_y",
  "hand_orient_z",
  "hand_temp",
  "heart_rate",
  "subject_id",
  "timestamp",
];

const SearchBar = ({
  query,
  setQuery,
  searchHistory,
  setSearchHistory,
}: SearchBarProps) => {
  const navigate = useNavigate();
  const { get } = useApi();
  const [features, setFeatures] = useState<String[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      try {
        const { data } = await get("/stats/features");
        setFeatures(data.data);
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    };

    fetchData();
  }, [get]);

  const applySearch = () => {
    saveToHistory(query);
    navigate("/query/result", { state: { query } });
  };

  const saveToHistory = (newQuery: string) => {
    if (!newQuery.trim()) return;

    const updatedHistory = [
      newQuery,
      ...searchHistory.filter((q) => q !== newQuery),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  return (
    <>
      <div className="px-0 py-4 space-y-3 grid grid-cols-12 items-center justify-center gap-5">
        <div className="col-span-10">
          <Input
            value={query}
            onValueChange={setQuery}
            placeholder="Enter your query..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            size="lg"
          />
        </div>
        <div className="col-span-2 !mt-0 h-full">
          <Button
            color="primary"
            className="w-full h-full"
            startContent={<PlayCircle className="w-5 h-5" />}
            onPress={applySearch}
            isDisabled={query === ""}
          >
            Run Query
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 col-sp mt-8">
        <div>
          <p className="text-default-500 text-sm">Suggested queries</p>

          <div className="flex flex-col gap-y-2 mt-3">
            {suggestions.map((historicalQuery, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg border border-divider text-default-600 hover:bg-default-100 flex justify-between items-center transition-colors duration-200 ease-in-out"
                onClick={() => setQuery(historicalQuery.query)}
              >
                <div className="flex gap-x-4 items-center flex-grow p-3">
                  <CopyPlus className="h-5 w-5" />
                  <p className="font-mono text-[.7rem]">
                    {historicalQuery.query}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-default-500 text-sm">Available features</div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {features.map((row, index) => (
              <Button
                key={index}
                radius="full"
                size="sm"
                variant="flat"
                onPress={() => {
                  setQuery(query + ", " + row);
                }}
              >
                {row}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
