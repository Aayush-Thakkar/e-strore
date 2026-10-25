import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Lock, FileSpreadsheet, MessageCircle, UserCheck, AlertCircle, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "DPDP Privacy Policy | Anandam Sarees & Ethnic Atelier",
  description:
    "Learn how Anandam Sarees collects, processes, and protects your digital personal data under India's Digital Personal Data Protection Act, 2023, including WhatsApp messaging and Google Sheets storage.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Header />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#54151C] to-[#722F37] text-[#FDFBF7] py-12 sm:py-16 px-4 border-b border-[#D4AF37]/40 shadow-inner">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#F4E5BD] border border-[#D4AF37]/40">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Digital Personal Data Protection Act, 2023 (India) Compliance</span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold tracking-tight text-[#FDFBF7]">
            DPDP Privacy Policy
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#F4E5BD]/90 font-light leading-relaxed">
            Transparent disclosure of how Anandam Sarees collects, processes, and safeguards your digital personal data for boutique ordering, WhatsApp concierge, and order fulfillment.
          </p>

          <p className="text-[11px] text-[#D4AF37] font-semibold tracking-wide uppercase pt-1">
            Last Updated & Effective: October 2026
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-grow w-full space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#722F37] hover:text-[#54151C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Anandam Collection</span>
          </Link>
        </div>

        {/* Overview Box */}
        <div className="p-6 rounded-2xl bg-[#F8F3EA] border border-[#EADBCE] space-y-3 text-stone-800 text-xs sm:text-sm leading-relaxed">
          <h2 className="font-serif-luxury text-lg font-bold text-[#722F37]">
            1. Notice & Role as Data Fiduciary
          </h2>
          <p>
            This Privacy Policy explains how <strong>Anandam Sarees</strong> (&quot;Anandam&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), acting as a <strong>Data Fiduciary</strong> under India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, collects, processes, stores, and protects personal data provided by customers and patrons (&quot;Data Principals&quot;) when inquiring about or ordering our handcrafted sarees, suits, lehengas, and Indo-Western attire.
          </p>
          <p>
            We process your personal data solely for specified, lawful, and transparent purposes associated with fulfilling your bespoke ethnic fashion inquiries, coordinating orders, and providing exceptional atelier service.
          </p>
        </div>

        {/* Data Collected */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#F2ECE4] pb-3">
            <div className="w-9 h-9 rounded-lg bg-[#722F37]/10 flex items-center justify-center text-[#722F37]">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#241416]">
              2. Digital Personal Data We Collect
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            When you interact with our catalogue and initiate an inquiry or order, we may collect the following personal data:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
            <li className="p-3 bg-[#FDFBF7] rounded-xl border border-[#EADBCE]">
              <strong className="text-[#722F37] block font-semibold mb-1">Full Name:</strong>
              To identify our customer, personalise communication, and address invoices.
            </li>
            <li className="p-3 bg-[#FDFBF7] rounded-xl border border-[#EADBCE]">
              <strong className="text-[#722F37] block font-semibold mb-1">WhatsApp / Phone Number:</strong>
              For real-time order coordination, video viewing, sizing confirmation, and dispatch notifications.
            </li>
            <li className="p-3 bg-[#FDFBF7] rounded-xl border border-[#EADBCE]">
              <strong className="text-[#722F37] block font-semibold mb-1">Delivery Address:</strong>
              To calculate courier logistics, prepare shipment labels, and ensure doorstep delivery of your order.
            </li>
            <li className="p-3 bg-[#FDFBF7] rounded-xl border border-[#EADBCE]">
              <strong className="text-[#722F37] block font-semibold mb-1">Inquiry & Sizing Preferences:</strong>
              Design choices, blouse stitching notes, fabric queries, and quantities requested.
            </li>
          </ul>
        </div>

        {/* How Data Is Used: WhatsApp & Google Sheets */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#F2ECE4] pb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#241416]">
              3. Purpose of Data Processing: WhatsApp & Google Sheets
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Direct WhatsApp Messaging Concierge</span>
              </div>
              <p>
                Our store operates on a personal concierge model. When you click <em>&quot;Open WhatsApp with Prefilled Message&quot;</em>, you are directed to our official WhatsApp business number (<strong>+91 89827 76402</strong>) with your selected outfit and details prefilled.
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                <li>We use WhatsApp strictly for direct customer consultation, sharing high-resolution weave photographs, confirming measurements, and providing live tracking updates.</li>
                <li>You retain complete control: you can inspect the message in WhatsApp and choose when to press send.</li>
                <li>We do not broadcast unsolicited promotional spam or add your number to third-party group chats.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                <span>Internal Order Record-Keeping via Google Sheets</span>
              </div>
              <p>
                To maintain accurate boutique inventory and prevent lost parcels, customer inquiries and delivery addresses are logged into secure, restricted-access <strong>Google Sheets</strong> and administrative order management systems:
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                <li>Google Sheets is used internally by our fulfillment and dispatch team to track orders from weaving to doorstep courier delivery.</li>
                <li>Access to the Google Sheet is strictly limited to authenticated atelier staff via multi-factor authentication (MFA).</li>
                <li>We do not monetize, rent, or sell your customer records to marketing aggregators or advertising networks.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Consent & User Rights Under DPDP Act */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#F2ECE4] pb-3">
            <div className="w-9 h-9 rounded-lg bg-[#722F37]/10 flex items-center justify-center text-[#722F37]">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#241416]">
              4. Your Rights as a Data Principal (DPDP Act, 2023)
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Under Chapter III of India&apos;s Digital Personal Data Protection Act, 2023, you have clear legal rights regarding your personal data:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
            <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#EADBCE] space-y-1">
              <h3 className="font-bold text-[#722F37]">Right to Access Information</h3>
              <p>You may request a summary of the personal data we hold about you and the processing activities undertaken.</p>
            </div>

            <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#EADBCE] space-y-1">
              <h3 className="font-bold text-[#722F37]">Right to Correction & Erasure</h3>
              <p>You have the right to correct inaccurate data or request deletion of your records from our Google Sheets and database once your order is fulfilled.</p>
            </div>

            <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#EADBCE] space-y-1">
              <h3 className="font-bold text-[#722F37]">Right to Withdraw Consent</h3>
              <p>You may withdraw your consent for WhatsApp communication at any time by replying &quot;STOP&quot; on WhatsApp or emailing us.</p>
            </div>

            <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#EADBCE] space-y-1">
              <h3 className="font-bold text-[#722F37]">Right of Grievance Redressal</h3>
              <p>You have the right to readily accessible grievance redressal mechanisms from our designated Data Protection & Grievance Officer.</p>
            </div>
          </div>
        </div>

        {/* Data Security & Retention */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EADBCE] shadow-sm space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <h2 className="font-serif-luxury text-lg font-bold text-[#722F37]">
            5. Data Security Safeguards & Retention
          </h2>
          <p>
            We implement technical and organizational security measures to protect your digital personal data against unauthorized access, alteration, or disclosure:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-1">
            <li>End-to-end transport layer security (HTTPS/SSL encryption) across our web platform.</li>
            <li>Role-based access controls for Google Sheets and administrative records.</li>
            <li>Data is retained only as long as necessary to fulfill the purpose of purchase, resolve warranty or alteration queries, and comply with applicable tax and commercial laws in India.</li>
          </ul>
        </div>

        {/* Grievance Redressal Officer */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#FDFBF7] via-[#F8F3EA] to-[#EADBCE]/50 border border-[#D4AF37]/60 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#722F37] border border-[#D4AF37] flex items-center justify-center text-[#F4E5BD]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#241416]">
                6. Grievance Redressal & Data Protection Contact
              </h2>
              <span className="text-xs text-stone-600">Designated officer under Section 8(9) of the DPDP Act, 2023</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            If you have questions, wish to exercise your rights of correction or erasure, or have any grievances regarding how your personal data is handled in WhatsApp or Google Sheets, please contact our Grievance Officer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#EADBCE] flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-stone-500 font-semibold block">Phone / WhatsApp</span>
                <strong className="text-stone-900">+91 89827 76402</strong>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EADBCE] flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-stone-500 font-semibold block">Email</span>
                <strong className="text-stone-900">privacy@anandamsarees.in</strong>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EADBCE] flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-stone-500 font-semibold block">Atelier Location</span>
                <strong className="text-stone-900">Indore, Madhya Pradesh, India</strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
