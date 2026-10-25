import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  MapPin,
  HeartHandshake,
  Stethoscope,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Check,
  Car,
  Pill,
  TestTube2,
  Droplet,
  Layers,
  X,
  Activity,
  Users,
  Ban,
  RotateCcw
} from 'lucide-react';
import { DashboardRole } from '../types/dashboard';
import {
  PartnerApplication,
  INITIAL_PARTNERS,
  isPartnerSuspended,
  calculateDaysInactive,
  INACTIVITY_THRESHOLD_DAYS
} from '../types/partner';
import { UserAccount } from '../types/serviceBooking';

interface AuthPageProps {
  onSuccess: (user: UserAccount) => void;
  onNavigateHome: () => void;
  defaultMode?: 'login' | 'signup' | 'partner';
  partners?: PartnerApplication[];
  onNavigatePartnerOnboarding?: () => void;
  onNavigateAdmin?: () => void;
  onUpdatePartner?: (partnerId: string, updates: Partial<PartnerApplication>) => void;
}

// Unified Single Identity schema in localStorage
interface UnifiedIdentity {
  id: string;
  name: string;
  phone: string;
  email: string;
  roles: string[]; // e.g. ['Patient', 'Caregiver', 'Partner']
  city?: string;
  provider?: 'phone' | 'email' | 'google';
  createdAt: string;
  lastLoginAt: string;
}

// Multi-Account Option schema for Single Identity (Phase 2 Requirement 2)
export interface ServiceAccountOption {
  id: string;
  name: string;
  role: DashboardRole;
  roleTitle: string;
  category: string;
  entityName: string;
  phone: string;
  email: string;
  status: 'Live' | 'Pending' | 'Active' | 'Suspended';
  badge: string;
  specialty?: string;
  registrationNumber?: string;
  password?: string;
  isPartner: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onNavigateHome,
  defaultMode = 'login',
  partners = INITIAL_PARTNERS,
  onNavigatePartnerOnboarding,
  onNavigateAdmin,
  onUpdatePartner,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'partner'>(defaultMode);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  // Login form state (Patient)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');

  // Signup form state (Patient)
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    city: 'Hyderabad',
    pincode: '',
    agreeTerms: false,
  });
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtp, setSignupOtp] = useState('');

  // Partner Login form state
  const [partnerLoginId, setPartnerLoginId] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [showPartnerPassword, setShowPartnerPassword] = useState(false);
  const [pendingPartnerNotice, setPendingPartnerNotice] = useState<PartnerApplication | null>(null);

  // Phase 3: Inactive Account Suspension & Revocation Request State (Requirement 1)
  const [suspendedPartnerNotice, setSuspendedPartnerNotice] = useState<PartnerApplication | null>(null);
  const [showRevocationModal, setShowRevocationModal] = useState<boolean>(false);
  const [revocationNote, setRevocationNote] = useState<string>('');
  const [revocationSuccessToast, setRevocationSuccessToast] = useState<boolean>(false);

  // Multi-Account Selection Dropdown & Modal State (Phase 2 Requirement 2)
  const [showMultiAccountModal, setShowMultiAccountModal] = useState(false);
  const [multiAccountOptions, setMultiAccountOptions] = useState<ServiceAccountOption[]>([]);
  const [selectedServiceAccount, setSelectedServiceAccount] = useState<ServiceAccountOption | null>(null);
  const [accountPasswordInput, setAccountPasswordInput] = useState('');
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountPasswordError, setAccountPasswordError] = useState('');
  const [accountSearchIdentifier, setAccountSearchIdentifier] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [singleIdentityNotice, setSingleIdentityNotice] = useState('');

  // Helper: Retrieve all registered identities from localStorage
  const getStoredIdentities = (): UnifiedIdentity[] => {
    try {
      const data = localStorage.getItem('nhealth_identities');
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [
      {
        id: 'USR-88210',
        name: 'Ramesh Kumar',
        phone: '9876543210',
        email: 'ramesh.kumar@gmail.com',
        roles: ['Patient'],
        city: 'Hyderabad',
        provider: 'phone',
        createdAt: '2026-09-01T10:00:00.000Z',
        lastLoginAt: '2026-10-16T12:00:00.000Z',
      },
      {
        id: 'USR-99412',
        name: 'Ananya Sharma',
        phone: '9845012345',
        email: 'ananya.care@gmail.com',
        roles: ['Patient', 'Caregiver'],
        city: 'Bengaluru',
        provider: 'google',
        createdAt: '2026-09-15T14:30:00.000Z',
        lastLoginAt: '2026-10-15T18:00:00.000Z',
      },
      {
        id: 'USR-95820',
        name: 'K. Venkatesh & Red Cross Fleet',
        phone: '9581582220',
        email: 'dispatch@lifelineambulancenet.in',
        roles: ['Ambulance', 'Blood Bank'],
        city: 'Hyderabad',
        provider: 'phone',
        createdAt: '2026-09-20T10:00:00.000Z',
        lastLoginAt: '2026-10-16T14:00:00.000Z',
      },
    ];
  };

  const saveIdentity = (identity: UnifiedIdentity) => {
    try {
      const current = getStoredIdentities();
      const existingIdx = current.findIndex(
        (i) => i.id === identity.id || i.phone === identity.phone || (i.email && i.email.toLowerCase() === identity.email.toLowerCase())
      );
      let updated: UnifiedIdentity[];
      if (existingIdx >= 0) {
        // Merge roles under Single Identity
        const mergedRoles = Array.from(new Set([...current[existingIdx].roles, ...identity.roles]));
        current[existingIdx] = { ...current[existingIdx], ...identity, roles: mergedRoles, lastLoginAt: new Date().toISOString() };
        updated = current;
      } else {
        updated = [identity, ...current];
      }
      localStorage.setItem('nhealth_identities', JSON.stringify(updated));
    } catch {}
  };

  // Helper: Find all linked service accounts for a phone number or email under Single Identity (Phase 2 Requirement 2)
  const findServiceAccounts = (identifier: string): ServiceAccountOption[] => {
    const rawClean = identifier.trim();
    if (!rawClean) return [];

    const cleanDigits = rawClean.replace(/\D/g, '');
    const cleanLower = rawClean.toLowerCase();
    const results: ServiceAccountOption[] = [];

    // 1. Check stored identities
    const identities = getStoredIdentities();
    const matchedIdentity = identities.find((i) => {
      const iDigits = i.phone.replace(/\D/g, '');
      const matchPhone = cleanDigits.length >= 8 && (iDigits.includes(cleanDigits) || cleanDigits.includes(iDigits));
      const matchEmail = cleanLower && i.email.toLowerCase() === cleanLower;
      return matchPhone || matchEmail;
    });

    if (matchedIdentity) {
      const roles = matchedIdentity.roles || ['Patient'];
      roles.forEach((r) => {
        const lower = r.toLowerCase();
        if (lower === 'patient') {
          results.push({
            id: matchedIdentity.id,
            name: matchedIdentity.name,
            role: 'Patient',
            roleTitle: 'Patient / General User Dashboard',
            category: 'Patient',
            entityName: 'Personal & Dependents Health Vault',
            phone: matchedIdentity.phone,
            email: matchedIdentity.email,
            status: 'Active',
            badge: 'Verified Citizen',
            specialty: 'Primary Healthcare & Home Consultations',
            password: 'patient@2026',
            isPartner: false,
          });
        } else if (lower.includes('caregiver') || lower.includes('care assist') || lower.includes('elder')) {
          results.push({
            id: matchedIdentity.id + '-CA',
            name: matchedIdentity.name,
            role: 'Caregiver',
            roleTitle: 'Eldercare / Care Assist Portal',
            category: 'Care Assist',
            entityName: 'Nhealth Bedside Care Assist Services',
            phone: matchedIdentity.phone,
            email: matchedIdentity.email,
            status: 'Live',
            badge: 'Verified Attendant',
            specialty: 'Geriatric Bedside Attendants & Rehab',
            registrationNumber: 'NURSE-COUNCIL-TS-4412',
            password: 'partner@2026',
            isPartner: true,
          });
        } else if (lower.includes('doctor')) {
          results.push({
            id: matchedIdentity.id + '-DOC',
            name: matchedIdentity.name,
            role: 'Doctor',
            roleTitle: 'Doctor Specialist Dashboard',
            category: 'Doctor',
            entityName: 'Specialist Clinical Practice',
            phone: matchedIdentity.phone,
            email: matchedIdentity.email,
            status: 'Live',
            badge: 'MCI Verified',
            specialty: 'Internal Medicine & Geriatrics OPD',
            registrationNumber: 'MCI-84729-KA',
            password: 'partner@2026',
            isPartner: true,
          });
        }
      });
    }

    // 2. Check partner applications roster (props + INITIAL_PARTNERS)
    const combinedPartners: PartnerApplication[] = [];
    const seenIds = new Set<string>();
    [...partners, ...INITIAL_PARTNERS].forEach((p) => {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        combinedPartners.push(p);
      }
    });

    combinedPartners.forEach((p) => {
      const pDigits = p.phone.replace(/\D/g, '');
      const matchPhone = cleanDigits.length >= 8 && (pDigits.includes(cleanDigits) || cleanDigits.includes(pDigits));
      const matchEmail =
        cleanLower &&
        (p.email.toLowerCase() === cleanLower ||
          p.loginIdOrEmail?.toLowerCase() === cleanLower ||
          p.id.toLowerCase() === cleanLower);

      if (matchPhone || matchEmail) {
        let dashboardRole: DashboardRole = 'Doctor';
        let roleTitle = 'Doctor Specialist Dashboard';
        const cat = p.category;

        if (cat === 'Doctor') {
          dashboardRole = 'Doctor';
          roleTitle = 'Doctor Specialist Dashboard';
        } else if (cat === 'Diagnostics') {
          dashboardRole = 'Diagnostics';
          roleTitle = 'Laboratory / Diagnostics Panel';
        } else if (cat === 'Pharmacy') {
          dashboardRole = 'Pharmacy';
          roleTitle = 'Pharmacy Management Dashboard';
        } else if (cat === 'Ambulance' || cat === 'Care Rider') {
          dashboardRole = 'Ambulance';
          roleTitle = 'Ambulance / Care Rider Dashboard';
        } else if (cat === 'Caregiver' || cat === 'Care Assist') {
          dashboardRole = 'Caregiver';
          roleTitle = 'Eldercare / Care Assist Portal';
        } else if (cat === 'Hospital') {
          dashboardRole = 'Hospital';
          roleTitle = 'Hospital / Institution Dashboard';
        } else if (cat === 'Blood Bank') {
          dashboardRole = 'Diagnostics';
          roleTitle = 'Blood Bank / Availability Network';
        }

        const isAlreadyAdded = results.some(
          (r) => r.id === p.id || (r.role === dashboardRole && r.entityName.toLowerCase() === p.entityName.toLowerCase())
        );

        const isSuspended = isPartnerSuspended(p);
        const daysInactive = calculateDaysInactive(p);
        let partnerStatus: 'Live' | 'Pending' | 'Suspended' = 'Live';
        let badge = 'Verified Partner';

        if (isSuspended) {
          partnerStatus = 'Suspended';
          badge = `Suspended due to Inactivity (${daysInactive}d)`;
        } else if (p.status === 'Pending') {
          partnerStatus = 'Pending';
          badge = 'Pending Admin Approval';
        } else {
          partnerStatus = 'Live';
          badge = 'Verified Partner';
        }

        if (!isAlreadyAdded) {
          results.push({
            id: p.id,
            name: p.contactPerson || p.entityName,
            role: dashboardRole,
            roleTitle,
            category: p.category,
            entityName: p.entityName,
            phone: p.phone,
            email: p.email,
            status: partnerStatus,
            badge,
            specialty: p.specialty || p.bioOrExperience,
            registrationNumber: p.registrationNumber,
            password: p.password || 'partner@2026',
            isPartner: true,
          });
        }
      }
    });

    return results;
  };

  const handleOpenMultiAccountSelector = (identifier: string) => {
    const accounts = findServiceAccounts(identifier);
    if (accounts.length > 0) {
      setMultiAccountOptions(accounts);
      setSelectedServiceAccount(accounts[0]);
      setAccountSearchIdentifier(identifier);
      setAccountPasswordInput('');
      setAccountPasswordError('');
      setShowMultiAccountModal(true);
    }
  };

  const handleSelectAndAuthenticateServiceAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedServiceAccount) return;

    setAccountPasswordError('');

    // Phase 3: Block suspended partner accounts and direct to Revocation Request flow
    if (selectedServiceAccount.status === 'Suspended') {
      const allP = [...partners, ...INITIAL_PARTNERS];
      const matched = allP.find((p) => p.id === selectedServiceAccount.id);
      if (matched) {
        setSuspendedPartnerNotice(matched);
      }
      setShowMultiAccountModal(false);
      setErrorMsg(
        `Account Suspended: "${selectedServiceAccount.entityName}" is flagged as Suspended due to Inactivity (>90 days rule). Please raise a Revocation Request below.`
      );
      return;
    }

    if (selectedServiceAccount.status === 'Pending') {
      setAccountPasswordError(
        `Application Pending: These credentials for "${selectedServiceAccount.entityName}" will become active once your application is approved by the Nhealth Admin.`
      );
      return;
    }

    const entered = accountPasswordInput.trim();
    if (!entered) {
      setAccountPasswordError('Please enter your account password to verify access.');
      return;
    }

    const expected = selectedServiceAccount.password || 'partner@2026';
    const isValid =
      entered === expected ||
      entered === 'partner@2026' ||
      entered === 'admin2026' ||
      entered === '482910' ||
      entered === 'patient@2026';

    if (!isValid) {
      setAccountPasswordError('Invalid password for this service account. (Demo password: partner@2026 or 482910)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowMultiAccountModal(false);

      const authenticatedUser: UserAccount = {
        id: selectedServiceAccount.id,
        name: selectedServiceAccount.name,
        phone: selectedServiceAccount.phone,
        email: selectedServiceAccount.email,
        accountType: selectedServiceAccount.role,
        role: selectedServiceAccount.role,
        entityName: selectedServiceAccount.entityName,
        roles: Array.from(new Set([
          ...multiAccountOptions.map((a) => a.role),
          selectedServiceAccount.role
        ])),
        provider: 'phone',
      };

      saveIdentity({
        id: selectedServiceAccount.id,
        name: selectedServiceAccount.name,
        phone: selectedServiceAccount.phone,
        email: selectedServiceAccount.email,
        roles: authenticatedUser.roles || [selectedServiceAccount.role],
        provider: 'phone',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem('nhealth_user', JSON.stringify(authenticatedUser));
      setSuccessMsg(`Authenticated as ${selectedServiceAccount.roleTitle}! Seamlessly routing to your specialized dashboard...`);
      setTimeout(() => onSuccess(authenticatedUser), 400);
    }, 400);
  };

  // Phase 3 Requirement 1: Handle raising revocation / re-activation request
  const handleRaiseRevocationRequest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!suspendedPartnerNotice) return;

    const note =
      revocationNote.trim() ||
      'Operations resumed. Medical licenses and service staff verified. Requesting account restoration on Nhealth network.';

    if (onUpdatePartner) {
      onUpdatePartner(suspendedPartnerNotice.id, {
        revocationRequested: true,
        revocationRequestedAt: new Date().toISOString(),
        revocationReason: note,
        revocationStatus: 'Pending Review',
      });
    }

    const updated = {
      ...suspendedPartnerNotice,
      revocationRequested: true,
      revocationRequestedAt: new Date().toISOString(),
      revocationReason: note,
      revocationStatus: 'Pending Review' as const,
    };
    setSuspendedPartnerNotice(updated);
    setShowRevocationModal(false);
    setRevocationSuccessToast(true);
    setSuccessMsg(
      `✓ Revocation Request Registered! Dispatched to support@nhealth.in & Admin Command Center review queue.`
    );
    setTimeout(() => setRevocationSuccessToast(false), 5000);
  };

  // 1-Click Quick Demo Login handler for Patients
  const handleQuickDemoLogin = (role: 'patient' | 'senior') => {
    setIsLoading(true);
    setErrorMsg('');
    setPendingPartnerNotice(null);
    setTimeout(() => {
      const demoUser: UserAccount =
        role === 'patient'
          ? {
              id: 'USR-88210',
              name: 'Ramesh Kumar',
              phone: '9876543210',
              email: 'ramesh.kumar@gmail.com',
              accountType: 'Patient',
              roles: ['Patient'],
              provider: 'phone',
            }
          : {
              id: 'USR-99412',
              name: 'Ananya Sharma (Senior)',
              phone: '9845012345',
              email: 'ananya.care@gmail.com',
              accountType: 'Patient',
              roles: ['Patient', 'Care Seeker'],
              provider: 'phone',
            };

      saveIdentity({
        id: demoUser.id,
        name: demoUser.name,
        phone: demoUser.phone,
        email: demoUser.email || '',
        roles: demoUser.roles || ['Patient'],
        city: 'Hyderabad',
        provider: 'phone',
        createdAt: '2026-09-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem('nhealth_user', JSON.stringify(demoUser));
      setIsLoading(false);
      onSuccess(demoUser);
    }, 400);
  };

  // 1-Click Quick Demo Login handler for Partners
  const handleQuickPartnerDemoLogin = (partnerId: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPendingPartnerNotice(null);

    setTimeout(() => {
      setIsLoading(false);
      const partner = partners.find((p) => p.id === partnerId) || INITIAL_PARTNERS.find((p) => p.id === partnerId);
      if (!partner) {
        setErrorMsg('Selected partner profile could not be found.');
        return;
      }

      if (partner.status === 'Pending') {
        // Enforce approval requirement
        setPendingPartnerNotice(partner);
        setErrorMsg(`Application Pending: The credentials for "${partner.entityName}" are awaiting Admin approval.`);
        return;
      }

      // Partner is Live / Approved -> Authenticate
      const partnerUser: UserAccount = {
        id: partner.id,
        name: partner.contactPerson || partner.entityName,
        phone: partner.phone,
        email: partner.email,
        accountType: 'Partner',
        role: partner.category,
        entityName: partner.entityName,
        roles: ['Partner', partner.category],
        provider: 'email',
      };

      saveIdentity({
        id: partner.id,
        name: partnerUser.name,
        phone: partner.phone,
        email: partner.email,
        roles: ['Partner', partner.category],
        city: partner.city,
        provider: 'email',
        createdAt: partner.submittedAt,
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem('nhealth_user', JSON.stringify(partnerUser));
      setSuccessMsg(`Welcome, ${partner.entityName}! Live partner access granted.`);
      setTimeout(() => onSuccess(partnerUser), 400);
    }, 450);
  };

  // Google OAuth Handler (Shared across Patient Login, Patient Signup, and Partner Login)
  const handleGoogleOAuth = (context: 'login' | 'signup' | 'partner') => {
    setGoogleAuthLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPendingPartnerNotice(null);
    setSingleIdentityNotice('');

    setTimeout(() => {
      setGoogleAuthLoading(false);
      const googleUserEmail = 'nhealth2026@gmail.com';
      const googleUserName = 'Nhealth Unified Account';
      const googleUserPhone = '9393934621';

      if (context === 'partner') {
        // Check if there is an approved partner with this email
        const matchedPartner = partners.find(
          (p) =>
            p.email.toLowerCase() === googleUserEmail.toLowerCase() ||
            p.loginIdOrEmail?.toLowerCase() === googleUserEmail.toLowerCase() ||
            p.category === 'Diagnostics' // Default live partner match for demo
        );

        if (matchedPartner) {
          if (isPartnerSuspended(matchedPartner)) {
            setSuspendedPartnerNotice(matchedPartner);
            setErrorMsg(
              `Account Suspended due to Inactivity: "${matchedPartner.entityName}" has been inactive for >90 days. Please raise a Revocation / Re-activation Request below.`
            );
            return;
          }

          if (matchedPartner.status === 'Pending') {
            setPendingPartnerNotice(matchedPartner);
            setErrorMsg(`Partner Application Pending: The account for "${matchedPartner.entityName}" is under review. Credentials activate upon Admin approval.`);
            return;
          }

          const partnerAccount: UserAccount = {
            id: matchedPartner.id,
            name: `${matchedPartner.contactPerson} (${matchedPartner.entityName})`,
            phone: matchedPartner.phone,
            email: googleUserEmail,
            accountType: 'Partner',
            role: matchedPartner.category,
            entityName: matchedPartner.entityName,
            roles: ['Partner', matchedPartner.category],
            provider: 'google',
          };

          saveIdentity({
            id: matchedPartner.id,
            name: partnerAccount.name,
            phone: matchedPartner.phone,
            email: googleUserEmail,
            roles: ['Partner', matchedPartner.category],
            city: matchedPartner.city,
            provider: 'google',
            createdAt: matchedPartner.submittedAt,
            lastLoginAt: new Date().toISOString(),
          });

          localStorage.setItem('nhealth_user', JSON.stringify(partnerAccount));
          setSuccessMsg(`Google Authentication Verified! Welcome ${matchedPartner.entityName}.`);
          setTimeout(() => onSuccess(partnerAccount), 500);
          return;
        } else {
          setErrorMsg(`No partner account found for ${googleUserEmail}. Please submit an onboarding application at /partner-with-us.`);
          return;
        }
      }

      // Patient Login or Patient Signup via Google (Single Identity)
      const existingIdentities = getStoredIdentities();
      const existing = existingIdentities.find(
        (i) => i.email.toLowerCase() === googleUserEmail.toLowerCase() || i.phone === googleUserPhone
      );

      const unifiedAccount: UserAccount = {
        id: existing ? existing.id : 'USR-GGL-' + Math.floor(10000 + Math.random() * 90000),
        name: existing ? existing.name : googleUserName,
        phone: existing ? existing.phone : googleUserPhone,
        email: googleUserEmail,
        accountType: 'Patient',
        roles: existing ? Array.from(new Set([...existing.roles, 'Patient'])) : ['Patient'],
        provider: 'google',
      };

      saveIdentity({
        id: unifiedAccount.id,
        name: unifiedAccount.name,
        phone: unifiedAccount.phone,
        email: googleUserEmail,
        roles: unifiedAccount.roles || ['Patient'],
        city: 'Hyderabad',
        provider: 'google',
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem('nhealth_user', JSON.stringify(unifiedAccount));
      setSuccessMsg('Google OAuth Successful! Connected as ' + googleUserEmail);
      setTimeout(() => onSuccess(unifiedAccount), 500);
    }, 600);
  };

  // Handle Send OTP for Patient Login
  const handleSendLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginPhone || loginPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Phase 2: If registered across multiple service roles, trigger Multi-Account selection
    const accounts = findServiceAccounts(loginPhone);
    if (accounts.length > 1) {
      handleOpenMultiAccountSelector(loginPhone);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoginOtpSent(true);
      setLoginOtp('482910'); // Pre-fill with demo OTP
      setSuccessMsg('OTP sent to +91 ' + loginPhone + ' (Demo OTP: 482910)');
    }, 500);
  };

  // Handle Patient Login Submit
  const handlePatientLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Phase 2: Check for multiple registered accounts across service roles
    if (loginMethod === 'phone') {
      const accounts = findServiceAccounts(loginPhone);
      if (accounts.length > 1) {
        handleOpenMultiAccountSelector(loginPhone);
        return;
      }
    } else {
      const accounts = findServiceAccounts(loginEmail);
      if (accounts.length > 1) {
        handleOpenMultiAccountSelector(loginEmail);
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (loginMethod === 'phone') {
        if (!loginOtpSent) {
          handleSendLoginOtp(e);
          return;
        }
        if (loginOtp !== '482910' && loginOtp.length < 4) {
          setErrorMsg('Invalid OTP. Please enter 482910 or your verified code.');
          return;
        }

        const existingIdentities = getStoredIdentities();
        const existing = existingIdentities.find((i) => i.phone === loginPhone);

        const user: UserAccount = {
          id: existing ? existing.id : 'USR-' + Math.floor(10000 + Math.random() * 90000),
          name: existing ? existing.name : 'Patient (' + loginPhone.slice(-4) + ')',
          phone: loginPhone,
          email: existing?.email || `${loginPhone}@nhealth.in`,
          accountType: 'Patient',
          roles: existing ? Array.from(new Set([...existing.roles, 'Patient'])) : ['Patient'],
          provider: 'phone',
        };

        saveIdentity({
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          roles: user.roles || ['Patient'],
          city: existing?.city || 'Hyderabad',
          provider: 'phone',
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });

        localStorage.setItem('nhealth_user', JSON.stringify(user));
        onSuccess(user);
      } else {
        // Email login
        if (!loginEmail || !loginPassword) {
          setErrorMsg('Please enter both email and password.');
          return;
        }

        const existingIdentities = getStoredIdentities();
        const existing = existingIdentities.find((i) => i.email.toLowerCase() === loginEmail.toLowerCase());

        const user: UserAccount = {
          id: existing ? existing.id : 'USR-' + Math.floor(10000 + Math.random() * 90000),
          name: existing ? existing.name : loginEmail.split('@')[0],
          phone: existing ? existing.phone : '9876543210',
          email: loginEmail,
          accountType: 'Patient',
          roles: existing ? Array.from(new Set([...existing.roles, 'Patient'])) : ['Patient'],
          provider: 'email',
        };

        saveIdentity({
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          roles: user.roles || ['Patient'],
          city: existing?.city || 'Hyderabad',
          provider: 'email',
          createdAt: existing ? existing.createdAt : new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });

        localStorage.setItem('nhealth_user', JSON.stringify(user));
        onSuccess(user);
      }
    }, 600);
  };

  // Handle Single Identity Patient Registration
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSingleIdentityNotice('');

    if (!signupForm.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signupForm.phone || signupForm.phone.length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!signupForm.agreeTerms) {
      setErrorMsg('Please agree to the mandatory Terms & Conditions and Privacy Policy.');
      return;
    }

    if (!signupOtpSent) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSignupOtpSent(true);
        setSignupOtp('482910');
        setSuccessMsg('Verification code sent to +91 ' + signupForm.phone + ' (Demo code: 482910)');
      }, 500);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const email = signupForm.email.trim() || `${signupForm.phone}@nhealth.in`;

      // Check if user already exists under Single Identity schema
      const existingIdentities = getStoredIdentities();
      const existing = existingIdentities.find(
        (i) => i.phone === signupForm.phone || (i.email && i.email.toLowerCase() === email.toLowerCase())
      );

      let unifiedUser: UserAccount;

      if (existing) {
        // Single Identity Sign-Up: Unify roles seamlessly
        const updatedRoles = Array.from(new Set([...existing.roles, 'Patient']));
        unifiedUser = {
          id: existing.id,
          name: signupForm.fullName || existing.name,
          phone: signupForm.phone,
          email: email,
          accountType: 'Patient',
          roles: updatedRoles,
          provider: 'phone',
        };
        setSingleIdentityNotice(`Single Identity Verified! Seamlessly linked your new registration to your unified account (${existing.email || existing.phone}).`);
      } else {
        unifiedUser = {
          id: 'USR-' + Math.floor(10000 + Math.random() * 90000),
          name: signupForm.fullName,
          phone: signupForm.phone,
          email: email,
          accountType: 'Patient',
          roles: ['Patient'],
          provider: 'phone',
        };
      }

      saveIdentity({
        id: unifiedUser.id,
        name: unifiedUser.name,
        phone: unifiedUser.phone,
        email: unifiedUser.email || '',
        roles: unifiedUser.roles || ['Patient'],
        city: signupForm.city,
        provider: 'phone',
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem('nhealth_user', JSON.stringify(unifiedUser));
      setSuccessMsg('Registration completed successfully! Welcome to Nhealth.');
      setTimeout(() => onSuccess(unifiedUser), 500);
    }, 600);
  };

  // Handle Partner Login Submit (Strict Credentials & Admin Approval Check)
  const handlePartnerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setPendingPartnerNotice(null);

    if (!partnerLoginId.trim() || !partnerPassword) {
      setErrorMsg('Please enter both your Partner Login ID/Email and Password.');
      return;
    }

    // Phase 2: Check for multiple registered accounts across service roles
    const accounts = findServiceAccounts(partnerLoginId);
    if (accounts.length > 1) {
      handleOpenMultiAccountSelector(partnerLoginId);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanId = partnerLoginId.trim().toLowerCase();

      // Search partner roster
      const matchedPartner = partners.find(
        (p) =>
          p.email.toLowerCase() === cleanId ||
          p.loginIdOrEmail?.toLowerCase() === cleanId ||
          p.id.toLowerCase() === cleanId
      );

      if (!matchedPartner) {
        setErrorMsg('No healthcare partner account found with these credentials. Please check your Login ID or register at /partner-with-us.');
        return;
      }

      // Validate password (partner password or demo master password)
      const isPasswordValid =
        partnerPassword === matchedPartner.password ||
        partnerPassword === 'partner@2026' ||
        partnerPassword === 'admin2026';

      if (!isPasswordValid) {
        setErrorMsg('Invalid password. Please check your credentials or reset password.');
        return;
      }

      // Phase 3: Check if account is suspended (either >90 days inactive or admin restricted)
      if (isPartnerSuspended(matchedPartner)) {
        setSuspendedPartnerNotice(matchedPartner);
        setErrorMsg(
          `Account Suspended due to Inactivity: "${matchedPartner.entityName}" has remained inactive for >90 days. Please raise a Revocation / Re-activation Request below.`
        );
        return;
      }

      // Status check: Is partner Approved/Live or Pending?
      if (matchedPartner.status === 'Pending') {
        setPendingPartnerNotice(matchedPartner);
        setErrorMsg(`Account Under Review: The application for "${matchedPartner.entityName}" has not yet been approved.`);
        return;
      }

      // Partner is Approved / Live! Authenticate
      const partnerAccount: UserAccount = {
        id: matchedPartner.id,
        name: matchedPartner.contactPerson || matchedPartner.entityName,
        phone: matchedPartner.phone,
        email: matchedPartner.email,
        accountType: 'Partner',
        role: matchedPartner.category,
        entityName: matchedPartner.entityName,
        roles: ['Partner', matchedPartner.category],
        provider: 'email',
      };

      saveIdentity({
        id: matchedPartner.id,
        name: partnerAccount.name,
        phone: matchedPartner.phone,
        email: matchedPartner.email,
        roles: ['Partner', matchedPartner.category],
        city: matchedPartner.city,
        provider: 'email',
        createdAt: matchedPartner.submittedAt,
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem('nhealth_user', JSON.stringify(partnerAccount));
      setSuccessMsg(`Welcome, ${matchedPartner.entityName}! Live Partner credentials verified.`);
      setTimeout(() => onSuccess(partnerAccount), 500);
    }, 600);
  };

  // Reusable Google OAuth button
  const renderGoogleButton = (portalRole: 'login' | 'signup' | 'partner') => (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handleGoogleOAuth(portalRole)}
        disabled={googleAuthLoading || isLoading}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer"
        title="Authenticate securely with your Google Account"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {googleAuthLoading
            ? 'Connecting Google OAuth...'
            : portalRole === 'signup'
            ? 'Sign up with Google (Single Identity)'
            : portalRole === 'partner'
            ? 'Partner Login with Google'
            : 'Continue with Google'}
        </span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          or continue with {portalRole === 'partner' ? 'partner credentials' : 'mobile / email'}
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#008080]/15 selection:text-[#002b49]">
      {/* Top Navigation Bar - Frozen/Sticky on mobile and tablet */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs sticky top-0 z-50">
        <div className="w-full px-3 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              aria-label="Back to home"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:text-[#008080] hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0 border border-slate-200/60 sm:border-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={onNavigateHome}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <img
              src="https://i.ibb.co/6JR2bwmJ/whatsapp-profile-pic.jpg"
              alt="Nhealth Logo"
              className="h-8 sm:h-10 w-auto object-contain rounded-lg border border-teal-500/30 shrink-0"
              onError={(e) => {
                e.currentTarget.src = '/splash-logo.png';
              }}
            />
            <span
              style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif", fontWeight: 600 }}
              className="text-lg sm:text-2xl tracking-tight text-[#002b49] group-hover:text-[#008080] transition-colors whitespace-nowrap"
            >
              Nhealth™
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 text-xs text-slate-500 shrink-0">
            <span className="hidden md:inline text-slate-400">Need assistance?</span>
            <a
              href="tel:9393934621"
              className="inline-flex items-center gap-1 font-bold text-[#008080] hover:underline bg-teal-50 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg border border-teal-100/80 sm:border-transparent text-[11px] sm:text-xs"
            >
              <Phone className="w-3 h-3 md:hidden text-[#008080]" />
              <span>9393934621</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          {/* Left / Info Hero Panel (4.5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#002b49] via-[#001f35] to-[#00172b] p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Single Identity Healthcare Portal</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight mb-3">
                {activeTab === 'partner'
                  ? 'Welcome Healthcare Partners & Providers.'
                  : 'Healthcare at Home, Simplified for Your Family.'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                {activeTab === 'partner'
                  ? 'Access your clinical appointments, diagnostic fulfillment roster, patient communications, and verified empanelment dashboard.'
                  : 'One unified account for hospital visits, diagnostic phlebotomy at home, ICU ambulance transit, and life-long encrypted medical health vaults.'}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Single Identity Architecture</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Use the same verified mobile number &amp; email across patient bookings and provider workflows.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Instant Google &amp; OTP Access</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Frictionless 1-click login with Google OAuth or verified mobile OTP.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Accredited Partner Empanelment</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Doctors, hospitals, labs, care riders, care assists, and blood bank networks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block">
                {activeTab === 'partner' ? '⚡ 1-Click Demo Partner Access' : '⚡ Instant Demo Patient Access'}
              </span>

              {activeTab === 'partner' ? (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPartnerDemoLogin('PARTNER-DIAG-003')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30 transition-all text-center cursor-pointer"
                      title="Thyrocare (Live & Approved Partner)"
                    >
                      ✓ Thyrocare Lab (Live)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPartnerDemoLogin('PARTNER-DOC-001')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-400/30 transition-all text-center cursor-pointer"
                      title="Dr. Meera Nambiar (Pending Approval)"
                    >
                      ⏳ Dr. Meera (Pending)
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPartnerDemoLogin('PARTNER-RIDER-005')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 text-xs font-semibold border border-teal-400/30 transition-all text-center cursor-pointer"
                      title="Care Rider Fleet (Live)"
                    >
                      ✓ Care Rider (Live)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPartnerDemoLogin('PARTNER-BLOOD-007')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold border border-rose-400/30 transition-all text-center cursor-pointer"
                      title="Blood Bank Network (Live)"
                    >
                      ✓ Blood Bank (Live)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('patient')}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all text-center cursor-pointer"
                  >
                    ⚡ Demo Patient (Ramesh)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('senior')}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 text-xs font-semibold border border-teal-400/30 transition-all text-center cursor-pointer"
                  >
                    ⚡ Senior Citizen Care
                  </button>
                </div>
              )}

              {/* Phase 2: Interactive Multi-Account Selection Demo Buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-amber-300" />
                  <span>Test Multi-Account Selection (Phase 2):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenMultiAccountSelector('9845012345')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-100 text-xs font-semibold border border-amber-400/30 transition-all text-left flex items-center justify-between cursor-pointer group"
                  title="Mobile 9845012345: Doctor + Care Assist + Patient"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold block text-white text-[11px] group-hover:text-amber-200">
                      Dr. Meera / Ananya (+91 9845012345)
                    </span>
                    <span className="text-[10px] text-amber-300/80">
                      3 Roles: Doctor Specialist, Care Assist &amp; Patient
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenMultiAccountSelector('9581582220')}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-100 text-xs font-semibold border border-rose-400/30 transition-all text-left flex items-center justify-between cursor-pointer group"
                  title="Mobile 9581582220: Ambulance Fleet & Blood Bank"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold block text-white text-[11px] group-hover:text-rose-200">
                      Emergency Fleet (+91 9581582220)
                    </span>
                    <span className="text-[10px] text-rose-300/80">
                      2 Roles: Ambulance Fleet &amp; Blood Bank
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right / Interactive Form Panel (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Requirement 3: Unified 3-Tab Switcher (Patient Login / Patient Registration / Partner Login) */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setPendingPartnerNotice(null);
                    setSingleIdentityNotice('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-[#002b49] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Patient Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setPendingPartnerNotice(null);
                    setSingleIdentityNotice('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-[#002b49] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Patient Registration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('partner');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setPendingPartnerNotice(null);
                    setSingleIdentityNotice('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'partner'
                      ? 'bg-white text-[#008080] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Partner Login</span>
                </button>
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {singleIdentityNotice && (
                <div className="mb-4 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{singleIdentityNotice}</span>
                </div>
              )}

              {/* Phase 3 Requirement 1: Suspended Partner Inactivity Notice & Revoke Action */}
              {suspendedPartnerNotice && (
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-50 to-amber-500/10 border-2 border-rose-400 text-rose-950 text-xs space-y-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black text-rose-900">
                      <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="uppercase tracking-tight text-xs sm:text-sm">Account Suspended due to Inactivity</span>
                    </div>
                    <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                      &gt;90-Day Rule
                    </span>
                  </div>

                  <p className="leading-relaxed text-slate-800">
                    The partner account for <strong>{suspendedPartnerNotice.entityName}</strong> (ID: {suspendedPartnerNotice.id}, Category: {suspendedPartnerNotice.category}) has been automatically flagged as <strong>"Suspended due to Inactivity"</strong> because it has remained without login or operational activity for over 3 months (90 days).
                  </p>

                  {suspendedPartnerNotice.lastActiveAt && (
                    <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-rose-200 font-mono">
                      Last operational activity recorded:{' '}
                      <strong>{new Date(suspendedPartnerNotice.lastActiveAt).toLocaleDateString()}</strong> (
                      {calculateDaysInactive(suspendedPartnerNotice)} days inactive)
                    </div>
                  )}

                  {/* Revoke Request Action */}
                  {suspendedPartnerNotice.revocationRequested ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-emerald-900">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Revocation / Re-activation Request Already Submitted</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-tight">
                        Your request has been routed directly to <strong className="font-mono">support@nhealth.in</strong> and entered the Admin review pipeline. The compliance officer will review within 24 hours.
                      </p>
                      {suspendedPartnerNotice.revocationReason && (
                        <p className="text-[10px] text-slate-600 italic mt-1">
                          Note: "{suspendedPartnerNotice.revocationReason}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRevocationNote('');
                          setShowRevocationModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Raise Revocation / Re-activation Request</span>
                      </button>

                      <a
                        href={`mailto:support@nhealth.in?subject=Revocation%20%2F%20Re-activation%20Request%20-%20${encodeURIComponent(suspendedPartnerNotice.id)}&body=Partner%20Entity:%20${encodeURIComponent(suspendedPartnerNotice.entityName)}%0APartner%20ID:%20${suspendedPartnerNotice.id}%0APhone:%20${suspendedPartnerNotice.phone}%0A%0AReason%20for%20Reactivation:%20`}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#008080]" />
                        <span>Direct to support@nhealth.in</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Pending Partner Application Modal / Warning Notice (Strict requirement) */}
              {pendingPartnerNotice && (
                <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-black text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Partner Credentials Activation Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    The partner profile for <strong>{pendingPartnerNotice.entityName}</strong> (Category: {pendingPartnerNotice.category}, ID: {pendingPartnerNotice.id}) is currently in <span className="bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">Pending Approval</span> status.
                  </p>
                  <p className="font-semibold text-amber-900 text-[11px]">
                    "These credentials will become active once your application is approved by the Nhealth Admin."
                  </p>
                  {onNavigateAdmin && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onNavigateAdmin}
                        className="px-3 py-1.5 rounded-lg bg-[#002b49] text-white font-bold text-[11px] hover:bg-[#00172b] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Open Admin Command Center (/command-center)</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: PATIENT LOGIN */}
              {activeTab === 'login' && (
                <div className="space-y-5">
                  {/* Google OAuth Button (Requirement 3) */}
                  {renderGoogleButton('login')}

                  {/* Sub-toggle: Phone OTP vs Email */}
                  <div className="flex items-center gap-4 text-xs border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`font-bold pb-1 cursor-pointer transition-colors ${
                        loginMethod === 'phone'
                          ? 'text-[#008080] border-b-2 border-[#008080]'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Login via Mobile OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`font-bold pb-1 cursor-pointer transition-colors ${
                        loginMethod === 'email'
                          ? 'text-[#008080] border-b-2 border-[#008080]'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Login via Email &amp; Password
                    </button>
                  </div>

                  <form onSubmit={handlePatientLoginSubmit} className="space-y-4">
                    {loginMethod === 'phone' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Registered Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1.5 sm:gap-2 w-full min-w-0">
                          <div className="flex items-center px-2.5 sm:px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 shrink-0">
                            🇮🇳 +91
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit number"
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                            disabled={loginOtpSent}
                            className="min-w-0 flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                          />
                          {!loginOtpSent && (
                            <button
                              type="button"
                              onClick={handleSendLoginOtp}
                              disabled={isLoading || loginPhone.length < 10}
                              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] active:bg-[#005555] text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                            >
                              Get OTP
                            </button>
                          )}
                        </div>

                        {loginOtpSent && (
                          <div className="mt-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold text-slate-700">
                                6-Digit Verification Code
                              </label>
                              <button
                                type="button"
                                onClick={() => setLoginOtpSent(false)}
                                className="text-[11px] font-bold text-[#008080] hover:underline cursor-pointer"
                              >
                                Change Number
                              </button>
                            </div>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 482910"
                              value={loginOtp}
                              onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                              className="w-full tracking-widest text-center text-lg font-mono font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                              Demo access code is automatically pre-filled.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="email"
                              placeholder="patient@example.com"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#008080] to-[#009b9b] hover:from-[#006666] hover:to-[#008080] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>
                        {isLoading
                          ? 'Verifying...'
                          : loginOtpSent
                          ? 'Verify & Access Patient Portal'
                          : 'Continue to Nhealth'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: PATIENT REGISTRATION (Single Identity Sign-Up) */}
              {activeTab === 'signup' && (
                <div className="space-y-4">
                  {/* Google OAuth Button (Requirement 3) */}
                  {renderGoogleButton('signup')}

                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Patient Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1.5">
                          <span className="inline-flex items-center px-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            placeholder="10-digit number"
                            value={signupForm.phone}
                            onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, '') })}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email (Single Identity)
                        </label>
                        <input
                          type="email"
                          placeholder="email@domain.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="Years"
                          value={signupForm.age}
                          onChange={(e) => setSignupForm({ ...signupForm, age: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={signupForm.gender}
                          onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad, Bengaluru"
                          value={signupForm.city}
                          onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Area Pincode
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit pincode"
                          value={signupForm.pincode}
                          onChange={(e) => setSignupForm({ ...signupForm, pincode: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                    </div>

                    {signupOtpSent && (
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl animate-in fade-in duration-200">
                        <label className="block text-xs font-bold text-teal-900 mb-1">
                          Enter Verification Code (Pre-filled for Demo)
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={signupOtp}
                          onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full font-mono font-bold text-center tracking-widest text-base px-3 py-2 bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={signupForm.agreeTerms}
                        onChange={(e) => setSignupForm({ ...signupForm, agreeTerms: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-[#008080] focus:ring-[#008080] cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-700 leading-snug cursor-pointer font-medium">
                        I agree to the <span className="font-bold text-[#002b49]">Terms &amp; Conditions</span> and <span className="font-bold text-[#002b49]">Privacy Policy</span> of Nhealth Unified Healthcare Technologies Private Limited. <span className="text-red-500 font-bold">(Mandatory)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !signupForm.agreeTerms}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        !signupForm.agreeTerms || isLoading
                          ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60 shadow-none'
                          : 'bg-gradient-to-r from-[#002b49] via-[#003859] to-[#002b49] hover:from-[#00172b] hover:to-[#00172b] text-white shadow-md hover:shadow-lg ring-2 ring-[#008080]/30 active:scale-[0.99] cursor-pointer'
                      }`}
                    >
                      <span>
                        {isLoading
                          ? 'Registering Single Identity...'
                          : signupOtpSent
                          ? 'Verify OTP & Submit Request'
                          : 'Submit Request / Register Single Identity'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: PARTNER LOGIN (Requirement 3 & 4) */}
              {activeTab === 'partner' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Google OAuth Button for Partners */}
                  {renderGoogleButton('partner')}

                  {/* Partner Credentials Form */}
                  <form onSubmit={handlePartnerLoginSubmit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          Partner Login ID / Registered Email <span className="text-red-500">*</span>
                        </label>
                        {onNavigatePartnerOnboarding && (
                          <button
                            type="button"
                            onClick={onNavigatePartnerOnboarding}
                            className="text-[11px] font-bold text-[#008080] hover:underline cursor-pointer"
                          >
                            New Partner? Apply Here
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. partner.labs@thyrocare.com or dr.meera@nambiarclinic.com"
                          value={partnerLoginId}
                          onChange={(e) => setPartnerLoginId(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Enter the credentials created during your partner onboarding submission.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Partner Account Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPartnerPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter your partner portal password"
                          value={partnerPassword}
                          onChange={(e) => setPartnerPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPartnerPassword(!showPartnerPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPartnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Partner Credential Activation Note */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#008080] shrink-0 mt-0.5" />
                      <span>
                        Note: Credentials for new partner applications become active once your application is approved by the Nhealth Admin.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#002b49] via-[#003859] to-[#002b49] hover:from-[#00172b] hover:to-[#00172b] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Stethoscope className="w-4 h-4 text-teal-300" />
                      <span>{isLoading ? 'Authenticating Partner...' : 'Sign In to Partner Portal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Partner Onboarding Quick Link */}
                  {onNavigatePartnerOnboarding && (
                    <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#002b49]">
                          Are you a Clinician, Hospital, Care Rider, or Blood Bank?
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Empanel with Nhealth to serve thousands of patients at home.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onNavigatePartnerOnboarding}
                        className="px-3.5 py-1.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Join Network
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Nhealth Unified Healthcare Technologies Private Limited</span>
              <span>🔒 256-Bit SSL Encrypted Single Identity</span>
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MULTI-ACCOUNT SELECTION MODAL & DROPDOWN (Phase 2 Requirement 2) */}
      {/* ------------------------------------------------------------- */}
      {showMultiAccountModal && (
        <div
          className="fixed inset-0 z-[1000] overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowMultiAccountModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002b49] via-[#003859] to-[#00172b] p-5 sm:p-6 text-white relative">
              <button
                type="button"
                onClick={() => setShowMultiAccountModal(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold border border-teal-400/30 mb-2">
                <Layers className="w-3 h-3 text-teal-300" />
                <span>Single Identity Multi-Account Switcher</span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Select the Service Account you wish to access
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Found <strong className="text-teal-300">{multiAccountOptions.length} registered service roles</strong> linked to mobile / email{' '}
                <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 rounded font-bold">
                  {accountSearchIdentifier.length === 10 ? `+91 ${accountSearchIdentifier}` : accountSearchIdentifier}
                </span>
                .
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSelectAndAuthenticateServiceAccount} className="p-5 sm:p-6 space-y-4">
              {/* Dropdown Selector (Requirement 2: Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Service Account Dropdown:
                </label>
                <div className="relative">
                  <select
                    value={selectedServiceAccount?.id}
                    onChange={(e) => {
                      const found = multiAccountOptions.find((a) => a.id === e.target.value);
                      if (found) {
                        setSelectedServiceAccount(found);
                        setAccountPasswordError('');
                      }
                    }}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080] cursor-pointer"
                  >
                    {multiAccountOptions.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.roleTitle} — {acc.entityName} ({acc.status})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Visual Card Selector Options */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {multiAccountOptions.map((acc) => {
                  const isSelected = selectedServiceAccount?.id === acc.id;
                  const isPending = acc.status === 'Pending';

                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setSelectedServiceAccount(acc);
                        setAccountPasswordError('');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#008080] bg-teal-50/70 shadow-xs ring-1 ring-[#008080]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          acc.role === 'Doctor'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : acc.role === 'Caregiver'
                            ? 'bg-teal-50 border-teal-200 text-teal-600'
                            : acc.role === 'Ambulance'
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : acc.role === 'Diagnostics'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : acc.role === 'Pharmacy'
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : acc.role === 'Hospital'
                            ? 'bg-slate-100 border-slate-300 text-slate-700'
                            : 'bg-teal-50 border-teal-200 text-teal-700'
                        }`}
                      >
                        {acc.role === 'Doctor' && <Stethoscope className="w-5 h-5" />}
                        {acc.role === 'Caregiver' && <HeartHandshake className="w-5 h-5" />}
                        {acc.role === 'Ambulance' && <Car className="w-5 h-5" />}
                        {acc.role === 'Diagnostics' && <TestTube2 className="w-5 h-5" />}
                        {acc.role === 'Pharmacy' && <Pill className="w-5 h-5" />}
                        {acc.role === 'Hospital' && <Building2 className="w-5 h-5" />}
                        {acc.role === 'Patient' && <User className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#002b49] truncate">
                            {acc.roleTitle}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                              acc.status === 'Suspended'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : acc.status === 'Pending'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {acc.status === 'Suspended'
                              ? '⛔ Suspended (>90d)'
                              : acc.status === 'Pending'
                              ? '⏳ Pending Approval'
                              : '✓ Live / Approved'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                          {acc.entityName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {acc.badge} • {acc.specialty || acc.registrationNumber || 'Nhealth Empaneled'}
                        </p>
                      </div>

                      <div className="shrink-0 pt-1">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#008080] bg-[#008080] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Password Input or Pending Notice or Suspended Inactivity Notice */}
              {selectedServiceAccount?.status === 'Suspended' ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-rose-900">
                    <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Suspended due to Inactivity (&gt;90 Days Rule)</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-700">
                    The partner account for <strong>{selectedServiceAccount.entityName}</strong> has remained inactive for over 90 days. Please raise a Revocation Request to restore operational credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const allP = [...partners, ...INITIAL_PARTNERS];
                      const matched = allP.find((p) => p.id === selectedServiceAccount.id);
                      if (matched) {
                        setSuspendedPartnerNotice(matched);
                      }
                      setShowMultiAccountModal(false);
                      setShowRevocationModal(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Raise Revocation / Re-activation Request</span>
                  </button>
                </div>
              ) : selectedServiceAccount?.status === 'Pending' ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Admin Approval Required</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    "These credentials will become active once your application is approved by the Nhealth Admin."
                  </p>
                  {onNavigateAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMultiAccountModal(false);
                        onNavigateAdmin();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#002b49] text-white font-bold text-[11px] hover:bg-[#00172b] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Approve in Admin Command Center (/command-center)</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter Password for{' '}
                    <span className="text-[#008080] font-black">
                      {selectedServiceAccount?.roleTitle || 'Selected Account'}
                    </span>{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showAccountPassword ? 'text' : 'password'}
                      value={accountPasswordInput}
                      onChange={(e) => setAccountPasswordInput(e.target.value)}
                      placeholder="Enter account password (or demo: partner@2026)"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountPassword(!showAccountPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      Quick Demo Password: <code className="font-mono text-teal-600 font-bold">partner@2026</code> or OTP <code className="font-mono text-teal-600 font-bold">482910</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAccountPasswordInput('partner@2026')}
                      className="text-[#008080] font-bold hover:underline cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>
              )}

              {accountPasswordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{accountPasswordError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMultiAccountModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    selectedServiceAccount?.status === 'Pending' ||
                    selectedServiceAccount?.status === 'Suspended'
                  }
                  className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#008080] to-[#009b9b] hover:from-[#006666] hover:to-[#008080] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Access {selectedServiceAccount?.role || 'Service'} Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REVOCATION / RE-ACTIVATION REQUEST MODAL (Phase 3 Requirement 1) */}
      {/* ------------------------------------------------------------- */}
      {showRevocationModal && suspendedPartnerNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowRevocationModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#002b49]">
                    Raise Revocation / Re-activation Request
                  </h4>
                  <p className="text-xs text-slate-500">
                    {suspendedPartnerNotice.entityName} ({suspendedPartnerNotice.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRevocationModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseRevocationRequest} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Direct Routing Protocol:</strong> This re-activation request routes directly to <strong>support@nhealth.in</strong> and is logged into the <strong>Admin Command Center (/command-center)</strong> review pipeline.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason &amp; Operational Readiness for Re-activation <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Pharmacy operations have resumed with new cold-chain drug storage and licensed pharmacist on duty. Requesting restoration to Live network."
                  value={revocationNote}
                  onChange={(e) => setRevocationNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div>Contact Person: <strong>{suspendedPartnerNotice.contactPerson}</strong></div>
                <div>Phone: <strong>{suspendedPartnerNotice.phone}</strong></div>
                <div>Registered Email: <strong>{suspendedPartnerNotice.email}</strong></div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRevocationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#002b49] via-[#003859] to-[#008080] hover:from-[#00172b] hover:to-[#006666] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Revocation Request to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Strip */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; 2026 Nhealth Unified Healthcare Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
};
