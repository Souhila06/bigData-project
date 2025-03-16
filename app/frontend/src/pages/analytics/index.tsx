import { useApi } from "@/hooks/use-api";
import DefaultLayout from "@/layouts/default";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Select,
  SelectItem,
  SelectSection,
} from "@heroui/react";
import { ChevronsUpDownIcon, Plus } from "lucide-react";
import { act, useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";

const charts = [
  { key: "0", label: "Line Chart" },
  { key: "1", label: "Bar Chart" },
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#ff0000",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#00C5FF",
];

const AnalyticsInterface = () => {
  const { get, post } = useApi();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const hasFetched = useRef(false);

  const [valuesX, setValuesX] = useState(new Set(["timestamp"]));
  const [valuesY, setValuesY] = useState(new Set([]));
  const [activity, setActivity] = useState(new Set([]));
  const [chartType, setChartType] = useState("0");
  const [disabledX, setDisabledX] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      try {
        const f_resp = await get("/stats/features_cat");
        const a_resp = await get("/stats/activities");

        const activitiesArray = Object.entries(a_resp.data.activities).map(
          ([key, value]) => ({
            id: key,
            activity: value,
          }),
        );
        setData(f_resp.data);
        setActivities(activitiesArray);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, [get]);


  const handleChartTypeChange = (value) => {
    setChartType(value.currentKey);
    if (value.currentKey === "0") {
      setValuesX(new Set(["timestamp"]));
      setDisabledX(true);
    } else {
      setDisabledX(false);
    }
  };


  const request = async () => {
    try {
      const params = {
        x_features: Array.from(valuesX),
        y_features: Array.from(valuesY),
        activity_id: activity.currentKey,
        chart_type: chartType,
      };
      const response = await post("/stats/chart-data", params);
      setChartData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="border border-divider rounded-lg p-3 shadow-lg bg-default-50">
          <p className="text-sm font-semibold mb-2">Timestamp: {label}</p>
          <div className="flex flex-col gap-2 text-sm">
            {["Hand", "Chest", "Ankle"].map((sensor, index) => (
              <div key={sensor} className="space-y-1">
                <p className="font-medium text-zinc-700">{sensor}</p>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">Magnitude:</span>
                  <span className="font-medium">
                    {payload[index]?.value?.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <DefaultLayout>
      <div className="p-5">
        <Card shadow="sm">
          <div className="px-5 pt-5">
            <p className="font-semibold">Chart Configuration</p>
          </div>
          <div className="p-5 space-y-4">
            <Select
              description="Choose your chart type"
              size="sm"
              placeholder="Select chart type"
              selectorIcon={<ChevronsUpDownIcon />}
              defaultSelectedKeys={[chartType]}
              aria-label="chart-type"
              onSelectionChange={handleChartTypeChange}
            >
              {charts.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              ))}
            </Select>

            <div className="flex flex-row gap-4">
              <Select
                isDisabled={disabledX}
                description="Choose the features you want to plot on the X axis"
                size="sm"
                aria-label="feature select"
                placeholder="Select feature"
                selectorIcon={<ChevronsUpDownIcon />}
                selectedKeys={valuesX}
                onSelectionChange={setValuesX}
                selectionMode="multiple"
                renderValue={(items) => {
                  return items.map((item) => (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="success"
                      key={item.key}
                      className="mr-1 !hover:cursor-pointer"
                      onClose={() => {
                        const newValues = new Set(valuesX);
                        newValues.delete(item.key);
                        setValuesX(newValues);
                      }}
                    >
                      {item.textValue}
                    </Chip>
                  ));
                }}
              >
                {data?.features &&
                  Object.entries(data.features).map(([title, section]) => (
                    <SelectSection showDivider key={title} title={title}>
                      {Array.isArray(section) &&
                        section.map((feature) => (
                          <SelectItem key={feature.id} value={feature.id}>
                            {feature.name}
                          </SelectItem>
                        ))}
                    </SelectSection>
                  ))}
              </Select>
              <Select
                description="Choose the features you want to plot Y"
                size="sm"
                aria-label="feature select"
                placeholder="Select feature"
                selectorIcon={<ChevronsUpDownIcon />}
                selectedKeys={valuesY}
                onSelectionChange={setValuesY}
                selectionMode="multiple"
                renderValue={(items) => {
                  return items.map((item) => (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="success"
                      key={item.key}
                      className="mr-1 !hover:cursor-pointer"
                      onClose={() => {
                        const newValues = new Set(valuesY);
                        newValues.delete(item.key);
                        setValuesY(newValues);
                      }}
                    >
                      {item.textValue}
                    </Chip>
                  ));
                }}
              >
                {data?.features &&
                  Object.entries(data.features).map(([title, section]) => (
                    <SelectSection showDivider key={title} title={title}>
                      {Array.isArray(section) &&
                        section.map((feature) => (
                          <SelectItem key={feature.id} value={feature.id}>
                            {feature.name}
                          </SelectItem>
                        ))}
                    </SelectSection>
                  ))}
              </Select>

              <Select
                size="sm"
                placeholder="Select activity"
                description="The activity you want the records to comes from"
                aria-label="activities"
                classNames={{
                  value: "capitalize",
                }}
                selectedKeys={activity}
                onSelectionChange={setActivity}
              >
                {activities.map((activity) => (
                  <SelectItem key={activity.id} className="capitalize">
                    {activity.activity}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex justify-center w-full">
              <Button
                color="primary"
                size="sm"
                onPress={() => request()}
                isDisabled={valuesY.size === 0}
              >
                Request chart
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="p-5">
        <Card>
          <CardBody>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis
                  dataKey={Array.from(valuesX)[0]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  label={{ value: Array.from(valuesX)[0], position: "bottom" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  label={{
                    value: "Value",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#525252" strokeDasharray="3 3" />

                {Array.from(valuesY).map((feature, index) => (
                  <Line
                    key={feature}
                    type="monotone"
                    dataKey={feature}
                    stroke={COLORS[index % COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    name={feature}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>{" "}
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default AnalyticsInterface;
