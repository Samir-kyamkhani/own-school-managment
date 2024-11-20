import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserId } from "@/lib/utils";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import React from "react";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const renderRow = (item: ExamList, role: string | undefined) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purpleLight "
  >
    <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
    <td>{item.lesson.class.name}</td>
    <td className="hidden md:table-cell">
      {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
    </td>
    <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-IN").format(item.startTime)}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {/* <Link href={`/list/teachers/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-sky">
            <Image src="/edit.png" alt="edit" width={16} height={16} />
          </button>
        </Link> */}
        {role === "admin" ||
          (role === "teacher" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-newPurple">
            //   <Image src="/delete.png" alt="delete" width={16} height={16} />
            // </button>
            <>
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </>
          ))}
      </div>
    </td>
  </tr>
);

const ExamsListPage = async ({
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
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },

    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "actions",
          },
        ]
      : []),
  ];

  // URL PARAMS CONDITIONS
  const query: Prisma.ExamWhereInput = {};
  query.lesson = {};
  if (queryParams) {
    for (const [key, vlaue] of Object.entries(queryParams)) {
      if (vlaue !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(vlaue);
            break;
          case "teacherId":
            query.lesson.teacherId = vlaue;
            break;
          case "search":
            query.lesson.subject = {
              name: {
                contains: vlaue,
                mode: "insensitive",
              },
            };
            break;

          default:
            break;
        }
      }
    }
  }

  //RollConditions

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = userId as string;
      break;
    case "student":
      query.lesson = {
        class: {
          students: {
            some: {
              id: userId as string,
            },
          },
        },
      };
      break;
    case "parent":
      query.lesson = {
        class: {
          students: {
            some: {
              parentId: userId as string,
            },
          },
        },
      };
      break;
    default:
      break;
  }

  const [examsData, totalExams] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      skip: (pageNumber - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
    }),
    prisma.exam.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold ">All Exams</h1>
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
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List  */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={examsData}
      />

      {/* Pagination  */}
      <Pagination page={pageNumber} count={totalExams} />
    </div>
  );
};
export default ExamsListPage;
