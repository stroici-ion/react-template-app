import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Header } from "../components/Header";
import { useTheme } from "../hooks/useTheme";
import Title from "../components/UI/Title";

// --- Sample Mock Data ---
const processingData = [
  { name: "08:00", volume: 2400 },
  { name: "09:00", volume: 1398 },
  { name: "10:00", volume: 9800 },
  { name: "11:00", volume: 3908 },
  { name: "12:00", volume: 4800 },
  { name: "13:00", volume: 3800 },
  { name: "14:00", volume: 4300 },
];

const sourceData = [
  { name: "API Logs", value: 400, color: "#60a5fa" }, // Blue
  { name: "Database Dump", value: 300, color: "#c084fc" }, // Purple
  { name: "S3 Buckets", value: 300, color: "#4ade80" }, // Green
  { name: "Kafka Stream", value: 200, color: "#fb923c" }, // Orange
];

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const gridStroke = isDark ? "#374151" : "#e5e7eb";
  const axisStroke = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipColor = isDark ? "#fff" : "#111827";
  const pieStroke = isDark ? "#1f2937" : "#ffffff";
  const legendColor = isDark ? "#9ca3af" : "#4b5563";

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* 1. Header / Navigation Bar */}
      <Header />
      {/* 4. Main Content Area */}
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:space-y-10 sm:p-6 md:p-10">
        {/* Welcome Banner */}
        <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <Title text="Data Processing Pipeline" />
          <p className="max-w-3xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Monitor, analyze, and manage your data ingestion and processing
            workflows in real-time. Total data integrity, unmatched performance.
          </p>
        </header>

        {/* 5. Statistics Cards (Theme) */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Total Rows Processed",
              value: "1,284,591",
              icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              change: "+12.5% this week",
              changeType: "positive",
            },
            {
              title: "API Integration Points",
              value: "24 Active",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
              change: "2 connection alerts",
              changeType: "negative",
            },
            {
              title: "Data Pipeline Status",
              value: "Healthy (99.8%)",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              change: "Uptime last 24h",
              changeType: "neutral",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h3>
                <svg
                  className="h-6 w-6 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={stat.icon}
                  />
                </svg>
              </div>
              <p className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <span
                className={`text-sm ${stat.changeType === "positive" ? "text-green-600 dark:text-green-400" : stat.changeType === "negative" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}
              >
                {stat.change}
              </span>
            </div>
          ))}
        </section>

        {/* 6. Diagrams Section */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Chart - Processing Volume */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
            <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-gray-100">
              Processing Volume (Last 7 Hours)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={processingData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorVolume"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="name"
                    stroke={axisStroke}
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={axisStroke}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: "none",
                      borderRadius: "8px",
                      color: tooltipColor,
                    }}
                    cursor={{ stroke: "#60a5fa" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Chart - Data Breakdown */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">
              Data Source Mix
            </h3>
            <div className="h-80 w-full flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={pieStroke}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: "none",
                      borderRadius: "8px",
                      color: tooltipColor,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: legendColor,
                      paddingTop: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
