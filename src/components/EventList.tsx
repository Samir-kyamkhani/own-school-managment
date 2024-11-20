import prisma from "@/lib/prisma";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();

  const data = await prisma.event.findMany({
    where: {
      startDate: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  });
  return data.map((event) => (
    <div
      key={event.id}
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-sky even:border-t-newPurple"
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">{event.title}</h1>
        <span className="text-gray-300 text-xs">
          {event.startDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>
      <p
        className={`mt-2 text-sm ${
          event.description.length > 100 ? "short-description" : ""
        }`}
      >
        {event.description}
      </p>
    </div>
  ));
};

export default EventList;
