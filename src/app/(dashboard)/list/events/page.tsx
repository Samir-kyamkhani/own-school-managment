import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserId } from "@/lib/utils";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import React from "react";

type EventList = Event & { class: Class };

const renderRow = (item: EventList, role: string | undefined) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purpleLight "
  >
    <td className="flex items-center gap-4 p-4">{item.title}</td>
    <td className="">{item.class?.name || "-"}</td>
    <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-IN").format(item.startDate)}
    </td>
    <td className="hidden md:table-cell">
      {item.startDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </td>
    <td className="hidden md:table-cell">
      {item.endDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {/* <Link href={`/list/teachers/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-sky">
            <Image src="/edit.png" alt="edit" width={16} height={16} />
          </button>
        </Link> */}
        {role === "admin" && (
          // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-newPurple">
          //   <Image src="/delete.png" alt="delete" width={16} height={16} />
          // </button>
          <>
            <FormModal table="event" type="update" data={item} />
            <FormModal table="event" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const EventsListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;
  const pageNumber = parseInt(page || "1");

  // Get session and role
  const { role, userId } = await getRoleAndUserId();
  const columns = [
    {
      header: "Tilte",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
    },

    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },

    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },

    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },

    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
          },
        ]
      : []),
  ];

  // URL PARAMS CONDITIONS
  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, vlaue] of Object.entries(queryParams)) {
      if (vlaue !== undefined) {
        switch (key) {
          case "search":
            query.title = {
              contains: vlaue,
              mode: "insensitive",
            };
            break;

          default:
            break;
        }
      }
    }
  }

  //ROLE CONDITIONS

  const rollConditions: Record<string, Prisma.ClassWhereInput> = {
    teacher: { lessons: { some: { teacherId: userId as string } } },
    student: { students: { some: { id: userId as string } } },
    parent: { students: { some: { parentId: userId as string } } },
  };

  query.OR = [
    { classId: null },
    { class: rollConditions[role as keyof typeof rollConditions] || {} },
  ];

  const [eventsData, totalEvents] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: (pageNumber - 1) * ITEM_PER_PAGE,
    }),

    prisma.event.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold ">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow">
              <Image src="/filter.png" alt="filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow">
              <Image src="/sort.png" alt="filter" width={14} height={14} />
            </button>
            {role === "admin" && (
              // <button className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow">
              //   <Image src="/plus.png" alt="filter" width={14} height={14} />
              // </button>
              <FormModal table="event" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List  */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={eventsData}
      />

      {/* Pagination  */}
      <Pagination page={pageNumber} count={totalEvents} />
    </div>
  );
};
export default EventsListPage;
