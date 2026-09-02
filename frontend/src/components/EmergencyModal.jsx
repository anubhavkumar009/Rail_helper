import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  HeartPulse, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const HELPLINE_SERVICES = {
  madad: {
    id: 'madad',
    title: 'Rail Madad - Integrated Helpline',
    number: '139',
    secondaryNumber: null,
    badge: '24x7 All-in-One Helpline',
    color: 'orange',
    icon: PhoneCall,
    tagline: 'Single national helpline for all passenger queries & grievances',
    description: 'Indian Railways has unified all helplines into 139 for an effortless passenger experience across all zones.',
    quickDialOptions: [
      { label: 'Integrated Rail Madad Helpline', number: '139', primary: true },
      { label: 'Rail Madad Online Portal', url: 'https://railmadad.indianrailways.gov.in', isWeb: true },
    ],
    ivrsGuide: [
      { key: '1', desc: 'Security & Medical Emergency Assistance' },
      { key: '2', desc: 'PNR Status, Fare & Ticket Inquiries' },
      { key: '3', desc: 'Catering & Food Services Complaints' },
      { key: '4', desc: 'General Complaints & Cleanliness' },
      { key: '9', desc: 'Speak with Customer Care Executive' },
    ],
    smsGuide: 'Send SMS: "MADAD <Your Complaint / PNR>" to 139 for fast assistance.',
    tips: [
      'Keep your 10-digit PNR number or Train Number ready when calling.',
      'Available in 12 languages (Hindi, English, Bengali, Tamil, Telugu, Marathi, etc.).',
      'Toll-free and accessible from any mobile or landline across India.'
    ]
  },
  security: {
    id: 'security',
    title: 'Railway Security (RPF)',
    number: '139',
    secondaryNumber: '182',
    badge: 'RPF Emergency Response',
    color: 'blue',
    icon: ShieldAlert,
    tagline: 'Railway Protection Force 24x7 Security & Escort Assistance',
    description: 'Immediate armed police assistance on running trains and railway station premises for safety, theft, or harassment.',
    quickDialOptions: [
      { label: 'Rail Security Emergency (139 -> Press 1)', number: '139', primary: true },
      { label: 'Direct RPF Emergency Helpline', number: '182', primary: false },
      { label: 'National Police Helpline', number: '112', primary: false },
    ],
    ivrsGuide: [
      { key: 'Immediate', desc: 'Notify RPF escort team traveling on your train' },
      { key: 'Next Station', desc: 'RPF personnel attend to coach at immediate next stop' },
      { key: 'Women Safety', desc: 'Dedicated Meri Saheli security teams for solo female travelers' },
    ],
    smsGuide: 'In emergency, tweet @RailMinIndia / @RPF_INDIA or SMS 139 with your PNR and Coach number.',
    tips: [
      'Mention your Coach Number (e.g. S4, B2) and Berth Number immediately.',
      'Report suspicious objects, unauthorized persons, eve-teasing, or theft.',
      'TTE and Train Guard also have direct wireless connectivity with RPF control room.'
    ]
  },
  medical: {
    id: 'medical',
    title: 'On-Train Medical Emergency',
    number: '139',
    secondaryNumber: '112',
    badge: 'First-Aid & Doctor on Call',
    color: 'emerald',
    icon: HeartPulse,
    tagline: 'Emergency medical aid and doctors arranged at upcoming stations',
    description: 'Indian Railways provides first-aid kits on all trains and can dispatch medical officers to your coach at the next major halt.',
    quickDialOptions: [
      { label: 'Medical Assistance on Train (139 -> Press 1)', number: '139', primary: true },
      { label: 'National Emergency Ambulance Service', number: '112', primary: false },
      { label: 'National Ambulance', number: '108', primary: false },
    ],
    ivrsGuide: [
      { key: 'In-Coach', desc: 'First-Aid kit is available with Train Superintendent / TTE & Guard' },
      { key: 'Station Halt', desc: 'Doctor on Call attended at the next scheduled or unscheduled stop' },
      { key: 'Hospital', desc: 'Ambulance standby arranged at platform for critical emergencies' },
    ],
    smsGuide: 'SMS 139 with "MEDICAL <PNR> <Patient Condition>" or inform Coach Attendant immediately.',
    tips: [
      'Contact the Travelling Ticket Examiner (TTE) or Coach Attendant in your coach immediately.',
      'All Station Masters have access to local railway hospitals and city emergency doctors.',
      'Basic life support and oxygen cylinder assistance can be organized at major junctions.'
    ]
  }
};

export default function EmergencyModal({ isOpen, onClose, serviceId }) {
  const [copiedNumber, setCopiedNumber] = useState(null);

  const service = HELPLINE_SERVICES[serviceId] || HELPLINE_SERVICES.madad;
  const Icon = service.icon;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const colorStyles = {
    orange: {
      border: 'border-orange-500/30',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      btnPrimary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20',
      glow: 'shadow-orange-500/10',
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-500/20',
    },
    blue: {
      border: 'border-blue-500/30',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      btnPrimary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-500/20',
      glow: 'shadow-blue-500/10',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
    },
    emerald: {
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      btnPrimary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20',
      glow: 'shadow-emerald-500/10',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  }[service.color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />

      <div className={`relative w-full max-w-2xl bg-[#091122] border ${colorStyles.border} rounded-2xl shadow-2xl ${colorStyles.glow} overflow-hidden max-h-[90vh] flex flex-col z-10 animate-scale-up`}>
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-xl ${colorStyles.iconBg} ${colorStyles.iconColor} border flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">{service.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorStyles.badgeBg}`}>
                  {service.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{service.tagline}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Quick Call Actions Banner */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
              <span>Direct Emergency Helpline Numbers</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.quickDialOptions.map((opt, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition ${
                    opt.primary 
                      ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600' 
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-slate-200 truncate">{opt.label}</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {opt.number || 'Portal Link'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {opt.number && (
                      <>
                        <button
                          onClick={() => handleCopy(opt.number)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center space-x-1"
                          title="Copy Number"
                        >
                          {copiedNumber === opt.number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <a
                          href={`tel:${opt.number}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-md ${colorStyles.btnPrimary}`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </>
                    )}

                    {opt.isWeb && (
                      <a
                        href={opt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service IVRS Menu Guide */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Helpline IVRS / Menu Guide</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.ivrsGuide.map((item, i) => (
                <div key={i} className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs">
                  <span className="w-5 h-5 rounded bg-slate-800 text-orange-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                    {item.key}
                  </span>
                  <span className="text-slate-300">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SMS & Alternate Channel */}
          {service.smsGuide && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/90 flex items-start space-x-2.5 text-xs">
              <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">SMS Support: </span>
                <span className="text-slate-300">{service.smsGuide}</span>
              </div>
            </div>
          )}

          {/* Important Tips */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5 uppercase tracking-wide">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Important Tips for Passengers</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {service.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Indian Railways Helpline Information</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
