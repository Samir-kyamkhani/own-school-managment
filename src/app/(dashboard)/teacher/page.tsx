import Announcement from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { getRoleAndUserId } from "@/lib/utils";

const TeacherPage = async () => {
  const { userId } = await getRoleAndUserId();
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col lg:flex-row">
      {/* Left side  */}
      <div className="w-full lg:w-2/3  flex flex-col gap-8">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedual</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>

      {/* Right side  */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <Announcement />
      </div>
    </div>
  );
};
export default TeacherPage;
