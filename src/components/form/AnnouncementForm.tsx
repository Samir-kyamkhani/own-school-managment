"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,  // Destructure relatedData
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;  // Accept relatedData as optional prop
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      // Ensure default values are set properly for 'create' and 'update' cases
      ...data,
      date: data?.date ? new Date(data.date).toISOString().slice(0, 16) : "", // Ensure date is in ISO format for input
      classId: data?.classId ?? undefined, // classId defaults to undefined if not provided
      class: data?.class ?? relatedData?.class ?? undefined, // Default to relatedData if available
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data); // Call createAnnouncement or updateAnnouncement based on 'type'
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Announcement record has been ${
          type === "create" ? "created" : "updated"
        }!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new announcement"
          : "Update the announcement"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Title Field */}
        <InputField
          lable="Title"
          name="title"
          register={register}
          error={errors?.title}
        />

        {/* Description Field */}
        <InputField
          lable="Description"
          name="description"
          register={register}
          error={errors?.description}
        />

        {/* Date Field */}
        <InputField
          lable="Date"
          type="datetime-local"
          name="date"
          register={register}
          error={errors?.date}
        />

        {/* Class ID Field (optional) */}
        <InputField
          lable="Class ID"
          type="number"
          name="classId"
          register={register}
          error={errors?.classId}
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

export default AnnouncementForm;
