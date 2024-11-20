"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      // Ensure default values are set properly for 'create' and 'update' cases
      ...data,
      startTime: data?.startTime
        ? new Date(data.startTime).toISOString().slice(0, 16)
        : "",
      endTime: data?.endTime
        ? new Date(data.endTime).toISOString().slice(0, 16)
        : "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
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
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Name Field (for student name or identifier) */}
        <InputField
          lable="Student Name"
          name="studentId"
          defaultValue={data?.studentId}
          register={register}
          error={errors?.studentId}
        />

        {/* Score Field */}
        <InputField
          lable="Score"
          name="score"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
          type="number"
        />

        {/* Hidden ID Field for Updates */}
        {data && (
          <InputField
            lable="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        {/* Exam ID */}
        <InputField
          lable="Exam ID"
          name="examId"
          defaultValue={data?.examId || ""}
          register={register}
          error={errors?.examId}
          type="number"
        />

        {/* Assignment ID */}
        <InputField
          lable="Assignment ID"
          name="assignmentId"
          defaultValue={data?.assignmentId || ""}
          register={register}
          error={errors?.assignmentId}
          type="number"
        />
      </div>

      {/* Error handling */}
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
