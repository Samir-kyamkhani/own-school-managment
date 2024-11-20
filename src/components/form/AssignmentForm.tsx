"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  AssignmentSchema,
  assignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AssignmentSchema; // Strongly type `data`
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: number; name: string }[] }; // Strongly type `relatedData`
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      ...data,
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().slice(0, 16)
        : "",
      dueDate: data?.dueDate
        ? new Date(data.dueDate).toISOString().slice(0, 16)
        : "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Title Field */}
        <InputField
          lable="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        {/* Start Date Field */}
        <InputField
          lable="Start Date"
          name="startDate"
          defaultValue={data?.startDate}
          register={register}
          error={errors?.startDate}
          type="datetime-local"
        />

        {/* Due Date Field */}
        <InputField
          lable="Due Date"
          name="dueDate"
          defaultValue={data?.dueDate}
          register={register}
          error={errors?.dueDate}
          type="datetime-local"
        />

        {/* Lesson Select Field */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId || ""}
          >
            {relatedData?.lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors?.lessonId && (
            <p className="text-xs text-red-400">{errors.lessonId.message}</p>
          )}
        </div>
      </div>

      {errors && (
        <span className="text-red-500">Please fix the errors above.</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
