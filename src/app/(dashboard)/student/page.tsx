import Announcement from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { getRoleAndUserId } from "@/lib/utils";
import React from "react";

const StudentPage = async () => {
  const { userId } = await getRoleAndUserId();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  return (
    <div className="p-4 flex gap-4 flex-col lg:flex-row">
      {/* Left side  */}
      <div className="w-full lg:w-2/3  flex flex-col gap-8">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedual (4A)</h1>
          <BigCalendarContainer type="classId" id={classItem[0]?.id} />
        </div>
      </div>

      {/* Right side  */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcement />
      </div>
    </div>
  );
};

export default StudentPage;
