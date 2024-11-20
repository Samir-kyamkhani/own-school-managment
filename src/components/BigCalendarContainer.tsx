import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const resData = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });

  const data = resData.map((lesson) => ({
    title: lesson.name,
    start: new Date(lesson.startTime),
    end: new Date(lesson.endTime),
  }));

  const schedual = adjustScheduleToCurrentWeek(data);

  return (
    <div className="">
      <BigCalendar data={schedual} />
    </div>
  );
};

export default BigCalendarContainer;