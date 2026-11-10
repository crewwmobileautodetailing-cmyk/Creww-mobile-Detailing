import emailjs from '@emailjs/browser';
import { BUSINESS_CONFIG } from '../config/businessConfig';

/**
 * Master EmailJS Configuration for CREWW MOBILE AUTO DETAILING
 */
export const EMAILJS_CONFIG = {
  publicKey: 'hIfpizilYrfx4DA6t',
  serviceId: 'service_u1vi2pp',
  adminTemplateId: 'template_tuw4u0j',
  customerTemplateId: 'template_jo7e19x',
};

// Initialize EmailJS Browser SDK
try {
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
} catch (err) {
  console.warn('EmailJS SDK initialization notice:', err);
}

export interface BookingSubmissionPayload {
  id: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  serviceId: string;
  serviceName: string;
  price: number;
  savings: number;
  preferredDate: string;
  preferredTime: string;
  serviceAddress: string;
  city: string;
  state: string;
  zipCode: string;
  waterConfirmed: boolean;
  electricityConfirmed: boolean;
  additionalNotes?: string;
}

export interface ContactSubmissionPayload {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  subject?: string;
  message: string;
}

export interface BookingEmailResult {
  success: boolean;
  adminSent: boolean;
  customerSent: boolean;
  error?: string;
  partialNotice?: string;
}

export interface ContactEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Sends both the Admin Notification and Customer Auto-Reply emails for a new booking.
 * Strictly respects rule 10: Customer auto-reply is sent ONLY after admin notification succeeds.
 */
export async function sendBookingEmails(
  booking: BookingSubmissionPayload
): Promise<BookingEmailResult> {
  const vehicleSummary = `${booking.vehicleYear} ${booking.vehicleMake} ${booking.vehicleModel}`.trim();
  const fullAddress = `${booking.serviceAddress}, ${booking.city}, ${booking.state} ${booking.zipCode}`.trim();
  const waterText = booking.waterConfirmed
    ? 'Confirmed Available (Water Spigot on-site)'
    : 'Not Confirmed';
  const electricityText = booking.electricityConfirmed
    ? 'Confirmed Available (120V Outlet on-site)'
    : 'Not Confirmed';

  const readableSummary = `
NEW BOOKING RESERVATION #${booking.id}
----------------------------------------
Customer: ${booking.fullName}
Phone: ${booking.phoneNumber}
Email: ${booking.emailAddress}

Service: ${booking.serviceName}
Price: $${booking.price} (Saved $${booking.savings})
Preferred Date: ${booking.preferredDate}
Preferred Time: ${booking.preferredTime}

Vehicle: ${vehicleSummary}
Service Address: ${fullAddress}

Water Availability: ${waterText}
Electricity Availability: ${electricityText}

Additional Notes:
${booking.additionalNotes?.trim() || 'None provided'}
----------------------------------------
Dispatched via CREWW Mobile Auto Detailing Portal
`.trim();

  // Multi-alias parameter mapping guarantees compatibility with any template variable names
  const adminParams: Record<string, string> = {
    // Identity & Contacts
    full_name: booking.fullName,
    fullName: booking.fullName,
    name: booking.fullName,
    from_name: booking.fullName,
    customer_name: booking.fullName,

    email: booking.emailAddress,
    emailAddress: booking.emailAddress,
    from_email: booking.emailAddress,
    customer_email: booking.emailAddress,
    reply_to: booking.emailAddress,

    phone: booking.phoneNumber,
    phoneNumber: booking.phoneNumber,
    phone_number: booking.phoneNumber,
    customer_phone: booking.phoneNumber,

    // Vehicle
    vehicle: vehicleSummary,
    vehicle_make: booking.vehicleMake,
    vehicleMake: booking.vehicleMake,
    vehicle_model: booking.vehicleModel,
    vehicleModel: booking.vehicleModel,
    vehicle_year: booking.vehicleYear,
    vehicleYear: booking.vehicleYear,

    // Service & Pricing
    service: booking.serviceName,
    service_name: booking.serviceName,
    serviceName: booking.serviceName,
    package_name: booking.serviceName,
    selected_service: booking.serviceName,
    price: `$${booking.price}`,
    package_price: `$${booking.price}`,
    savings: `$${booking.savings}`,

    // Date & Time
    date: booking.preferredDate,
    preferred_date: booking.preferredDate,
    preferredDate: booking.preferredDate,
    time: booking.preferredTime,
    preferred_time: booking.preferredTime,
    preferredTime: booking.preferredTime,
    appointment_time: `${booking.preferredDate} at ${booking.preferredTime}`,

    // Location
    address: fullAddress,
    service_address: booking.serviceAddress,
    serviceAddress: booking.serviceAddress,
    street_address: booking.serviceAddress,
    city: booking.city,
    state: booking.state,
    zip: booking.zipCode,
    zip_code: booking.zipCode,
    zipCode: booking.zipCode,
    zipcode: booking.zipCode,

    // Requirements
    water: waterText,
    water_availability: waterText,
    water_confirmed: waterText,
    electricity: electricityText,
    electricity_availability: electricityText,
    electricity_confirmed: electricityText,

    // Notes & Message
    additional_notes: booking.additionalNotes?.trim() || 'None',
    additionalNotes: booking.additionalNotes?.trim() || 'None',
    notes: booking.additionalNotes?.trim() || 'None',
    comments: booking.additionalNotes?.trim() || 'None',
    message: readableSummary,
    summary: readableSummary,

    // Metadata
    booking_id: booking.id,
    reference_id: booking.id,
    form_type: 'Mobile Detailing Booking Reservation',
    subject: `New On-Site Booking: ${booking.serviceName} - ${booking.fullName} (${vehicleSummary})`,
  };

  // STEP 1: Send Admin Notification
  try {
    const adminResponse = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.adminTemplateId,
      adminParams,
      EMAILJS_CONFIG.publicKey
    );

    if (adminResponse.status !== 200 && adminResponse.text !== 'OK') {
      throw new Error(`Admin email service returned status: ${adminResponse.status}`);
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('EmailJS Admin Notification failed:', err);
    return {
      success: false,
      adminSent: false,
      customerSent: false,
      error: errMsg || 'Unable to deliver notification to dispatch. Please try again or reach out directly.',
    };
  }

  // STEP 2: Only after admin succeeds, send Customer Auto-Reply
  const customerParams: Record<string, string> = {
    // Delivery recipient variables
    to_name: booking.fullName,
    to_email: booking.emailAddress,
    email: booking.emailAddress,
    customer_email: booking.emailAddress,
    customer_name: booking.fullName,
    name: booking.fullName,

    // Reservation details for customer email body
    booking_id: booking.id,
    reference_id: booking.id,
    service_name: booking.serviceName,
    package_name: booking.serviceName,
    price: `$${booking.price}`,
    date: booking.preferredDate,
    time: booking.preferredTime,
    appointment_time: `${booking.preferredDate} at ${booking.preferredTime}`,
    vehicle: vehicleSummary,
    address: fullAddress,
    water: waterText,
    electricity: electricityText,
    notes: booking.additionalNotes?.trim() || 'None',

    // Sender details
    company_name: BUSINESS_CONFIG.name,
    company_email: BUSINESS_CONFIG.email,
    reply_to: BUSINESS_CONFIG.email,
    message: `Thank you for choosing ${BUSINESS_CONFIG.name}. Your appointment request for ${booking.serviceName} on ${booking.preferredDate} at ${booking.preferredTime} has been received. Our mobile detailing rig will arrive on-site with purified deionized water, specialized machine polishers, and steam extraction. Payment is collected only after your personal vehicle walkthrough inspection.`,
  };

  try {
    const customerResponse = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.customerTemplateId,
      customerParams,
      EMAILJS_CONFIG.publicKey
    );

    if (customerResponse.status !== 200 && customerResponse.text !== 'OK') {
      throw new Error(`Customer auto-reply returned status: ${customerResponse.status}`);
    }

    return {
      success: true,
      adminSent: true,
      customerSent: true,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('Customer auto-reply failed after admin success:', err);
    // Explicit partial failure without falsely claiming customer email was sent (Rule 10)
    return {
      success: true,
      adminSent: true,
      customerSent: false,
      partialNotice: `Your appointment request is safely received by our dispatch team, but the automatic confirmation email could not be delivered to ${booking.emailAddress}. Our crew will verify your appointment by phone or manual email.`,
    };
  }
}

/**
 * Sends a Contact Us inquiry to dispatch via EmailJS Admin Notification Template.
 */
export async function sendContactEmail(
  contact: ContactSubmissionPayload
): Promise<ContactEmailResult> {
  const contactSummary = `
NEW CONTACT INQUIRY
----------------------------------------
From: ${contact.fullName}
Email: ${contact.emailAddress}
Phone: ${contact.phoneNumber?.trim() || 'Not provided'}
Subject: ${contact.subject?.trim() || 'General Inquiry'}

Message:
${contact.message.trim()}
----------------------------------------
Submitted via CREWW Mobile Auto Detailing Portal
`.trim();

  const contactParams: Record<string, string> = {
    full_name: contact.fullName,
    fullName: contact.fullName,
    name: contact.fullName,
    from_name: contact.fullName,
    customer_name: contact.fullName,

    email: contact.emailAddress,
    emailAddress: contact.emailAddress,
    from_email: contact.emailAddress,
    customer_email: contact.emailAddress,
    reply_to: contact.emailAddress,

    phone: contact.phoneNumber?.trim() || 'Not provided',
    phoneNumber: contact.phoneNumber?.trim() || 'Not provided',
    phone_number: contact.phoneNumber?.trim() || 'Not provided',

    subject: contact.subject?.trim() || 'New Inquiry from CREWW Website',
    message: contactSummary,
    summary: contactSummary,
    notes: contact.message.trim(),
    comments: contact.message.trim(),

    form_type: 'Website Contact Us Form',
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.adminTemplateId,
      contactParams,
      EMAILJS_CONFIG.publicKey
    );

    if (response.status !== 200 && response.text !== 'OK') {
      throw new Error(`EmailJS returned status: ${response.status}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('EmailJS Contact send error:', err);
    return {
      success: false,
      error: errMsg || 'Unable to send message right now. Please try again or email us directly.',
    };
  }
}
