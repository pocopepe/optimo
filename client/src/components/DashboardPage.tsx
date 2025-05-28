import React, { useState, useEffect } from 'react';
import type { DashboardProps, PatientDetail, DoctorNursePatientData, PharmacistPatientData, Medication, FullVisit, PharmacistVisit } from '../types';

const DashboardPage: React.FC<DashboardProps> = ({ patientData, userRole }) => {
  // State to manage which patient's main details section is open
  const [openPatientId, setOpenPatientId] = useState<number | null>(null);
  // State to manage which specific historical visit is open within a patient's details
  // Using string for unique visit ID (patientId-date-index) to handle cases with same dates
  const [openHistoricalVisitId, setOpenHistoricalVisitId] = useState<string | null>(null); 
  // State for the search term input
  const [searchTerm, setSearchTerm] = useState<string>('');
  // State for the list of patients filtered by the search term
  const [filteredPatients, setFilteredPatients] = useState<PatientDetail[]>(patientData);

  // Effect to filter patients whenever patientData or searchTerm changes
  useEffect(() => {
    if (searchTerm === '') {
      // If search term is empty, show all patients
      setFilteredPatients(patientData);
    } else {
      // Filter patients by name (case-insensitive)
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const newFilteredPatients = patientData.filter(patient =>
        patient.name.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredPatients(newFilteredPatients);
    }
  }, [patientData, searchTerm]);

  // Function to toggle the visibility of a patient's main details
  const togglePatientDetails = (id: number): void => {
    setOpenPatientId(openPatientId === id ? null : id);
    // Close any open historical visit when main details are toggled
    setOpenHistoricalVisitId(null); 
  };

  // Function to toggle the visibility of a specific historical visit
  const toggleHistoricalVisit = (patientId: number, visitDate: string, index: number): void => {
    const uniqueVisitId = `${patientId}-${visitDate}-${index}`;
    setOpenHistoricalVisitId(openHistoricalVisitId === uniqueVisitId ? null : uniqueVisitId);
  };

  // Helper function to render medication list items
  const renderMedications = (meds: Medication[]): React.ReactNode => (
    <ul className="list-disc list-inside ml-4 text-sm text-gray-700 space-y-1">
      {meds.length > 0 ? (
        meds.map((med, index) => (
          <li key={index} className="text-gray-600">
            <span className="font-medium text-indigo-700">{med.name}</span> ({med.quantity})
          </li>
        ))
      ) : (
        <li className="text-gray-500 italic">No medications listed.</li>
      )}
    </ul>
  );

  // Type guard to determine if a visit is a FullVisit (has 'symptoms' and 'condition')
  const isFullVisit = (visit: FullVisit | PharmacistVisit): visit is FullVisit => {
    return 'symptoms' in visit && 'condition' in visit;
  };

  // Helper function to render a single visit entry in the history (used for both latest and historical)
  const renderVisitContent = (visit: FullVisit | PharmacistVisit): React.ReactNode => {
    return (
      <div className="space-y-3">
        {isFullVisit(visit) && ( // Use type guard here
          <>
            <div>
              <p className="text-base font-semibold text-gray-700 mb-1">Symptoms:</p>
              <p className="text-gray-600 ml-4">{visit.symptoms.join(', ') || 'N/A'}</p>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700 mb-1">Condition:</p>
              <p className="text-gray-600 ml-4">{visit.condition || 'N/A'}</p>
            </div>
          </>
        )}
        <div>
          <p className="text-base font-semibold text-gray-700 mb-1">Medication:</p>
          {renderMedications(visit.medication || [])}
        </div>
      </div>
    );
  };

  // Function to render patient-specific data based on the user's role
  const renderPatientSpecificData = (patient: PatientDetail): React.ReactNode => {
    // Get the latest visit from the patient's visit history
    const latestVisitFromHistory = patient.visitHistory && patient.visitHistory.length > 0
      ? patient.visitHistory[patient.visitHistory.length - 1]
      : null;

    // Get previous visits (all except the latest)
    const previousVisits = patient.visitHistory ? patient.visitHistory.slice(0, -1).reverse() : [];

    switch (userRole) {
      case 'doctor':
      case 'nurse': {
        // Assert patient type based on role. This is safe as App.tsx ensures data consistency.
        const commonPatient = patient as DoctorNursePatientData; 
        
        let latestCommonVisit: FullVisit | null = null;
        // Explicitly narrow latestVisitFromHistory using the type guard
        if (latestVisitFromHistory && isFullVisit(latestVisitFromHistory)) {
          latestCommonVisit = latestVisitFromHistory;
        }

        return (
          <>
            {/* Patient Header Section: Image, Name, Age, ID */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 border-b border-blue-200 pb-4">
              <img
                src={commonPatient.image}
                alt={commonPatient.name}
                className="w-28 h-28 rounded-full sm:rounded-lg mb-4 sm:mb-0 sm:mr-6 object-cover border-4 border-blue-400 shadow-lg transition-transform duration-300 hover:scale-105"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-extrabold text-3xl text-blue-800 mb-1 leading-tight">{commonPatient.name}</h3>
                <p className="text-lg text-gray-700"><strong>Age:</strong> {commonPatient.age}</p>
                <p className="text-lg text-gray-700"><strong>ID:</strong> {commonPatient.id}</p>
              </div>
            </div>

            {/* Latest Visit Details */}
            {latestCommonVisit ? (
              <div className="space-y-4 mb-6">
                <h4 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2">Latest Visit Details ({latestCommonVisit.date})</h4>
                {renderVisitContent(latestCommonVisit)}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-6 text-center">No recent visit data available.</p>
            )}

            {/* Historical Visits as Dropdowns */}
            {previousVisits.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Previous Visits:</h4>
                <div className="space-y-3 p-2 bg-blue-50 rounded-lg border border-blue-100 shadow-inner"> 
                  {previousVisits.map((visit, index) => {
                    // Unique ID for each historical visit dropdown
                    const uniqueVisitId = `${patient.id}-${visit.date}-${index}`; 
                    const isOpen = openHistoricalVisitId === uniqueVisitId;
                    return (
                      <div key={uniqueVisitId} className="bg-blue-100 rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                        <button
                          onClick={() => toggleHistoricalVisit(patient.id, visit.date, index)}
                          className="w-full text-left p-3 bg-blue-200 hover:bg-blue-300 transition-colors duration-200 ease-in-out rounded-t-lg text-blue-800 font-semibold flex justify-between items-center cursor-pointer"
                        >
                          <span className="text-base">Visit Date: {visit.date}</span>
                          <span>
                            {isOpen ? (
                              <i className="fas fa-chevron-up text-blue-600"></i>
                            ) : (
                              <i className="fas fa-chevron-down text-blue-600"></i>
                            )}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="p-4 text-gray-700 border-t border-blue-200 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                            {renderVisitContent(visit)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );
      } // End doctor/nurse case
      case 'pharmacist': {
        // Assert patient type based on role. This is safe as App.tsx ensures data consistency.
        const pharmaPatient = patient as PharmacistPatientData;
        
        let latestPharmaVisit: PharmacistVisit | null = null;
        // Explicitly narrow latestVisitFromHistory using the type guard (checking it's NOT a FullVisit)
        if (latestVisitFromHistory && !isFullVisit(latestVisitFromHistory)) {
          latestPharmaVisit = latestVisitFromHistory;
        }

        return (
          <>
            {/* Patient Header Section: Image, Name, Age, ID */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 border-b border-green-200 pb-4">
              <img
                src={pharmaPatient.image}
                alt={pharmaPatient.name}
                className="w-28 h-28 rounded-full sm:rounded-lg mb-4 sm:mb-0 sm:mr-6 object-cover border-4 border-green-400 shadow-lg transition-transform duration-300 hover:scale-105"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-extrabold text-3xl text-green-800 mb-1 leading-tight">{pharmaPatient.name}</h3>
                <p className="text-lg text-gray-700"><strong>Age:</strong> {pharmaPatient.age}</p>
                <p className="text-lg text-gray-700"><strong>ID:</strong> {pharmaPatient.id}</p>
              </div>
            </div>

            {/* Latest Visit Details (Pharmacist specific) */}
            {latestPharmaVisit ? (
              <div className="space-y-4 mb-6">
                <h4 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2">Latest Prescription ({latestPharmaVisit.date})</h4>
                {renderVisitContent(latestPharmaVisit)}
              </div>
            ) : (
              <p className="text-gray-500 italic mb-6 text-center">No recent prescription data available.</p>
            )}

            {/* Historical Visits as Dropdowns */}
            {previousVisits.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Previous Prescriptions:</h4>
                {/* Removed max-h and overflow from this container */}
                <div className="space-y-3 p-2 bg-blue-50 rounded-lg border border-blue-100 shadow-inner">
                  {previousVisits.map((visit, index) => {
                    // Unique ID for each historical visit dropdown
                    const uniqueVisitId = `${patient.id}-${visit.date}-${index}`; 
                    const isOpen = openHistoricalVisitId === uniqueVisitId;
                    return (
                      <div key={uniqueVisitId} className="bg-blue-100 rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                        <button
                          onClick={() => toggleHistoricalVisit(patient.id, visit.date, index)}
                          className="w-full text-left p-3 bg-blue-200 hover:bg-blue-300 transition-colors duration-200 ease-in-out rounded-t-lg text-blue-800 font-semibold flex justify-between items-center cursor-pointer"
                        >
                          <span className="text-base">Prescription Date: {visit.date}</span>
                          <span>
                            {isOpen ? (
                              <i className="fas fa-chevron-up text-green-600"></i>
                            ) : (
                              <i className="fas fa-chevron-down text-green-600"></i>
                            )}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="p-4 text-gray-700 border-t border-blue-200 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                            {renderVisitContent(visit)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );
      } // End pharmacist case
      default:
        return <p className="text-red-400 text-center">No specific data available for this role.</p>;
    }
  };

  return (
    <div className="p-6 bg-blue-50 text-gray-800 rounded-xl shadow-2xl min-h-[80vh] flex flex-col font-sans">
      <h2 className="text-4xl font-extrabold text-center mb-8 text-blue-800">
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
      </h2>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search patients by name..."
          className="w-full p-4 bg-white border border-blue-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPatients && filteredPatients.length > 0 ? (
        <div className="space-y-6 flex-grow">
          {filteredPatients.map((patient: PatientDetail) => (
            <div key={patient.id} className="bg-white rounded-xl overflow-hidden border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
              <button
                onClick={() => togglePatientDetails(patient.id)}
                className="w-full text-left p-5 bg-blue-100 hover:bg-blue-200 transition-colors duration-200 ease-in-out rounded-t-xl text-blue-800 font-bold flex justify-between items-center cursor-pointer text-xl"
              >
                <span className="flex items-center">
                  <i className="fas fa-user-circle mr-3 text-blue-600"></i> {/* User icon */}
                  {patient.name}
                </span>
                <span>
                  {openPatientId === patient.id ? (
                    <i className="fas fa-chevron-up text-blue-600"></i>
                  ) : (
                    <i className="fas fa-chevron-down text-blue-600"></i>
                  )}
                </span>
              </button>

              {openPatientId === patient.id && (
                <div className="p-6 text-gray-800 border-t border-blue-100 max-h-[500px] overflow-y-auto custom-scrollbar bg-blue-50 animate-fade-in">
                   {renderPatientSpecificData(patient)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center text-xl mt-8 p-4 bg-white rounded-lg shadow-inner">
          No patient data available or found for your search.
        </p>
      )}
    </div>
  );
};

export default DashboardPage;
