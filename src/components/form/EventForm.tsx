"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

const EventForm = ({
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
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      // Ensure default values are set properly for 'create' and 'update' cases
      ...data,
      startDate: data?.startDate
        ? new Date(data.startDate).toISOString().slice(0, 16)
        : "",
      endDate: data?.endDate
        ? new Date(data.endDate).toISOString().slice(0, 16)
        : "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data); // Call createEvent or updateEvent based on 'type'
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Event record has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new event"
          : "Update the event record"}
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

        {/* Start Date Field */}
        <InputField
          lable="Start Date"
          type="datetime-local"
          name="startDate"
          register={register}
          error={errors?.startDate}
        />

        {/* End Date Field */}
        <InputField
          lable="End Date"
          type="datetime-local"
          name="endDate"
          register={register}
          error={errors?.endDate}
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

export default EventForm;
