'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  message,
  Switch,
  Upload
} from 'antd'
import { 
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BookOutlined,
  BankOutlined,
  TeamOutlined,
  HomeOutlined,
  InboxOutlined
} from '@ant-design/icons'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'

interface Contact {
  id: string
  firstname: string
  middlename?: string
  lastname?: string
  spouseName?: string
  fatherName?: string
  motherName?: string
  gender?: string
  maritalStatus?: string
  is18Plus?: boolean
  gaam?: string
  currentAddress?: string
  city?: string
  stateId?: string
  countryId?: string
  state?: { name: string }
  country?: { name: string }
  phone: string
  email?: string
  dob?: string
  educationId?: string
  otherEducation?: string
  education?: { name: string }
  professionId?: string
  otherProfession?: string
  profession?: { name: string }
  educationalLevel?: string
  additionalProfessions?: any[]
  website?: string
  profile?: string
  profilePic?: string
  familyPhoto?: string
  children: any[]
  siblings: any[]
  createdAt: string
}

interface MasterData {
  countries: any[]
  states: any[]
  cities: any[]
  educations: any[]
  professions: any[]
}

export default function ContactEditPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [masterData, setMasterData] = useState<MasterData>({
    countries: [],
    states: [],
    cities: [],
    educations: [],
    professions: []
  })
  const [maritalStatus, setMaritalStatus] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const allowedRoles = ['SUPER_ADMIN', 'GAAM_ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      router.push('/dashboard')
      return
    }

    fetchContact()
    fetchMasterData()
  }, [session, status, router, params.id])

  const fetchContact = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contacts/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setContact(data)
        setMaritalStatus(data.maritalStatus || '')
      } else {
        alert('Failed to fetch contact')
        router.push('/admin/contacts')
      }
    } catch (error) {
      console.error('Error fetching contact:', error)
      alert('Failed to fetch contact')
      router.push('/admin/contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterData = async () => {
    try {
      const [countriesRes, educationsRes, professionsRes] = await Promise.all([
        fetch('/api/countries'),
        fetch('/api/educations'),
        fetch('/api/professions')
      ])

      const [countries, educations, professions] = await Promise.all([
        countriesRes.json(),
        educationsRes.json(),
        professionsRes.json()
      ])

      setMasterData(prev => ({ 
        ...prev, 
        countries, 
        educations, 
        professions 
      }))
    } catch (error) {
      console.error('Error fetching master data:', error)
    }
  }

  const fetchStates = async (countryId: string) => {
    try {
      const response = await fetch(`/api/states?countryId=${countryId}`)
      const states = await response.json()
      setMasterData(prev => ({ ...prev, states, cities: [] }))
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const handleCountryChange = (countryId: string) => {
    setContact(prev => prev ? { ...prev, countryId, stateId: '', city: '' } : null)
    if (countryId) {
      fetchStates(countryId)
    }
  }

  const handleStateChange = (stateId: string) => {
    setContact(prev => prev ? { ...prev, stateId, city: '' } : null)
  }

  const handleMaritalStatusChange = (value: string) => {
    setMaritalStatus(value)
    if (value === 'single') {
      setContact(prev => prev ? { ...prev, maritalStatus: value, spouseName: '' } : null)
    } else {
      setContact(prev => prev ? { ...prev, maritalStatus: value } : null)
    }
  }

  const handleSubmit = async (values: any) => {
    if (!contact) return

    setSaving(true)
    try {
      const response = await fetch(`/api/contacts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...contact, ...values }),
      })

      if (response.ok) {
        message.success('Contact updated successfully!')
        router.push(`/admin/contacts/${params.id}`)
      } else {
        const errorData = await response.json()
        message.error(`Failed to update contact: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating contact:', error)
      message.error('Failed to update contact. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof Contact, value: any) => {
    setContact(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #1890ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <Typography.Text style={{ marginTop: '16px', color: '#8c8c8c' }}>
              Loading contact...
            </Typography.Text>
          </div>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <Typography.Text style={{ color: '#8c8c8c' }}>Contact not found</Typography.Text>
            <br />
            <Button 
              type="primary" 
              onClick={() => router.push('/admin/contacts')} 
              style={{ marginTop: '16px' }}
            >
              Back to Contacts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ 
        backgroundColor: '#fff', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href={`/admin/contacts/${params.id}`}>
                <Button type="default" icon={<ArrowLeftOutlined />}>
                  Back to Contact
                </Button>
              </Link>
              <div>
                <Typography.Title level={2} style={{ margin: 0, color: '#262626' }}>
                  Edit Contact
                </Typography.Title>
                <Typography.Text type="secondary">Update contact information</Typography.Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            firstname: contact.firstname,
            middlename: contact.middlename,
            lastname: contact.lastname,
            gender: contact.gender,
            maritalStatus: contact.maritalStatus,
            is18Plus: contact.is18Plus,
            dob: contact.dob ? dayjs(contact.dob) : null,
            gaam: contact.gaam,
            email: contact.email,
            phone: contact.phone,
            website: contact.website,
            spouseName: contact.spouseName,
            fatherName: contact.fatherName,
            motherName: contact.motherName,
            currentAddress: contact.currentAddress,
            countryId: contact.countryId,
            stateId: contact.stateId,
            city: contact.city,
            educationId: contact.educationId,
            otherEducation: contact.otherEducation,
            professionId: contact.professionId,
            otherProfession: contact.otherProfession,
            educationalLevel: contact.educationalLevel,
            additionalProfessions: contact.additionalProfessions,
            profile: contact.profile,
            profilePic: contact.profilePic,
            familyPhoto: contact.familyPhoto
          }}
        >
          <Row gutter={[24, 24]}>
            {/* Personal Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    Personal Information
                  </Space>
                }
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      label="First Name" 
                      name="firstname"
                      rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Middle Name" name="middlename">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Last Name" name="lastname">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Gender" name="gender">
                      <Select placeholder="Select gender">
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                        <Select.Option value="other">Other</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Marital Status" name="maritalStatus">
                      <Select 
                        placeholder="Select marital status"
                        onChange={handleMaritalStatusChange}
                      >
                        <Select.Option value="single">Single</Select.Option>
                        <Select.Option value="married">Married</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="18 Plus" name="is18Plus">
                      <Switch 
                        checkedChildren="Yes" 
                        unCheckedChildren="No" 
                        style={{ minWidth: '80px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Date of Birth" name="dob">
                      <DatePicker style={{ width: '100%' }} placeholder="Select date of birth (optional)" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Gaam" name="gaam">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <PhoneOutlined style={{ color: '#52c41a' }} />
                    Contact Information
                  </Space>
                }
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Form.Item 
                    label="Email" 
                    name="email"
                    rules={[
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter email address (optional)" />
                  </Form.Item>
                  <Form.Item 
                    label="Phone" 
                    name="phone"
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item label="Website" name="website">
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                </Space>
              </Card>
            </Col>

            {/* Family Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <TeamOutlined style={{ color: '#722ed1' }} />
                    Family Information
                  </Space>
                }
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Row gutter={[16, 16]}>
                  {maritalStatus === 'married' && (
                    <Col xs={24} md={12}>
                      <Form.Item label="Spouse Name" name="spouseName">
                        <Input />
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={24} md={12}>
                    <Form.Item label="Father's Name" name="fatherName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Mother's Name" name="motherName">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Location Information */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: '#fa8c16' }} />
                    Location Information
                  </Space>
                }
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Form.Item label="Current Address" name="currentAddress">
                    <Input />
                  </Form.Item>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Country" name="countryId">
                        <Select 
                          placeholder="Select country"
                          onChange={handleCountryChange}
                        >
                          {masterData.countries.map((country) => (
                            <Select.Option key={country.id} value={country.id}>
                              {country.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="State" name="stateId">
                        <Select 
                          placeholder="Select state"
                          disabled={!contact.countryId}
                          onChange={handleStateChange}
                        >
                          {masterData.states.map((state) => (
                            <Select.Option key={state.id} value={state.id}>
                              {state.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="City" name="city">
                    <Input placeholder="Enter city (optional)" />
                  </Form.Item>
                </Space>
              </Card>
            </Col>

            {/* Education & Profession */}
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <BookOutlined style={{ color: '#531dab' }} />
                    Education & Profession
                  </Space>
                }
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Row gutter={[32, 16]}>
                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        <BookOutlined style={{ marginRight: 8 }} />
                        Education
                      </Typography.Title>
                      <Form.Item label="Education Level" name="educationId">
                        <Select placeholder="Select education (optional)">
                          {masterData?.educations?.map((education) => (
                            <Select.Option key={education.id} value={education.id}>
                              {education.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item label="Educational Level" name="educationalLevel">
                        <Select placeholder="Select educational level (optional)">
                          {masterData?.educations?.map((education) => (
                            <Select.Option key={education.id} value={education.id}>
                              {education.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item label="Other Education" name="otherEducation">
                        <Input placeholder="Specify if not in list" />
                      </Form.Item>
                    </Space>
                  </Col>
                  <Col xs={24} md={12}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        <BankOutlined style={{ marginRight: 8 }} />
                        Profession
                      </Typography.Title>
                      <Form.Item label="Profession" name="professionId">
                        <Select placeholder="Select profession (optional)">
                          {masterData.professions.map((profession) => (
                            <Select.Option key={profession.id} value={profession.id}>
                              {profession.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item label="Other Profession" name="otherProfession">
                        <Input placeholder="Specify if not in list" />
                      </Form.Item>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Additional Information */}
            <Col xs={24}>
              <Card 
                title="Additional Information"
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Form.Item label="Profile" name="profile">
                  <Input.TextArea 
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Photos */}
            <Col xs={24}>
              <Card 
                title="Photos"
                style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Profile Photo" name="profilePic">
                      <Upload
                        name="profilePhoto"
                        listType="picture-card"
                        showUploadList={true}
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
                          return false; // Prevent auto upload
                        }}
                        onChange={(info) => {
                          if (info.file.status === 'done') {
                            message.success(`${info.file.name} file uploaded successfully`);
                          } else if (info.file.status === 'error') {
                            message.error(`${info.file.name} file upload failed.`);
                          }
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
                              updateField('profilePic', result.url);
                              onSuccess?.(result);
                            } else {
                              throw new Error(result.error || 'Upload failed');
                            }
                          } catch (error) {
                            console.error('Upload error:', error);
                            onError?.(error as Error);
                          }
                        }}
                      >
                        {contact.profilePic ? (
                          <img src={contact.profilePic} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div>
                            <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                            <div style={{ marginTop: 8 }}>Upload Profile Photo</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Family Photo" name="familyPhoto">
                      <Upload
                        name="familyPhoto"
                        listType="picture-card"
                        showUploadList={true}
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
                          return false; // Prevent auto upload
                        }}
                        onChange={(info) => {
                          if (info.file.status === 'done') {
                            message.success(`${info.file.name} file uploaded successfully`);
                          } else if (info.file.status === 'error') {
                            message.error(`${info.file.name} file upload failed.`);
                          }
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
                              updateField('familyPhoto', result.url);
                              onSuccess?.(result);
                            } else {
                              throw new Error(result.error || 'Upload failed');
                            }
                          } catch (error) {
                            console.error('Upload error:', error);
                            onError?.(error as Error);
                          }
                        }}
                      >
                        {contact.familyPhoto ? (
                          <img src={contact.familyPhoto} alt="family" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div>
                            <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                            <div style={{ marginTop: 8 }}>Upload Family Photo</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Submit Button */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Button 
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={<SaveOutlined />}
              size="large"
              style={{ 
                padding: '8px 32px',
                height: 'auto',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">12Gaam Community</span>
            </div>
            <div className="text-sm text-gray-400 mb-2">
              © 2025 12Gaam Community. All rights reserved.
            </div>
            <div className="text-xs text-gray-500">
              Bringing families together, one connection at a time
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}