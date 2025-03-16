import {
  Card,
  CardHeader,
  Button,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Drawer,
  Tabs,
  Tab,
  Spacer,
  Divider,
} from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { HelpCircle, HistoryIcon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import History from "@/components/queries/search/history";
import SearchBar from "@/components/queries/search/search-bar";


const QueryInterface = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTab, setSelectedTab] = useState("search");
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const setSearch = (query) => {
    setSelectedTab("search");
    setQuery(query);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto p-4 space-y-3">
        <Card className="p-8" shadow="sm">
          <CardHeader className="flex justify-between items-center p-0 pb-4">
            <div>
              <h1 className="text-xl font-bold">Query Engine</h1>
              <p className="text-[.8rem] font-light text-default-500">
                Query physical activity monitoring data from 9 subjects and 18
                activities
              </p>
            </div>
            <Button
              onPress={onOpen}
              isIconOnly
              variant="light"
              aria-label="Help"
              className="text-default-400 hover:text-default-500"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </CardHeader>
          <Tabs
            aria-label="Window"
            fullWidth
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
          >
            <Tab
              key="search"
              title={
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Query builder</span>
                </div>
              }
            >
              <SearchBar
                query={query}
                searchHistory={searchHistory}
                setQuery={setQuery}
                setSearchHistory={setSearchHistory}
              />
            </Tab>
            <Tab
              key="history"
              title={
                <div className="flex items-center space-x-2">
                  <HistoryIcon className="h-4 w-4" />
                  <span>History</span>
                </div>
              }
            >
              <History
                setSearch={setSearch}
                searchHistory={searchHistory}
                setSearchHistory={setSearchHistory}
              />
            </Tab>
          </Tabs>
        </Card>
      </div>

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        size="4xl"
        aria-labelledby="query-guide-title"
      >
        <DrawerContent>
          <DrawerHeader>
            <h4 id="query-guide-title">Query Language Guide</h4>
          </DrawerHeader>

          <DrawerBody>
            <h5>Overview</h5>
            <p>
              This guide explains the syntax and functionality of the custom
              query language parser. It enables users to construct SQL-like
              queries in a simple, human-readable format for selecting,
              filtering, sorting, and limiting data.
            </p>
            <Spacer y={1} />

            <Divider />

            <Spacer y={0.5} />
            <h5>Features</h5>
            <ul style={{ paddingLeft: "1rem", lineHeight: "1.8" }}>
              <li>
                <b>Column Selection:</b> Specify the columns to retrieve. Use{" "}
                <code>*</code> for all columns.
              </li>
              <li>
                <b>WHERE Clauses:</b> Add conditions to filter data. Supports{" "}
                <code>AND</code>, <code>OR</code>, and nested conditions.
              </li>
              <li>
                <b>Sorting:</b> Use <code>sorted by</code> to sort results in
                ascending or descending order.
              </li>
              <li>
                <b>Limiting Results:</b> Limit the number of rows returned using
                the <code>limit</code> keyword.
              </li>
            </ul>

            <Spacer y={1} />
            <Divider />

            <Spacer y={0.5} />
            <h5>Syntax Examples</h5>
            <ul style={{ paddingLeft: "1rem", lineHeight: "1.8" }}>
              <li>
                <b>Select All:</b> <code>Show me *</code>
              </li>
              <li>
                <b>Filter with Conditions:</b>{" "}
                <code>
                  Show me column1, column2 where column1 &gt; 10 limit 5
                </code>
              </li>
              <li>
                <b>Sorted Results:</b>{" "}
                <code>
                  Show me column1, column2 sorted by column1 descending
                </code>
              </li>
              <li>
                <b>Limit Rows:</b> <code>Show me column1, column2 limit 5</code>
              </li>
              <li>
                <b>Complex Query:</b>{" "}
                <code>
                  Show me column1, column2 where (column1 &gt; 10 and column2
                  &le; 20) or column3 = 'value'
                </code>
              </li>
            </ul>

            <Spacer y={1} />
            <Divider />

            <Spacer y={0.5} />
            <p>Helpful Tips</p>
            <ul style={{ paddingLeft: "1rem", lineHeight: "1.8" }}>
              <li>
                Use single or double quotes for string values in conditions.
              </li>
              <li>Nested conditions require parentheses for grouping.</li>
              <li>Ensure all column names match the dataset schema.</li>
            </ul>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </DefaultLayout>
  );
};

export default QueryInterface;
