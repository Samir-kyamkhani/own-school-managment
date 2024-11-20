import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserId } from "@/lib/utils";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const renderRow = (item: TeacherList, role: string | undefined) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purpleLight "
  >
    <td className="flex items-center gap-4 p-4">
      <Image
        src={item.img || "/noAvatar.png"}
        alt={item.name}
        width={40}
        height={40}
        className="md:hidden lg:block w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-500 text-xs">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.username}</td>
    <td className="hidden md:table-cell">
      {item.subjects.map((subject) => subject.name).join(", ")}
    </td>
    <td className="hidden md:table-cell">
      {item.classes.map((classItem) => classItem.name).join(", ")}
    </td>
    <td className="hidden md:table-cell">{item.phone}</td>
    <td className="hidden md:table-cell">{item.address}</td>
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/teachers/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-sky">
            <Image src="/view.png" alt="view" width={16} height={16} />
          </button>
        </Link>
        {role === "admin" && (
          <FormContainer table="teacher" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
);

const TeachersListPage = async ({
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
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher Id",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "clasess",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
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
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, vlaue] of Object.entries(queryParams)) {
      if (vlaue !== undefined) {
        switch (key) {
          case "classId":
            {
              query.lessons = {
                some: {
                  classId: parseInt(vlaue),
                },
              };
            }
            break;
          case "search":
            query.name = {
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

  const [teachersData, totalTeachers] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      take: ITEM_PER_PAGE,
      skip: (pageNumber - 1) * ITEM_PER_PAGE,
    }),

    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold ">All Teachers</h1>
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
              <FormContainer table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* List  */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={teachersData}
      />

      {/* Pagination  */}
      <Pagination page={pageNumber} count={totalTeachers} />
    </div>
  );
};

export default TeachersListPage;
