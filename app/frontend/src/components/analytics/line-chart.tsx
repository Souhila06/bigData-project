import { useApi } from "@/hooks/use-api";
import { Button, Select, SelectItem } from "@heroui/react";
import { h1 } from "framer-motion/client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

const AccelerometerAnalysis = () => {
  const [data, setData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activityID, setactivityID] = useState(5);
  const { get } = useApi();

  useEffect(() => {
    const fetch = async () => {
      try {
        const stats = await get("/stats/sensor-acceleration-comparison", {
          params: {
            activity_id: activityID,
            subject_id: 105,
          },
        });

        const resp = await get("/stats/activities");

        console.log(resp.data.activities);
        let test = Object.entries(resp.data.activities).map(([id, name]) => ({
          key: parseInt(id),
          name: name,
        }));

        setActivities(test);

        console.log(test);

        setData(stats.data.data);
      } catch (error) {}
    };

    fetch();
  }, [activityID]);

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

  const handleChange = (value) => {
    setactivityID(Array.from(value)[0]);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-12 justify-between items-center">
        <h3 className="text-lg font-semibold col-span-10">
          Sensor Acceleration Comparison
        </h3>
        <Select
          placeholder="Choose activity"
          className="w-full col-span-2"
          aria-label="Activities list"
          size="sm"
          onSelectionChange={(value) => handleChange(value)}
          defaultSelectedKeys={[5]}
        >
          {activities.map((activity) => (
            <SelectItem key={activity.key} className="capitalize">
              {activity.name}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis
              dataKey="timestamp"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              label={{
                value: "Acceleration Magnitude",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#525252" strokeDasharray="3 3" />

            {/* Hand acceleration */}
            <Line
              type="monotone"
              dataKey="hand"
              stroke="#ef4444"
              name="Hand"
              dot={false}
              strokeWidth={2}
            />

            {/* Chest acceleration */}
            <Line
              type="monotone"
              dataKey="chest"
              stroke="#22c55e"
              name="Chest"
              dot={false}
              strokeWidth={2}
            />

            {/* Ankle acceleration */}
            <Line
              type="monotone"
              dataKey="ankle"
              stroke="#3b82f6"
              name="Ankle"
              dot={false}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AccelerometerAnalysis;
