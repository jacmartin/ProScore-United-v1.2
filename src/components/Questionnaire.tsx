import React, { useState } from 'react';
import { Course } from '../types';
import { COURSES } from '../data/courses';
import { HelpCircle, ChevronRight, CheckCircle, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';

interface QuestionnaireProps {
  onSelectCourse: (course: Course) => void;
  onBackToBifurcation: () => void;
}

export default function Questionnaire({ onSelectCourse, onBackToBifurcation }: QuestionnaireProps) {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState({
    needType: '',     // individual, crew, supervisor
    workType: [] as string[],     // height, excavation, general, heavy-lifting
    format: '',       // virtual, in-person, flexible
    language: 'English'
  });

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const toggleWorkType = (type: string) => {
    setAnswers(prev => {
      const exists = prev.workType.includes(type);
      return {
        ...prev,
        workType: exists 
          ? prev.workType.filter(t => t !== type)
          : [...prev.workType, type]
      };
    });
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({
      needType: '',
      workType: [],
      format: '',
      language: 'English'
    });
  };

  // Get recommendations based on answers
  const getRecommendations = (): { course: Course; matchReason: string; score: number }[] => {
    const list = COURSES.map(course => {
      let score = 0;
      const reasons: string[] = [];

      // Language match
      if (course.language.toLowerCase() === answers.language.toLowerCase()) {
        score += 2;
      }

      // Format match (eLearning vs ILT)
      if (answers.format === 'eLearning' && course.delivery === 'eLearning') {
        score += 3;
        reasons.push('Matches preferred online self-paced learning');
      } else if (answers.format === 'ILT' && course.delivery === 'ILT') {
        score += 3;
        reasons.push('Matches hands-on practical in-person instruction');
      }

      // Need and role match
      if (answers.needType === 'supervisor') {
        if (course.name.toLowerCase().includes('trainer') || course.name.toLowerCase().includes('competent') || course.id.includes('30')) {
          score += 4;
          reasons.push('Highly recommended for safety management and crew supervisors');
        }
      }

      // Work type match
      if (answers.workType.includes('height')) {
        if (course.category === 'Aerial & Lift' || course.name.toLowerCase().includes('fall') || course.name.toLowerCase().includes('mewp') || course.name.toLowerCase().includes('boomlift')) {
          score += 5;
          reasons.push('Key requirement for working safely at heights and operating lifts');
        }
      }
      if (answers.workType.includes('excavation')) {
        if (course.category === 'Earth Moving' || course.name.toLowerCase().includes('excavation') || course.name.toLowerCase().includes('dozer') || course.name.toLowerCase().includes('skid')) {
          score += 5;
          reasons.push('Essential certification for running excavation and earth-moving machinery');
        }
      }
      if (answers.workType.includes('heavy-lifting') || answers.workType.includes('general')) {
        if (course.category === 'Rigging' || course.name.toLowerCase().includes('rigger') || course.name.toLowerCase().includes('forklift')) {
          score += 4;
          reasons.push('Crucial for safe payload rigging and general site logistical transport');
        }
      }

      // Default backup
      if (reasons.length === 0) {
        if (course.pilot) {
          score += 1;
          reasons.push('Official ProScore core pilot training');
        } else {
          reasons.push('Standard professional safety certification');
        }
      }

      return {
        course,
        matchReason: reasons[0] || 'Matches your general safety profile',
        score
      };
    });

    // Sort by score descending and return top 3
    return list.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const recommendations = getRecommendations();

  return (
    <div id="path-c-quiz" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-3xl mx-auto my-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <button 
          onClick={onBackToBifurcation}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
          <Sparkles className="w-3.5 h-3.5" /> PATH C: Recommendation Engine
        </span>
      </div>

      {step <= 4 ? (
        <div>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 font-medium mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Q1: Who is this for */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-950 flex items-center gap-2">
                <HelpCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                Who requires the training and certification?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We accommodate single operators, large construction cohorts, or safety supervisors looking to self-qualify.
              </p>
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {[
                  { id: 'individual', title: 'Just Me (Individual)', desc: 'Looking to add credentials, learn new machine controls, or complete safety courses.' },
                  { id: 'crew', title: 'My Crew / Site Laborers', desc: 'Prepping an entire team for an upcoming project on the job site.' },
                  { id: 'supervisor', title: 'Site Lead / Safety Supervisor', desc: 'Qualifying competent roles or completing advanced industry regulatory requirements.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, needType: opt.id }));
                      handleNextStep();
                    }}
                    className={`flex flex-col text-left p-4 rounded-lg border text-sm transition-all focus:outline-hidden ${
                      answers.needType === opt.id 
                        ? 'border-blue-600 bg-blue-50/50 hover:bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{opt.title}</span>
                    <span className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Q2: Work Types */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                What specific work tasks will be performed?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select all that apply to get a precise bundle of equipment operator controls.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'height', title: 'Working at Heights', desc: 'Boomlifts, scissor lifts, fall protection' },
                  { id: 'excavation', title: 'Earth Moving, Trenching', desc: 'Skid steers, backhoes, excavators' },
                  { id: 'heavy-lifting', title: 'Logistics & Heavy Rigging', desc: 'Telehandlers, forklifts, sling rigging' },
                  { id: 'general', title: 'General Site Safety Orientation', desc: 'OSHA 10, safety foundations' }
                ].map(opt => {
                  const selected = answers.workType.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleWorkType(opt.id)}
                      className={`flex flex-col text-left p-4 rounded-lg border text-sm transition-all focus:outline-hidden ${
                        selected 
                          ? 'border-blue-600 bg-blue-50/40' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-semibold text-gray-900">{opt.title}</span>
                        <input 
                          type="checkbox" 
                          checked={selected} 
                          onChange={() => {}} // handled by click
                          className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none" 
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button 
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={handleNextStep}
                  disabled={answers.workType.length === 0}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Q3: Delivery Format */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                What is your preferred format for the training?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                United Academy offers virtual theory and on-site practical hands-on assessments.
              </p>
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {[
                  { id: 'ILT', title: 'Hands-on In-Person (Instructor-Led + PE)', desc: 'Full certification with practical performance evaluation at our training hub or your on-site lot.' },
                  { id: 'eLearning', title: 'Self-Paced Virtual (eLearning Only)', desc: '100% online safety theory study modules. Perfect for remote onboarding and fast compliance.' },
                  { id: 'Flexible', title: 'Flexible / Hybrid Needs', desc: 'Mix of on-site delivery for operating equipment and online theory for standard safety blocks.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers(prev => ({ ...prev, format: opt.id }));
                      handleNextStep();
                    }}
                    className={`flex flex-col text-left p-4 rounded-lg border text-sm transition-all focus:outline-hidden ${
                      answers.format === opt.id 
                        ? 'border-blue-600 bg-blue-50/50 hover:bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{opt.title}</span>
                    <span className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex pt-4 border-t border-gray-100">
                <button 
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              </div>
            </div>
          )}

          {/* Q4: Language selecting */}
          {step === 4 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="text-blue-500 w-5 h-5 flex-shrink-0" />
                Select preferred instruction language
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We support multi-lingual instruction formats to ensure full field crew comprehension and safety compliance.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {['English', 'Spanish', 'French'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setAnswers(prev => ({ ...prev, language: lang }))}
                    className={`p-4 text-center rounded-lg border text-sm font-semibold transition-all focus:outline-hidden ${
                      answers.language === lang 
                        ? 'border-blue-600 bg-blue-50 text-blue-900' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <div className="flex justify-between pt-6 border-t border-gray-100 mt-4">
                <button 
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={handleNextStep}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  Calculate Recommendations <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="text-center py-2">
            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-950">Your Recommended Operator Path</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-lg mx-auto">
              Our recommendation system has curated the most critical certifications based on your project goals and logistics answers.
            </p>
          </div>

          <div className="space-y-3.5">
            {recommendations.map(({ course, matchReason, score }, idx) => (
              <div 
                key={course.id}
                className={`border rounded-lg p-5 transition-all hover:shadow-xs relative bg-white ${
                  idx === 0 ? 'border-blue-200 ring-2 ring-blue-500/25 ring-offset-0' : 'border-gray-100'
                }`}
              >
                {idx === 0 && (
                  <span className="absolute -top-2.5 right-6 bg-blue-600 text-white font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    PRIMARY FIT
                  </span>
                )}
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div>
                    <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-sm uppercase tracking-wider mb-2">
                      {course.category} • {course.delivery}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-base">{course.name}</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-2xl">{course.description}</p>
                    
                    {/* Reason badge */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/50 px-2.5 py-1 rounded-sm w-fit">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{matchReason}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end min-w-[100px]">
                    <span className="text-lg font-bold text-gray-950">${course.price}</span>
                    <span className="text-xs text-gray-400 mt-0.5">Per seat</span>
                    <span className="text-xs font-mono bg-gray-50 text-gray-600 px-2 py-0.5 rounded-sm mt-3.5">{course.duration}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3.5 mt-5 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Select & Use this Course
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <button
              onClick={resetQuiz}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 py-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={onBackToBifurcation}
              className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
