import { z } from "zod";

enum Role {
    Player = "PLAYER",
    Trainer = "TRAINER",
    Admin = "ADMIN",
}
const createValidation = z.object({
    name: z.string().min(2).max(255).optional(),
    email: z.string().email("Invalid email").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    phone: z.string().refine((val) => val !== undefined && val !== null, {
        message: "This field is required",

    }),
    /*   dateOfBirth: z.date().refine((val) => val !== undefined && val !== null && !isNaN(val.getTime()), {
          message: "This field is required and must be a valid date",
      }), */

    dateOfBirth: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "This field is required and must be a valid date string",
        })
        .transform((val) => new Date(val)), // Convert string to Date object

    role: z.nativeEnum(Role)  // This will ensure the value is one of the enum keys
        .refine((val) => val !== undefined && val !== null, {
            message: "This field is required and must be a valid status",
        })

    // .regex(/[a-zA-Z0-9]/, "Password must contain only letters and numbers")
})

const updateValidation = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long").optional()
})

const changePasswordValidation = z.object({
    oldPassword: z.string().min(8, "Password must be at least 8 characters long"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long")
})




export const UserValidation = { createValidation, updateValidation, changePasswordValidation }