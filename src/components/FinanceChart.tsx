"use client";

import Image from "next/image";
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

const data = [
  {
    name: "Jan",
    income: 400,
    expense: 200,
  },
  {
    name: "Feb",
    income: 300,
    expense: 100,
  },
  {
    name: "Mar",
    income: 200,
    expense: 50,
  },
  {
    name: "Apr",
    income: 278,
    expense: 300,
  },
  {
    name: "May",
    income: 189,
    expense: 480,
  },
  {
    name: "Jun",
    income: 239,
    expense: 380,
  },
  {
    name: "Jul",
    income: 349,
    expense: 430,
  },
  {
    name: "Aug",
    income: 349,
    expense: 430,
  },
  {
    name: "Sep",
    income: 349,
    expense: 430,
  },
  {
    name: "Oct",
    income: 349,
    expense: 430,
  },
  {
    name: "Nov",
    income: 349,
    expense: 430,
  },
  {
    name: "Dec",
    income: 349,
    expense: 430,
  },
];

export default function FinanceChart() {
  return (
    <div className=" bg-white rounded-xl p-4 w-full h-full">
      {/* Title  */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Image src="/moreDark.png" alt="more" height={20} width={20} />
      </div>

      <div className="relative w-full h-[90%]">
        <ResponsiveContainer>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: "#d1d5db" }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#d1d5db" }}
              tickLine={false}
              tickMargin={20}
            />
            <Tooltip />
            <Legend
              align="center"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#C3EBFA"
              strokeWidth={5}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#CFCEFF"
              strokeWidth={5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
