"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/providers/auth-provider"
import { Camera, Save, Lock, Bell, Globe, CreditCard, Shield, Moon, Sun, Smartphone, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("profile")
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    university: user?.university || "",
    bio: "Hi there! I'm a student at University studying Computer Science. I sell textbooks, electronics, and other items that I no longer need.",
  })
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    offerNotifications: true,
    favoriteNotifications: false,
    systemNotifications: true,
  })

  // Handle notification toggle
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [setting]: !prev[setting] }))
  }

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showUniversity: true,
    showActivity: false,
    allowMessages: true,
  })

  // Handle privacy toggle
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({ ...prev, [setting]: !prev[setting] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-64 h-fit">
          <CardContent className="p-0">
            <Tabs
              defaultValue="profile"
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto items-stretch p-0 bg-transparent space-y-1">
                <TabsTrigger
                  value="profile"
                  className="justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
                >
                  Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  className="justify-start px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
                >
                  Payment Methods
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border overflow-hidden">
                      <Image
                        src={user?.avatar || "/placeholder.svg?height=96&width=96&text=Avatar"}
                        alt={user?.firstName || "User"}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#f58220] hover:bg-[#f58220]/90 border-2 border-white"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Upload photo</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Select
                    value={profileForm.university}
                    onValueChange={(value) => setProfileForm((prev) => ({ ...prev, university: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="University of Lagos">University of Lagos</SelectItem>
                      <SelectItem value="University of Ibadan">University of Ibadan</SelectItem>
                      <SelectItem value="Obafemi Awolowo University">Obafemi Awolowo University</SelectItem>
                      <SelectItem value="University of Benin">University of Benin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    className="resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button className="bg-[#0a2472] hover:bg-[#0a2472]/90">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-6">
                  <Button className="bg-[#0a2472] hover:bg-[#0a2472]/90">
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {isDarkMode ? (
                        <Moon className="h-5 w-5 text-[#0a2472]" />
                      ) : (
                        <Sun className="h-5 w-5 text-[#f58220]" />
                      )}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Language</CardTitle>
                  <CardDescription>Choose your preferred language</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Globe className="h-5 w-5 text-[#0a2472]" />
                    <div className="flex-1">
                      <Select defaultValue="en">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-[#f58220]" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Smartphone className="h-5 w-5 text-[#0a2472]" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={() => handleNotificationToggle("pushNotifications")}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Messages</p>
                        <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                      </div>
                      <Switch
                        checked={notificationSettings.messageNotifications}
                        onCheckedChange={() => handleNotificationToggle("messageNotifications")}
                        className="data-[state=checked]:bg-[#0a2472]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Offers</p>
                        <p className="text-sm text-muted-foreground">Notifications for offers on your listings</p>
                      </div>
                      <Switch
                        checked={notificationSettings.offerNotifications}
                        onCheckedChange={() => handleNotificationToggle("offerNotifications")}
                        className="data-[state=checked]:bg-[#0a2472]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Favorites</p>
                        <p className="text-sm text-muted-foreground">
                          Notifications when someone favorites your listing
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.favoriteNotifications}
                        onCheckedChange={() => handleNotificationToggle("favoriteNotifications")}
                        className="data-[state=checked]:bg-[#0a2472]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-muted-foreground">Notifications about UniStore updates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemNotifications}
                        onCheckedChange={() => handleNotificationToggle("systemNotifications")}
                        className="data-[state=checked]:bg-[#0a2472]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "privacy" && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Shield className="h-5 w-5 text-[#f58220]" />
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showProfile}
                      onCheckedChange={() => handlePrivacyToggle("showProfile")}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Globe className="h-5 w-5 text-[#0a2472]" />
                      <div>
                        <p className="font-medium">Show University</p>
                        <p className="text-sm text-muted-foreground">Display your university on your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showUniversity}
                      onCheckedChange={() => handlePrivacyToggle("showUniversity")}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-[#f58220]" />
                      <div>
                        <p className="font-medium">Activity Status</p>
                        <p className="text-sm text-muted-foreground">Show when you're active on UniStore</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.showActivity}
                      onCheckedChange={() => handlePrivacyToggle("showActivity")}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <MessageCircle className="h-5 w-5 text-[#0a2472]" />
                      <div>
                        <p className="font-medium">Direct Messages</p>
                        <p className="text-sm text-muted-foreground">Allow others to send you messages</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={() => handlePrivacyToggle("allowMessages")}
                      className="data-[state=checked]:bg-[#0a2472]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "payment" && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                    <CreditCard className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    You haven't added any payment methods yet. Add a payment method to make purchases easier.
                  </p>
                  <Button className="bg-[#0a2472] hover:bg-[#0a2472]/90">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
