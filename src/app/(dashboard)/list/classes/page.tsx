import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getRoleAndUserId } from "@/lib/utils";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import React from "react";

type ClassesList = Class & { supervisor: Teacher };

const renderRow = (item: ClassesList, role: string | undefined) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purpleLight "
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.capacity}</td>
    <td className="hidden md:table-cell">{item.name[0]}</td>
    <td className="hidden sm:table-cell">
      {item.supervisor.name + " " + item.supervisor.surname}
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
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const ClassesListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;
  const pageNumber = parseInt(page || "1");

  // Get session and role
  const { role } = await getRoleAndUserId();

  // URL PARAMS CONDITIONS
  const query: Prisma.ClassWhereInput = {};

  const columns = [
    {
      header: "Class Name",
      accessor: "name",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },

    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
      className: "hidden sm:table-cell",
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

  if (queryParams) {
    for (const [key, vlaue] of Object.entries(queryParams)) {
      if (vlaue !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = vlaue;
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

  const [classesData, totalClasses] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
      },
      skip: (pageNumber - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
    }),
    prisma.class.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* top  */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold ">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow">
              <Image src="/filter.png" alt="filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow">
              <Image src="/sort.png" alt="filter" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
      </div>

      {/* List  */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={classesData}
      />

      {/* Pagination  */}
      <Pagination page={pageNumber} count={totalClasses} />
    </div>
  );
};

export default ClassesListPage;
