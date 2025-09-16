import { supabase } from './supabase'

export interface Contact {
  id: string
  firstname: string
  middlename?: string
  lastname?: string
  spouseName?: string
  fatherName: string
  motherName: string
  gender: 'male' | 'female' | 'other'
  gaam: string
  currentAddress: string
  countryId?: string
  country?: { name: string }
  stateId?: string
  state?: { name: string }
  cityId?: string
  city?: { name: string }
  phone: string
  email: string
  dob: string
  educationId: string
  education?: { name: string }
  otherEducation?: string
  professionId: string
  profession?: { name: string }
  otherProfession?: string
  website?: string
  profilePic?: string
  fb?: string
  linkedin?: string
  insta?: string
  tiktok?: string
  twitter?: string
  snapchat?: string
  children: ContactChild[]
  siblings: ContactSibling[]
  createdAt: string
  updatedAt: string
}

export interface ContactChild {
  id: string
  contactId: string
  firstname: string
  gender: 'male' | 'female' | 'other'
  age: number
  createdAt: string
  updatedAt: string
}

export interface ContactSibling {
  id: string
  contactId: string
  name: string
  gender: 'male' | 'female' | 'other'
  age: number
  createdAt: string
  updatedAt: string
}

export interface MasterData {
  countries: { id: string; name: string }[]
  states: { id: string; name: string; countryId: string }[]
  cities: { id: string; name: string; stateId: string }[]
  educations: { id: string; name: string }[]
  professions: { id: string; name: string }[]
}

// Master data functions
export async function getCountries() {
  const { data, error } = await supabase
    .from('CountryMaster')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getStates(countryId: string) {
  const { data, error } = await supabase
    .from('StateMaster')
    .select('*')
    .eq('country_id', countryId)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getCities(stateId: string) {
  const { data, error } = await supabase
    .from('CityMaster')
    .select('*')
    .eq('state_id', stateId)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getEducations() {
  const { data, error } = await supabase
    .from('EducationMaster')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getProfessions() {
  const { data, error } = await supabase
    .from('ProfessionMaster')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

// Contact functions
export async function createContact(contactData: any) {
  console.log('Creating contact with data:', contactData);
  
  const { data, error } = await supabase
    .from('Contact')
    .insert([contactData])
    .select()
    .single()
  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  return data
}

export async function getContacts(page = 1, limit = 10, search = '') {
  let query = supabase
    .from('Contact')
    .select(`
      *,
      country:CountryMaster(name),
      state:StateMaster(name),
      education:EducationMaster(name),
      profession:ProfessionMaster(name),
      children:ContactChild(*),
      siblings:ContactSibling(*)
    `, { count: 'exact' })
  
  if (search) {
    query = query.or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }
  
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)
  
  if (error) throw error
  return { contacts: data || [], total: count || 0 }
}

export async function getContact(id: string) {
  const { data, error } = await supabase
    .from('Contact')
    .select(`
      *,
      country:CountryMaster(name),
      state:StateMaster(name),
      education:EducationMaster(name),
      profession:ProfessionMaster(name),
      children:ContactChild(*),
      siblings:ContactSibling(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateContact(id: string, contactData: any) {
  const { data, error } = await supabase
    .from('Contact')
    .update(contactData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteContact(id: string) {
  const { error } = await supabase
    .from('Contact')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// User functions
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) throw error
  return data
}

export async function createUser(userData: { username: string; password: string; role: string }) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      username: userData.username,
      password_hash: userData.password,
      role: userData.role
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}
