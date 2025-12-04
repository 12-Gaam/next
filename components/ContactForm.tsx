'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactFormSchema, type ContactFormData } from '@/lib/validations'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  notification,
  Switch,
  Upload,
  message,
  Image,
  Flex,
  Spin
} from 'antd'
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, CheckOutlined, UploadOutlined, InboxOutlined, FilePdfOutlined } from '@ant-design/icons'
import csc from 'countries-states-cities'
import dayjs from 'dayjs'
import { countryCodes, countryCodeMap } from '@/lib/country-codes'


interface ContactFormProps {
  onSuccess: () => void
  onCancel: () => void
  existingContact?: any
  initialStep?: number
}

const steps = [
  { id: 1, title: 'Personal Information', description: 'Basic personal details' },
  { id: 2, title: 'Contact Details', description: 'Address and contact information' },
  { id: 3, title: 'Education & Profession', description: 'Educational and professional background' },
  { id: 4, title: 'Family Information', description: 'Children and siblings details' },
  { id: 5, title: 'Review & Submit', description: 'Review all information before submitting' }
]


export default function ContactForm({ onSuccess, onCancel, existingContact, initialStep = 1 }: ContactFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)
  const [showOtherEducation, setShowOtherEducation] = useState(false)
  const [showOtherProfession, setShowOtherProfession] = useState(false)
  const [fileList, setFileList] = useState<any[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploadedProfilePic, setUploadedProfilePic] = useState<string>('')
  const [uploadedFamilyPhoto, setUploadedFamilyPhoto] = useState<string>('')
  const [hasLoadedExistingData, setHasLoadedExistingData] = useState(false)
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
    formState: { errors, isValid },
    clearErrors,
    setError
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange'
  })

  const { fields: childrenFields, append: appendChild, remove: removeChild, replace: replaceChildren } = useFieldArray({
    control,
    name: 'children'
  })

  const { fields: siblingsFields, append: appendSibling, remove: removeSibling, replace: replaceSiblings } = useFieldArray({
    control,
    name: 'siblings'
  })

  const { fields: additionalProfessionsFields, append: appendAdditionalProfession, remove: removeAdditionalProfession, replace: replaceAdditionalProfessions } = useFieldArray({
    control,
    name: 'additionalProfessions'
  })

  const watchedCountryId = watch('countryId')
  const watchedStateId = watch('stateId')
  const watchedEducationId = watch('educationId')
  const watchedProfessionId = watch('professionId')
  const watchedMaritalStatus = watch('maritalStatus') as unknown as string
  const isEditMode = Boolean(existingContact?.id)

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    // Only load existing contact data after masterData is loaded
    if (existingContact && masterData.countries.length > 0) {
      // Set flag FIRST to prevent clearing values when setting countryId
      setHasLoadedExistingData(true)

      const baseValues: Partial<ContactFormData> = {
        firstname: existingContact.firstname || '',
        middlename: existingContact.middlename || '',
        lastname: existingContact.lastname || '',
        spouseFirstName: existingContact.spouseFirstName || null,
        spouseMiddleName: existingContact.spouseMiddleName || null,
        spouseLastName: existingContact.spouseLastName || null,
        fatherFirstName: existingContact.fatherFirstName || '',
        fatherMiddleName: existingContact.fatherMiddleName || '',
        fatherLastName: existingContact.fatherLastName || '',
        motherFirstName: existingContact.motherFirstName || '',
        motherMiddleName: existingContact.motherMiddleName || '',
        motherLastName: existingContact.motherLastName || '',
        gender: existingContact.gender || undefined,
        maritalStatus: existingContact.maritalStatus || undefined,
        is18Plus: existingContact.is18Plus ?? false,
        gaam: existingContact.gaam || '',
        currentAddress: existingContact.currentAddress || '',
        countryId: existingContact.countryId || undefined,
        stateId: existingContact.stateId || undefined,
        cityId: existingContact.cityId || '',
        phone: existingContact.phone || '',
        countryCode: existingContact.countryCode || '+1',
        email: existingContact.email || '',
        dob: existingContact.dob || undefined,
        educationId: existingContact.educationId || undefined,
        otherEducation: existingContact.otherEducation || '',
        professionId: existingContact.professionId || undefined,
        otherProfession: existingContact.otherProfession || '',
        website: existingContact.website || '',
        profilePic: existingContact.profilePic || '',
        familyPhoto: existingContact.familyPhoto || '',
        fb: existingContact.fb || '',
        linkedin: existingContact.linkedin || '',
        insta: existingContact.insta || '',
        tiktok: existingContact.tiktok || '',
        twitter: existingContact.twitter || '',
        snapchat: existingContact.snapchat || ''
      }

      // Set all form values
      Object.entries(baseValues).forEach(([key, value]) => {
        setValue(key as keyof ContactFormData, value as any, { shouldValidate: false })
      })

      replaceChildren(
        (existingContact.children || []).map((child: any) => ({
          firstName: child.firstName || '',
          middleName: child.middleName || '',
          lastName: child.lastName || '',
          gender: child.gender || 'male',
          age: child.age || 0
        }))
      )

      replaceSiblings(
        (existingContact.siblings || []).map((sibling: any) => ({
          firstName: sibling.firstName || '',
          middleName: sibling.middleName || '',
          lastName: sibling.lastName || '',
          gender: sibling.gender || 'male',
          age: sibling.age || 0
        }))
      )

      replaceAdditionalProfessions(existingContact.additionalProfessions || [])
      setUploadedProfilePic(existingContact.profilePic || '')
      setUploadedFamilyPhoto(existingContact.familyPhoto || '')

      // Fetch states if countryId exists (after a small delay to ensure form values are set)
      // Stop loading after states are loaded
      if (existingContact.countryId) {
        setTimeout(async () => {
          await fetchStates(existingContact.countryId, existingContact.stateId)
          // Stop loading after states are fetched
          setIsLoadingInitialData(false)
        }, 300)
      } else {
        // No countryId, stop loading immediately
        setIsLoadingInitialData(false)
      }
    }
  }, [existingContact, replaceChildren, replaceSiblings, replaceAdditionalProfessions, setValue, masterData.countries.length])

  useEffect(() => {
    if (watchedCountryId) {
      // Fetch states for the selected country if we don't have them or they're for a different country
      const currentStateCountryId = masterData.states.length > 0 ? masterData.states[0]?.countryId : null
      if (!masterData.states.length || currentStateCountryId !== watchedCountryId) {
        fetchStates(watchedCountryId).then(() => {
          // After fetching states, if we have existing data and stateId, make sure it's still set
          if (hasLoadedExistingData && existingContact?.stateId) {
            setValue('stateId', existingContact.stateId, { shouldValidate: false })
          }
        })
      }
      // Only clear stateId/cityId if user is changing country (not loading existing data)
      if (!hasLoadedExistingData) {
        setValue('stateId', '')
        setValue('cityId', '')
      }
    }
  }, [watchedCountryId, setValue, hasLoadedExistingData, masterData.states, existingContact])

  useEffect(() => {
    if (watchedStateId && !hasLoadedExistingData) {
      setValue('cityId', '')
    }
  }, [watchedStateId, setValue, hasLoadedExistingData])

  useEffect(() => {
    // Check if "Other" is selected for education
    if (masterData.educations && Array.isArray(masterData.educations) && watchedEducationId) {
      const selectedEducation = masterData.educations.find(edu => edu.id === watchedEducationId)
      setShowOtherEducation(selectedEducation?.name?.toLowerCase().includes('other') || false)
    }
  }, [watchedEducationId, masterData.educations])

  useEffect(() => {
    // Check if "Other" is selected for profession
    if (masterData.professions && Array.isArray(masterData.professions) && watchedProfessionId) {
      const selectedProfession = masterData.professions.find(prof => prof.id === watchedProfessionId)
      setShowOtherProfession(selectedProfession?.name?.toLowerCase().includes('other') || false)
    }
  }, [watchedProfessionId, masterData.professions])

  useEffect(() => {
    // Clear spouse names when marital status changes to single
    if (watchedMaritalStatus === 'single') {
      handleFieldChange('spouseFirstName', '')
      handleFieldChange('spouseMiddleName', '')
      handleFieldChange('spouseLastName', '')
    }
  }, [watchedMaritalStatus])

  useEffect(() => {
    // Auto-change country code when country is selected
    if (watchedCountryId && masterData.countries.length > 0) {
      const selectedCountry = masterData.countries.find(country => country.id === watchedCountryId)
      if (selectedCountry && countryCodeMap[selectedCountry.name]) {
        handleFieldChange('countryCode', countryCodeMap[selectedCountry.name])
      }
    }
  }, [watchedCountryId, masterData.countries])

  const fetchMasterData = async () => {
    try {
      // Get all data from our database
      const [countriesRes, educationsRes, professionsRes] = await Promise.all([
        fetch('/api/countries'),
        fetch('/api/educations'),
        fetch('/api/professions')
      ])

      const countriesData = await countriesRes.json()
      const educationsData = await educationsRes.json()
      const professionsData = await professionsRes.json()

      // Ensure we always have arrays, handle different response structures
      const countries = Array.isArray(countriesData) ? countriesData : (countriesData?.data || countriesData?.countries || [])
      const educations = Array.isArray(educationsData) ? educationsData : (educationsData?.data || educationsData?.educations || [])
      const professions = Array.isArray(professionsData) ? professionsData : (professionsData?.data || professionsData?.professions || [])

      setMasterData({
        countries: Array.isArray(countries) ? countries : [],
        educations: Array.isArray(educations) ? educations : [],
        professions: Array.isArray(professions) ? professions : [],
        states: [],
        cities: []
      })
      
      // If not in edit mode, stop loading. Otherwise, wait for existing data to load
      if (!existingContact) {
        setIsLoadingInitialData(false)
      }
    } catch (error) {
      console.error('Error fetching master data:', error)
      setMasterData({
        countries: [],
        educations: [],
        professions: [],
        states: [],
        cities: []
      })
      setIsLoadingInitialData(false)
    }
  }

  const fetchStates = async (countryId: string, preserveStateId?: string) => {
    try {
      // Get states for the selected country from our database
      const response = await fetch(`/api/states?countryId=${countryId}`)
      const statesData = await response.json()
      // Ensure we always have an array
      const states = Array.isArray(statesData) ? statesData : (statesData?.data || statesData?.states || [])
      setMasterData(prev => ({ ...prev, states: Array.isArray(states) ? states : [], cities: [] }))
      
      // If we need to preserve a stateId (for edit mode), set it after states are loaded
      if (preserveStateId) {
        // Use a slightly longer timeout to ensure states are fully loaded in the component
        setTimeout(() => {
          setValue('stateId', preserveStateId, { shouldValidate: false })
        }, 100)
      }
      
      return states
    } catch (error) {
      console.error('Error fetching states:', error)
      setMasterData(prev => ({ ...prev, states: [], cities: [] }))
      throw error
    }
  }




  const onSubmit = async (data: ContactFormData) => {
    // Fix website URL if it doesn't have protocol
    const processedData = {
      ...data,
      website: data.website && !data.website.startsWith('http')
        ? `https://${data.website}`
        : data.website,
      profilePic: uploadedProfilePic || data.profilePic,
      familyPhoto: uploadedFamilyPhoto || data.familyPhoto
    }

    console.log('Form data being submitted:', processedData)
    setIsLoading(true)
    const endpoint = isEditMode && existingContact?.id
      ? `/api/contacts/${existingContact.id}`
      : '/api/contacts'
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })

      const responseData = await response.text()

      if (!response.ok) {
        throw new Error(`Failed to submit contact form: ${response.status} - ${responseData}`)
      }

      // Show success notification
      notification.success({
        message: isEditMode ? 'Profile updated' : 'Success!',
        description: isEditMode
          ? 'Your profile has been updated successfully.'
          : 'Details submitted successfully! Your information has been saved.',
        placement: 'topRight',
        duration: 3.5,
      })
      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      notification.error({
        message: 'Submission Failed',
        description: `Failed to submit form: ${errorMessage}`,
        placement: 'topRight',
        duration: 3.5,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isCurrentStepValid = () => {
    const formData = watch()

    switch (currentStep) {
      case 1:
        let step1Valid: boolean = !!(formData.firstname && formData.gender)

        // Check if spouse first name is required when married
        if (watchedMaritalStatus === 'married' && (!formData.spouseFirstName || formData.spouseFirstName.trim().length === 0)) {
          step1Valid = false
        }

        console.log('Step 1 validation:', { step1Valid, formData: { firstname: formData.firstname, gender: formData.gender, maritalStatus: formData.maritalStatus, spouseFirstName: formData.spouseFirstName, fatherFirstName: formData.fatherFirstName, motherFirstName: formData.motherFirstName } })
        return step1Valid
      case 2:
        const step2Valid = formData.gaam && formData.currentAddress &&
          formData.countryId && formData.stateId
        console.log('Step 2 validation:', { step2Valid, formData: { gaam: formData.gaam, currentAddress: formData.currentAddress, countryId: formData.countryId, stateId: formData.stateId, cityId: formData.cityId } })
        return step2Valid
      case 3:
        const step3Valid = formData.phone
        console.log('Step 3 validation:', { step3Valid, formData: { phone: formData.phone } })
        return step3Valid
      case 4:
        console.log('Step 4 validation: true (optional)')
        return true // Children and siblings are optional
      case 5:
        // For the final step, check if all required fields are filled
        let step5Valid: boolean = !!(formData.firstname && formData.gender &&
          formData.gaam && formData.currentAddress &&
          formData.countryId && formData.stateId &&
          formData.phone)

        // Check if spouse first name is required when married
        if (watchedMaritalStatus === 'married' && (!formData.spouseFirstName || formData.spouseFirstName.trim().length === 0)) {
          step5Valid = false
        }

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
    appendChild({ firstName: '', middleName: '', lastName: '', gender: 'male', age: 0 })
  }

  const addSibling = () => {
    appendSibling({ firstName: '', middleName: '', lastName: '', gender: 'male', age: 0 })
  }

  const handleFieldChange = (fieldName: keyof ContactFormData, value: any) => {
    setValue(fieldName, value, { shouldValidate: true })
    // Clear validation error for this field
    if (errors[fieldName]) {
      clearErrors(fieldName)
    }
  }

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  const handleChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList)
  }

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Personal Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">Basic personal details</p>
        </div>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">First Name <span className="text-red-500">*</span></span>}
              validateStatus={errors.firstname ? 'error' : ''}
              help={errors.firstname?.message}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('firstname') || ''}
                onChange={(e) => handleFieldChange('firstname', e.target.value)}
                placeholder="Enter first name"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Middle Name</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('middlename') || ''}
                onChange={(e) => handleFieldChange('middlename', e.target.value)}
                placeholder="Enter middle name"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Last Name</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('lastname') || ''}
                onChange={(e) => handleFieldChange('lastname', e.target.value)}
                placeholder="Enter last name"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[20, 20]} className="mt-6">
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Gender <span className="text-red-500">*</span></span>}
              validateStatus={errors.gender ? 'error' : ''}
              help={errors.gender?.message}
              className="mb-0"
            >
              <Select
                size="large"
                value={watch('gender') || undefined}
                onChange={(value) => handleFieldChange('gender', value)}
                placeholder="Select gender"
                className="rounded-lg"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Marital Status <span className="text-red-500">*</span></span>}
              className="mb-0"
            >
              <Select
                size="large"
                value={watch('maritalStatus') || undefined}
                onChange={(value) => handleFieldChange('maritalStatus', value)}
                placeholder="Select marital status"
                className="rounded-lg"
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Date of Birth</span>}
              validateStatus={errors.dob ? 'error' : ''}
              help={errors.dob?.message}
              className="mb-0"
            >
              <DatePicker
                size="large"
                value={watch('dob') ? (typeof watch('dob') === 'string' ? dayjs(watch('dob')) : dayjs(watch('dob'))) : null}
                onChange={(date) => handleFieldChange('dob', date ? date.format('YYYY-MM-DD') : undefined)}
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Select date of birth"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Are you 18+ years old?</span>}
              validateStatus={errors.is18Plus ? 'error' : ''}
              help={errors.is18Plus?.message}
              className="mb-0"
            >
              <div className="flex items-center h-10">
                <Switch
                  checked={watch('is18Plus') || false}
                  onChange={(checked) => handleFieldChange('is18Plus', checked)}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                  style={{ minWidth: '80px' }}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </div>

        {watchedMaritalStatus === 'married' && (
          <div className="mt-8">
            <div className="mb-6 pb-3 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-secondary rounded-full"></span>
                Spouse Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">Details about your spouse</p>
            </div>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label={<span className="font-medium text-gray-700">Spouse First Name <span className="text-red-500">*</span></span>}
                  validateStatus={errors.spouseFirstName ? 'error' : ''}
                  help={errors.spouseFirstName?.message}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    value={watch('spouseFirstName') || ''}
                    onChange={(e) => handleFieldChange('spouseFirstName', e.target.value)}
                    placeholder="Enter spouse first name"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label={<span className="font-medium text-gray-700">Spouse Middle Name</span>}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    value={watch('spouseMiddleName') || ''}
                    onChange={(e) => handleFieldChange('spouseMiddleName', e.target.value)}
                    placeholder="Enter spouse middle name"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label={<span className="font-medium text-gray-700">Spouse Last Name</span>}
                  className="mb-0"
                >
                  <Input
                    size="large"
                    value={watch('spouseLastName') || ''}
                    onChange={(e) => handleFieldChange('spouseLastName', e.target.value)}
                    placeholder="Enter spouse last name"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

      {/* Parents Information Section */}
      <div className="mt-8">
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Parents Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">Details about your parents</p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-800 mb-4">Father's Details</h4>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Father's First Name <span className="text-red-500">*</span></span>}
                validateStatus={errors.fatherFirstName ? 'error' : ''}
                help={errors.fatherFirstName?.message}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('fatherFirstName') || ''}
                  onChange={(e) => handleFieldChange('fatherFirstName', e.target.value)}
                  placeholder="Enter father's first name"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Father's Middle Name</span>}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('fatherMiddleName') || ''}
                  onChange={(e) => handleFieldChange('fatherMiddleName', e.target.value)}
                  placeholder="Enter father's middle name"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Father's Last Name</span>}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('fatherLastName') || ''}
                  onChange={(e) => handleFieldChange('fatherLastName', e.target.value)}
                  placeholder="Enter father's last name"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-4">Mother's Details</h4>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Mother's First Name <span className="text-red-500">*</span></span>}
                validateStatus={errors.motherFirstName ? 'error' : ''}
                help={errors.motherFirstName?.message}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('motherFirstName') || ''}
                  onChange={(e) => handleFieldChange('motherFirstName', e.target.value)}
                  placeholder="Enter mother's first name"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Mother's Middle Name</span>}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('motherMiddleName') || ''}
                  onChange={(e) => handleFieldChange('motherMiddleName', e.target.value)}
                  placeholder="Enter mother's middle name"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Mother's Last Name</span>}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('motherLastName') || ''}
                  onChange={(e) => handleFieldChange('motherLastName', e.target.value)}
                  placeholder="Enter mother's last name"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-8">
      {/* Address & Location Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Address & Location
          </h3>
          <p className="text-sm text-gray-600 mt-1">Your current address and location details</p>
        </div>
        
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Current Address <span className="text-red-500">*</span></span>}
              validateStatus={errors.currentAddress ? 'error' : ''}
              help={errors.currentAddress?.message}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('currentAddress') || ''}
                onChange={(e) => handleFieldChange('currentAddress', e.target.value)}
                placeholder="Enter current address"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Gaam <span className="text-red-500">*</span></span>}
              validateStatus={errors.gaam ? 'error' : ''}
              help={errors.gaam?.message}
              className="mb-0"
            >
              <Select
                size="large"
                showSearch
                value={watch('gaam') || undefined}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => handleFieldChange('gaam', value)}
                placeholder="Select gaam"
                className="rounded-lg"
                options={[
                  { value: 'Pisai', label: 'Pisai' },
                  { value: 'Puniyad', label: 'Puniyad' },
                  { value: 'Sandha', label: 'Sandha' },
                  { value: 'Bhekhda', label: 'Bhekhda' },
                  { value: 'Avakhal', label: 'Avakhal' },
                  { value: 'Kukas', label: 'Kukas' },
                  { value: 'Manjrol', label: 'Manjrol' },
                  { value: 'Vemar', label: 'Vemar' },
                  { value: 'Malpur', label: 'Malpur' },
                  { value: 'Juni Jithardi', label: 'Juni Jithardi' },
                  { value: 'Someswarpura', label: 'Someswarpura' },
                  { value: 'Jaferpura', label: 'Jaferpura' },
                  { value: 'Alindra', label: 'Alindra' },
                  { value: 'Tarsana', label: 'Tarsana' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Email</span>}
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('email') || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                type="email"
                placeholder="Enter email address (optional)"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[20, 20]} className="mt-6">
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Country <span className="text-red-500">*</span></span>}
              validateStatus={errors.countryId ? 'error' : ''}
              help={errors.countryId?.message}
              className="mb-0"
            >
              <Select
                size="large"
                showSearch
                value={watch('countryId') || undefined}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => handleFieldChange('countryId', value)}
                placeholder="Select country"
                className="rounded-lg"
                options={Array.isArray(masterData.countries) ? masterData.countries.map((country: any) => ({
                  value: country.id,
                  label: country.name
                })) : []}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">State <span className="text-red-500">*</span></span>}
              validateStatus={errors.stateId ? 'error' : ''}
              help={errors.stateId?.message}
              className="mb-0"
            >
              <Select
                size="large"
                showSearch
                value={watch('stateId') || undefined}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => handleFieldChange('stateId', value)}
                placeholder="Select state"
                disabled={!watchedCountryId}
                className="rounded-lg"
                options={Array.isArray(masterData.states) ? masterData.states.map((state: any) => ({
                  value: state.id,
                  label: state.name
                })) : []}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">City</span>}
              validateStatus={errors.cityId ? 'error' : ''}
              help={errors.cityId?.message}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('cityId') || ''}
                onChange={(e) => handleFieldChange('cityId', e.target.value)}
                placeholder="Enter city (optional)"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Contact Information Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Contact Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">Phone number and communication details</p>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Phone <span className="text-red-500">*</span></span>}
              validateStatus={errors.phone ? 'error' : ''}
              help={errors.phone?.message}
              className="mb-0"
            >
              <Input.Group compact className="flex">
                <Select
                  size="large"
                  style={{ width: '30%', borderRadius: '8px 0 0 8px' }}
                  value={watch('countryCode') || '+1'}
                  onChange={(value) => handleFieldChange('countryCode', value)}
                  options={countryCodes}
                />
                <Input
                  size="large"
                  style={{ width: '70%', borderRadius: '0 8px 8px 0' }}
                  type="tel"
                  value={watch('phone') || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Education & Profession Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Education & Profession
          </h3>
          <p className="text-sm text-gray-600 mt-1">Your educational and professional background</p>
        </div>
        
        <Row gutter={[20, 20]}>
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Education Level</span>}
              validateStatus={errors.educationId ? 'error' : ''}
              help={errors.educationId?.message}
              className="mb-0"
            >
              <Select
                size="large"
                value={watch('educationId') || ''}
                onChange={(value) => handleFieldChange('educationId', value)}
                placeholder="Select education level (optional)"
                className="rounded-lg"
                options={Array.isArray(masterData.educations) ? masterData.educations.map((education: any) => ({
                  value: education.id,
                  label: education.name
                })) : []}
              />
            </Form.Item>
          </Col>
          {showOtherEducation && (
            <Col xs={24} md={6}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Other Education <span className="text-red-500">*</span></span>}
                validateStatus={errors.otherEducation ? 'error' : ''}
                help={errors.otherEducation?.message}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('otherEducation') || ''}
                  onChange={(e) => handleFieldChange('otherEducation', e.target.value)}
                  placeholder="Please specify your education"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={6}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Profession</span>}
              validateStatus={errors.professionId ? 'error' : ''}
              help={errors.professionId?.message}
              className="mb-0"
            >
              <Select
                size="large"
                value={watch('professionId') || ''}
                onChange={(value) => handleFieldChange('professionId', value)}
                placeholder="Select profession (optional)"
                className="rounded-lg"
                options={Array.isArray(masterData.professions) ? masterData.professions.map((profession: any) => ({
                  value: profession.id,
                  label: profession.name
                })) : []}
              />
            </Form.Item>
          </Col>
          {showOtherProfession && (
            <Col xs={24} md={6}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Other Profession <span className="text-red-500">*</span></span>}
                validateStatus={errors.otherProfession ? 'error' : ''}
                help={errors.otherProfession?.message}
                className="mb-0"
              >
                <Input
                  size="large"
                  value={watch('otherProfession') || ''}
                  onChange={(e) => handleFieldChange('otherProfession', e.target.value)}
                  placeholder="Please specify your profession"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={[20, 20]} className="mt-6">
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Website</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('website') || ''}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                placeholder="Enter website URL"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Social Media Profiles Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Social Media Profiles
          </h3>
          <p className="text-sm text-gray-600 mt-1">Connect your social media accounts (optional)</p>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Facebook</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('fb') || ''}
                onChange={(e) => handleFieldChange('fb', e.target.value)}
                placeholder="Facebook profile"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">LinkedIn</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('linkedin') || ''}
                onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                placeholder="LinkedIn profile"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Instagram</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('insta') || ''}
                onChange={(e) => handleFieldChange('insta', e.target.value)}
                placeholder="Instagram profile"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">TikTok</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('tiktok') || ''}
                onChange={(e) => handleFieldChange('tiktok', e.target.value)}
                placeholder="TikTok profile"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Twitter</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('twitter') || ''}
                onChange={(e) => handleFieldChange('twitter', e.target.value)}
                placeholder="Twitter profile"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span className="font-medium text-gray-700">Snapchat</span>}
              className="mb-0"
            >
              <Input
                size="large"
                value={watch('snapchat') || ''}
                onChange={(e) => handleFieldChange('snapchat', e.target.value)}
                placeholder="Snapchat username"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Photos Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-secondary rounded-full"></span>
            Photos
          </h3>
          <p className="text-sm text-gray-600 mt-1">Upload your profile and family photos</p>
        </div>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card 
              title={<span className="font-semibold text-gray-900">Profile Photo</span>}
              className="shadow-md border border-gray-200"
              style={{ borderRadius: '12px' }}
            >
              <Form.Item className="upload_photo_box mb-0">
                <Upload
                  name="profilePhoto"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isAllowed =
                      file.type.startsWith("image/") || file.type === "application/pdf";

                    if (!isAllowed) {
                      message.error("You can only upload image or PDF files!");
                      return Upload.LIST_IGNORE;
                    }

                    const isLt15M = file.size / 1024 / 1024 < 15;
                    if (!isLt15M) {
                      message.error("File must be smaller than 15MB!");
                      return Upload.LIST_IGNORE;
                    }
                    return true;
                  }}
                  customRequest={async ({ file, onSuccess, onError }) => {
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("folder", "profile-photos");

                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const result = await response.json();

                      if (response.ok) {
                        setUploadedProfilePic(result.url);
                        handleFieldChange("profilePic", result.url);
                        onSuccess?.(result);
                        message.success(`${(file as File).name} uploaded successfully`);
                      } else {
                        throw new Error(result.error || "Upload failed");
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                      onError?.(error as Error);
                      message.error(`${(file as File).name} upload failed`);
                    }
                  }}
                >
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    {uploadedProfilePic && uploadedProfilePic.endsWith(".pdf") ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f5f5f5",
                          border: "1px solid #d9d9d9",
                          borderRadius: 8,
                        }}
                      >
                        <FilePdfOutlined style={{ fontSize: "40px", color: "red" }} />
                      </div>
                    ) : uploadedProfilePic ? (
                      <img
                        src={uploadedProfilePic}
                        alt="profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 1,
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 0,
                        }}
                      >
                        <InboxOutlined style={{ fontSize: "24px", color: "#f4a94b" }} />
                        <div style={{ marginTop: 8, color: "#666" }}>Upload Profile Photo / PDF</div>
                      </div>
                    )}
                  </div>
                </Upload>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              title={<span className="font-semibold text-gray-900">Family Photo</span>}
              className="shadow-md border border-gray-200"
              style={{ borderRadius: '12px' }}
            >
              <Form.Item className="upload_photo_box mb-0">
                <Upload
                  name="familyPhoto"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isAllowed =
                      file.type.startsWith("image/") || file.type === "application/pdf";

                    if (!isAllowed) {
                      message.error("You can only upload image or PDF files!");
                      return Upload.LIST_IGNORE;
                    }

                    const isLt15M = file.size / 1024 / 1024 < 15;
                    if (!isLt15M) {
                      message.error("File must be smaller than 15MB!");
                      return Upload.LIST_IGNORE;
                    }
                    return true;
                  }}
                  customRequest={async ({ file, onSuccess, onError }) => {
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("folder", "family-photos");

                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const result = await response.json();

                      if (response.ok) {
                        setUploadedFamilyPhoto(result.url);
                        handleFieldChange("familyPhoto", result.url);
                        onSuccess?.(result);
                        message.success(`${(file as File).name} uploaded successfully`);
                      } else {
                        throw new Error(result.error || "Upload failed");
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                      onError?.(error as Error);
                      message.error(`${(file as File).name} upload failed`);
                    }
                  }}
                >
                  <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    {uploadedFamilyPhoto && uploadedFamilyPhoto.endsWith(".pdf") ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f5f5f5",
                          border: "1px solid #d9d9d9",
                          borderRadius: 8,
                        }}
                      >
                        <FilePdfOutlined style={{ fontSize: "40px", color: "red" }} />
                      </div>
                    ) : uploadedFamilyPhoto ? (
                      <img
                        src={uploadedFamilyPhoto}
                        alt="family"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 1,
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 0,
                        }}
                      >
                        <InboxOutlined style={{ fontSize: "24px", color: "#f4a94b" }} />
                        <div style={{ marginTop: 8, color: "#666" }}>Upload Family Photo / PDF</div>
                      </div>
                    )}
                  </div>
                </Upload>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-8">
      {/* Children Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded-full"></span>
              Children
            </h3>
            <p className="text-sm text-gray-600 mt-1">Add information about your children</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={addChild}
            size="large"
            className="bg-secondary hover:bg-secondary/90 border-0"
          >
            Add Child
          </Button>
        </div>
        
        <Card className="border border-gray-200 shadow-sm" style={{ borderRadius: '12px' }}>
          {childrenFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Typography.Text type="secondary">No children added yet. Click "Add Child" to get started.</Typography.Text>
            </div>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {childrenFields.map((field, index) => (
                <Card key={field.id} className="border border-gray-200 shadow-sm" style={{ borderRadius: '12px' }}>
                  <Row gutter={[20, 20]} align="bottom">
                    <Col xs={24} md={5}>
                      <Form.Item label={<span className="font-medium text-gray-700">First Name</span>} className="mb-0">
                        <Input
                          size="large"
                          value={watch(`children.${index}.firstName`) || ''}
                          onChange={(e) => {
                            setValue(`children.${index}.firstName`, e.target.value)
                            if (errors.children?.[index]?.firstName) {
                              clearErrors(`children.${index}.firstName`)
                            }
                          }}
                          placeholder="Child's first name"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item label={<span className="font-medium text-gray-700">Middle Name</span>} className="mb-0">
                        <Input
                          size="large"
                          value={watch(`children.${index}.middleName`) || ''}
                          onChange={(e) => {
                            setValue(`children.${index}.middleName`, e.target.value)
                            if (errors.children?.[index]?.middleName) {
                              clearErrors(`children.${index}.middleName`)
                            }
                          }}
                          placeholder="Child's middle name"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item label={<span className="font-medium text-gray-700">Last Name</span>} className="mb-0">
                        <Input
                          size="large"
                          value={watch(`children.${index}.lastName`) || ''}
                          onChange={(e) => {
                            setValue(`children.${index}.lastName`, e.target.value)
                            if (errors.children?.[index]?.lastName) {
                              clearErrors(`children.${index}.lastName`)
                            }
                          }}
                          placeholder="Child's last name"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item label={<span className="font-medium text-gray-700">Gender</span>} className="mb-0">
                        <Select
                          size="large"
                          value={watch(`children.${index}.gender`) || ''}
                          onChange={(value) => {
                            setValue(`children.${index}.gender`, value)
                            if (errors.children?.[index]?.gender) {
                              clearErrors(`children.${index}.gender`)
                            }
                          }}
                          className="rounded-lg"
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={3}>
                      <Form.Item label={<span className="font-medium text-gray-700">Age</span>} className="mb-0">
                        <Input
                          size="large"
                          type="number"
                          value={watch(`children.${index}.age`) || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : 0
                            setValue(`children.${index}.age`, value)
                            if (errors.children?.[index]?.age) {
                              clearErrors(`children.${index}.age`)
                            }
                          }}
                          placeholder="Age"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={2}>
                      <Form.Item className="mb-0">
                        <Button
                          size="large"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeChild(index)}
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </div>

      {/* Siblings Section */}
      <div>
        <div className="mb-6 pb-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded-full"></span>
              Siblings/Brother/sister
            </h3>
            <p className="text-sm text-gray-600 mt-1">Add information about your siblings</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={addSibling}
            size="large"
            className="bg-secondary hover:bg-secondary/90 border-0"
          >
            Add Sibling
          </Button>
        </div>
        
        <Card className="border border-gray-200 shadow-sm" style={{ borderRadius: '12px' }}>
          {siblingsFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Typography.Text type="secondary">No siblings added yet. Click "Add Sibling" to get started.</Typography.Text>
            </div>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {siblingsFields.map((field, index) => (
                <Card key={field.id} className="border border-gray-200 shadow-sm" style={{ borderRadius: '12px' }}>
                  <Row gutter={[20, 20]} align="bottom">
                    <Col xs={24} md={5}>
                      <Form.Item label={<span className="font-medium text-gray-700">First Name</span>} className="mb-0">
                        <Input
                          size="large"
                          value={watch(`siblings.${index}.firstName`) || ''}
                          onChange={(e) => {
                            setValue(`siblings.${index}.firstName`, e.target.value)
                            if (errors.siblings?.[index]?.firstName) {
                              clearErrors(`siblings.${index}.firstName`)
                            }
                          }}
                          placeholder="Sibling's first name"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item label={<span className="font-medium text-gray-700">Middle Name</span>} className="mb-0">
                        <Input
                          size="large"
                          value={watch(`siblings.${index}.middleName`) || ''}
                          onChange={(e) => {
                            setValue(`siblings.${index}.middleName`, e.target.value)
                            if (errors.siblings?.[index]?.middleName) {
                              clearErrors(`siblings.${index}.middleName`)
                            }
                          }}
                          placeholder="Sibling's middle name"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item label={<span className="font-medium text-gray-700">Last Name</span>} className="mb-0">
                        <Input
                          size="large"
                          value={watch(`siblings.${index}.lastName`) || ''}
                          onChange={(e) => {
                            setValue(`siblings.${index}.lastName`, e.target.value)
                            if (errors.siblings?.[index]?.lastName) {
                              clearErrors(`siblings.${index}.lastName`)
                            }
                          }}
                          placeholder="Sibling's last name"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item label={<span className="font-medium text-gray-700">Gender</span>} className="mb-0">
                        <Select
                          size="large"
                          value={watch(`siblings.${index}.gender`) || ''}
                          onChange={(value) => {
                            setValue(`siblings.${index}.gender`, value)
                            if (errors.siblings?.[index]?.gender) {
                              clearErrors(`siblings.${index}.gender`)
                            }
                          }}
                          className="rounded-lg"
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={3}>
                      <Form.Item label={<span className="font-medium text-gray-700">Age</span>} className="mb-0">
                        <Input
                          size="large"
                          type="number"
                          value={watch(`siblings.${index}.age`) || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : 0
                            setValue(`siblings.${index}.age`, value)
                            if (errors.siblings?.[index]?.age) {
                              clearErrors(`siblings.${index}.age`)
                            }
                          }}
                          placeholder="Age"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={2}>
                      <Form.Item className="mb-0">
                        <Button
                          size="large"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeSibling(index)}
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </div>
    </div>
  )

  const renderStep5 = () => {
    const formData = watch()

    // Get actual education and profession names
    const selectedEducation = masterData.educations?.find(edu => edu.id === formData.educationId)
    const selectedProfession = masterData.professions?.find(prof => prof.id === formData.professionId)

    // Get location names
    const selectedCountry = masterData.countries?.find(country => country.id === formData.countryId)
    const selectedState = masterData.states?.find(state => state.id === formData.stateId)

    return (
      <div className="space-y-8">
        <div>
          <div className="mb-6 pb-3 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded-full"></span>
              Review Your Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">Please review all your details before submitting</p>
          </div>
          
          <Card className="border border-gray-200 shadow-sm" style={{ borderRadius: '12px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Name:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.firstname} {formData.middlename} {formData.lastname}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Gender:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900 capitalize">{formData.gender || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Marital Status:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900 capitalize">{formData.maritalStatus || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">18 Plus:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.is18Plus ? 'Yes' : 'No'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Date of Birth:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.dob || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    {formData.maritalStatus === 'married' && formData.spouseFirstName && (
                      <div className="flex">
                        <div className="w-32 flex-shrink-0">
                          <Typography.Text strong className="text-gray-700">Spouse Name:</Typography.Text>
                        </div>
                        <div className="flex-1">
                          <Typography.Text className="text-gray-900">{formData.spouseFirstName} {formData.spouseMiddleName} {formData.spouseLastName}</Typography.Text>
                        </div>
                      </div>
                    )}
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Phone:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.countryCode || '+1'} {formData.phone || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Email:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.email || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Gaam:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.gaam || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Address:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.currentAddress || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Country:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{selectedCountry?.name || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">State:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{selectedState?.name || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">City:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.cityId || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Education:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{selectedEducation?.name || formData.otherEducation || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Profession:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{selectedProfession?.name || formData.otherProfession || 'Not specified'}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Children:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.children?.length || 0}</Typography.Text>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-32 flex-shrink-0">
                        <Typography.Text strong className="text-gray-700">Siblings:</Typography.Text>
                      </div>
                      <div className="flex-1">
                        <Typography.Text className="text-gray-900">{formData.siblings?.length || 0}</Typography.Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Photos Section */}
          {(uploadedProfilePic || uploadedFamilyPhoto) && (
            <div className="mt-8">
              <div className="mb-6 pb-3 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-6 bg-secondary rounded-full"></span>
                  Photos
                </h3>
                <p className="text-sm text-gray-600 mt-1">Your uploaded profile and family photos</p>
              </div>
              <Card className="border border-gray-200 shadow-sm" style={{ borderRadius: '12px' }}>
                <Row gutter={[20, 20]}>
                  {uploadedProfilePic && (
                    <Col xs={24} md={12}>
                      <div className="text-center">
                        <Typography.Text strong className="block mb-4 text-gray-900">Profile Photo</Typography.Text>
                        <img
                          src={uploadedProfilePic}
                          alt="Profile"
                          className="mx-auto rounded-lg border border-gray-200 shadow-sm"
                          style={{
                            maxWidth: '200px',
                            height: '200px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </Col>
                  )}
                  {uploadedFamilyPhoto && (
                    <Col xs={24} md={12}>
                      <div className="text-center">
                        <Typography.Text strong className="block mb-4 text-gray-900">Family Photo</Typography.Text>
                        <img
                          src={uploadedFamilyPhoto}
                          alt="Family"
                          className="mx-auto rounded-lg border border-gray-200 shadow-sm"
                          style={{
                            maxWidth: '200px',
                            height: '200px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            </div>
          )}
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

  // Show loading spinner while initial data is being loaded
  if (isLoadingInitialData) {
    return (
      <div className="w-full">
        <Card 
          className="shadow-xl border-0"
          style={{
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          <div className="flex flex-col items-center justify-center py-24">
            <Spin size="large" />
            <Typography.Text className="mt-4 text-gray-600 text-lg">
              {existingContact ? 'Loading contact data...' : 'Loading form...'}
            </Typography.Text>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Modern Card Container */}
      <Card 
        className="shadow-xl border-0"
        style={{
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Progress Steps - Enhanced Design */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
            {steps.map((step, index) => {
              // Allow clicking on any step in edit mode, or on completed/current/next steps in create mode
              const isClickable = isEditMode || currentStep >= step.id || step.id === currentStep + 1
              
              return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    onClick={() => {
                      if (isClickable) {
                        setCurrentStep(step.id)
                      }
                    }}
                    className={`
                      flex items-center justify-center
                      w-12 h-12 rounded-full
                      font-semibold text-sm
                      transition-all duration-300
                      ${currentStep >= step.id
                        ? 'bg-secondary text-white shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                      }
                      ${isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-not-allowed opacity-50'}
                    `}
                    style={{
                      minWidth: '48px',
                      minHeight: '48px'
                    }}
                    title={isClickable ? `Go to ${step.title}` : 'Complete previous steps first'}
                  >
                    {currentStep > step.id ? (
                      <CheckOutlined className="text-lg" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <div className={`text-xs font-medium ${currentStep >= step.id ? 'text-secondary' : 'text-gray-400'}`}>
                      {step.title.split(' ')[0]}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 rounded-full transition-all duration-300
                      ${currentStep > step.id ? 'bg-secondary' : 'bg-gray-200'}
                    `}
                    style={{ marginTop: '-24px' }}
                  />
                )}
              </div>
              )
            })}
          </div>
        </div>

        {/* Step Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 text-lg">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Form Content - Wrapped in Card */}
        <Card
          className="border-0 shadow-none bg-gray-50/50"
          style={{
            borderRadius: '12px',
            padding: '32px'
          }}
        >
          <Form layout="vertical">
            <div className="space-y-6">
              {renderCurrentStep()}
            </div>

            {/* Navigation Buttons - Enhanced */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <Button
                    size="large"
                    onClick={prevStep}
                    icon={<LeftOutlined />}
                    className="px-6 h-11 border-2 border-gray-300 hover:border-primary hover:text-primary transition-all"
                  >
                    Previous
                  </Button>
                )}
              </div>

              <Space size="middle">
                {currentStep < steps.length ? (
                  <>
                    {currentStep === 4 && isEditMode && (
                      <Button
                        size="large"
                        type="primary"
                        onClick={() => {
                          const formData = watch()
                          onSubmit(formData)
                        }}
                        disabled={isLoading}
                        loading={isLoading}
                        className="px-6 h-11 bg-secondary hover:bg-secondary/90 border-0"
                      >
                        Save Family Members
                      </Button>
                    )}
                    <Button
                      size="large"
                      type="primary"
                      onClick={nextStep}
                      disabled={!isCurrentStepValid()}
                      icon={<RightOutlined />}
                      className="px-8 h-11 bg-secondary hover:bg-secondary/90 border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </>
                ) : (
                  <Button
                    size="large"
                    type="primary"
                    onClick={() => {
                      console.log('Manual submit test')
                      const formData = watch()
                      console.log('Form data for submission:', formData)
                      onSubmit(formData)
                    }}
                    disabled={!isCurrentStepValid() || isLoading}
                    loading={isLoading}
                    className="px-8 h-11 bg-secondary hover:bg-secondary/90 border-0 shadow-lg"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Profile'}
                  </Button>
                )}

                <Button
                  size="large"
                  onClick={onCancel}
                  className="px-6 h-11 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Card>
    </div>
  )
}