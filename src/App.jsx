import { useState, useCallback } from "react";
import Header from "./components/Header";
import StepIndicator from "./components/StepIndicator";
import Step1Areas from "./components/Step1Areas";
import Step2Questions from "./components/Step2Questions";
import Step3Results from "./components/Step3Results";
import "./styles/globals.css";

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [profile, setProfile] = useState({ sector: "", tenure: "", team: "", market: "" });
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const handleAreaToggle = useCallback((areaId) => {
    setSelectedAreas((prev) => {
      if (prev.includes(areaId)) return prev.filter((a) => a !== areaId);
      if (prev.length >= 3) return prev;
      return [...prev, areaId];
    });
  }, []);

  const handleProfileChange = useCallback((field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const goToStep2 = useCallback(() => {
    if (selectedAreas.length === 0) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedAreas]);

  const goToStep1 = useCallback(() => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleResultsReady = useCallback((resultsData) => {
    setResults(resultsData);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="app-root">
      <Header />
      <StepIndicator current={step} />
      <main>
        {step === 1 && (
          <Step1Areas selectedAreas={selectedAreas} onToggle={handleAreaToggle} onNext={goToStep2} />
        )}
        {step === 2 && (
          <Step2Questions
            selectedAreas={selectedAreas}
            profile={profile}
            answers={answers}
            onProfileChange={handleProfileChange}
            onAnswerChange={handleAnswerChange}
            onBack={goToStep1}
            onResultsReady={handleResultsReady}
          />
        )}
        {step === 3 && results && (
          <Step3Results
            results={results}
            selectedAreas={selectedAreas}
            profile={profile}
            onRestart={() => {
              setStep(1); setSelectedAreas([]); setProfile({ sector: "", tenure: "", team: "", market: "" });
              setAnswers({}); setResults(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </main>
      <footer className="app-footer">
        <p><strong>WorkeaCenter</strong> · Sortis Business Tower, Obarrio, Ciudad de Panamá</p>
        <p><a href="https://workeacenter.com" target="_blank" rel="noopener noreferrer">workeacenter.com</a> · info@workeacenter.com · +507 6832 2442</p>
        <small>WorkeaCheck™ · Diagnóstico anónimo · Los datos se usan únicamente para mejorar los servicios de WorkeaCenter.</small>
      </footer>
    </div>
  );
}
