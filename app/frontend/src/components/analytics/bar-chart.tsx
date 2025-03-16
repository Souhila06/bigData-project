import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BarChartAnalytic = ({
  title,
  data,
  xAxisKey = "activity",
  yAxisKey = "duration",
  tooltipLabel = "Duration",
  tooltipUnit = "s",
  domain = [60, 80],
  ticks = [60, 65, 70, 75, 80],
  barColor = "#3b82f6",
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="border border-divider rounded-lg p-3 shadow-lg bg-default-50">
          <p className="text-sm font-semibold mb-2">{label}</p>
          <div className="flex justify-between items-center gap-4 text-sm">
            <span>{tooltipLabel}:</span>
            <span className="font-medium">
              {payload[0].value}
              {tooltipUnit && ` ${tooltipUnit}`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="">{title}</p>
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 15, left: 15, bottom: 0 }}
          >
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              domain={domain}
              ticks={ticks}
              width={25}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey={yAxisKey} fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartAnalytic;
