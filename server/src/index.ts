import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';

interface User {
  password: string;
  role: 'doctor' | 'nurse' | 'pharmacist';
  userId: string;
}

interface AuthRequest {
  employeeCode: string;
  password: string;
}

interface CustomJWTPayload {
  userId: string;
  role: 'doctor' | 'nurse' | 'pharmacist';
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

function isCustomJWTPayload(payload: any): payload is CustomJWTPayload {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'userId' in payload && typeof payload.userId === 'string' &&
        'role' in payload && (payload.role === 'doctor' || payload.role === 'nurse' || payload.role === 'pharmacist') &&
        'exp' in payload && typeof payload.exp === 'number'
    );
}

// --- NEW Visit Type (Full Detail) ---
// This is the comprehensive visit structure stored centrally
interface FullVisit {
  date: string; // e.g., "YYYY-MM-DD"
  symptoms: string[];
  condition: string;
  medication: Medication[];
}

// --- Medication Type ---
interface Medication {
  name: string;
  quantity: string;
}

// --- Central Patient Data Interface (Full Detail) ---
// This represents the complete patient record in the central store
interface FullPatientData {
  id: number;
  name: string;
  age: number;
  image: string;
  visitHistory: FullVisit[]; // Holds all visits with all details
}

// --- Role-Specific Patient Data Interfaces (for frontend consumption) ---
// These match what the frontend expects for each role's dashboard
interface DoctorNursePatientData {
  id: number;
  name: string;
  age: number;
  image: string;
  // When sent to frontend, `visitHistory` will be `FullVisit[]`
  // The 'DashboardProps' and 'PatientsInQueuePageProps' on frontend will use this structure for Doctor/Nurse
  visitHistory: FullVisit[];
}

interface PharmacistPatientData {
  id: number;
  name: string;
  age: number;
  image: string;
  // When sent to frontend, `visitHistory` will have `symptoms` and `condition` omitted
  visitHistory: Pick<FullVisit, 'date' | 'medication'>[];
}

// Combined type for what's returned to the frontend
type PatientDetailForFrontend = DoctorNursePatientData | PharmacistPatientData;

interface AuthenticatedRoleData {
  role: 'doctor' | 'nurse' | 'pharmacist';
  patientData: PatientDetailForFrontend[]; // Use the combined type here
}

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET'],
  credentials: true,
}));

const JWT_SECRET = 'your-super-secret-jwt-key'; // CONSIDER USING ENVIRONMENT VARIABLES FOR PRODUCTION

const users: Record<string, User> = {
  doctor: { password: 'password', role: 'doctor', userId: 'doc123' },
  nurse: { password: 'password', role: 'nurse', userId: 'nurse456' },
  pharmacist: { password: 'password', role: 'pharmacist', userId: 'pharma789' },
};

// --- CENTRALIZED PATIENT DATA STORE ---
// Changed to 'let' so it can be modified when new visits are added
let allPatientsData: FullPatientData[] = [
  { id: 101, name: 'Ava Rodriguez', age: 45, image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Ava',
    visitHistory: [
      { date: '2025-05-27', symptoms: ['Headache', 'Fatigue'], condition: 'Chronic Migraine', medication: [{ name: 'Sumatriptan', quantity: '50mg' }, { name: 'Propranolol', quantity: '20mg' }] },
      { date: '2025-01-15', symptoms: ['Mild headache'], condition: 'Headache', medication: [{ name: 'Ibuprofen', quantity: '200mg' }] }
    ]
  },
  { id: 102, name: 'Noah Thompson', age: 60, image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Noah',
    visitHistory: [
      { date: '2025-05-26', symptoms: ['Chest Pain', 'Shortness of Breath'], condition: 'Hypertension', medication: [{ name: 'Lisinopril', quantity: '10mg' }, { name: 'Amlodipine', quantity: '5mg' }] },
      { date: '2024-12-01', symptoms: ['High blood pressure reading'], condition: 'Pre-hypertension', medication: [] }
    ]
  },
  { id: 103, name: 'Isabella Garcia', age: 52, image: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Isabella',
    visitHistory: [
      { date: '2025-05-25', symptoms: ['Joint Stiffness', 'Swelling'], condition: 'Rheumatoid Arthritis', medication: [{ name: 'Methotrexate', quantity: '15mg' }, { name: 'Folic Acid', quantity: '1mg' }] }
    ]
  },
  { id: 104, name: 'Liam Martinez', age: 30, image: 'https://via.placeholder.com/150/FFFF00/000000?text=Liam',
    visitHistory: [
      { date: '2025-05-24', symptoms: ['Sore Throat', 'Fever'], condition: 'Strep Throat', medication: [{ name: 'Amoxicillin', quantity: '500mg' }] }
    ]
  },
  { id: 105, name: 'Sophia Hernandez', age: 72, image: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Sophia',
    visitHistory: [
      { date: '2025-05-23', symptoms: ['Frequent Urination', 'Thirst'], condition: 'Type 2 Diabetes', medication: [{ name: 'Metformin', quantity: '850mg' }, { name: 'Insulin Glargine', quantity: '10 Units' }] }
    ]
  },
  { id: 106, name: 'Mason Clark', age: 10, image: 'https://via.placeholder.com/150/00FFFF/000000?text=Mason',
    visitHistory: [
      { date: '2025-05-22', symptoms: ['Rash', 'Itching'], condition: 'Allergic Reaction', medication: [{ name: 'Diphenhydramine', quantity: '25mg' }] }
    ]
  },
  { id: 107, name: 'Olivia Lewis', age: 28, image: 'https://via.placeholder.com/150/800080/FFFFFF?text=Olivia',
    visitHistory: [
      { date: '2025-05-21', symptoms: ['Severe Headache', 'Sensitivity to Light'], condition: 'Migraine', medication: [{ name: 'Rizatriptan', quantity: '10mg' }] }
    ]
  },
  { id: 108, name: 'Ethan Hill', age: 68, image: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Ethan',
    visitHistory: [
      { date: '2025-05-20', symptoms: ['Wheezing', 'Cough'], condition: 'Asthma Exacerbation', medication: [{ name: 'Albuterol Inhaler', quantity: '2 puffs' }, { name: 'Prednisone', quantity: '20mg' }] }
    ]
  },
  { id: 109, name: 'Emma Scott', age: 25, image: 'https://via.placeholder.com/150/008080/FFFFFF?text=Emma',
    visitHistory: [
      { date: '2025-05-19', symptoms: ['Nausea', 'Vomiting'], condition: 'Gastroenteritis', medication: [{ name: 'Ondansetron', quantity: '4mg' }] }
    ]
  },
  { id: 110, name: 'Jackson King', age: 35, image: 'https://via.placeholder.com/150/8B0000/FFFFFF?text=Jackson',
    visitHistory: [
      { date: '2025-05-18', symptoms: ['Back Pain', 'Stiffness'], condition: 'Lumbar Strain', medication: [{ name: 'Ibuprofen', quantity: '400mg' }, { name: 'Cyclobenzaprine', quantity: '5mg' }] }
    ]
  },
  // Adding a few more patients that might be relevant for nurses/pharmacists
  { id: 201, name: 'Mia Green', age: 30, image: 'https://via.placeholder.com/150/A020F0/FFFFFF?text=Mia',
    visitHistory: [
      { date: '2025-05-27', symptoms: ['Surgical Incision Pain'], condition: 'Post-op Appendectomy', medication: [{ name: 'Morphine', quantity: '2mg IV PRN' }] },
      { date: '2025-05-01', symptoms: ['Abdominal discomfort'], condition: 'Appendicitis Diagnosis', medication: [] }
    ]
  },
  { id: 202, name: 'Elijah Baker', age: 72, image: 'https://via.placeholder.com/150/DC143C/FFFFFF?text=Elijah',
    visitHistory: [
      { date: '2025-05-26', symptoms: ['Elevated Blood Glucose'], condition: 'Diabetes Management', medication: [{ name: 'Insulin Aspart', quantity: '8 Units SC' }] }
    ]
  },
  { id: 203, name: 'Charlotte Adams', age: 25, image: 'https://via.placeholder.com/150/32CD32/FFFFFF?text=Charlotte',
    visitHistory: [
      { date: '2025-05-25', symptoms: ['Swelling', 'Pain'], condition: 'Wrist Fracture', medication: [{ name: 'Acetaminophen', quantity: '500mg' }] }
    ]
  },
  { id: 301, name: 'Michael Bell', age: 22, image: 'https://via.placeholder.com/150/DDA0DD/FFFFFF?text=Michael',
    visitHistory: [
      { date: '2025-05-27', symptoms: ['Fever', 'Body Aches'], condition: 'Influenza', medication: [{ name: 'Aspirin', quantity: '325mg' }, { name: 'Famotidine', quantity: '20mg' }] }
    ]
  },
  { id: 302, name: 'Abigail River', age: 7, image: 'https://via.placeholder.com/150/F0E68C/000000?text=Abigail',
    visitHistory: [
      { date: '2025-05-26', symptoms: ['Earache'], condition: 'Otitis Media', medication: [{ name: 'Childrens Ibuprofen', quantity: '100mg/5ml' }] }
    ]
  },
];

// --- Helper function to transform patient data based on role ---
// Moved this function definition before its usage in app.get('/patient-data')
function transformPatientDataForRole(patient: FullPatientData, role: User['role']): PatientDetailForFrontend {
  if (role === 'pharmacist') {
    // For pharmacists, filter visit history to only include date and medication
    const pharmacistVisits = patient.visitHistory.map(visit => ({
      date: visit.date,
      medication: visit.medication,
    }));
    return {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      image: patient.image,
      visitHistory: pharmacistVisits,
    };
  } else {
    // For doctors and nurses, return the full visit history
    return {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      image: patient.image,
      visitHistory: patient.visitHistory,
    };
  }
}

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.post('/login', async (c) => {
  const { employeeCode, password } = await c.req.json<AuthRequest>();

  const validRoles: Array<User['role']> = ['doctor', 'nurse', 'pharmacist'];
  if (!validRoles.includes(employeeCode as User['role'])) {
    return c.json({ error: 'Invalid employee code' }, 401);
  }

  const user = users[employeeCode as User['role']];

  if (user.password !== password) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload: CustomJWTPayload = {
    userId: user.userId,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
  };

  const token = await sign(payload, JWT_SECRET);

  return c.json({ token });
});

app.get('/patient-data', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization token required' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verify(token, JWT_SECRET);

    if (!isCustomJWTPayload(decoded)) {
        return c.json({ error: 'Invalid token payload structure' }, 403);
    }

    const role = decoded.role;

    // Filter and transform data based on the user's role
    const transformedPatientData = allPatientsData.map(patient =>
      transformPatientDataForRole(patient, role)
    );

    return c.json({
      role: role,
      patientData: transformedPatientData,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('invalid signature') || error.message.includes('jwt expired')) {
        return c.json({ error: 'Invalid or expired token' }, 401);
      }
      return c.json({ error: `Authentication failed: ${error.message}` }, 401);
    }
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

app.post('/patients/:id/visit', async (c) => {
    const authHeader = c.req.header('Authorization');
    const patientId = parseInt(c.req.param('id'));
    const newVisitData = await c.req.json<FullVisit>(); // Expecting a FullVisit object

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization token required' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await verify(token, JWT_SECRET);

        if (!isCustomJWTPayload(decoded)) {
            return c.json({ error: 'Invalid token payload structure' }, 403);
        }

        const role = decoded.role;

        // Only doctors and nurses can add visits (adjust as per your business logic)
        if (role !== 'doctor' && role !== 'nurse') {
            return c.json({ error: 'Access denied: Only doctors and nurses can add new visits.' }, 403);
        }

        const patientIndex = allPatientsData.findIndex(p => p.id === patientId);

        if (patientIndex === -1) {
            return c.json({ error: 'Patient not found' }, 404);
        }

        // Add the new visit to the patient's history (at the end for chronological display)
        allPatientsData[patientIndex].visitHistory.push(newVisitData); 

        // Return the updated patient data
        // Transform the patient data for the specific role before returning
        const updatedPatientForFrontend = transformPatientDataForRole(allPatientsData[patientIndex], role);
        return c.json({ message: 'Visit added successfully', patient: updatedPatientForFrontend });

    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes('invalid signature') || error.message.includes('jwt expired')) {
                return c.json({ error: 'Invalid or expired token' }, 401);
            }
            return c.json({ error: `Operation failed: ${error.message}` }, 500);
        }
        return c.json({ error: 'An unknown error occurred during visit addition' }, 500);
    }
});


export default app;
