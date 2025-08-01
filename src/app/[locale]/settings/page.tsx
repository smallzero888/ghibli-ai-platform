'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { showToast } from '@/lib/toast'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Palette, 
  Globe,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Save
} from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

export default function SettingsPage() {
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    full_name: '',
    email: '',
    bio: '',
    avatar_url: ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    generationComplete: true,
    newFeatures: true,
    marketingEmails: false
  })

  // Display preferences
  const [displayPrefs, setDisplayPrefs] = useState({
    language: locale,
    theme: 'light',
    imageQuality: 'high',
    defaultStyle: 'classic'
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        full_name: user.full_name || '',
        email: user.email || '',
        bio: '',
        avatar_url: user.avatar_url || ''
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // 这里应该调用API来更新用户资料
      // await updateUser({
      //   username: profileForm.username,
      //   full_name: profileForm.full_name,
      //   bio: profileForm.bio
      // })
      
      showToast.success(t('settings.profileUpdateSuccess'))
    } catch (error) {
      console.error('更新个人资料失败:', error)
      showToast.error(t('settings.profileUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error(t('settings.passwordMismatch'))
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      showToast.error(t('settings.passwordTooShort'))
      return
    }
    
    setLoading(true)
    
    try {
      // 这里应该调用API来更新密码
      // await updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
      
      showToast.success(t('settings.passwordUpdateSuccess'))
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('更新密码失败:', error)
      showToast.error(t('settings.passwordUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationPrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // 这里应该调用API来保存通知偏好
      // await saveNotificationPreferences(notificationPrefs)
      
      showToast.success(t('settings.notificationPrefsUpdateSuccess'))
    } catch (error) {
      console.error('更新通知偏好失败:', error)
      showToast.error(t('settings.notificationPrefsUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDisplayPrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // 这里应该调用API来保存显示偏好
      // await saveDisplayPreferences(displayPrefs)
      
      showToast.success(t('settings.displayPrefsUpdateSuccess'))
    } catch (error) {
      console.error('更新显示偏好失败:', error)
      showToast.error(t('settings.displayPrefsUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    
    try {
      // 这里应该调用API来导出用户数据
      // const data = await exportUserData()
      
      showToast.success(t('settings.dataExportSuccess'))
    } catch (error) {
      console.error('导出数据失败:', error)
      showToast.error(t('settings.dataExportError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm(t('settings.deleteAccountConfirm'))) {
      return
    }
    
    setLoading(true)
    
    try {
      // 这里应该调用API来删除用户账户
      // await deleteAccount()
      
      showToast.success(t('settings.accountDeleted'))
      // 重定向到首页
      window.location.href = '/'
    } catch (error) {
      console.error('删除账户失败:', error)
      showToast.error(t('settings.deleteAccountError'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ghibli-cream flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <User className="w-12 h-12 text-ghibli-green mx-auto mb-4" />
            <CardTitle className="text-2xl">{t('settings.loginRequired')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {t('settings.loginDesc')}
            </p>
            <Button onClick={() => window.location.href = `/${locale}/login`} className="w-full">
              {t('settings.goLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ghibli-cream">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600">
            {t('settings.subtitle')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings.profileTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings.securityTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings.notificationsTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{t('settings.preferencesTab')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('settings.profileTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-ghibli-green flex items-center justify-center text-white font-medium overflow-hidden">
                      {profileForm.avatar_url ? (
                        <img
                          src={profileForm.avatar_url}
                          alt={profileForm.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          {(profileForm.username || profileForm.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      {t('settings.changeAvatar')}
                    </Button>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleProfileSubmit} className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('settings.username')}
                        </label>
                        <Input
                          value={profileForm.username}
                          onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                          placeholder={t('settings.usernamePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('settings.fullName')}
                        </label>
                        <Input
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                          placeholder={t('settings.fullNamePlaceholder')}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.email')}
                      </label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        placeholder={t('settings.emailPlaceholder')}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('settings.emailChangeNote')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.bio')}
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ghibli-green focus:border-transparent"
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        placeholder={t('settings.bioPlaceholder')}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {t('settings.saveProfile')}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t('settings.securityTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('settings.currentPassword')}
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      placeholder={t('settings.currentPasswordPlaceholder')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.newPassword')}
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        placeholder={t('settings.newPasswordPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('settings.confirmPassword')}
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        placeholder={t('settings.confirmPasswordPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('settings.changePassword')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('settings.accountActions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{t('settings.exportData')}</h3>
                    <p className="text-sm text-gray-600">{t('settings.exportDataDesc')}</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('settings.exportButton')}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="font-medium text-red-900">{t('settings.deleteAccount')}</h3>
                    <p className="text-sm text-red-600">{t('settings.deleteAccountDesc')}</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('settings.deleteButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('settings.notificationsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationPrefsSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.emailNotifications')}</h3>
                        <p className="text-sm text-gray-600">{t('settings.emailNotificationsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.emailNotifications}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, emailNotifications: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ghibli-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.generationComplete')}</h3>
                        <p className="text-sm text-gray-600">{t('settings.generationCompleteDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.generationComplete}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, generationComplete: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ghibli-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.newFeatures')}</h3>
                        <p className="text-sm text-gray-600">{t('settings.newFeaturesDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.newFeatures}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, newFeatures: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ghibli-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.marketingEmails')}</h3>
                        <p className="text-sm text-gray-600">{t('settings.marketingEmailsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.marketingEmails}
                          onChange={(e) => setNotificationPrefs({...notificationPrefs, marketingEmails: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ghibli-green/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ghibli-green"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('settings.saveNotifications')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t('settings.preferencesTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDisplayPrefsSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.language')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { code: 'zh', name: '中文' },
                        { code: 'en', name: 'English' },
                        { code: 'ja', name: '日本語' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            displayPrefs.language === lang.code
                              ? 'border-ghibli-green bg-ghibli-green/10 text-ghibli-green'
                              : 'border-gray-300 hover:border-ghibli-green'
                          }`}
                          onClick={() => setDisplayPrefs({...displayPrefs, language: lang.code as "zh" | "en" | "ja"})}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.theme')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { value: 'light', name: t('settings.lightTheme') },
                        { value: 'dark', name: t('settings.darkTheme') }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            displayPrefs.theme === theme.value
                              ? 'border-ghibli-green bg-ghibli-green/10 text-ghibli-green'
                              : 'border-gray-300 hover:border-ghibli-green'
                          }`}
                          onClick={() => setDisplayPrefs({...displayPrefs, theme: theme.value})}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.imageQuality')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'standard', name: t('settings.standardQuality') },
                        { value: 'high', name: t('settings.highQuality') },
                        { value: 'ultra', name: t('settings.ultraQuality') }
                      ].map((quality) => (
                        <button
                          key={quality.value}
                          type="button"
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            displayPrefs.imageQuality === quality.value
                              ? 'border-ghibli-green bg-ghibli-green/10 text-ghibli-green'
                              : 'border-gray-300 hover:border-ghibli-green'
                          }`}
                          onClick={() => setDisplayPrefs({...displayPrefs, imageQuality: quality.value})}
                        >
                          {quality.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.defaultStyle')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { value: 'classic', name: t('settings.classicStyle') },
                        { value: 'modern', name: t('settings.modernStyle') }
                      ].map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            displayPrefs.defaultStyle === style.value
                              ? 'border-ghibli-green bg-ghibli-green/10 text-ghibli-green'
                              : 'border-gray-300 hover:border-ghibli-green'
                          }`}
                          onClick={() => setDisplayPrefs({...displayPrefs, defaultStyle: style.value})}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('settings.savePreferences')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}