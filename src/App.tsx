import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Search, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Copy, 
  Mail, 
  Plus, 
  Check, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  FolderSync, 
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';

import { Course, TrainingRequest, AvailableDate } from './types';
import { COURSES, INITIAL_AVAILABLE_DATES, DEFAULT_REQUESTS } from './data/courses';
import { COMM_TEMPLATES, getRenderedTemplate } from './data/templates';
import Questionnaire from './components/Questionnaire';

export default function App() {
  // Navigation & View Toggles
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<'marketplace' | 'backoffice'>('marketplace');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Client Marketplace State
  const [clientPath, setClientPath] = useState<'home' | 'catalog' | 'form-b' | 'questionnaire' | 'success'>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('All');
  const [catalogDeliveryFilter, setCatalogDeliveryFilter] = useState<string>('All');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [pilotOnly, setPilotOnly] = useState<boolean>(true); // Default to showcasing pilot launch courses

  // Questionnaire selection callback
  const handleSelectCourseFromQuiz = (course: Course) => {
    setSelectedCourse(course);
    // Find the next available date or default to custom preference
    const firstDate = availableDates.find(d => d.courseId === course.id);
    setSelectedDate(firstDate ? firstDate.date : '');
    setClientPath('catalog');
    
    // Smooth scroll down to course details
    setTimeout(() => {
      const el = document.getElementById('course-details-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Shared Data States (Using LocalStorage for durable client-side simulator experience)
  const [requests, setRequests] = useState<TrainingRequest[]>(() => {
    const saved = localStorage.getItem('ps_ur_requests');
    return saved ? JSON.parse(saved) : DEFAULT_REQUESTS;
  });

  const [availableDates, setAvailableDates] = useState<AvailableDate[]>(() => {
    const saved = localStorage.getItem('ps_ur_avail_dates');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABLE_DATES;
  });

  useEffect(() => {
    localStorage.setItem('ps_ur_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('ps_ur_avail_dates', JSON.stringify(availableDates));
  }, [availableDates]);

  // Client Intake Form State (Single multi-purpose form requested by the team)
  const [intakeForm, setIntakeForm] = useState({
    companyName: '',
    courseId: '',
    deliveryType: 'ILT' as 'eLearning' | 'ILT' | 'On-Site Crew',
    headcount: 1,
    datePreference: '',
    location: '',
    locationType: 'Facility' as 'Facility' | 'On-Site',
    billingContactName: '',
    billingContactEmail: '',
    billingContactPhone: '',
    participantsRaw: '', // comma separated or newline separated names
    notes: '',
    markupPercent: 15
  });

  // Prefill intake form when selecting a course
  useEffect(() => {
    if (selectedCourse) {
      setIntakeForm(prev => ({
        ...prev,
        courseId: selectedCourse.id,
        deliveryType: selectedCourse.delivery === 'ILT' ? 'ILT' : 'eLearning',
        datePreference: selectedDate,
        locationType: selectedCourse.delivery === 'ILT' ? 'Facility' : 'Facility',
        location: selectedCourse.delivery === 'ILT' 
          ? (availableDates.find(d => d.courseId === selectedCourse.id && d.date === selectedDate)?.location || 'United Academy Regional Training Facility')
          : 'Self-Paced Virtual Portal (eLearning)'
      }));
    }
  }, [selectedCourse, selectedDate, availableDates]);

  // Handle client-side registration submit
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.companyName || !intakeForm.courseId || !intakeForm.billingContactEmail) {
      alert('Please fill out all required fields (Company name, course selection, and billing email).');
      return;
    }

    const course = COURSES.find(c => c.id === intakeForm.courseId);
    if (!course) return;

    const participantList = intakeForm.participantsRaw
      ? intakeForm.participantsRaw.split(/[\n,]+/).map(p => p.trim()).filter(p => p.length > 0)
      : ['To be provided before catalog verification'];

    const newRequest: TrainingRequest = {
      id: `req-${Math.floor(100 + Math.random() * 900)}`,
      companyName: intakeForm.companyName,
      courseId: course.id,
      courseName: course.name,
      coursePrice: course.price,
      deliveryType: intakeForm.deliveryType,
      headcount: Math.max(1, intakeForm.headcount),
      datePreference: intakeForm.datePreference || 'To be selected with coordinator',
      location: intakeForm.location || 'Pending Manual Verification',
      locationType: intakeForm.locationType,
      billingContact: {
        name: intakeForm.billingContactName || 'Accounts Payable',
        email: intakeForm.billingContactEmail,
        phone: intakeForm.billingContactPhone || '(555) 000-0000'
      },
      participants: participantList,
      status: 'Inquiry',
      markupPercent: intakeForm.markupPercent,
      createdAt: new Date().toISOString(),
      notes: intakeForm.notes,
      timeline: [
        {
          status: 'Inquiry',
          timestamp: new Date().toISOString(),
          message: `Inquiry submitted via ProScore web intake form. Requested format: ${intakeForm.deliveryType}.`
        },
        {
          status: 'Inquiry',
          timestamp: new Date().toISOString(),
          message: 'Intake confirmation pending manual coordinator review.'
        }
      ]
    };

    setRequests(prev => [newRequest, ...prev]);
    
    // Clear selections and show success
    setClientPath('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset intake form for new submissions
  const resetIntakeForm = () => {
    setIntakeForm({
      companyName: '',
      courseId: '',
      deliveryType: 'ILT',
      headcount: 1,
      datePreference: '',
      location: '',
      locationType: 'Facility',
      billingContactName: '',
      billingContactEmail: '',
      billingContactPhone: '',
      participantsRaw: '',
      notes: '',
      markupPercent: 15
    });
    setSelectedCourse(null);
    setSelectedDate('');
  };

  // Back Office Admin State
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(requests[0] || null);
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('All');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  
  // Simulated email viewer state inside back-office
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('client-confirm');
  const [customDatesInput, setCustomDatesInput] = useState({
    courseId: 'skid-steer-ilt',
    date: '2026-07-15',
    location: 'United Academy Training Yard, Orlando FL',
    capacity: 12
  });

  // Calculate administrative reporting statistics
  const markupTotal = requests.reduce((acc, req) => {
    // Only calculate gross revenue and profit based on headcount and prices
    const cost = req.coursePrice * req.headcount;
    const markup = cost * (req.markupPercent / 100);
    return acc + markup;
  }, 0);

  const revenueTotal = requests.reduce((acc, req) => {
    const cost = req.coursePrice * req.headcount;
    return acc + cost * (1 + req.markupPercent / 100);
  }, 0);

  const totalRegisteredWorkers = requests.reduce((acc, req) => acc + req.headcount, 0);
  const completedTrainingsCount = requests.filter(r => ['Completed', 'Certified', 'Billed', 'Paid'].includes(r.status)).length;

  // Most requested course titles
  const courseDemandMap = requests.reduce((acc: { [key: string]: number }, req) => {
    acc[req.courseName] = (acc[req.courseName] || 0) + req.headcount;
    return acc;
  }, {});

  const sortedCourseDemands = (Object.entries(courseDemandMap) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Handle request status manual transitions
  const updateRequestStatus = (reqId: string, newStatus: TrainingRequest['status']) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const message = getStatusMessage(newStatus);
        return {
          ...req,
          status: newStatus,
          timeline: [
            ...req.timeline,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              message: message
            }
          ]
        };
      }
      return req;
    }));
    
    // Sync current select request detail panel
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
          timeline: [
            ...prev.timeline,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              message: getStatusMessage(newStatus)
            }
          ]
        };
      });
    }
  };

  const getStatusMessage = (status: TrainingRequest['status']): string => {
    switch (status) {
      case 'Inquiry': return 'Intake verified. Awaiting coordination confirmation.';
      case 'Scheduled': return 'Scheduled on the shared calendar and seat allocation locked with United Rentals.';
      case 'Completed': return 'Class session marked completed by the instructor. Attendance records archived.';
      case 'Certified': return 'Standardized ProScore certificate issued and dispatched to operators.';
      case 'Billed': return 'ProScore billing invoice compiled and triggered to Accounts Payable.';
      case 'Paid': return 'Payment processed and verified. Transaction records closed.';
      default: return 'Status updated.';
    }
  };

  // Handle admin adding a new manual date received from United Rentals
  const handleAddManualURDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDatesInput.date) return;
    const course = COURSES.find(c => c.id === customDatesInput.courseId);
    if (!course) return;

    const newDate: AvailableDate = {
      id: `ad-${Date.now()}`,
      courseId: course.id,
      date: customDatesInput.date,
      maxCapacity: customDatesInput.capacity,
      enrolled: 0,
      location: customDatesInput.location
    };

    setAvailableDates(prev => [...prev, newDate]);
    alert(`Successfully posted new available training date for: ${course.name}`);
  };

  // Helper to copy text to clipboard
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  // Course filter logic
  const filteredCourses = COURSES.filter(course => {
    const matchesCategory = catalogCategoryFilter === 'All' || course.category === catalogCategoryFilter;
    const matchesDelivery = catalogDeliveryFilter === 'All' || course.delivery === catalogDeliveryFilter;
    const matchesPilot = !pilotOnly || course.pilot;
    const matchesSearch = course.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          course.description.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCategory && matchesDelivery && matchesPilot && matchesSearch;
  });

  // Admin filter logic
  const filteredAdminRequests = requests.filter(req => {
    const matchesSearch = req.companyName.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          req.courseName.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          req.id.includes(adminSearch);
    const matchesStatus = adminStatusFilter === 'All' || req.status === adminStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* GLOBAL CO-BRANDED PORTAL HEADER */}
      <nav id="navbar" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div 
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => { setClientPath('home'); setCurrentTab('marketplace'); }}
              >
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white text-base">P</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black tracking-tight text-base sm:text-lg text-white">PROSCORE</span>
                  <span className="text-slate-600 font-bold">×</span>
                  <span className="font-display font-extrabold text-[11px] sm:text-xs text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15">United Rentals</span>
                </div>
              </div>
              <div className="h-4 w-[1px] bg-slate-800 mx-4 hidden sm:block"></div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-orange-400">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="underline underline-offset-4 decoration-2">Operations Hub</span>
              </div>
            </div>

            {/* View switcher & menu toggle */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => { setCurrentTab('marketplace'); setClientPath('home'); }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg tracking-wide transition-all ${
                  currentTab === 'marketplace'
                    ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Client Marketplace View
              </button>
              <button
                onClick={() => { setCurrentTab('backoffice'); setSelectedRequest(requests[0] || null); }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg tracking-wide transition-all flex items-center gap-2 ${
                  currentTab === 'backoffice'
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>ProScore Logistics Console</span>
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {requests.filter(r => r.status === 'Inquiry').length}
                </span>
              </button>
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-800 bg-slate-900"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => { setCurrentTab('marketplace'); setClientPath('home'); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                    currentTab === 'marketplace' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Client Marketplace View
                </button>
                <button
                  onClick={() => { setCurrentTab('backoffice'); setMobileMenuOpen(false); setSelectedRequest(requests[0] || null); }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center justify-between ${
                    currentTab === 'backoffice' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> Logistics Console
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {requests.filter(r => r.status === 'Inquiry').length}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* CORE LAYOUT ROUTER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* VIEW 1: CLIENT MARKETPLACE */}
        {currentTab === 'marketplace' && (
          <div>
            {/* HERO PROMOTION GRID */}            {clientPath === 'home' && (
              <div className="space-y-10">
                {/* HERO PROMOTION HEADER */}
                <div className="text-center max-w-3xl mx-auto space-y-4 py-6 md:py-10">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider border border-orange-200/50">
                    <Sparkles className="w-3.5 h-3.5" /> Core Partner Ecosystem Launch
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
                    Scale Your Workforce with Certified <span className="text-blue-600">Equipment Training</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
                    ProScore offers industry-learning operator certification through our joint safety fulfillment partnership with United Rentals. Lock in rolling regional dates or trigger heavy certified instructors live to your construction site.
                  </p>
                </div>

                {/* THE PORTAL BENTO GRID (Paths A/B/C + Live Metrics Stats) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* PATH SELECTION (Trifurcation) - Spans 2 columns */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-5">
                      <div className="space-y-0.5">
                        <h2 className="text-lg font-display font-bold text-slate-900">Training Entry Points</h2>
                        <p className="text-xs text-slate-450 font-medium">Select your contractor intake channel below</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-1 bg-orange-50 text-orange-700 rounded-sm border border-orange-200/40 uppercase tracking-widest">INTAKE SYSTEM</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grow">
                      {/* Path A */}
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex flex-col justify-between hover:ring-2 hover:ring-blue-550/10 transition-all hover:bg-white group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-sm uppercase">PATH A</span>
                            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                          </div>
                          <h3 className="font-display font-bold text-slate-800 text-sm">Individual Learner</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Secure individual in-person or eLearning seats in regional training yards at pre-scheduled, rolling dates.
                          </p>
                        </div>
                        <button 
                          onClick={() => { setClientPath('catalog'); setSelectedCourse(null); }}
                          className="mt-5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Browse Catalog
                        </button>
                      </div>

                      {/* Path B */}
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex flex-col justify-between hover:ring-2 hover:ring-orange-550/10 transition-all hover:bg-white group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-sm uppercase">PATH B</span>
                            <MapPin className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                          </div>
                          <h3 className="font-display font-bold text-slate-800 text-sm">Compliance Fleet</h3>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Request customized, instructor-led operator training for your entire crew delivered directly on your active job site location.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            resetIntakeForm();
                            setIntakeForm(prev => ({ 
                              ...prev, 
                              deliveryType: 'On-Site Crew', 
                              locationType: 'On-Site',
                              courseId: COURSES[0].id
                            }));
                            setClientPath('form-b');
                          }}
                          className="mt-5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Request On-Site
                        </button>
                      </div>

                      {/* Path C (New Advisor) */}
                      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/60 flex flex-col justify-between ring-2 ring-blue-500/20 hover:ring-blue-505/40 transition-all group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono font-extrabold text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded-sm uppercase">PATH C: DIAGNOSTIC</span>
                            <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          </div>
                          <h3 className="font-display font-bold text-blue-900 text-sm">Interactive Advisor</h3>
                          <p className="text-xs text-blue-700 leading-relaxed italic font-medium">
                            "Answer a few quick questions, and we'll recommend the best training for your goals in under 1 minute."
                          </p>
                        </div>
                        <button 
                          onClick={() => setClientPath('questionnaire')}
                          className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Advisor Questionnaire
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BUSINESS VALUE STATS (Reporting metrics) */}
                  <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-sm border border-slate-800/80">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <span className="text-xs font-display font-medium tracking-wider text-slate-400 uppercase">Live Intake Metrics</span>
                      <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-[10px] font-mono font-bold text-green-400">SYNCED</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-7 gap-x-4 my-6">
                      <div className="space-y-0.5">
                        <p className="text-2xl sm:text-3xl font-display font-black text-white">${Math.round(revenueTotal).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Total Revenue</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-2xl sm:text-3xl font-display font-black text-blue-400">15%</p>
                        <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Proscore Markup</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-2xl sm:text-3xl font-display font-black text-white">{totalRegisteredWorkers}</p>
                        <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Cohorts Seats</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-2xl sm:text-3xl font-display font-black text-orange-400">{completedTrainingsCount}</p>
                        <p className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Completed Classes</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>API: MANUAL PASS</span>
                      <span>SECURE TRANSACTIONAL</span>
                    </div>
                  </div>

                </div>

                {/* PILOT TRAINING PROMOTION CAROUSEL */}
                <div className="space-y-6 pt-4">
                  <div className="border-b border-slate-200/60 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900">Featured Pilot Launch Courses</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Start high-comprehension operator pathways with our core certified cohort subset.</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-sm border border-blue-100">4 ACTIVE PILOTS</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {COURSES.filter(c => c.pilot).map(course => (
                      <div 
                        key={course.id}
                        className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md hover:border-orange-500 transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedCourse(course);
                          const dates = availableDates.filter(d => d.courseId === course.id);
                          setSelectedDate(dates[0] ? dates[0].date : '');
                          setClientPath('catalog');
                        }}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-sm uppercase">
                              {course.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{course.duration}</span>
                          </div>
                          
                          <h4 className="font-display font-bold text-slate-900 text-base mt-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{course.name}</h4>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed font-medium">{course.description}</p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-105 flex items-center justify-between">
                          <span className="text-base font-display font-extrabold text-slate-905">${course.price} <span className="text-[10px] text-slate-400 font-normal">/seat</span></span>
                          <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm">
                            Get Seats
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PATH C QUESTIONNAIRE CONTAINER */}
            {clientPath === 'questionnaire' && (
              <Questionnaire 
                onSelectCourse={handleSelectCourseFromQuiz} 
                onBackToBifurcation={() => setClientPath('home')} 
              />
            )}

            {/* BROWSE CATALOG VIEW (With details & date picker) */}
            {clientPath === 'catalog' && (
              <div className="space-y-8 font-sans">
                {/* Back Link */}
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => { setClientPath('home'); setSelectedCourse(null); }}
                    className="text-slate-500 hover:text-slate-900 text-sm font-bold flex items-center gap-1.5 tracking-tight transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Pathways</span>
                  </button>
                  <span className="text-xs text-slate-400 font-mono tracking-wider font-bold">ProScore Joint Fulfillment System</span>
                </div>

                {/* FILTER CONTROLS */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search certified forklift, lift operator, OSHA compliance standard items..." 
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 placeholder:text-slate-400 bg-slate-50/50"
                      />
                    </div>
                    {/* Switch between Pilot only or All courses */}
                    <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
                      <button
                        onClick={() => setPilotOnly(true)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          pilotOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Pilot Courses Only
                      </button>
                      <button
                        onClick={() => setPilotOnly(false)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          !pilotOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Full UR Catalog
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center pt-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-2">Category:</span>
                    {['All', 'Safety & OSHA', 'Aerial & Lift', 'Earth Moving', 'Rigging', 'Other'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCatalogCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                          catalogCategoryFilter === cat 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}

                    <div className="w-[1px] h-4 bg-slate-200 mx-2 hidden lg:block"></div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-2 hidden lg:inline">Format:</span>
                    {['All', 'ILT', 'eLearning'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setCatalogDeliveryFilter(mode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                          catalogDeliveryFilter === mode 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        {mode === 'All' ? 'All Formats' : mode === 'ILT' ? 'ILT (Practical evaluation)' : 'Online eLearning'}
                      </button>
                    ))}
                  </div>
                </div>
                {/* THE GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT: RESULTS LIST */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-display font-extrabold text-slate-900 text-lg flex items-center justify-between">
                      <span>Available Catalog Options ({filteredCourses.length})</span>
                      {pilotOnly && (
                        <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200 font-bold uppercase tracking-wider animate-pulse">Pilot Selection</span>
                      )}
                    </h3>

                    {filteredCourses.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                        <h4 className="font-display font-bold text-slate-900">No matching training found</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Try toggling to "Full UR Catalog" or adjusting search constraints.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredCourses.map(course => {
                          const isSelected = selectedCourse?.id === course.id;
                          return (
                            <div 
                              key={course.id}
                              onClick={() => {
                                setSelectedCourse(course);
                                const dates = availableDates.filter(d => d.courseId === course.id);
                                setSelectedDate(dates[0] ? dates[0].date : '');
                              }}
                              className={`bg-white rounded-2xl p-5 border text-left cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-orange-500 ring-2 ring-orange-500/10' 
                                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-sm uppercase tracking-wide">
                                  {course.category}
                                </span>
                                {course.pilot && (
                                  <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-sm uppercase">Pilot</span>
                                )}
                              </div>
                              <h4 className="font-display font-bold text-slate-900 text-sm mt-3 line-clamp-2 leading-snug">{course.name}</h4>
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed font-medium">{course.description}</p>
                              
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                <span className="font-mono text-[10px]">{course.delivery} • {course.duration}</span>
                                <span className="text-sm font-display font-extrabold text-slate-900">${course.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: COURSE CALENDAR & DETAIL INSPECTOR BLOCK */}
                  <div className="space-y-6">
                    {selectedCourse ? (
                      <div id="course-details-section" className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-6">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-900/40 px-2.5 py-1 rounded-sm uppercase tracking-wider">
                            {selectedCourse.category} • {selectedCourse.delivery}
                          </span>
                          <h3 className="font-display font-bold text-white text-lg mt-3 leading-snug">{selectedCourse.name}</h3>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedCourse.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-mono py-2 border-y border-slate-800">
                          <div>
                            <span className="text-slate-550 block text-[10px] uppercase font-bold tracking-wider">Unit Cost:</span>
                            <span className="text-sm font-display font-extrabold text-white">${selectedCourse.price} USD</span>
                          </div>
                          <div>
                            <span className="text-slate-550 block text-[10px] uppercase font-bold tracking-wider">Duration:</span>
                            <span className="text-slate-300 font-bold block mt-0.5">{selectedCourse.duration}</span>
                          </div>
                          <div>
                            <span className="text-slate-550 block text-[10px] uppercase font-bold tracking-wider">Expiration:</span>
                            <span className="text-slate-300 font-bold block mt-0.5">{selectedCourse.expiration}</span>
                          </div>
                          <div>
                            <span className="text-slate-550 block text-[10px] uppercase font-bold tracking-wider">Class Seats:</span>
                            <span className="text-slate-300 font-bold block mt-0.5">Min {selectedCourse.classMin} / Max {selectedCourse.classMax}</span>
                          </div>
                        </div>

                        {/* INTERACTIVE CALENDAR FOR PILOT DATE SELECTION */}
                        {selectedCourse.delivery === 'ILT' ? (
                          <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-orange-500" /> Choose Available Cohort Date:
                            </h4>
                            {availableDates.filter(d => d.courseId === selectedCourse.id).length === 0 ? (
                              <div className="bg-slate-800 rounded-2xl p-4 text-xs text-center border border-dashed border-slate-700 text-slate-400">
                                <span>No rolling facility dates allocated. Use the enrollment form to request your desired date.</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {availableDates.filter(d => d.courseId === selectedCourse.id).map(dateObj => {
                                  let availableSeats = dateObj.maxCapacity - dateObj.enrolled;
                                  return (
                                    <label 
                                      key={dateObj.id}
                                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        selectedDate === dateObj.date 
                                          ? 'bg-orange-500/10 border-orange-500 text-white' 
                                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/85'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <input 
                                          type="radio" 
                                          name="selectedDate" 
                                          checked={selectedDate === dateObj.date}
                                          onChange={() => setSelectedDate(dateObj.date)}
                                          className="text-orange-500 focus:ring-orange-500 pointer-events-auto"
                                        />
                                        <div>
                                          <span className="font-bold text-sm block">{dateObj.date}</span>
                                          <span className="text-[10px] text-slate-400 block max-w-[180px] truncate">{dateObj.location}</span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-mono font-bold bg-slate-700 px-2 py-0.5 rounded text-white">
                                        {availableSeats} left
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 border-dashed">
                            <span className="text-xs text-blue-300 flex items-center gap-1.5 font-bold">
                              <BookOpen className="w-4 h-4 text-blue-400" /> eLearning On-Demand Module
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              This online theory course has no physical location limits. Access credentials are dispatched immediately upon ProScore manual verification.
                            </p>
                          </div>
                        )}

                        {/* SINGLE REGISTRATION INTAKE FORM DISPATCH BUTTON */}
                        <div className="pt-3">
                          <button
                            onClick={() => {
                              // Pre-populate fields
                              setIntakeForm(prev => ({
                                ...prev,
                                courseId: selectedCourse.id,
                                deliveryType: selectedCourse.delivery === 'ILT' ? 'ILT' : 'eLearning',
                                datePreference: selectedDate,
                                locationType: selectedCourse.delivery === 'ILT' ? 'Facility' : 'Facility',
                                location: selectedCourse.delivery === 'ILT' 
                                  ? (availableDates.find(d => d.courseId === selectedCourse.id && d.date === selectedDate)?.location || 'United Academy Training Facility')
                                  : 'Self-Paced Virtual Portal (eLearning)'
                              }));
                              setClientPath('form-b');
                            }}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer uppercase tracking-wider"
                          >
                            <span>Proceed to Registration Form</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <p className="text-[9px] text-slate-500 text-center mt-2 font-mono">
                            Standard Automated ProScore Fulfillment Procedure
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-8 text-center text-slate-405">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="font-display font-bold text-slate-700 text-sm">Detailed Inspect Panel</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Select a safety or equipment course from catalog list to view descriptions, rolling dates, and register.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SINGLE STANDARDIZED REGISTRATION REQUEST FORM (REQUESTED BY TEAM!) */}
            {clientPath === 'form-b' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <button 
                  onClick={() => setClientPath(selectedCourse ? 'catalog' : 'home')}
                  className="text-slate-500 hover:text-slate-900 text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Listings</span>
                </button>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6 font-sans">
                  {/* CO-BRANDED FRAME HEADER */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="text-xl font-display font-bold text-slate-900">Standard Partnership Training Form</h2>
                      <p className="text-xs text-slate-500 mt-1">Intake, tracking, billing triggers, and completion logs consolidated for ProScore clients.</p>
                    </div>
                    {selectedCourse && (
                      <span className="bg-blue-50 text-blue-700 text-xs font-mono font-bold px-3 py-1 rounded-full border border-blue-100">
                        ${selectedCourse.price} Wholesale Cost
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleIntakeSubmit} className="space-y-6">
                    {/* SECTION 1: SELECTED SERVICE INFRASTRUCTURE */}
                    <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/50 space-y-4">
                      <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">1. Selected Course Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Training Program</label>
                          <select 
                            value={intakeForm.courseId} 
                            onChange={(e) => {
                              const c = COURSES.find(v => v.id === e.target.value);
                              if (c) setSelectedCourse(c);
                              setIntakeForm(prev => ({ ...prev, courseId: e.target.value }));
                            }}
                            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden w-full font-semibold focus:ring-2 focus:ring-orange-500/10 cursor-pointer"
                          >
                            <option value="">-- Choose Course --</option>
                            {COURSES.map(c => (
                              <option key={c.id} value={c.id}>{c.name} (${c.price})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Expected Delivery Format</label>
                          <select
                            value={intakeForm.deliveryType}
                            onChange={(e) => {
                              const format = e.target.value as 'eLearning' | 'ILT' | 'On-Site Crew';
                              setIntakeForm(prev => ({ 
                                ...prev, 
                                deliveryType: format,
                                locationType: format === 'On-Site Crew' ? 'On-Site' : 'Facility',
                                location: format === 'eLearning' ? 'Self-Paced eLearning Portal' : prev.location
                              }));
                            }}
                            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden w-full font-semibold focus:ring-2 focus:ring-orange-500/10 cursor-pointer"
                          >
                            <option value="ILT">ILT (In-person at regional United facility)</option>
                            <option value="eLearning">eLearning (Self-paced online module)</option>
                            <option value="On-Site Crew">On-Site Crew (Instructor travels to your site)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: COMPANY PROFILE & HEADCOUNT */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">2. Company & Logistics Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Company Name *</label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                            <input 
                              type="text" 
                              required
                              value={intakeForm.companyName}
                              onChange={(e) => setIntakeForm(prev => ({ ...prev, companyName: e.target.value }))}
                              placeholder="e.g. Apex Renewable Fields"
                              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Billing Contact Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
                            <input 
                              type="email" 
                              required
                              value={intakeForm.billingContactEmail}
                              onChange={(e) => setIntakeForm(prev => ({ ...prev, billingContactEmail: e.target.value }))}
                              placeholder="billing@company.com"
                              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Billing Client Contact Name</label>
                          <input 
                            type="text" 
                            value={intakeForm.billingContactName}
                            onChange={(e) => setIntakeForm(prev => ({ ...prev, billingContactName: e.target.value }))}
                            placeholder="Sarah Jenkins"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Total Headcount Needed *</label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            max="50"
                            value={intakeForm.headcount}
                            onChange={(e) => setIntakeForm(prev => ({ ...prev, headcount: parseInt(e.target.value) || 1 }))}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 font-bold"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">United academy class margins apply.</p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Date Preference</label>
                          <input 
                            type="date"
                            value={intakeForm.datePreference}
                            onChange={(e) => setIntakeForm(prev => ({ ...prev, datePreference: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-hidden font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Preferred Training Location / Project Yard</label>
                          <input 
                            type="text" 
                            value={intakeForm.location}
                            onChange={(e) => setIntakeForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g. 1420 Sunbeam Way, Solar Field Yard Pecos TX"
                            className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: PARTICIPANT LOG DETAILS */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                        <span>3. Operator Cohort Names</span>
                        <span className="text-[10px] text-slate-400 font-normal">Separate with names or commas</span>
                      </h3>
                      <textarea 
                        rows={3}
                        value={intakeForm.participantsRaw}
                        onChange={(e) => setIntakeForm(prev => ({ ...prev, participantsRaw: e.target.value }))}
                        placeholder="John Carter&#10;Raul Gomez&#10;Armando Martinez"
                        className="w-full p-4 border border-slate-200 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 font-mono"
                      ></textarea>
                    </div>

                    {/* SECTION 4: INVOICING MARKUP TRANSPARENCY (ProScore specific dashboard feature) */}
                    <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/65 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">ProScore Operational Markup (Markup Trigger)</h4>
                          <p className="text-[10px] text-slate-500">Auto-configured Standard 15% partner markup applied for ProScore invoice triggers.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">Markup %:</span>
                        <input 
                          type="number"
                          value={intakeForm.markupPercent}
                          onChange={(e) => setIntakeForm(prev => ({ ...prev, markupPercent: parseInt(e.target.value) || 15 }))}
                          className="w-16 bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-center"
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3.5 pt-5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setClientPath('catalog')}
                        className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Submit Intent to Enroll
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SCREEN SUCCESS: CLIENT CONFIRM CONTEXT */}
            {clientPath === 'success' && (
              <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Intent to Enroll is Filed!</h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
                    We have dynamically added your request to ProScore’s master tracking spreadsheet. Our joint coordination operations team is verifying seat availability with United Academy representatives.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 text-left max-w-lg mx-auto space-y-4">
                  <h4 className="font-bold text-slate-900 border-b border-slate-50 pb-2">Operational Next Steps & Reminders:</h4>
                  <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside">
                    <li><strong className="text-slate-800">Coordination Email Request:</strong> Sent dynamically to United Rentals SME (Clint C.).</li>
                    <li><strong className="text-slate-800">Manual Date Verification:</strong> Confirming trainer availability and target yard logistics.</li>
                    <li><strong className="text-slate-800">Participant Calendar Invite:</strong> Issued automatically once seats are allocated.</li>
                    <li><strong className="text-slate-800">Billing Follow-up Invoice:</strong> Emailed with ProScore's standardized markup pre-billing.</li>
                  </ul>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => { resetIntakeForm(); setClientPath('home'); }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-semibold rounded-lg text-sm transition-colors"
                  >
                    Return to Portal Home
                  </button>
                  <button
                    onClick={() => { setSelectedRequest(requests[0] || null); setCurrentTab('backoffice'); }}
                    className="px-5 py-2.5 border border-slate-200 bg-white text-blue-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    View Backoffice Log Sheet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: MASTER BACK-OFFICE TRACKING DASHBOARD (REQUESTED BY TEAM!) */}
        {currentTab === 'backoffice' && (
          <div className="space-y-6 font-sans">
            
            {/* BACKOFFICE WARNING BOX (Manual UR process contextual notice) */}
            <div className="bg-amber-50/50 border border-amber-200/80 p-5 rounded-3xl flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-display font-bold text-sm">Manual Coordination Guideline & API Limit Override Lock:</p>
                <p className="leading-relaxed font-semibold text-slate-700">
                  United Rentals' systems operate inside cybersecurity firewalls which prevent direct API sync. To maintain seamless operation, ProScore automates all custom-facing steps (Intake tracking, reminder queues, template dispatch, calendar updating, and billing triggers) from this console. Use manual actions below to fulfill requests.
                </p>
              </div>
            </div>

            {/* BACK-OFFICE METRICS AND REPORTING BOARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Enrollment Seats</span>
                  <span className="text-2xl font-display font-extrabold text-slate-900">{totalRegisteredWorkers} operators</span>
                  <p className="text-[10px] text-slate-500 font-medium">Total registered cohort seats</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-display font-extrabold text-sm border border-blue-100">SE</div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Completed Sessions</span>
                  <span className="text-2xl font-display font-extrabold text-slate-900">{completedTrainingsCount} completed</span>
                  <p className="text-[10px] text-slate-500 font-medium font-medium">Marked as trained on-field</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <Check className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Gross Revenue (Retail)</span>
                  <span className="text-2xl font-display font-extrabold text-emerald-650">${Math.round(revenueTotal).toLocaleString()}</span>
                  <p className="text-[10px] text-slate-500 font-medium">Billed to contractor accounts</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">ProScore Net Margin Profit</span>
                  <span className="text-2xl font-display font-extrabold text-blue-700">${Math.round(markupTotal).toLocaleString()}</span>
                  <p className="text-[10px] text-slate-500 font-medium">Generated via standard 15% markup</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center border border-blue-100">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* WORKFLOW ROADMAPS & MANUAL CALENDAR EXPANSION (Collapsible helper tools) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* SHARING AND CALENDAR INGEST PANEL */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-105 pb-3">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                    <Calendar className="w-4 h-4 text-orange-500" /> Rolling Dates Allocator
                  </h3>
                  <p className="text-[11px] text-slate-500 block mt-1">Manual intake for available dates received from United Academy.</p>
                </div>

                <form onSubmit={handleAddManualURDate} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Target Training Course</label>
                    <select 
                      value={customDatesInput.courseId}
                      onChange={(e) => setCustomDatesInput(prev => ({ ...prev, courseId: e.target.value }))}
                      className="bg-slate-50/60 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-hidden w-full font-semibold focus:ring-2 focus:ring-orange-500/10 cursor-pointer"
                    >
                      {COURSES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Rolling Session Date</label>
                    <input 
                      type="date"
                      value={customDatesInput.date}
                      onChange={(e) => setCustomDatesInput(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-slate-50/60 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-hidden w-full font-semibold focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">UA Regional Hub / Facility Location</label>
                    <input 
                      type="text"
                      value={customDatesInput.location}
                      onChange={(e) => setCustomDatesInput(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Phoenix AZ UA Yard"
                      className="bg-slate-50/60 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-hidden w-full placeholder-slate-400 font-semibold focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-xs cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 text-orange-500" /> Lock In Date on Marketplace
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Rolling Dates Shared ({availableDates.length})</h4>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 my-1 font-mono text-[10px] text-slate-550">
                    {availableDates.map(d => (
                      <div key={d.id} className="flex justify-between border-b border-slate-50 pb-1">
                        <span className="font-bold text-slate-800">{d.date}</span>
                        <span className="truncate max-w-[150px] font-semibold text-slate-500">{COURSES.find(c => c.id === d.courseId)?.name || 'Course'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DEMAND GRAPH & LEADERBOARD reporting */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-105 pb-3">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Most Requested Courses
                  </h3>
                  <p className="text-[11px] text-slate-500 block">Demonstrating target workforce demands across active contractor cohorts.</p>
                </div>

                <div className="space-y-4 pt-1">
                  {sortedCourseDemands.map(([name, seats], idx) => (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="truncate max-w-[190px] text-slate-800 font-sans">{name}</span>
                        <span className="text-blue-700 font-mono font-bold text-[11px]">{seats} operators</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (seats / 30) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUTOMATION FUTURE ROADMAP PANEL */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-white text-sm flex items-center gap-2 uppercase tracking-wide">
                    <FolderSync className="text-orange-500 w-4 h-4" /> Future Automation Roadmap
                  </h3>
                  <p className="text-[11.5px] text-slate-400 leading-normal font-sans">
                    Since United Academy requires manual processing, ProScore’s pipeline scale focuses on deep core automation tools.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="flex gap-3 items-start">
                    <span className="bg-orange-500/10 text-orange-400 rounded-sm px-1.5 py-0.5 leading-none font-mono font-bold text-[10px]">1</span>
                    <div>
                      <p className="font-display font-bold text-white text-xs">Automated Reminders Queue</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Trigger standard confirmation details via headless workers.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="bg-orange-500/10 text-orange-400 rounded-sm px-1.5 py-0.5 leading-none font-mono font-bold text-[10px]">2</span>
                    <div>
                      <p className="font-display font-bold text-white text-xs">Roster Sheet Parsing (OCR)</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Read excel completion rosters automatically to generate PDF certificates.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="bg-orange-500/10 text-orange-400 rounded-sm px-1.5 py-0.5 leading-none font-mono font-bold text-[10px]">3</span>
                    <div>
                      <p className="font-display font-bold text-white text-xs">Contractor Ledger Webhooks</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Direct webhook synchronization out to ProScore apprentice tracking databases.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* THE MASTER TRACKING WORKLIST SPREADSHEET TABLE & ACTION DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* SPREADSHEEET LEDGER (Column 1 & 2 combined) */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Ledger Toolbar */}
                  <div className="border-b border-slate-100 p-5 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-orange-500" /> Master Partnership Tracking Spreadsheet
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">Simulated database of all class registrations and coordination actions.</p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-2.5 ml-0.5 text-slate-405 w-3.5 h-3.5" />
                        <input 
                          type="text" 
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          placeholder="Search APEX, Titan, IDs..." 
                          className="pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden w-full focus:ring-2 focus:ring-orange-500/10"
                        />
                      </div>
                      <select
                        value={adminStatusFilter}
                        onChange={(e) => setAdminStatusFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:outline-hidden font-semibold cursor-pointer focus:ring-2 focus:ring-orange-500/10"
                      >
                        <option value="All">All statuses</option>
                        <option value="Inquiry">Inquiries (Action needed)</option>
                        <option value="Scheduled">Scheduled (Yards blocked)</option>
                        <option value="Completed">Attendance complete</option>
                        <option value="Certified">Credentials Issued</option>
                        <option value="Billed">Billed</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  {/* SPREADSHEET LEDGER TABLE ROW RENDER */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50/60 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Inquiry ID</th>
                          <th className="px-5 py-3.5">Client Company</th>
                          <th className="px-5 py-3.5">Training Course</th>
                          <th className="px-5 py-3.5">Headcount</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Billing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-sans">
                        {filteredAdminRequests.map(req => {
                          const isSelected = selectedRequest?.id === req.id;
                          return (
                            <tr 
                              key={req.id} 
                              onClick={() => setSelectedRequest(req)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-orange-500/5 border-l-4 border-orange-500 font-medium' : 'hover:bg-slate-50/40'
                              }`}
                            >
                              <td className="px-5 py-4 font-mono font-bold text-orange-600">{req.id}</td>
                              <td className="px-5 py-4 font-bold text-slate-900">{req.companyName}</td>
                              <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{req.courseName}</td>
                              <td className="px-5 py-4 font-mono text-slate-700">{req.headcount} seat(s)</td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider leading-none ${
                                  req.status === 'Inquiry' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  req.status === 'Scheduled' ? 'bg-amber-50 text-amber-705 border border-amber-200' :
                                  req.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                  req.status === 'Certified' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                  req.status === 'Billed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                  'bg-emerald-50 text-emerald-700 border border-emerald-205'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-mono font-bold text-slate-900">
                                ${Math.round(req.coursePrice * req.headcount * (1 + req.markupPercent/100)).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between text-[11px] text-slate-500 font-sans">
                  <span className="font-medium">Displaying {filteredAdminRequests.length} of {requests.length} records</span>
                  <span className="font-semibold text-orange-600/95">Select any request row to operate action workflow.</span>
                </div>
              </div>

              {/* ACTION DRAWER DETAIL PANEL & EMAIL SIMULATOR (Column 3) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                {selectedRequest ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Drawer Head */}
                      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono font-bold text-orange-400 bg-slate-800 px-2.5 py-1 rounded">
                            {selectedRequest.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                            selectedRequest.status === 'Inquiry' ? 'bg-red-900/40 text-red-400 border border-red-800' :
                            selectedRequest.status === 'Scheduled' ? 'bg-amber-900/40 text-amber-400 border border-amber-800' :
                            'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                          }`}>
                            {selectedRequest.status}
                          </span>
                        </div>
                        <h4 className="font-display font-extrabold text-white text-base mt-3 leading-snug">{selectedRequest.companyName}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed mt-1">{selectedRequest.courseName}</p>
                      </div>

                      {/* Info Sections */}
                      <div className="p-5 space-y-4 text-xs">
                        {/* Summary Block */}
                        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase">Pref Date:</span>
                            <span className="font-semibold text-slate-800">{selectedRequest.datePreference}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase">Delivery / Format:</span>
                            <span className="font-semibold text-blue-700">{selectedRequest.deliveryType}</span>
                          </div>
                          <div className="col-span-2 mt-1">
                            <span className="text-slate-400 block font-mono font-bold text-[9px] uppercase">Location:</span>
                            <span className="text-slate-700 leading-relaxed block font-medium">{selectedRequest.location}</span>
                          </div>
                        </div>

                        {/* Crew roster listing */}
                        <div className="border-b border-slate-100 pb-3">
                          <h5 className="text-slate-400 block font-mono font-bold text-[9px] uppercase mb-1.5">
                            Roster Crew ({selectedRequest.participants.length} operators)
                          </h5>
                          <div className="max-h-20 overflow-y-auto space-y-1.5 font-sans">
                            {selectedRequest.participants.map((p, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-semibold text-slate-800 text-[11px]">{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* BILLING MATRIX DETAILS */}
                        <div className="bg-slate-50/60 p-4 rounded-2xl space-y-1.5 border border-slate-100">
                          <h5 className="text-slate-400 font-mono font-bold text-[9px] uppercase pb-1 border-b border-slate-100">Billing Summary</h5>
                          <div className="flex justify-between text-slate-655">
                            <span>UR Wholesale Cost ({selectedRequest.headcount} seats):</span>
                            <span className="font-mono text-slate-700 font-medium">${selectedRequest.coursePrice * selectedRequest.headcount}</span>
                          </div>
                          <div className="flex justify-between text-blue-705 font-bold">
                            <span>ProScore Markup (+{selectedRequest.markupPercent}%):</span>
                            <span>+${Math.round(selectedRequest.coursePrice * selectedRequest.headcount * (selectedRequest.markupPercent / 100))}</span>
                          </div>
                          <div className="flex justify-between font-display font-bold text-slate-900 border-t border-slate-100 pt-2 text-sm">
                            <span>Total Retail Billed:</span>
                            <span>${Math.round(selectedRequest.coursePrice * selectedRequest.headcount * (1 + selectedRequest.markupPercent / 100)).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* AUTOMATED WORKFLOW TRIGGER ACTIONS (The core manual-process dashboard buttons!) */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-slate-400 font-mono font-bold text-[9px] uppercase tracking-wider">
                            Interactive Operational Triggers
                          </h5>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {selectedRequest.status === 'Inquiry' && (
                              <>
                                <button
                                  onClick={() => {
                                    setCurrentTemplateId('ur-sched');
                                    alert('UR booking email loaded below. Draft customized scheduling request for Clint (UR SME).');
                                  }}
                                  className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 text-[10px] text-center cursor-pointer transition-colors"
                                >
                                  Draft Email to UR Clint
                                </button>
                                <button
                                  onClick={() => {
                                    updateRequestStatus(selectedRequest.id, 'Scheduled');
                                    setCurrentTemplateId('client-confirm');
                                    alert('Dates mapped on shared calendar! Scheduled notices and calendar invites dispatched.');
                                  }}
                                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] text-center cursor-pointer transition-colors"
                                >
                                  Lock In Scheduled Date
                                </button>
                              </>
                            )}

                            {selectedRequest.status === 'Scheduled' && (
                              <>
                                <button
                                  onClick={() => {
                                    setCurrentTemplateId('crew-reminder');
                                    alert('Safety apparel and checklist reminder dispatch loaded into editor below.');
                                  }}
                                  className="py-2.5 px-3 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 font-bold rounded-xl text-[10px] text-center border border-indigo-200 cursor-pointer transition-colors"
                                >
                                  Load Crew Reminders
                                </button>
                                <button
                                  onClick={() => {
                                    updateRequestStatus(selectedRequest.id, 'Completed');
                                    setCurrentTemplateId('comp-notice');
                                    alert('Training complete records captured from Instructor. Completions recorded in database.');
                                  }}
                                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] text-center cursor-pointer transition-colors"
                                >
                                  Log Training Complete
                                </button>
                              </>
                            )}

                            {selectedRequest.status === 'Completed' && (
                              <>
                                <button
                                  onClick={() => {
                                    updateRequestStatus(selectedRequest.id, 'Certified');
                                    alert('Standard ProScore digital credentials processed and wallet cards transmitted to Operators.');
                                  }}
                                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] text-center cursor-pointer transition-colors"
                                >
                                  Issue Cert Credentials
                                </button>
                                <button
                                  onClick={() => {
                                    updateRequestStatus(selectedRequest.id, 'Billed');
                                    setCurrentTemplateId('billing-invoice');
                                    alert('Invoice #{invoiceNum} triggered dynamically to the client company billing desk.');
                                  }}
                                  className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[10px] text-center cursor-pointer transition-colors"
                                >
                                  Trigger Billing AP Invoice
                                </button>
                              </>
                            )}

                            {selectedRequest.status === 'Certified' && (
                              <button
                                onClick={() => {
                                  updateRequestStatus(selectedRequest.id, 'Billed');
                                  setCurrentTemplateId('billing-invoice');
                                  alert('Invoice triggered to billing contact Sarah Jenkins for completed cohort training.');
                                }}
                                className="col-span-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[10px] text-center cursor-pointer transition-colors"
                              >
                                Trigger Billing AP Invoice (ProScore Margin Included)
                              </button>
                            )}

                            {selectedRequest.status === 'Billed' && (
                              <button
                                onClick={() => {
                                  updateRequestStatus(selectedRequest.id, 'Paid');
                                  alert('Client ACH wire cleared. Master spreadsheet synchronized as closed business.');
                                }}
                                className="col-span-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 text-emerald-300" /> Clear ACH Bill Receipt (Paid)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* LIVE TIMELINE TRACKER LOGS */}
                        <div className="pt-3 border-t border-slate-100">
                          <h5 className="text-slate-400 font-mono font-bold text-[9px] uppercase mb-2">Live Request Action Logs</h5>
                          <div className="space-y-1.5 max-h-24 overflow-y-auto leading-normal text-[10px] font-mono">
                            {selectedRequest.timeline.map((item, idx) => (
                              <div key={idx} className="flex gap-2 text-slate-600">
                                <span className="font-bold text-orange-600">[{item.status}]</span>
                                <div>
                                  {item.message}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE EMAIL DRAFT & RENDER PREVIEWER (REQUESTED BY TEAM!) */}
                    <div className="bg-slate-50/60 border-t border-slate-200">
                      <div className="p-3 bg-slate-100/50 flex justify-between items-center text-xs">
                        <span className="font-display font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-orange-500" /> Comm Template Editor
                        </span>
                        <select
                          value={currentTemplateId}
                          onChange={(e) => setCurrentTemplateId(e.target.value)}
                          className="bg-white border border-slate-200 py-1 px-2 rounded-lg text-[10px] focus:outline-hidden font-bold cursor-pointer"
                        >
                          {COMM_TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Render Drafted Mail Body with standard inputs */}
                      {(() => {
                        const templateObj = COMM_TEMPLATES.find(t => t.id === currentTemplateId) || COMM_TEMPLATES[0];
                        const courseObj = COURSES.find(c => c.id === selectedRequest.courseId);
                        const rendered = getRenderedTemplate(templateObj, {
                          id: selectedRequest.id,
                          companyName: selectedRequest.companyName,
                          courseName: selectedRequest.courseName,
                          coursePrice: selectedRequest.coursePrice,
                          headcount: selectedRequest.headcount,
                          datePreference: selectedRequest.datePreference,
                          location: selectedRequest.location,
                          locationType: selectedRequest.locationType,
                          billingContactName: selectedRequest.billingContact.name,
                          billingContactEmail: selectedRequest.billingContact.email,
                          participants: selectedRequest.participants,
                          markupPercent: selectedRequest.markupPercent,
                          classMin: courseObj?.classMin
                        });

                        return (
                          <div className="p-5 space-y-3 text-xs font-sans">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-mono font-bold text-[9px] uppercase">Rendered Draft:</span>
                              <button 
                                onClick={() => handleCopyToClipboard(`${rendered.subject}\n\n${rendered.body}`, currentTemplateId)}
                                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                              >
                                {isCopied === currentTemplateId ? (
                                  <span className="flex items-center gap-0.5 font-semibold"><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied</span>
                                ) : (
                                  <span className="flex items-center gap-0.5 font-semibold"><Copy className="w-3.5 h-3.5" /> Copy Email Clip</span>
                                )}
                              </button>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 font-mono text-[10px] text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                              <div className="font-bold text-slate-900 pb-1.5 mb-1.5 border-b border-slate-100">Subject: {rendered.subject}</div>
                              {rendered.body}
                            </div>
                            <p className="text-[9px] text-slate-405 italic">
                              Templates utilize variable hydration mapping. Customize and shoot via local mail hooks.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center text-slate-400 my-auto font-sans">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-display font-bold text-slate-800 text-sm">No cohort request selected</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">Click on any request details in the spreadsheet log to operate date scheduling and review communication templates.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 py-10 px-5 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-2">
            <p className="font-display font-extrabold text-base text-white tracking-tight">ProScore × United Rentals Joint Safety Partnership</p>
            <p className="text-slate-400 font-medium">Manual Operations Coordination Blueprint & Reactive Click-Through Prototype</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-[10px] font-mono text-slate-500">
              <span className="bg-slate-800/60 px-2 py-0.5 rounded text-orange-400">ProScore SME: Erik Grant</span>
              <span>•</span>
              <span className="bg-slate-800/60 px-2 py-0.5 rounded text-slate-305">United Rentals SME: Clint C.</span>
              <span>•</span>
              <span className="bg-slate-800/60 px-2 py-0.5 rounded text-slate-305">Revision Date: June 2026</span>
            </div>
          </div>
          <div className="space-y-1 my-auto text-[10px] text-slate-500 font-mono tracking-wide text-right md:text-right flex flex-col items-center md:items-end">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/25 inline-block mb-1">CYBER FIREWALL BLOCKED RESTAL BYPASS</span>
            <p>&copy; 2026 ProScore.ai & United Rentals Academy. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
