export interface Course {
  id: string;
  name: string;
  price: number;
  language: string;
  duration: string;
  expiration: string;
  delivery: 'eLearning' | 'ILT';
  classMin: number;
  classMax: number | 'N/A';
  description: string;
  category: 'Aerial & Lift' | 'Earth Moving' | 'Safety & OSHA' | 'Rigging' | 'Other';
  pilot: boolean; // Highlights selected courses for pilot launch
}

export interface TrainingRequest {
  id: string;
  companyName: string;
  courseId: string;
  courseName: string;
  coursePrice: number;
  deliveryType: 'eLearning' | 'ILT' | 'On-Site Crew';
  headcount: number;
  datePreference: string;
  location: string;
  locationType: 'Facility' | 'On-Site';
  billingContact: {
    name: string;
    email: string;
    phone: string;
  };
  participants: string[]; // List of names/emails
  status: 'Inquiry' | 'Scheduled' | 'Completed' | 'Certified' | 'Billed' | 'Paid';
  markupPercent: number; // ProScore markup percent on top of cost
  createdAt: string;
  notes: string;
  timeline: {
    status: string;
    timestamp: string;
    message: string;
  }[];
}

export interface AvailableDate {
  id: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  maxCapacity: number;
  enrolled: number;
  location: string;
}
