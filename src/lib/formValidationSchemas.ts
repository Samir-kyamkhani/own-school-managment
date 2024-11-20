import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional(),
  phone: z.string().optional(),
  address: z.string(),
  students: z.array(z.string()).optional(),
});

export type ParentSchema = z.infer<typeof parentSchema>;

enum Day {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export const lessonSchema = z.object({
  id: z.number().int().optional(), // If the id is auto-generated, it's optional during creation.
  name: z.string().min(1, { message: "Name is required!" }), // Name should be a non-empty string.
  day: z.enum(
    [
      Day.Monday,
      Day.Tuesday,
      Day.Wednesday,
      Day.Thursday,
      Day.Friday,
      Day.Saturday,
    ],
    {
      message: "Invalid day", // Enum validation for day.
    }
  ),
  startTime: z.date().refine((val) => !isNaN(val.getTime()), {
    message: "Invalid start time", // Ensure valid DateTime for startTime.
  }),
  endTime: z.date().refine((val) => !isNaN(val.getTime()), {
    message: "Invalid end time", // Ensure valid DateTime for endTime.
  }),
  subjectId: z
    .number()
    .int()
    .min(1, { message: "Subject ID must be a positive integer!" }), // Subject ID should be a positive integer.
  classId: z
    .number()
    .int()
    .min(1, { message: "Class ID must be a positive integer!" }), // Class ID should be a positive integer.
  teacherId: z.string().min(1, { message: "Teacher ID is required!" }), // Teacher ID should be a non-empty string.
  exams: z.array(z.object({})).optional(), // Assuming exams is an array of objects, and can be optional.
  assignments: z.array(z.object({})).optional(), // Assuming assignments is an array of objects, and can be optional.
  attendances: z.array(z.object({})).optional(), // Assuming attendances is an array of objects, and can be optional.
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.number().optional(), // `id` is optional for creation
  title: z.string().min(1, "Title is required"), // Validate non-empty string
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }), // Ensure valid ISO date string
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid due date",
  }), // Ensure valid ISO date string
  lessonId: z.number().int("Lesson ID must be an integer"), // Validate integer ID
  results: z
    .array(
      z.object({
        // Add necessary properties for Result objects if applicable
      })
    )
    .optional(), // `results` is optional and can be an array of objects
});
export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.number().int().positive().optional(), // Auto-incremented ID, optional during creation
  score: z.number().int().nonnegative(), // Integer, score must be non-negative
  examId: z.number().int().positive().nullable(), // Optional relation, can be null
  assignmentId: z.number().int().positive().nullable(), // Optional relation, can be null
  studentId: z.string().nonempty(), // String, required
});
export type ResultSchema = z.infer<typeof resultSchema>;

export const attendanceSchema = z.object({
  id: z.number().int().positive().optional(), // ID is auto-incremented, so it's optional during creation
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }), // Ensures the date is a valid string representing a date
  present: z.boolean(), // Ensures `present` is a boolean
  studentId: z.string().nonempty("Student ID is required"), // Student ID is a required string
  lessonId: z.number().int().positive().nonnegative(), // Lesson ID must be a positive integer
});
export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const eventSchema = z.object({
  id: z.number().int().positive().optional(), // ID is auto-incremented, so it's optional
  title: z.string().min(1, "Title is required"), // Ensures the title is a non-empty string
  description: z.string().min(1, "Description is required"), // Ensures description is not empty
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format", // Ensures startDate is a valid date
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date format", // Ensures endDate is a valid date
  }),
  classId: z.number().int().positive().optional(), // classId is optional, but if provided, it must be a positive integer
  class: z.object({ id: z.number().int().positive() }).optional(), // Optional class relation, if provided
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.number().int().positive().optional(), // ID is auto-incremented, so it's optional
  title: z.string().min(1, "Title is required"), // Title is a non-empty string
  description: z.string().min(1, "Description is required"), // Description is a non-empty string
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format", // Ensures date is a valid Date string
  }),
  classId: z.number().int().positive().optional(), // classId is optional but must be a positive integer if provided
  class: z
    .object({
      id: z.number().int().positive(), // class ID should be a positive integer if provided
    })
    .optional(), // Optional class object
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;
