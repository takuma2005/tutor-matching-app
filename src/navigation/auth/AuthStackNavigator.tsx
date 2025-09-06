import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import TabNavigator from '@/navigation/TabNavigator';
import PhoneVerificationScreen from '@/screens/auth/PhoneVerificationScreen';
import ProfileSetupScreen, { ProfileData } from '@/screens/auth/ProfileSetupScreen';
import RoleSelectionScreen from '@/screens/auth/RoleSelectionScreen';

export type AuthStep = 'role' | 'phone' | 'profile' | 'completed';

export default function AuthFlow() {
  const [authStep, setAuthStep] = useState<AuthStep>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor'>('student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { signIn } = useAuth();

  const handleRoleSelect = (role: 'student' | 'tutor') => {
    setSelectedRole(role);
    setAuthStep('phone');
  };

  const handleVerificationComplete = (phone: string, code: string) => {
    setPhoneNumber(phone);
    setAuthStep('profile');
  };

  const handleProfileComplete = async (profileData: ProfileData) => {
    // モック：ユーザー登録処理
    const userData = {
      id: Date.now().toString(),
      role: selectedRole,
      phoneNumber,
      ...profileData,
    } as any;

    await signIn(userData);
    setAuthStep('completed');
  };

  switch (authStep) {
    case 'role':
      return <RoleSelectionScreen onRoleSelect={handleRoleSelect} />;
    case 'phone':
      return (
        <PhoneVerificationScreen
          role={selectedRole}
          onVerificationComplete={handleVerificationComplete}
        />
      );
    case 'profile':
      return (
        <ProfileSetupScreen
          role={selectedRole}
          phoneNumber={phoneNumber}
          onProfileComplete={handleProfileComplete}
        />
      );
    default:
      return <TabNavigator />;
  }
}
