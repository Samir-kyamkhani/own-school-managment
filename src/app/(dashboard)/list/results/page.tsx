import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserId } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import React from "react";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  StudentSurename: string;
  teacherName: string;
  teacherSurename: string;
  score: number;
  className: string;
  startTime: Date;
};

const renderRow = (item: ResultList, role: string | undefined) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purpleLight "
  >
    <td className="flex items-center gap-4 p-4">{item.title}</td>
    <td className="">{item.studentName + " " + item.StudentSurename}</td>
    <td className="hidden md:table-cell">{item.score}</td>
    <td className="hidden md:table-cell">
      {item.teacherName + " " + item.teacherSurename}
    </td>
    <td className="hidden md:table-cell">{item.className}</td>
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
            <>
              <FormModal table="result" type="update" data={item} />
              <FormModal table="result" type="delete" id={item.id} />
            </>
          ))}
      </div>
    </td>
  </tr>
);

const ResultsListPage = async ({
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
      header: "Title",
      accessor: "title",
    },
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Score",
      accessor: "score",
      className: "hidden md:table-cell",
    },

    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
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

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, vlaue] of Object.entries(queryParams)) {
      if (vlaue !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = vlaue;
            break;

          case "search":
            query.OR = [
              { exam: { title: { contains: vlaue, mode: "insensitive" } } },
              { student: { name: { contains: vlaue, mode: "insensitive" } } },
            ];
            break;

          default:
            break;
        }
      }
    }
  }

  //roleCondintions

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: userId as string } } },
        { assignment: { lesson: { teacherId: userId as string } } },
      ];
      break;
    case "student":
      query.studentId = userId as string;
      break;

    case "parent":
      query.student = {
        parentId: userId as string,
      };
      break;
    default:
      break;
  }

  const [data, totalResults] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: {
          select: {
            name: true,
            surname: true,
          },
        },
        exam: {
          include: {
            lesson: {
              select: {
                teacher: { select: { name: true, surname: true } },
                class: { select: { name: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                teacher: { select: { name: true, surname: true } },
                class: { select: { name: true } },
              },
            },
          },
        },
      },
      skip: (pageNumber - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
    }),
    prisma.result.count({
      where: query,
    }),
  ]);

  const resultsData = data.map((item) => {
    const assesment = item.exam || item.assignment;

    if (!assesment) return null;

    const isExam = "startTime" in assesment;

    return {
      id: item.id,
      title: assesment.title,
      studentName: item.student.name,
      StudentSurename: item.student.surname,
      teacherName: assesment.lesson.teacher.name,
      teacherSurename: assesment.lesson.teacher.surname,
      score: item.score,
      className: assesment.lesson.class.name,
      startTime: isExam ? assesment.startTime : assesment.startDate,
    };
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold ">
          Student Results
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
              <FormModal table="result" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List  */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={resultsData}
      />

      {/* Pagination  */}
      <Pagination page={pageNumber} count={totalResults} />
    </div>
  );
};

export default ResultsListPage;
