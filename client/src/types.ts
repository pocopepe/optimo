// src/types.ts

// --- JWT and Auth Related Types ---
export interface AuthTokenPayload {
    userId: string;
    role: 'doctor' | 'nurse' | 'pharmacist';
    exp: number;
    iat?: number;
}

export interface LoginPageProps {
    navigate: (href: string) => void;
    role: AuthTokenPayload['role'];
}

// --- Medication Type ---
export interface Medication {
    name: string;
    quantity: string;
}

// --- NEW: Visit Types ---
// Full visit details, as stored in the backend and sent to Doctor/Nurse
export interface FullVisit {
    date: string;
    symptoms: string[];
    condition: string;
    medication: Medication[];
}

// Partial visit details, sent to Pharmacist
export interface PharmacistVisit {
    date: string;
    medication: Medication[];
}

// --- Patient Data Types (reflecting backend's transformed output) ---
// This is the full patient data, as returned to Doctor/Nurse roles
export interface DoctorNursePatientData {
    id: number;
    name: string;
    age: number;
    image: string;
    visitHistory: FullVisit[]; // Doctors/Nurses get full history
}

// This is the partial patient data, as returned to Pharmacist role
export interface PharmacistPatientData {
    id: number;
    name: string;
    age: number;
    image: string;
    visitHistory: PharmacistVisit[]; // Pharmacists get partial history (no symptoms/condition)
}

// PatientDetail is now a union of these two specialized patient types
export type PatientDetail = DoctorNursePatientData | PharmacistPatientData;


export interface AuthenticatedRoleData {
    role: 'doctor' | 'nurse' | 'pharmacist';
    patientData: PatientDetail[]; // This now holds the mixed types based on role
}

// --- Component Props Types ---

export interface CommonComponentProps {
    navigate: (href: string) => void;
}

// New interface for Admin component props
export interface AdminComponentProps extends CommonComponentProps {
    currentPath: string;
    getAuthToken: () => string | null;
    authenticatedRoleData: AuthenticatedRoleData | null;
}

export interface BaseNavBarProps {
    brandName: string;
    navigate: (href: string) => void;
}

export interface NavigationLink {
    href: string;
    label: string;
}

export interface NavBarProps extends BaseNavBarProps {
    navLinks: NavigationLink[];
}

export interface AdminNavBarProps extends BaseNavBarProps {
    onLogout: () => void;
    userRole: AuthTokenPayload['role'] | null;
}

export interface HomePageProps {
    // No specific props needed for HomePage
}

export interface DashboardProps {
    navigate: (href: string) => void;
    // PatientData will now be filtered based on the userRole received from backend
    patientData: PatientDetail[];
    userRole: AuthTokenPayload['role'];
}

export interface PatientsInQueuePageProps {
    navigate: (href: string) => void;
    userRole: 'doctor' | 'nurse';
    // No direct patientData prop here, it will fetch individual patient details
    // or receive a more specific filtered list if needed for the queue overview
}
