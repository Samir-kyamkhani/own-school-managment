"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { Day } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // Revalidate to refresh the page
    revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // Revalidate to refresh the page
    revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    // Create the user in Clerk
    const user = await clerkClient..createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });
    
    // Create teacher in the database
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Update teacher in the database
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // Delete the user in Clerk
    await client.users.deleteUser(id);

    // Delete teacher in the database
    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // Revalidate to refresh the page
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true, message: "Class is full." };
    }

    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/students");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Student ID is required." };
  }
  try {
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        ...(data.password && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/students");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await client.users.deleteUser(id);

    await prisma.student.delete({
      where: { id: id },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/students");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/exams");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/exams");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: { id: parseInt(id) },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/exams");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone!,
        address: data.address,
        students: {
          connect:
            data.students?.map((studentId: string) => ({
              id: studentId,
            })) || [],
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating parent:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Parent ID is required." };
  }

  try {
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        ...(data.password && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone!,
        address: data.address,
        students: {
          set:
            data.students?.map((studentId: string) => ({
              id: studentId,
            })) || [],
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await client.users.deleteUser(id);

    await prisma.parent.delete({
      where: { id: id },
    });

    // Revalidate path to refresh data
    revalidatePath("/list/parents");

    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day.toUpperCase() as Day, // Ensure the day is in the correct format
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId, // Link to Subject model
        classId: data.classId, // Link to Class model
        teacherId: data.teacherId, // Link to Teacher model
      },
    });

    // Optionally, you can trigger revalidation here if needed
    // revalidatePath("/list/lessons");

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating lesson:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Lesson ID is required." };
  }

  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }), // Ensure `name` is updated if present
        ...(data.day && { day: data.day.toUpperCase() as Day }), // Ensure `day` is updated if present and converted to enum format
        ...(data.startTime && { startTime: data.startTime }), // Ensure `startTime` is updated if present
        ...(data.endTime && { endTime: data.endTime }), // Ensure `endTime` is updated if present
        ...(data.subjectId && { subjectId: data.subjectId }), // Ensure `subjectId` is updated if present
        ...(data.classId && { classId: data.classId }), // Ensure `classId` is updated if present
        ...(data.teacherId && { teacherId: data.teacherId }), // Ensure `teacherId` is updated if present
      },
    });

    // Optionally, revalidate path after update
    // revalidatePath("/list/lessons");

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating lesson:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");

  // Ensure id is valid and a number
  if (!id || isNaN(Number(id))) {
    return { success: false, error: true, message: "Invalid ID provided." };
  }

  try {
    const lessonId = parseInt(id as string, 10);

    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    // Optionally, revalidate path after deletion
    // revalidatePath("/list/lessons");

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

// Assignment Management

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating assignment:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      message: "Assignment ID is required.",
    };
  }

  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        dueDate: new Date(data.dueDate),
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating assignment:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || isNaN(Number(id))) {
    return { success: false, error: true, message: "Invalid ID provided." };
  }

  try {
    const assignmentId = parseInt(id as string, 10);

    await prisma.assignment.delete({
      where: {
        id: assignmentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

// Results Management

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating result:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      message: "Result ID is required.",
    };
  }

  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        examId: data.examId,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating result:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || isNaN(Number(id))) {
    return { success: false, error: true, message: "Invalid ID provided." };
  }

  try {
    const resultId = parseInt(id as string, 10);

    await prisma.result.delete({
      where: {
        id: resultId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting result:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: new Date(data.date), // Ensure proper date formatting
        present: data.present, // Attendance status
        studentId: data.studentId, // Link to Student
        lessonId: data.lessonId, // Link to Lesson
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating attendance:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      message: "Attendance ID is required.",
    };
  }

  try {
    await prisma.attendance.update({
      where: { id: data.id },
      data: {
        date: new Date(data.date), // Ensure proper date formatting
        present: data.present, // Update attendance status
        studentId: data.studentId, // Link to Student
        lessonId: data.lessonId, // Link to Lesson
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating attendance:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || isNaN(Number(id))) {
    return { success: false, error: true, message: "Invalid ID provided." };
  }

  try {
    const attendanceId = parseInt(id as string, 10);
    await prisma.attendance.delete({
      where: { id: attendanceId },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting attendance:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

// Event Management

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate), // Ensure proper date formatting
        endDate: new Date(data.endDate), // Ensure proper date formatting
        classId: data.classId, // Optional class relation
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating event:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Event ID is required." };
  }

  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate), // Ensure proper date formatting
        endDate: new Date(data.endDate), // Ensure proper date formatting
        classId: data.classId, // Optional class relation
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating event:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || isNaN(Number(id))) {
    return { success: false, error: true, message: "Invalid ID provided." };
  }

  try {
    const eventId = parseInt(id as string, 10);
    await prisma.event.delete({
      where: { id: eventId },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

// Announcement Management

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    const announcementData = {
      title: data.title,
      description: data.description,
      date: new Date(data.date), // Ensure date is a Date object
      ...(data.class
        ? {
            class: {
              connect: { id: data.class.id }, // Connect to class using its ID
            },
          }
        : data.classId
        ? { classId: data.classId } // Directly set classId if no class relation
        : {}),
    };

    await prisma.announcement.create({
      data: announcementData,
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) {
    return {
      success: false,
      error: true,
      message: "Announcement ID is required.",
    };
  }

  try {
    const announcementData = {
      title: data.title,
      description: data.description,
      date: new Date(data.date), // Ensure the date is a Date object
      ...(data.class
        ? {
            class: {
              connect: { id: data.class.id }, // Connect to class using its ID
            },
          }
        : data.classId
        ? { classId: data.classId } // Directly set classId if no class relation
        : {}),
    };

    await prisma.announcement.update({
      where: { id: data.id },
      data: announcementData,
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || isNaN(Number(id))) {
    return { success: false, error: true, message: "Invalid ID provided." };
  }

  try {
    const announcementId = parseInt(id as string, 10);
    await prisma.announcement.delete({
      where: { id: announcementId },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return { success: false, error: true, message: (err as Error).message };
  }
};
