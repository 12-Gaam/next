import { z } from "zod";

export const contactFormSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  middlename: z.string().optional(),
  lastname: z.string().optional().default("Patel"),
  spouseName: z.string().optional(),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  gender: z.string().min(1, "Gender is required"),
  gaam: z.string().min(1, "Gaam is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  countryId: z.string().optional().or(z.literal("")),
  stateId: z.string().optional().or(z.literal("")),
  cityId: z.string().optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  educationId: z.string().optional().or(z.literal("")),
  otherEducation: z.string().optional(),
  professionId: z.string().optional().or(z.literal("")),
  otherProfession: z.string().optional(),
  additionalProfessions: z.array(z.object({
    professionId: z.string().min(1, "Profession is required"),
    otherProfession: z.string().optional()
  })).default([]),
  website: z.string().optional().or(z.literal("")),
  profilePic: z.string().optional(),
  familyPhoto: z.string().optional(),
  fb: z.string().optional(),
  linkedin: z.string().optional(),
  insta: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  snapchat: z.string().optional(),
  children: z.array(z.object({
    firstname: z.string().min(1, "Child first name is required"),
    gender: z.string().min(1, "Gender is required"),
    age: z.number().min(0).max(120, "Age must be between 0 and 120")
  })).default([]),
  siblings: z.array(z.object({
    name: z.string().min(1, "Sibling name is required"),
    gender: z.string().min(1, "Gender is required"),
    age: z.number().min(0).max(120, "Age must be between 0 and 120")
  })).default([])
}).superRefine((data, ctx) => {
  // Check if "Other" education is selected but not specified
  if (data.educationId && data.educationId.includes('other') && (!data.otherEducation || data.otherEducation.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your education",
      path: ["otherEducation"]
    });
  }
  
  // Check if "Other" profession is selected but not specified
  if (data.professionId && data.professionId.includes('other') && (!data.otherProfession || data.otherProfession.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your profession",
      path: ["otherProfession"]
    });
  }

  // Check additional professions for "Other" selections
  data.additionalProfessions.forEach((prof, index) => {
    if (prof.professionId && prof.professionId.includes('other') && (!prof.otherProfession || prof.otherProfession.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify your profession",
        path: ["additionalProfessions", index, "otherProfession"]
      });
    }
  });

});

export const masterDataSchema = z.object({
  name: z.string().min(1, "Name is required")
});

export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]).default("user")
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type MasterDataForm = z.infer<typeof masterDataSchema>;
export type UserFormData = z.infer<typeof userSchema>;
