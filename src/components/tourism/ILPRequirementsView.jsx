import { useState } from "react";
import {
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import TourismPageHeader from "./TourismPageHeader";
import TourismNavTabs from "./TourismNavTabs";
import SourceAttribution from "./SourceAttribution";
import NagaWeavingDivider from "../NagaWeavingDivider";
import { ILP_INFORMATION } from "../../data/tourismData";

export default function ILPRequirementsView() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = idx => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Navigation Sub-Tabs */}
      <TourismNavTabs />

      {/* Page Header */}
      <TourismPageHeader
        badgeText="Statutory Entry Regulations"
        badgeIcon={ShieldCheck}
        title="Inner Line Permit (ILP) & Travel Requirements"
        subtitle="Official statutory information and application guidelines for travelers visiting the state of Nagaland under the Bengal Eastern Frontier Regulation (BEFR), 1873."
        breadcrumbs={[{ label: "ILP & Travel Requirements" }]}
        actions={
          <a
            href={ILP_INFORMATION.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#203E2D] hover:bg-[#2C523C] text-white transition-all shadow-xs mt-1"
          >
            <span>Apply on Official Portal (ilp.nagaland.gov.in)</span>
            <ExternalLink size={14} />
          </a>
        }
      />

      <NagaWeavingDivider />

      {/* Important Advisory Strip */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] text-[#252B26] text-xs flex items-start gap-3 shadow-2xs">
        <AlertTriangle size={18} className="text-[#A45E45] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-xs font-semibold text-[#252B26]">
            Important Notice on Application Integrity
          </strong>
          <p className="text-[#57534E] leading-relaxed">
            NagaQuest provides statutory informational guidance only. All applications, document verifications, fee transactions, and permit issuances are executed exclusively through the official government portal (<code className="font-semibold text-[#203E2D] bg-[#203E2D]/5 px-1 py-0.5 rounded">ilp.nagaland.gov.in</code>). NagaQuest never collects personal identity cards, passport credentials, or permit processing fees.
          </p>
        </div>
      </div>

      {/* 1. Who Needs an ILP Section */}
      <div className="editorial-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#203E2D]/10 text-[#203E2D] flex items-center justify-center font-bold text-sm">
            1
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#252B26]">
            Who Needs a Permit?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ILP_INFORMATION.categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="editorial-tag text-[#203E2D] bg-[#203E2D]/5 border-[#203E2D]/20 inline-block">
                  Category: {cat.title}
                </span>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {cat.summary}
                </p>

                {cat.permitTypes && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                      Recognized Permit Types:
                    </span>
                    {cat.permitTypes.map((pt, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-white p-3 rounded-lg border border-[#E6E1D6] text-xs space-y-0.5"
                      >
                        <span className="font-semibold text-[#252B26] block">
                          {pt.name}
                        </span>
                        <span className="text-[11px] text-[#78716C] block">
                          Validity: {pt.validity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {cat.specialNote && (
                  <div className="p-3 rounded-lg bg-[#A45E45]/10 border border-[#A45E45]/20 text-[11px] text-[#A45E45] leading-relaxed">
                    <strong>Special Requirement:</strong> {cat.specialNote}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Application Process Step-by-Step */}
      <div className="editorial-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#203E2D]/10 text-[#203E2D] flex items-center justify-center font-bold text-sm">
            2
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#252B26]">
            Online Application Process
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {ILP_INFORMATION.applicationSteps.map(step => (
            <div
              key={step.step}
              className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] space-y-2.5 relative"
            >
              <div className="w-7 h-7 rounded-lg bg-[#203E2D] text-white flex items-center justify-center font-bold text-xs">
                {step.step}
              </div>
              <h3 className="font-semibold text-xs text-[#252B26] leading-snug">
                {step.title}
              </h3>
              <p className="text-[11px] text-[#57534E] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Required Documents */}
      <div className="editorial-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#203E2D]/10 text-[#203E2D] flex items-center justify-center font-bold text-sm">
            3
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#252B26]">
            Required Documents Checklist
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ILP_INFORMATION.requiredDocuments.map((doc, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#FAF7F2] rounded-lg border border-[#E6E1D6] flex items-center gap-3 text-xs text-[#252B26]"
            >
              <CheckCircle2 size={16} className="text-[#203E2D] shrink-0" />
              <span className="font-medium">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Frequently Asked Questions */}
      <div className="editorial-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle size={22} className="text-[#A45E45]" />
          <h2 className="font-serif text-2xl font-bold text-[#252B26]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {ILP_INFORMATION.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#E6E1D6] rounded-lg overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[#252B26]">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-[#78716C] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-[#78716C] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-xs text-[#57534E] leading-relaxed border-t border-[#E6E1D6]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Portal Direct Call to Action */}
      <div className="bg-[#203E2D] text-white p-6 md:p-8 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold">
            Ready to Apply for your E-ILP?
          </h3>
          <p className="text-xs text-white/80 max-w-xl">
            Proceed to the official Government of Nagaland portal to complete your registration safely.
          </p>
        </div>

        <a
          href={ILP_INFORMATION.officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold bg-[#C68A36] hover:bg-[#B3792E] text-white transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <span>Open ilp.nagaland.gov.in</span>
          <ExternalLink size={14} />
        </a>
      </div>

      <SourceAttribution
        source="Home Department, Government of Nagaland"
        provider="Bengal Eastern Frontier Regulation (BEFR), 1873"
        lastReviewed={ILP_INFORMATION.lastReviewedDate}
        externalUrl={ILP_INFORMATION.officialPortalUrl}
      />
    </div>
  );
}
