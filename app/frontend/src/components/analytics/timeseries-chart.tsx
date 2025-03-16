import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardBody } from "@heroui/react";

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

const TimeSeriesChart = ({ data, xFeatures, yFeatures, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center h-96">
          Loading chart data...
        </CardBody>
      </Card>
    );
  }

  if (!data || !data.length) return null;

  return (
    <Card>
      <CardBody>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xFeatures[0]}
              label={{ value: xFeatures[0], position: "bottom" }}
            />
            <YAxis label={{ value: "Value", angle: -90, position: "left" }} />
            <Tooltip />
            <Legend />
            {yFeatures.map((feature, index) => (
              <Line
                key={feature}
                type="monotone"
                dataKey={feature}
                stroke={COLORS[index % COLORS.length]}
                dot={false}
                name={feature}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default TimeSeriesChart;
