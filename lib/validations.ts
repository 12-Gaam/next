import { z } from "zod";

export const contactFormSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  middlename: z.string().optional().nullable().or(z.literal("")),
  lastname: z.string().optional().default("Patel").nullable().or(z.literal("")),
  spouseFirstName: z.string().optional().nullable().or(z.literal("")),
  spouseMiddleName: z.string().optional().nullable().or(z.literal("")),
  spouseLastName: z.string().optional().nullable().or(z.literal("")),
  fatherFirstName: z.string().optional().default("").nullable().or(z.literal("")),
  fatherMiddleName: z.string().optional().nullable().or(z.literal("")),
  fatherLastName: z.string().optional().nullable().or(z.literal("")),
  motherFirstName: z.string().optional().default("").nullable().or(z.literal("")),
  motherMiddleName: z.string().optional().nullable().or(z.literal("")),
  motherLastName: z.string().optional().nullable().or(z.literal("")),
  gender: z.string().min(1, "Gender is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  is18Plus: z.boolean().optional(),
  gaam: z.string().min(1, "Gaam is required"),
  dob: z.string().optional().nullable().or(z.literal("")),
  currentAddress: z.string().min(1, "Current address is required"),
  countryId: z.string().min(1, "Country is required"),
  stateId: z.string().min(1, "State is required"),
  cityId: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(12, "Phone number must be at most 12 digits"),
  countryCode: z.string().optional().default("+1"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  educationId: z.string().optional().nullable().or(z.literal("")),
  educationDetail: z.string().optional().nullable().or(z.literal("")),
  otherEducation: z.string().optional().nullable().or(z.literal("")),
  professionId: z.string().optional().nullable().or(z.literal("")),
  otherProfession: z.string().optional().nullable().or(z.literal("")),
  additionalProfessions: z.array(z.object({
    professionId: z.string().min(1, "Profession is required"),
    otherProfession: z.string().optional()
  })).default([]),
  educationalLevel: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  fb: z.string().optional().nullable().or(z.literal("")),
  linkedin: z.string().optional().nullable().or(z.literal("")),
  insta: z.string().optional().nullable().or(z.literal("")),
  tiktok: z.string().optional().nullable().or(z.literal("")),
  twitter: z.string().optional().nullable().or(z.literal("")),
  snapchat: z.string().optional().nullable().or(z.literal("")),
  children: z.array(z.object({
    firstName: z.string().optional().nullable().or(z.literal("")),
    middleName: z.string().optional().nullable().or(z.literal("")),
    lastName: z.string().optional().nullable().or(z.literal("")),
    gender: z.string().min(1, "Gender is required"),
    dob: z.string().optional().nullable().or(z.literal("")),
    educationId: z.string().optional().nullable().or(z.literal("")),
    educationDetail: z.string().optional().nullable().or(z.literal("")),
    otherEducation: z.string().optional().nullable().or(z.literal("")),
    professionId: z.string().optional().nullable().or(z.literal("")),
    otherProfession: z.string().optional().nullable().or(z.literal("")),
  })).default([]),
  siblings: z.array(z.object({
    firstName: z.string().optional().nullable().or(z.literal("")),
    middleName: z.string().optional().nullable().or(z.literal("")),
    lastName: z.string().optional().nullable().or(z.literal("")),
    gender: z.string().min(1, "Gender is required"),
    dob: z.string().optional().nullable().or(z.literal("")),
    currentAddress: z.string().optional().nullable().or(z.literal("")),
    countryId: z.string().optional().nullable().or(z.literal("")),
    stateId: z.string().optional().nullable().or(z.literal("")),
    cityId: z.string().optional().nullable().or(z.literal("")),
    zipCode: z.string().optional().nullable().or(z.literal("")),
  })).default([]),
  profilePic: z.string().optional().or(z.literal("")),
  familyPhoto: z.string().optional().or(z.literal("")),
  residingCountryId: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  // Check if "Other" education is selected but not specified
  if (data.educationId && typeof data.educationId === 'string' && data.educationId.toLowerCase().includes('other') && (!data.otherEducation || data.otherEducation.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your education",
      path: ["otherEducation"]
    });
  }
  
  // Check if "Other" profession is selected but not specified
  if (data.professionId && typeof data.professionId === 'string' && data.professionId.toLowerCase().includes('other') && (!data.otherProfession || data.otherProfession.trim().length === 0)) {
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

  // Check if spouse first name is required when marital status is married
  if (data.maritalStatus === 'married' && (!data.spouseFirstName || data.spouseFirstName.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Spouse first name is required when marital status is married",
      path: ["spouseFirstName"]
    });
  }
});

export const masterDataSchema = z.object({
  name: z.string().min(1, "Name is required")
});

export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "GAAM_ADMIN", "MEMBER"]).default("MEMBER")
});

export const registrationSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  gaamId: z.string().min(1, "Please select a gaam")
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type MasterDataForm = z.infer<typeof masterDataSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;