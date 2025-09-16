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
  Image
} from 'antd'
import { PlusOutlined, DeleteOutlined, LeftOutlined, RightOutlined, CheckOutlined, UploadOutlined, InboxOutlined } from '@ant-design/icons'
import csc from 'countries-states-cities'
import dayjs from 'dayjs'


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
  const [fileList, setFileList] = useState<any[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploadedProfilePic, setUploadedProfilePic] = useState<string>('')
  const [uploadedFamilyPhoto, setUploadedFamilyPhoto] = useState<string>('')
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

  const { fields: childrenFields, append: appendChild, remove: removeChild } = useFieldArray({
    control,
    name: 'children'
  })

  const { fields: siblingsFields, append: appendSibling, remove: removeSibling } = useFieldArray({
    control,
    name: 'siblings'
  })

  const { fields: additionalProfessionsFields, append: appendAdditionalProfession, remove: removeAdditionalProfession } = useFieldArray({
    control,
    name: 'additionalProfessions'
  })

  const watchedCountryId = watch('countryId')
  const watchedStateId = watch('stateId')
  const watchedEducationId = watch('educationId')
  const watchedProfessionId = watch('professionId')
  const watchedMaritalStatus = watch('maritalStatus') as unknown as string

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
    }
  }, [watchedStateId, setValue])

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
    // Clear spouse name when marital status changes to single
    if (watchedMaritalStatus === 'single') {
      handleFieldChange('spouseName', '')
    }
  }, [watchedMaritalStatus])

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
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
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
        message: 'Success!',
        description: 'Details submitted successfully! Your information has been saved.',
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
        let step1Valid: boolean = !!(formData.firstname && formData.gender &&
          formData.fatherName && formData.motherName)

        // Check if spouse name is required when married
        if (watchedMaritalStatus === 'married' && (!formData.spouseName || formData.spouseName.trim().length === 0)) {
          step1Valid = false
        }

        console.log('Step 1 validation:', { step1Valid, formData: { firstname: formData.firstname, gender: formData.gender, maritalStatus: formData.maritalStatus, spouseName: formData.spouseName, fatherName: formData.fatherName, motherName: formData.motherName } })
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
          formData.fatherName && formData.motherName &&
          formData.gaam && formData.currentAddress &&
          formData.countryId && formData.stateId &&
          formData.phone)

        // Check if spouse name is required when married
        if (watchedMaritalStatus === 'married' && (!formData.spouseName || formData.spouseName.trim().length === 0)) {
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
    appendChild({ firstname: '', gender: 'male', age: 0 })
  }

  const addSibling = () => {
    appendSibling({ name: '', gender: 'male', age: 0 })
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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item
            label="First Name"
            required
            validateStatus={errors.firstname ? 'error' : ''}
            help={errors.firstname?.message}
          >
            <Input
              value={watch('firstname') || ''}
              onChange={(e) => handleFieldChange('firstname', e.target.value)}
              placeholder="Enter first name"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Middle Name">
            <Input
              value={watch('middlename') || ''}
              onChange={(e) => handleFieldChange('middlename', e.target.value)}
              placeholder="Enter middle name"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Last Name">
            <Input
              value={watch('lastname') || ''}
              onChange={(e) => handleFieldChange('lastname', e.target.value)}
              placeholder="Enter last name"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Form.Item
            label="Gender"
            required
            validateStatus={errors.gender ? 'error' : ''}
            help={errors.gender?.message}
          >
            <Select
              // value={watch('gender') || ''}
              onChange={(value) => handleFieldChange('gender', value)}
              placeholder="Select gender"
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
            label="Marital Status"
            required
          >
            <Select
              // value={watch('maritalStatus') || ''}
              onChange={(value) => handleFieldChange('maritalStatus', value)}
              placeholder="Select marital status"
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' }
              ]}
            />
          </Form.Item>
        </Col>


        {watchedMaritalStatus === 'married' && (
          <Col xs={24} md={6}>
            <Form.Item
              label="Spouse Name"
              required
              validateStatus={errors.spouseName ? 'error' : ''}
              help={errors.spouseName?.message}
            >
              <Input
                value={watch('spouseName') || ''}
                onChange={(e) => handleFieldChange('spouseName', e.target.value)}
                placeholder="Enter spouse name"
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} md={6}>
          <Form.Item
            label="Date of Birth"
            validateStatus={errors.dob ? 'error' : ''}
            help={errors.dob?.message}
          >
            <DatePicker
              value={watch('dob') ? dayjs(watch('dob')) : null}
              onChange={(date) => handleFieldChange('dob', date ? date.format('YYYY-MM-DD') : '')}
              style={{ width: '100%' }}
              placeholder="Select date of birth (optional)"
            />
          </Form.Item>
        </Col>

      </Row>

      <Row gutter={[16, 16]}>

        <Col xs={24} md={8}>
          <Form.Item
            label="Father's Name"
            required
            validateStatus={errors.fatherName ? 'error' : ''}
            help={errors.fatherName?.message}
          >
            <Input
              value={watch('fatherName') || ''}
              onChange={(e) => handleFieldChange('fatherName', e.target.value)}
              placeholder="Enter father's name"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>

          <Form.Item
            label="Mother's Name"
            required
            validateStatus={errors.motherName ? 'error' : ''}
            help={errors.motherName?.message}
          >
            <Input
              value={watch('motherName') || ''}
              onChange={(e) => handleFieldChange('motherName', e.target.value)}
              placeholder="Enter mother's name"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="Are you 18+ years old?"
            validateStatus={errors.is18Plus ? 'error' : ''}
            help={errors.is18Plus?.message}
          >
            <Switch
              checked={watch('is18Plus') || false}
              onChange={(checked) => handleFieldChange('is18Plus', checked)}
              checkedChildren="Yes"
              unCheckedChildren="No"
              style={{ minWidth: '80px' }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Space>
  )

  const renderStep2 = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>


      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Current Address"
            required
            validateStatus={errors.currentAddress ? 'error' : ''}
            help={errors.currentAddress?.message}
          >
            <Input
              value={watch('currentAddress') || ''}
              onChange={(e) => handleFieldChange('currentAddress', e.target.value)}
              placeholder="Enter current address"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="Gaam"
            required
            validateStatus={errors.gaam ? 'error' : ''}
            help={errors.gaam?.message}
          >
            <Input
              value={watch('gaam') || ''}
              onChange={(e) => handleFieldChange('gaam', e.target.value)}
              placeholder="Enter gaam"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={6}>
          <Form.Item
            label="Phone"
            required
            validateStatus={errors.phone ? 'error' : ''}
            help={errors.phone?.message}
          >
            <Input
              type="number"
              value={watch('phone') || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Form.Item
            label="Country"
            required
            validateStatus={errors.countryId ? 'error' : ''}
            help={errors.countryId?.message}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              value={watch('countryId') || ''}
              onChange={(value) => handleFieldChange('countryId', value)}
              placeholder="Select country"
              options={masterData.countries?.map((country: any) => ({
                value: country.id,
                label: country.name
              })) || []}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="State"
            required
            validateStatus={errors.stateId ? 'error' : ''}
            help={errors.stateId?.message}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              value={watch('stateId') || ''}
              onChange={(value) => handleFieldChange('stateId', value)}
              placeholder="Select state"
              disabled={!watchedCountryId}
              options={masterData.states?.map((state: any) => ({
                value: state.id,
                label: state.name
              })) || []}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="City"
            validateStatus={errors.cityId ? 'error' : ''}
            help={errors.cityId?.message}
          >
            <Input
              value={watch('cityId') || ''}
              onChange={(e) => handleFieldChange('cityId', e.target.value)}
              placeholder="Enter city (optional)"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Input
              value={watch('email') || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              type="email"
              placeholder="Enter email address (optional)"
            />
          </Form.Item>
        </Col>
      </Row>



    </Space>
  )

  const renderStep3 = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Form.Item
            label="Education Level"
            validateStatus={errors.educationId ? 'error' : ''}
            help={errors.educationId?.message}
          >
            <Select
              value={watch('educationId') || ''}
              onChange={(value) => handleFieldChange('educationId', value)}
              placeholder="Select education level (optional)"
              options={masterData.educations?.map((education: any) => ({
                value: education.id,
                label: education.name
              })) || []}
            />
          </Form.Item>
        </Col>
        {showOtherEducation && (
          <Col xs={24} md={6}>
            <Form.Item
              label="Other Education"
              required
              validateStatus={errors.otherEducation ? 'error' : ''}
              help={errors.otherEducation?.message}
            >
              <Input
                value={watch('otherEducation') || ''}
                onChange={(e) => handleFieldChange('otherEducation', e.target.value)}
                placeholder="Please specify your education"
              />
            </Form.Item>
          </Col>
        )}

        {/* <Col xs={24} md={12}>
          <Form.Item
            label="Educational Level"
            validateStatus={errors.educationalLevel ? 'error' : ''}
            help={errors.educationalLevel?.message}
          >
            <Select
              value={watch('educationalLevel') || ''}
              onChange={(value) => handleFieldChange('educationalLevel', value)}
              placeholder="Select educational level (optional)"
              options={masterData.educations?.map((education: any) => ({
                value: education.id,
                label: education.name
              })) || []}
            />
          </Form.Item>
        </Col> */}
        <Col xs={24} md={6}>
          <Form.Item
            label="Profession"
            validateStatus={errors.professionId ? 'error' : ''}
            help={errors.professionId?.message}
          >
            <Select
              value={watch('professionId') || ''}
              onChange={(value) => handleFieldChange('professionId', value)}
              placeholder="Select profession (optional)"
              options={masterData.professions?.map((profession: any) => ({
                value: profession.id,
                label: profession.name
              })) || []}
            />
          </Form.Item>
        </Col>
        {showOtherProfession && (
          <Col xs={24} md={6}>
            <Form.Item
              label="Other Profession"
              required
              validateStatus={errors.otherProfession ? 'error' : ''}
              help={errors.otherProfession?.message}
            >
              <Input
                value={watch('otherProfession') || ''}
                onChange={(e) => handleFieldChange('otherProfession', e.target.value)}
                placeholder="Please specify your profession"
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      {/* Additional Professions Section */}


      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item label="Website">
            <Input
              value={watch('website') || ''}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              placeholder="Enter website URL"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">
        <Typography.Title level={5}>Social Media Profiles</Typography.Title>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Form.Item label="Facebook">
            <Input
              value={watch('fb') || ''}
              onChange={(e) => handleFieldChange('fb', e.target.value)}
              placeholder="Facebook profile"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="LinkedIn">
            <Input
              value={watch('linkedin') || ''}
              onChange={(e) => handleFieldChange('linkedin', e.target.value)}
              placeholder="LinkedIn profile"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Instagram">
            <Input
              value={watch('insta') || ''}
              onChange={(e) => handleFieldChange('insta', e.target.value)}
              placeholder="Instagram profile"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="TikTok">
            <Input
              value={watch('tiktok') || ''}
              onChange={(e) => handleFieldChange('tiktok', e.target.value)}
              placeholder="TikTok profile"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Twitter">
            <Input
              value={watch('twitter') || ''}
              onChange={(e) => handleFieldChange('twitter', e.target.value)}
              placeholder="Twitter profile"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Snapchat">
            <Input
              value={watch('snapchat') || ''}
              onChange={(e) => handleFieldChange('snapchat', e.target.value)}
              placeholder="Snapchat username"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">
        <Typography.Title level={5}>Photos</Typography.Title>
      </Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item label="Profile Photo">
            <Upload
              name="profilePhoto"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('You can only upload image files!');
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }
                return true; // Allow upload to proceed
              }}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('folder', 'profile-photos');

                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });

                  const result = await response.json();

                  if (response.ok) {
                    setUploadedProfilePic(result.url);
                    handleFieldChange('profilePic', result.url);
                    onSuccess?.(result);
                    message.success(`${(file as File).name} uploaded successfully`);
                  } else {
                    throw new Error(result.error || 'Upload failed');
                  }
                } catch (error) {
                  console.error('Upload error:', error);
                  onError?.(error as Error);
                  message.error(`${(file as File).name} upload failed`);
                }
              }}
            >
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {uploadedProfilePic && (
                  <img
                    src={uploadedProfilePic}
                    alt="profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 1
                    }}
                  />
                )}
                {!uploadedProfilePic && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 0
                  }}>
                    <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div style={{ marginTop: 8 }}>Upload Profile Photo</div>
                  </div>
                )}
              </div>
            </Upload>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Family Photo">
            <Upload
              name="familyPhoto"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('You can only upload image files!');
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }
                return true; // Allow upload to proceed
              }}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('folder', 'family-photos');

                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });

                  const result = await response.json();

                  if (response.ok) {
                    setUploadedFamilyPhoto(result.url);
                    handleFieldChange('familyPhoto', result.url);
                    onSuccess?.(result);
                    message.success(`${(file as File).name} uploaded successfully`);
                  } else {
                    throw new Error(result.error || 'Upload failed');
                  }
                } catch (error) {
                  console.error('Upload error:', error);
                  onError?.(error as Error);
                  message.error(`${(file as File).name} upload failed`);
                }
              }}
            >
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {uploadedFamilyPhoto && (
                  <img
                    src={uploadedFamilyPhoto}
                    alt="family"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 1
                    }}
                  />
                )}
                {!uploadedFamilyPhoto && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 0
                  }}>
                    <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div style={{ marginTop: 8 }}>Upload Family Photo</div>
                  </div>
                )}
              </div>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </Space>
  )

  const renderStep4 = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Children Section */}
      <Card title="Children" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={addChild}>
          Add Child
        </Button>
      }>
        {childrenFields.length === 0 ? (
          <Typography.Text type="secondary">No children added yet</Typography.Text>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {childrenFields.map((field, index) => (
              <Card key={field.id} size="small">
                <Row gutter={[16, 16]} align="bottom">
                  <Col xs={24} md={6}>
                    <Form.Item label="First Name">
                      <Input
                        value={watch(`children.${index}.firstname`) || ''}
                        onChange={(e) => {
                          setValue(`children.${index}.firstname`, e.target.value)
                          if (errors.children?.[index]?.firstname) {
                            clearErrors(`children.${index}.firstname`)
                          }
                        }}
                        placeholder="Child's first name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Gender">
                      <Select
                        value={watch(`children.${index}.gender`) || ''}
                        onChange={(value) => {
                          setValue(`children.${index}.gender`, value)
                          if (errors.children?.[index]?.gender) {
                            clearErrors(`children.${index}.gender`)
                          }
                        }}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Age">
                      <Input
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
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeChild(index)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      {/* Siblings Section */}
      <Card title="Siblings" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={addSibling}>
          Add Sibling
        </Button>
      }>
        {siblingsFields.length === 0 ? (
          <Typography.Text type="secondary">No siblings added yet</Typography.Text>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {siblingsFields.map((field, index) => (
              <Card key={field.id} size="small">
                <Row gutter={[16, 16]} align="bottom">
                  <Col xs={24} md={6}>
                    <Form.Item label="Name">
                      <Input
                        value={watch(`siblings.${index}.name`) || ''}
                        onChange={(e) => {
                          setValue(`siblings.${index}.name`, e.target.value)
                          if (errors.siblings?.[index]?.name) {
                            clearErrors(`siblings.${index}.name`)
                          }
                        }}
                        placeholder="Sibling's name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Gender">
                      <Select
                        value={watch(`siblings.${index}.gender`) || ''}
                        onChange={(value) => {
                          setValue(`siblings.${index}.gender`, value)
                          if (errors.siblings?.[index]?.gender) {
                            clearErrors(`siblings.${index}.gender`)
                          }
                        }}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Age">
                      <Input
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
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSibling(index)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        )}
      </Card>
    </Space>
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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Review Your Information">
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="small">
                <Typography.Text strong>Name:</Typography.Text>
                <Typography.Text>{formData.firstname} {formData.middlename} {formData.lastname}</Typography.Text>

                <Typography.Text strong>Gender:</Typography.Text>
                <Typography.Text>{formData.gender}</Typography.Text>

                <Typography.Text strong>Marital Status:</Typography.Text>
                <Typography.Text>{formData.maritalStatus}</Typography.Text>

                <Typography.Text strong>18 Plus:</Typography.Text>
                <Typography.Text>{formData.is18Plus ? 'Yes' : 'No'}</Typography.Text>

                <Typography.Text strong>Date of Birth:</Typography.Text>
                <Typography.Text>{formData.dob || 'Not specified'}</Typography.Text>

                {formData.maritalStatus === 'married' && formData.spouseName && (
                  <>
                    <Typography.Text strong>Spouse Name:</Typography.Text>
                    <Typography.Text>{formData.spouseName}</Typography.Text>
                  </>
                )}

                <Typography.Text strong>Phone:</Typography.Text>
                <Typography.Text>{formData.phone}</Typography.Text>

                <Typography.Text strong>Email:</Typography.Text>
                <Typography.Text>{formData.email || 'Not specified'}</Typography.Text>

                <Typography.Text strong>Gaam:</Typography.Text>
                <Typography.Text>{formData.gaam}</Typography.Text>

                <Typography.Text strong>Current Address:</Typography.Text>
                <Typography.Text>{formData.currentAddress}</Typography.Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="small">
                <Typography.Text strong>Country:</Typography.Text>
                <Typography.Text>{selectedCountry?.name || 'Not specified'}</Typography.Text>

                <Typography.Text strong>State:</Typography.Text>
                <Typography.Text>{selectedState?.name || 'Not specified'}</Typography.Text>

                <Typography.Text strong>City:</Typography.Text>
                <Typography.Text>{formData.cityId || 'Not specified'}</Typography.Text>

                <Typography.Text strong>Education:</Typography.Text>
                <Typography.Text>{selectedEducation?.name || 'Not specified'}</Typography.Text>

                {selectedEducation?.name?.toLowerCase().includes('other') && formData.otherEducation && (
                  <>
                    <Typography.Text strong>Other Education:</Typography.Text>
                    <Typography.Text>{formData.otherEducation}</Typography.Text>
                  </>
                )}

                <Typography.Text strong>Educational Level:</Typography.Text>
                <Typography.Text>{formData.educationalLevel || 'Not specified'}</Typography.Text>

                <Typography.Text strong>Profession:</Typography.Text>
                <Typography.Text>{selectedProfession?.name || 'Not specified'}</Typography.Text>

                {selectedProfession?.name?.toLowerCase().includes('other') && formData.otherProfession && (
                  <>
                    <Typography.Text strong>Other Profession:</Typography.Text>
                    <Typography.Text>{formData.otherProfession}</Typography.Text>
                  </>
                )}

                {formData.additionalProfessions && formData.additionalProfessions.length > 0 && (
                  <>
                    <Typography.Text strong>Additional Professions:</Typography.Text>
                    {formData.additionalProfessions.map((prof, index) => {
                      const selectedProf = masterData.professions?.find(p => p.id === prof.professionId)
                      return (
                        <Typography.Text key={index} style={{ display: 'block', marginLeft: 16 }}>
                          {index + 1}. {selectedProf?.name || 'Not specified'}
                          {selectedProf?.name?.toLowerCase().includes('other') && prof.otherProfession &&
                            ` (${prof.otherProfession})`
                          }
                        </Typography.Text>
                      )
                    })}
                  </>
                )}

                <Typography.Text strong>Children:</Typography.Text>
                <Typography.Text>{formData.children?.length || 0}</Typography.Text>

                <Typography.Text strong>Siblings:</Typography.Text>
                <Typography.Text>{formData.siblings?.length || 0}</Typography.Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Photos Section */}
        {(uploadedProfilePic || uploadedFamilyPhoto) && (
          <Card title="Photos">
            <Row gutter={[16, 16]}>
              {uploadedProfilePic && (
                <Col xs={24} md={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Profile Photo</Typography.Text>
                    <img
                      src={uploadedProfilePic}
                      alt="Profile"
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #d9d9d9'
                      }}
                    />
                  </div>
                </Col>
              )}
              {uploadedFamilyPhoto && (
                <Col xs={24} md={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Family Photo</Typography.Text>
                    <img
                      src={uploadedFamilyPhoto}
                      alt="Family"
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #d9d9d9'
                      }}
                    />
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        )}


      </Space>
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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '2px solid',
              backgroundColor: currentStep >= step.id ? '#1890ff' : '#fff',
              borderColor: currentStep >= step.id ? '#1890ff' : '#d9d9d9',
              color: currentStep >= step.id ? '#fff' : '#8c8c8c'
            }}>
              {currentStep > step.id ? <CheckOutlined /> : step.id}
            </div>
            {index < steps.length - 1 && (
              <div style={{
                width: 64,
                height: 2,
                margin: '0 8px',
                backgroundColor: currentStep > step.id ? '#1890ff' : '#d9d9d9'
              }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title level={3}>{steps[currentStep - 1].title}</Typography.Title>
        <Typography.Text type="secondary">{steps[currentStep - 1].description}</Typography.Text>
      </div>

      {/* Form Content */}
      <Form layout="vertical">
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 24 }}>
          <div>
            {currentStep > 1 && (
              <Button type="default" onClick={prevStep} icon={<LeftOutlined />}>
                Previous
              </Button>
            )}
          </div>

          <Space>
            {currentStep < steps.length ? (
              <Button
                type="primary"
                onClick={nextStep}
                disabled={!isCurrentStepValid()}
                icon={<RightOutlined />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  console.log('Manual submit test')
                  const formData = watch()
                  console.log('Form data for submission:', formData)
                  onSubmit(formData)
                }}
                disabled={!isCurrentStepValid() || isLoading}
                loading={isLoading}
              >
                Submit
              </Button>
            )}

            <Button type="default" onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </div>
      </Form>
    </Space>
  )
}