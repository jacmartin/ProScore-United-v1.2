export interface CommTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipientType: 'Client' | 'United Rentals' | 'Crew' | 'Accounts Payable';
}

export const COMM_TEMPLATES: CommTemplate[] = [
  {
    id: 'client-confirm',
    name: 'Client Confirmation Notice',
    subject: 'CONFIRMED: Your ProScore Certification Training Session',
    recipientType: 'Client',
    body: `Dear {contactName},

Thank you for selecting ProScore for your field force training. We have received your inquiry for the upcoming training session.

Session Details:
- Course: {courseName}
- Scheduled Date: {datePreference}
- Headcount: {headcount} operator(s)
- Delivery Location: {location}
- Billing Contact: {billingContactName} ({billingContactEmail})

What Happens Next:
Our training logistics desk is finalizing the manual scheduling reservation with United Rentals (our fulfillment partner). You will receive an official Google Calendar invite and practical details (required footwear, safety gear, and regional site gate directions) within 24-48 business hours.

If you have any immediate scheduling changes, please contact support@proscore.ai referencing request number {id}.

Best Regards,
Erik Grant
ProScore Training Partnership Desk`
  },
  {
    id: 'ur-sched',
    name: 'United Rentals Scheduling Request',
    subject: 'URGENT RES: ProScore Seat Booking Request - {companyName}',
    recipientType: 'United Rentals',
    body: `Hi Clint,

We have a new ProScore training block to lock in with United Academy under our Joint Venture Manual Coordination framework. 

Partnership Booking Request Details:
- Project/Company: {companyName}
- Course: {courseName}
- Target Date: {datePreference}
- Headcount: {headcount} operator seat(s)
- Delivery Option: {locationType}
- Target Yard/Site: {location}
- Requested Participant Roster: 
{participantRoster}

Please reply within our agreed 24-hour SLA to confirm trainer availability and hold these seats. Once you confirm, we will update the master tracking spreadsheet status and dispatch client calendar invites.

Wholesale billing to be applied to the ProScore Monthly Partner Account.

Thanks!
Erik Grant
Partnership SME, ProScore`
  },
  {
    id: 'crew-reminder',
    name: 'Participant / Crew Safety Reminder',
    subject: 'REMINDER: Upcoming ProScore Certification Course - {courseName}',
    recipientType: 'Crew',
    body: `Hello Operators,

This is a reminder that you are scheduled for the upcoming ProScore Certification Training Course.

Course: {courseName}
Date: {datePreference}
Location: {location}

Instruction Requirements & PPE Checklist:
1. Please arrive 15 minutes before the scheduled start.
2. Hard hat, safety glasses, high-visibility vest, and steel-toed boots (with ankle support) are STRICTLY REQUIRED for the hands-on practical performance evaluation.
3. Bring valid government-issued photographic identification.

Failure to wear required safety equipment will result in immediate dismissal from the operation yard by the United Academy instructor, and rescheduling penalties will apply to your host company.

Get ready to skill up and stay safe!

ProScore Training Safety Desk`
  },
  {
    id: 'comp-notice',
    name: 'Completion & Certificate Dispatch',
    subject: 'CONGRATULATIONS: Safety Credentials Registered for {companyName}',
    recipientType: 'Client',
    body: `Hi {contactName},

We are pleased to report that your safety cohort has successfully completed the coursework and practical performance evaluations.

Completed Course: {courseName}
Date of Completion: {datePreference}
Total Certified Operators: {headcount}

Attached to this email, please find the official digital ProScore Safety Certification Credentials and portable wallet cards for each operator. We have also updated your contractor master roster in the ProScore apprentice records system to reflect active certified status.

Course completion details have been locked into the collaborative spreadsheet tracking ledger.

Thank you for your ongoing commitment to building a zero-injury workplace culture.

Best,
Erik Grant
Operations, ProScore`
  },
  {
    id: 'billing-invoice',
    name: 'Billing Trigger & Invoice Email',
    subject: 'INVOICE: Training Services Delivery - ProScore / {companyName}',
    recipientType: 'Accounts Payable',
    body: `Dear Accounts Payable Team,

Please find enclosed ProScore Training Services Invoice #{invoiceNum} for the recent operator certification course completed on {datePreference}.

Summary of Billable Deliverables:
- Client Company: {companyName}
- Safety/Equipment Course: {courseName}
- Certified Operators: {headcount} seats
- Unit Cost per Seat: \${retailUnitCost}
- Gross Billable Amount: \${retailTotal}

Payment Terms: Net 15
Billing Contact On Record: {billingContactName} ({billingContactEmail})

Payment may be completed via standard ACH transfer using the bank routing credentials listed at the footer of the attached invoice PDF cover.

For billing reconciliation queries, please reply directly to billing@proscore.ai.

Sincerely,
ProScore Finance Operations Desk`
  },
  {
    id: 'cancel-notice',
    name: 'Course Cancellation / Reschedule notice',
    subject: 'ADVISORY: Training Session Reschedule Required - Request #{id}',
    recipientType: 'Client',
    body: `Hi {contactName},

We are reaching out to let you know we must reschedule the upcoming session for {courseName} originally requested for {datePreference}. 

Under the United Academy coordination guidelines, Class Seat Minimums ({classMin} operators) were not met or trainer scheduling conflicts arose. No charges have been applied, and we are working directly with United Rentals to allocate rolling dates next week.

Our team will call you within today to present upcoming date options on our shared rolling calendar to select a new spot.

We apologize for any scheduling inconvenience.

Best Regards,
Erik Grant
SME Lead, ProScore`
  }
];

export function getRenderedTemplate(
  template: CommTemplate,
  request: {
    id: string;
    companyName: string;
    courseName: string;
    coursePrice: number;
    headcount: number;
    datePreference: string;
    location: string;
    locationType: string;
    billingContactName: string;
    billingContactEmail: string;
    participants: string[];
    markupPercent: number;
    classMin?: number;
  }
): { subject: string; body: string } {
  const invoiceNum = `PS-INV-${request.id.replace('req-', '')}`;
  const retailUnitCost = Math.round(request.coursePrice * (1 + request.markupPercent / 100));
  const retailTotal = retailUnitCost * request.headcount;
  const participantRoster = request.participants.map((p, i) => `${i + 1}. ${p}`).join('\n');

  let subject = template.subject
    .replace('{companyName}', request.companyName)
    .replace('{courseName}', request.courseName)
    .replace('{id}', request.id);

  let body = template.body
    .replace(/{id}/g, request.id)
    .replace(/{contactName}/g, request.billingContactName)
    .replace(/{billingContactName}/g, request.billingContactName)
    .replace(/{billingContactEmail}/g, request.billingContactEmail)
    .replace(/{companyName}/g, request.companyName)
    .replace(/{courseName}/g, request.courseName)
    .replace(/{datePreference}/g, request.datePreference)
    .replace(/{headcount}/g, String(request.headcount))
    .replace(/{location}/g, request.location)
    .replace(/{locationType}/g, request.locationType)
    .replace(/{participantRoster}/g, participantRoster)
    .replace(/{invoiceNum}/g, invoiceNum)
    .replace(/{retailUnitCost}/g, String(retailUnitCost))
    .replace(/{retailTotal}/g, String(retailTotal))
    .replace(/{classMin}/g, String(request.classMin || 5));

  return { subject, body };
}
