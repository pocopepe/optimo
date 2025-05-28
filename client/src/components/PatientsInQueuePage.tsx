import React, { useState, useEffect, useCallback } from 'react';
import type { PatientDetail, Medication, FullVisit, PharmacistVisit, DoctorNursePatientData } from '../types';

const initialMockQueueIds: number[] = [101, 103, 201];

interface PatientsInQueuePageProps {
  navigate: (href: string) => void;
  userRole: 'doctor' | 'nurse';
  patientData: PatientDetail[];
}

const PatientsInQueuePage: React.FC<PatientsInQueuePageProps> = ({ navigate, patientData }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientDetail | null>(null);
  const [currentSymptoms, setCurrentSymptoms] = useState<string>('');
  const [currentCondition, setCurrentCondition] = useState<string>('');
  const [currentPrescriptionName, setCurrentPrescriptionName] = useState<string>('');
  const [currentPrescriptionQuantity, setCurrentPrescriptionQuantity] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showEndConversationConfirm, setShowEndConversationConfirm] = useState<boolean>(false);
  const [queueIds, setQueueIds] = useState<number[]>(initialMockQueueIds);
  const [prevSelectedPatientId, setPrevSelectedPatientId] = useState<number | null>(null);

  const patientsInQueue = patientData.filter(patient => queueIds.includes(patient.id));

  useEffect(() => {
    if (selectedPatientId !== prevSelectedPatientId) {
      setCurrentSymptoms('');
      setCurrentCondition('');
      setCurrentPrescriptionName('');
      setCurrentPrescriptionQuantity('');
      setSaveMessage(null);
      setPrevSelectedPatientId(selectedPatientId);
    }

    if (selectedPatientId !== null) {
      const patient = patientsInQueue.find(p => p.id === selectedPatientId);
      setSelectedPatientDetails(patient || null);
    } else {
      setSelectedPatientDetails(null);
    }
  }, [selectedPatientId, patientsInQueue, prevSelectedPatientId]);

  useEffect(() => {
    console.log("Current Queue IDs:", queueIds);
  }, [queueIds]);

  const handleSelectPatient = (id: number) => {
    setSelectedPatientId(id);
  };

  const handleEndConversation = useCallback(() => {
    setShowEndConversationConfirm(true);
  }, []);

  const confirmEndConversation = useCallback(() => {
    if (selectedPatientId !== null) {
      setQueueIds(prevQueueIds => prevQueueIds.filter(id => id !== selectedPatientId));
    }
    setSelectedPatientId(null);
    setSelectedPatientDetails(null);
    setSaveMessage(null);
    setShowEndConversationConfirm(false);
  }, [selectedPatientId]);

  const cancelEndConversation = useCallback(() => {
    setShowEndConversationConfirm(false);
  }, []);

  const handleSaveVisit = useCallback(async () => {
    if (!selectedPatientDetails) {
      setSaveMessage('Error: No patient selected.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const newMedication: Medication[] = [];
    if (currentPrescriptionName && currentPrescriptionQuantity) {
      newMedication.push({ name: currentPrescriptionName, quantity: currentPrescriptionQuantity });
    }

    const newVisitData: FullVisit = {
      date: new Date().toISOString().split('T')[0],
      symptoms: currentSymptoms.split(',').map(s => s.trim()).filter(s => s),
      condition: currentCondition,
      medication: newMedication,
    };

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setSaveMessage('Error: Authentication token not found. Please log in again.');
        setIsSaving(false);
        navigate('/admin');
        return;
      }

      const response = await fetch(`https://server.avijusanjai.workers.dev/patients/${selectedPatientDetails.id}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newVisitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save visit.');
      }

      const result = await response.json();
      setSaveMessage('Visit saved successfully!');
      setSelectedPatientDetails(result.patient);
      setCurrentSymptoms('');
      setCurrentCondition('');
      setCurrentPrescriptionName('');
      setCurrentPrescriptionQuantity('');

    } catch (error: any) {
      console.error("Error saving visit:", error);
      setSaveMessage(`Error saving visit: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [selectedPatientDetails, currentSymptoms, currentCondition, currentPrescriptionName, currentPrescriptionQuantity, navigate]);

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

  const isFullVisit = (visit: FullVisit | PharmacistVisit): visit is FullVisit => {
    return 'symptoms' in visit && 'condition' in visit;
  };

  const renderPatientDetailsSection = (patient: PatientDetail) => {
    const latestVisit = patient.visitHistory && patient.visitHistory.length > 0
      ? patient.visitHistory[patient.visitHistory.length - 1]
      : null;

    const previousVisits = patient.visitHistory ? patient.visitHistory.slice(0, -1).reverse() : [];

    return (
      <div key={patient.id} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 border-b border-blue-200 pb-4">
          <img
            src={patient.image}
            alt={patient.name}
            className="w-28 h-28 rounded-full sm:rounded-lg mb-4 sm:mb-0 sm:mr-6 object-cover border-4 border-blue-400 shadow-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-extrabold text-3xl text-blue-800 mb-1 leading-tight">{patient.name}</h3>
            <p className="text-lg text-gray-700"><strong>Age:</strong> {patient.age}</p>
            <p className="text-lg text-gray-700"><strong>ID:</strong> {patient.id}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2">Current Status:</h4>
          {latestVisit ? (
            <>
              <p className="text-base text-gray-700"><strong>Last Visit Date:</strong> {latestVisit.date}</p>
              {isFullVisit(latestVisit) && (
                <>
                  <div>
                    <p className="text-base font-semibold text-gray-700 mb-1">Symptoms:</p>
                    <p className="text-gray-600 ml-4">{latestVisit.symptoms.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-700 mb-1">Condition:</p>
                    <p className="text-gray-600 ml-4">{latestVisit.condition || 'N/A'}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-base font-semibold text-gray-700 mb-1">Medication:</p>
                {renderMedications(latestVisit.medication || [])}
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">No current visit data available.</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6 border-t border-blue-200 pt-6 mt-6">
          {previousVisits.length > 0 && (
            <div className="lg:w-1/2 mb-6 lg:mb-0 flex flex-col"> {/* Removed justify-between */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">Past Visit History:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar p-2 bg-blue-50 rounded-lg border border-blue-100 shadow-inner">
                  {previousVisits.map((visit, index) => (
                    <div key={index} className="bg-blue-100 p-3 rounded-md border border-blue-200 shadow-sm">
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {visit.date}</p>
                      {isFullVisit(visit) && (
                        <>
                          <p className="text-sm text-gray-700"><strong>Symptoms:</strong> {visit.symptoms.join(', ') || 'N/A'}</p>
                          <p className="text-sm text-gray-700"><strong>Condition:</strong> {visit.condition || 'N/A'}</p>
                        </>
                      )}
                      <p className="text-sm text-gray-700"><strong>Medication:</strong></p>
                      {renderMedications(visit.medication || [])}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleEndConversation}
                className="mt-4 w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md"
                title="End the current consultation"
              >
                End Conversation
              </button>
            </div>
          )}

          <div className={`lg:w-1/2 ${previousVisits.length > 0 ? '' : 'w-full'}`}>
            <h4 className="text-xl font-bold text-gray-800 mb-3">New Visit Details:</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="symptoms" className="block text-gray-700 text-sm font-medium mb-1">Symptoms of Current Visit:</label>
                <textarea
                  id="symptoms"
                  className="w-full p-2 bg-white border border-blue-200 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows={3}
                  value={currentSymptoms}
                  onChange={(e) => setCurrentSymptoms(e.target.value)}
                  placeholder="e.g., persistent cough, fatigue, shortness of breath"
                ></textarea>
              </div>
              <div>
                <label htmlFor="condition" className="block text-gray-700 text-sm font-medium mb-1">Diagnosis/Condition:</label>
                <input
                  type="text"
                  id="condition"
                  className="w-full p-2 bg-white border border-blue-200 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  placeholder="e.g., Acute Bronchitis"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <label htmlFor="prescriptionName" className="block text-gray-700 text-sm font-medium mb-1">Prescription Name:</label>
                  <input
                    type="text"
                    id="prescriptionName"
                    className="w-full p-2 bg-white border border-blue-200 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={currentPrescriptionName}
                    onChange={(e) => setCurrentPrescriptionName(e.target.value)}
                    placeholder="e.g., Amoxicillin"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="prescriptionQuantity" className="block text-gray-700 text-sm font-medium mb-1">Quantity:</label>
                  <input
                    type="text"
                    id="prescriptionQuantity"
                    className="w-full p-2 bg-white border border-blue-200 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={currentPrescriptionQuantity}
                    onChange={(e) => setCurrentPrescriptionQuantity(e.target.value)}
                    placeholder="e.g., 250mg, 1 tablet daily"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveVisit}
                disabled={isSaving || (!currentSymptoms && !currentCondition && !currentPrescriptionName && !currentPrescriptionQuantity)}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSaving ? 'Saving...' : 'Save New Visit'}
              </button>
              {saveMessage && <p className="text-center text-sm mt-2 text-green-600">{saveMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-blue-50 text-gray-800 rounded-xl shadow-2xl min-h-[calc(100vh-160px)] flex flex-col sm:flex-row">
      <div className="w-full sm:w-1/4 pr-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-blue-200 pb-4 sm:pb-0 mb-6 sm:mb-0">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Queue ({patientsInQueue.length})</h2>
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar p-1">
          {patientsInQueue.length > 0 ? (
            patientsInQueue.map(patient => {
              const patientAsDoctorNurse = patient as DoctorNursePatientData;
              const latestVisitForQueue = patientAsDoctorNurse.visitHistory?.[patientAsDoctorNurse.visitHistory.length - 1];

              return (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ease-in-out
                              ${selectedPatientId === patient.id ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-blue-100 text-gray-800 hover:bg-blue-50 hover:border-blue-200'}`}
                >
                  <p className="font-semibold text-lg">{patient.name}</p>
                  <p className="text-sm text-gray-600">Age: {patient.age}</p>
                  {latestVisitForQueue && latestVisitForQueue.condition && (
                    <p className="text-sm text-gray-600">Condition: {latestVisitForQueue.condition || 'N/A'}</p>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-gray-500 italic">No patients in queue.</p>
          )}
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold transition-colors duration-200 shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="w-full sm:w-3/4 pl-0 sm:pl-6 pt-6 sm:pt-0">
        {selectedPatientId ? (
          <>
            <div className="mb-6 bg-blue-100 rounded-xl overflow-hidden shadow-xl border border-blue-200 aspect-video flex items-center justify-center relative">
              <div className="absolute top-4 right-4 w-32 h-24 bg-blue-200 rounded-lg border border-blue-300 overflow-hidden shadow-md">
                <video src="" autoPlay muted className="w-full h-full object-cover"></video>
                <span className="absolute bottom-1 right-1 text-xs text-blue-800 bg-blue-300 px-1 py-0.5 rounded">You</span>
              </div>
              <video src="" autoPlay className="w-full h-full object-cover"></video>
              <div className="absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-75 text-white text-xl font-bold">
                {selectedPatientDetails ? `Connecting with ${selectedPatientDetails.name}...` : 'Establishing Connection...'}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
                <button className="p-3 bg-gray-600 hover:bg-gray-700 rounded-full text-white text-lg transition-colors shadow-lg" title="Mute Mic">
                  <i className="fas fa-microphone"></i>
                </button>
              </div>
            </div>

            {selectedPatientDetails ? (
              renderPatientDetailsSection(selectedPatientDetails)
            ) : (
              <div className="p-6 text-center text-gray-500">Loading patient details...</div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-xl font-medium bg-blue-100 rounded-xl shadow-lg border border-blue-200 p-6">
            Select a patient from the queue to start a consultation.
          </div>
        )}
      </div>

      {showEndConversationConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">End Conversation?</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to end the conversation with {selectedPatientDetails?.name || 'this patient'}?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmEndConversation}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md"
              >
                End Call
              </button>
              <button
                onClick={cancelEndConversation}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition-colors duration-200 shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsInQueuePage;
