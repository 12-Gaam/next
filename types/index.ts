// Define enums locally since they're not exported from Prisma client
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GAAM_ADMIN = 'GAAM_ADMIN',
  MEMBER = 'MEMBER'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  status: RegistrationStatus;
  gaamId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryMaster {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StateMaster {
  id: string;
  name: string;
  countryId: string;
  country: CountryMaster;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationMaster {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionMaster {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactChild {
  id: string;
  contactId: string;
  firstname: string;
  gender: Gender;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactSibling {
  id: string;
  contactId: string;
  name: string;
  gender: Gender;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId?: string | null;
  firstname: string;
  middlename?: string;
  lastname?: string;
  spouseName?: string;
  fatherName?: string;
  motherName?: string;
  gender: Gender;
  samaj?: string;
  gaam?: string;
  currentAddress?: string;
  countryId?: string;
  country?: CountryMaster;
  stateId?: string;
  state?: StateMaster;
  city?: string;
  phone: string;
  email: string;
  dob: Date;
  educationId?: string;
  education?: EducationMaster;
  otherEducation?: string;
  professionId?: string;
  profession?: ProfessionMaster;
  otherProfession?: string;
  website?: string;
  profile?: string;
  children: ContactChild[];
  siblings: ContactSibling[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFormData {
  firstname: string;
  middlename?: string;
  lastname?: string;
  spouseName?: string;
  fatherName?: string;
  motherName?: string;
  gender: Gender;
  samaj?: string;
  gaam?: string;
  currentAddress?: string;
  countryId?: string;
  stateId?: string;
  city?: string;
  phone: string;
  email: string;
  dob: string;
  educationId?: string;
  otherEducation?: string;
  professionId?: string;
  otherProfession?: string;
  website?: string;
  profile?: string;
  children: Omit<ContactChild, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>[];
  siblings: Omit<ContactSibling, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>[];
}

export interface MasterData {
  countries: CountryMaster[];
  states: StateMaster[];
  educations: EducationMaster[];
  professions: ProfessionMaster[];
}
