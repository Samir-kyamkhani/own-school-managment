import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserId } from "@/lib/utils";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import React from "react";

type LessonsList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

const renderRow = (item: LessonsList, role: string | undefined) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purpleLight "
  >
    <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
    <td>{item.class.name}</td>
    <td className="hidden md:table-cell">
      {item.teacher.name + " " + item.teacher.surname}
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
            <FormModal table="lessons" type="update" data={item} />
            <FormModal table="lessons" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const LessonsListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;
  const pageNumber = parseInt(page || "1");

  // Get session and role
  const { role } = await getRoleAndUserId();

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },

    {
      header: "Teacher",
      accessor: "teacher",
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
  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, vlaue] of Object.entries(queryParams)) {
      if (vlaue !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(vlaue);
            break;
          case "teacherId":
            query.teacherId = vlaue;
            break;
          case "search":
            query.OR = [
              {
                subject: {
                  name: {
                    contains: vlaue,
                    mode: "insensitive",
                  },
                },
              },
              {
                teacher: {
                  name: {
                    contains: vlaue,
                    mode: "insensitive",
                  },
                },
              },
            ];
            break;

          default:
            break;
        }
      }
    }
  }

  const [lessonsData, totalLessons] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      skip: (pageNumber - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
    }),
    prisma.lesson.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold ">
          All Classes Lessons
        </h1>
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
              <FormModal table="lessons" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List  */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={lessonsData}
      />

      {/* Pagination  */}
      <Pagination page={pageNumber} count={totalLessons} />
    </div>
  );
};

export default LessonsListPage;
