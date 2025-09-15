'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactFormSchema, type ContactFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import csc from 'countries-states-cities'
import { notification } from 'antd'


interface ContactFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const steps = [
  { id: 1, title: 'Personal Information', description: 'Basic personal details' },
  { id: 2, title: 'Contact Details', description: 'Address and contact information' },
  { id: 3, title: 'Education & Profession', description: 'Educational and professional background' },
  { id: 4, title: 'Family Information', description: 'Children and siblings details' },
  { id: 5, title: 'Review & Submit', description: 'Review all information before submitting' }
]

export default function ContactForm({ onSuccess, onCancel }: ContactFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showOtherEducation, setShowOtherEducation] = useState(false)
  const [showOtherProfession, setShowOtherProfession] = useState(false)
  const [masterData, setMasterData] = useState({
    countries: [] as any[],
    states: [] as any[],
    cities: [] as any[],
    educations: [] as any[],
    professions: [] as any[]
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange'
  })

  const { fields: childrenFields, append: appendChild, remove: removeChild } = useFieldArray({
    control,
    name: 'children'
  })

  const { fields: siblingsFields, append: appendSibling, remove: removeSibling } = useFieldArray({
    control,
    name: 'siblings'
  })

  const watchedCountryId = watch('countryId')
  const watchedStateId = watch('stateId')
  const watchedEducationId = watch('educationId')
  const watchedProfessionId = watch('professionId')

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    if (watchedCountryId) {
      setValue('stateId', '')
      setValue('cityId', '')
      fetchStates(watchedCountryId)
    }
  }, [watchedCountryId, setValue])

  useEffect(() => {
    if (watchedStateId) {
      setValue('cityId', '')
      fetchCities(watchedStateId)
    }
  }, [watchedStateId, setValue])

  useEffect(() => {
    // Check if "Other" is selected for education
    const selectedEducation = masterData.educations.find(edu => edu.id === watchedEducationId)
    setShowOtherEducation(selectedEducation?.name?.toLowerCase().includes('other') || false)
  }, [watchedEducationId, masterData.educations])

  useEffect(() => {
    // Check if "Other" is selected for profession
    const selectedProfession = masterData.professions.find(prof => prof.id === watchedProfessionId)
    setShowOtherProfession(selectedProfession?.name?.toLowerCase().includes('other') || false)
  }, [watchedProfessionId, masterData.professions])

  const fetchMasterData = async () => {
    try {
      // Get all data from our database
      const [countriesRes, educationsRes, professionsRes] = await Promise.all([
        fetch('/api/countries'),
        fetch('/api/educations'),
        fetch('/api/professions')
      ])

      const countries = await countriesRes.json()
      const educations = await educationsRes.json()
      const professions = await professionsRes.json()

      setMasterData({ 
        countries: countries || [], 
        educations: educations || [], 
        professions: professions || [], 
        states: [],
        cities: []
      })
    } catch (error) {
      console.error('Error fetching master data:', error)
      setMasterData({ 
        countries: [], 
        educations: [], 
        professions: [], 
        states: [],
        cities: []
      })
    }
  }

  const fetchStates = async (countryId: string) => {
    try {
      // Get states for the selected country from our database
      const response = await fetch(`/api/states?countryId=${countryId}`)
      const states = await response.json()
      setMasterData(prev => ({ ...prev, states: states || [], cities: [] }))
    } catch (error) {
      console.error('Error fetching states:', error)
      setMasterData(prev => ({ ...prev, states: [], cities: [] }))
    }
  }

  const fetchCities = async (stateId: string) => {
    try {
      // Get cities for the selected state from our API
      const response = await fetch(`/api/cities?stateId=${stateId}`)
      const cities = await response.json()
      setMasterData(prev => ({ ...prev, cities: cities || [] }))
    } catch (error) {
      console.error('Error fetching cities:', error)
      setMasterData(prev => ({ ...prev, cities: [] }))
    }
  }



  const onSubmit = async (data: ContactFormData) => {
    // Fix website URL if it doesn't have protocol
    const processedData = {
      ...data,
      website: data.website && !data.website.startsWith('http') 
        ? `https://${data.website}` 
        : data.website
    }
    
    console.log('Form data being submitted:', processedData)
    setIsLoading(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })

      console.log('Response status:', response.status)
      const responseData = await response.text()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(`Failed to submit contact form: ${response.status} - ${responseData}`)
      }

      // Show success notification
      notification.success({
        message: 'Success!',
        description: 'Details submitted successfully! Your information has been saved.',
        placement: 'topRight',
        duration: 4.5,
      })
      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notification.error({
        message: 'Submission Failed',
        description: `Failed to submit form: ${errorMessage}`,
        placement: 'topRight',
        duration: 4.5,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isCurrentStepValid = () => {
    const formData = watch()
    
    switch (currentStep) {
      case 1:
        const step1Valid = formData.firstname && formData.gender && formData.dob && 
               formData.fatherName && formData.motherName
        console.log('Step 1 validation:', { step1Valid, formData: { firstname: formData.firstname, gender: formData.gender, dob: formData.dob, fatherName: formData.fatherName, motherName: formData.motherName } })
        return step1Valid
      case 2:
        const step2Valid = formData.gaam && formData.currentAddress && 
               formData.countryId && formData.stateId && formData.cityId
        console.log('Step 2 validation:', { step2Valid, formData: { gaam: formData.gaam, currentAddress: formData.currentAddress, countryId: formData.countryId, stateId: formData.stateId, cityId: formData.cityId } })
        return step2Valid
      case 3:
        const step3Valid = formData.phone && formData.email && formData.educationId && 
               formData.professionId
        console.log('Step 3 validation:', { step3Valid, formData: { phone: formData.phone, email: formData.email, educationId: formData.educationId, professionId: formData.professionId } })
        return step3Valid
      case 4:
        console.log('Step 4 validation: true (optional)')
        return true // Children and siblings are optional
      case 5:
        // For the final step, check if all required fields are filled
        const step5Valid = formData.firstname && formData.gender && formData.dob && 
               formData.fatherName && formData.motherName &&
               formData.gaam && formData.currentAddress && 
               formData.countryId && formData.stateId && formData.cityId &&
               formData.phone && formData.email && formData.educationId && 
               formData.professionId
        console.log('Step 5 validation:', { step5Valid, formData })
        return step5Valid
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length && isCurrentStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addChild = () => {
    appendChild({ firstname: '', gender: 'male', age: 0 })
  }

  const addSibling = () => {
    appendSibling({ name: '', gender: 'male', age: 0 })
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstname">First Name *</Label>
          <Input
            id="firstname"
            {...register('firstname')}
            placeholder="Enter first name"
          />
          {errors.firstname && (
            <p className="text-sm text-red-600 mt-1">{errors.firstname.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="middlename">Middle Name</Label>
          <Input
            id="middlename"
            {...register('middlename')}
            placeholder="Enter middle name"
          />
        </div>
        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input
            id="lastname"
            {...register('lastname')}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <select 
            {...register('gender')} 
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input
            id="dob"
            type="date"
            {...register('dob')}
          />
          {errors.dob && (
            <p className="text-sm text-red-600 mt-1">{errors.dob.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="spouseName">Spouse Name</Label>
          <Input
            id="spouseName"
            {...register('spouseName')}
            placeholder="Enter spouse name"
          />
        </div>
        <div>
          <Label htmlFor="fatherName">Father's Name *</Label>
          <Input
            id="fatherName"
            {...register('fatherName')}
            placeholder="Enter father's name"
            required
          />
          {errors.fatherName && (
            <p className="text-sm text-red-600 mt-1">{errors.fatherName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="motherName">Mother's Name *</Label>
        <Input
          id="motherName"
          {...register('motherName')}
          placeholder="Enter mother's name"
          required
        />
        {errors.motherName && (
          <p className="text-sm text-red-600 mt-1">{errors.motherName.message}</p>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gaam">Gaam *</Label>
        <Input
          id="gaam"
          {...register('gaam')}
          placeholder="Enter gaam"
          required
        />
        {errors.gaam && (
          <p className="text-sm text-red-600 mt-1">{errors.gaam.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="currentAddress">Current Address *</Label>
        <Input
          id="currentAddress"
          {...register('currentAddress')}
          placeholder="Enter current address"
          required
        />
        {errors.currentAddress && (
          <p className="text-sm text-red-600 mt-1">{errors.currentAddress.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="countryId">Country *</Label>
          <select 
            {...register('countryId')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select country</option>
            {masterData.countries && masterData.countries.length > 0 ? masterData.countries.map((country: any) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            )) : null}
          </select>
          {errors.countryId && (
            <p className="text-sm text-red-600 mt-1">{errors.countryId.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="stateId">State *</Label>
          <select 
            {...register('stateId')} 
            disabled={!watchedCountryId}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select state</option>
            {masterData.states && masterData.states.length > 0 ? masterData.states.map((state: any) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            )) : null}
          </select>
          {errors.stateId && (
            <p className="text-sm text-red-600 mt-1">{errors.stateId.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cityId">City *</Label>
          <select 
            {...register('cityId')}
            disabled={!watchedStateId}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Select city</option>
            {masterData.cities && masterData.cities.length > 0 ? masterData.cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            )) : null}
          </select>
          {errors.cityId && (
            <p className="text-sm text-red-600 mt-1">{errors.cityId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="educationId">Education Level *</Label>
          <select 
            {...register('educationId')} 
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select education level</option>
            {masterData.educations && masterData.educations.length > 0 ? masterData.educations.map((education: any) => (
              <option key={education.id} value={education.id}>
                {education.name}
              </option>
            )) : null}
          </select>
          {errors.educationId && (
            <p className="text-sm text-red-600 mt-1">{errors.educationId.message}</p>
          )}
        </div>
        {showOtherEducation && (
          <div>
            <Label htmlFor="otherEducation">Other Education *</Label>
            <Input
              id="otherEducation"
              {...register('otherEducation')}
              placeholder="Please specify your education"
              required={showOtherEducation}
            />
            {errors.otherEducation && (
              <p className="text-sm text-red-600 mt-1">{String(errors.otherEducation.message || 'Invalid input')}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="professionId">Profession *</Label>
          <select 
            {...register('professionId')} 
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select profession</option>
            {masterData.professions && masterData.professions.length > 0 ? masterData.professions.map((profession: any) => (
              <option key={profession.id} value={profession.id}>
                {profession.name}
              </option>
            )) : null}
          </select>
          {errors.professionId && (
            <p className="text-sm text-red-600 mt-1">{errors.professionId.message}</p>
          )}
        </div>
        {showOtherProfession && (
          <div>
            <Label htmlFor="otherProfession">Other Profession *</Label>
            <Input
              id="otherProfession"
              {...register('otherProfession')}
              placeholder="Please specify your profession"
              required={showOtherProfession}
            />
            {errors.otherProfession && (
              <p className="text-sm text-red-600 mt-1">{String(errors.otherProfession.message || 'Invalid input')}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...register('website')}
            placeholder="Enter website URL"
          />
        </div>
        <div>
          <Label htmlFor="profilePic">Profile Picture URL</Label>
          <Input
            id="profilePic"
            {...register('profilePic')}
            placeholder="Enter profile picture URL"
          />
        </div>
      </div>

      {/* Social Media Fields */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Social Media Profiles</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fb">Facebook</Label>
            <Input
              id="fb"
              {...register('fb')}
              placeholder="Facebook profile"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              {...register('linkedin')}
              placeholder="LinkedIn profile"
            />
          </div>
          <div>
            <Label htmlFor="insta">Instagram</Label>
            <Input
              id="insta"
              {...register('insta')}
              placeholder="Instagram profile"
            />
          </div>
          <div>
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              {...register('tiktok')}
              placeholder="TikTok profile"
            />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              {...register('twitter')}
              placeholder="Twitter profile"
            />
          </div>
          <div>
            <Label htmlFor="snapchat">Snapchat</Label>
            <Input
              id="snapchat"
              {...register('snapchat')}
              placeholder="Snapchat username"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Children Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Children</h3>
          <Button type="button" onClick={addChild} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>
        {childrenFields.length === 0 ? (
          <p className="text-gray-500 text-sm">No children added yet</p>
        ) : (
          <div className="space-y-3">
            {childrenFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        {...register(`children.${index}.firstname`)}
                        placeholder="Child's first name"
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                                <select 
            {...register(`children.${index}.gender`)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        {...register(`children.${index}.age`, { valueAsNumber: true })}
                        placeholder="Age"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeChild(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Siblings Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Siblings</h3>
          <Button type="button" onClick={addSibling} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Sibling
          </Button>
        </div>
        {siblingsFields.length === 0 ? (
          <p className="text-gray-500 text-sm">No siblings added yet</p>
        ) : (
          <div className="space-y-3">
            {siblingsFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        {...register(`siblings.${index}.name`)}
                        placeholder="Sibling's name"
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                                <select 
            {...register(`siblings.${index}.gender`)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        {...register(`siblings.${index}.age`, { valueAsNumber: true })}
                        placeholder="Age"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeSibling(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep5 = () => {
    const formData = watch()
    
    // Get actual education and profession names
    const selectedEducation = masterData.educations.find(edu => edu.id === formData.educationId)
    const selectedProfession = masterData.professions.find(prof => prof.id === formData.professionId)
    
    // Get location names
    const selectedCountry = masterData.countries.find(country => country.id === formData.countryId)
    const selectedState = masterData.states.find(state => state.id === formData.stateId)
    const selectedCity = masterData.cities.find(city => city.id === formData.cityId)
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Review Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Name:</strong> {formData.firstname} {formData.middlename} {formData.lastname}</p>
              <p><strong>Gender:</strong> {formData.gender}</p>
              <p><strong>Date of Birth:</strong> {formData.dob}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Gaam:</strong> {formData.gaam}</p>
              <p><strong>Current Address:</strong> {formData.currentAddress}</p>
            </div>
            <div>
              <p><strong>Country:</strong> {selectedCountry?.name || 'Not specified'}</p>
              <p><strong>State:</strong> {selectedState?.name || 'Not specified'}</p>
              <p><strong>City:</strong> {selectedCity?.name || 'Not specified'}</p>
              <p><strong>Education:</strong> {selectedEducation?.name || 'Not specified'}</p>
              {selectedEducation?.name?.toLowerCase().includes('other') && formData.otherEducation && (
                <p><strong>Other Education:</strong> {formData.otherEducation}</p>
              )}
              <p><strong>Profession:</strong> {selectedProfession?.name || 'Not specified'}</p>
              {selectedProfession?.name?.toLowerCase().includes('other') && formData.otherProfession && (
                <p><strong>Other Profession:</strong> {formData.otherProfession}</p>
              )}
              <p><strong>Children:</strong> {formData.children?.length || 0}</p>
              <p><strong>Siblings:</strong> {formData.siblings?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Please review all the information above. Once submitted, you can edit your profile later.
          </p>
          <Button 
            type="button" 
            onClick={() => {
              const formData = watch()
              console.log('Current form data:', formData)
              console.log('Form errors:', errors)
              console.log('Is form valid:', isCurrentStepValid())
            }}
            variant="outline"
          >
            Debug Form Data
          </Button>
        </div>
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= step.id 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {currentStep > 1 && (
              <Button type="button" onClick={prevStep} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep} disabled={!isCurrentStepValid()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  onClick={() => {
                    console.log('Manual submit test')
                    const formData = watch()
                    console.log('Form data for submission:', formData)
                    onSubmit(formData)
                  }}
                  disabled={!isCurrentStepValid() || isLoading}
                >
                  Submit
                </Button>
            
              </div>
            )}
            
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
