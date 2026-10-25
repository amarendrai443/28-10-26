import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Phone,
  Mail,
  Compass,
  Calendar,
  Activity,
  Heart,
  Stethoscope,
  TestTube2,
  ShieldAlert,
  ArrowRight,
  Globe,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToRoute: (route: string, urlPath?: string) => void;
  onOpenServiceBooking: (serviceName?: string) => void;
  onOpenVitalLens: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  language?: string;
}

type SupportedLanguage = 'en-IN' | 'te-IN' | 'hi-IN';

const LANGUAGE_CONFIG: Record<
  SupportedLanguage,
  { name: string; nativeName: string; welcome: string; disclaimer: string }
> = {
  'en-IN': {
    name: 'English',
    nativeName: 'English',
    welcome:
      "Hello! I am your Nhealth AI Voice Assistant. You can ask me to book doctors, schedule lab tests at home, request emergency ambulance, or ask health and wellness questions.",
    disclaimer:
      'Medical Disclaimer: Guidance provided is for educational awareness only. Consult a qualified doctor on Nhealth for actual diagnosis and clinical prescriptions.',
  },
  'te-IN': {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    welcome:
      'నమస్కారం! నేను మీ ఎన్‌హెల్త్ వాయిస్ అసిస్టెంట్. మీరు డాక్టర్ బుకింగ్, హోమ్ ల్యాబ్ టెస్టులు, అంబులెన్స్ లేదా ఆరోగ్య సలహాల గురించి నన్ను అడగవచ్చు.',
    disclaimer:
      'వైద్య నిరాకరణ: ఈ సమాచారం అవగాహన కోసం మాత్రమే. ఖచ్చితమైన నిర్ధారణ మరియు ప్రిస్క్రిప్షన్ కోసం ఎన్‌హెల్త్ అర్హత కలిగిన డాక్టర్‌ను సంప్రదించండి.',
  },
  'hi-IN': {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    welcome:
      'नमस्ते! मैं आपका एनहेल्थ एआई वॉयस असिस्टेंट हूं। आप मुझसे डॉक्टर बुकिंग, घर पर लैब टेस्ट, एम्बुलेंस या स्वास्थ्य संबंधी सलाह के बारे में पूछ सकते हैं।',
    disclaimer:
      'चिकित्सा अस्वीकरण: यह जानकारी केवल जागरूकता के लिए है। वास्तविक निदान और उपचार के लिए एनहेल्थ पर डॉक्टर से परामर्श लें।',
  },
};

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
  onNavigateToRoute,
  onOpenServiceBooking,
  onOpenVitalLens,
}) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState<number[]>([20, 45, 80, 50, 30, 60, 90, 40]);
  const [messages, setMessages] = useState<Message[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const waveAnimInterval = useRef<any>(null);

  // Initialize SpeechSynthesis voices cache and SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Speech Recognition Setup
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLang;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          // If final result detected
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const finalQuery = lastResult[0].transcript.trim();
            if (finalQuery) {
              handleUserQuery(finalQuery);
              setTranscript('');
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.warn('Speech recognition error:', event.error);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }

      // 2. Speech Synthesis Setup & Voice Cache
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        const updateVoices = () => {
          try {
            const vList = window.speechSynthesis.getVoices();
            if (vList && vList.length > 0) {
              voicesRef.current = vList;
            }
          } catch {}
        };
        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Update recognition language on language change and restart if listening
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLang;
      if (isListening) {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              if (recognitionRef.current) {
                recognitionRef.current.lang = currentLang;
                recognitionRef.current.start();
              }
            } catch {}
          }, 150);
        } catch {}
      }
    }
  }, [currentLang]);

  // Audio wave visualizer animation
  useEffect(() => {
    if (isListening || isSpeaking) {
      waveAnimInterval.current = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 65) + 25,
          Math.floor(Math.random() * 85) + 15,
          Math.floor(Math.random() * 95) + 30,
          Math.floor(Math.random() * 70) + 20,
          Math.floor(Math.random() * 90) + 25,
          Math.floor(Math.random() * 60) + 35,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 70) + 30,
        ]);
      }, 120);
    } else {
      setAudioLevel([15, 25, 20, 30, 25, 20, 30, 15]);
      if (waveAnimInterval.current) clearInterval(waveAnimInterval.current);
    }

    return () => {
      if (waveAnimInterval.current) clearInterval(waveAnimInterval.current);
    };
  }, [isListening, isSpeaking]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMsg: Message = {
        id: 'msg-welcome',
        sender: 'assistant',
        text: LANGUAGE_CONFIG[currentLang].welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: {
          label: 'Explore Doctor Consultations',
          onClick: () => {
            onClose();
            onOpenServiceBooking('Online Doctor Consultations');
          },
        },
      };
      setMessages([initialMsg]);
      speakResponse(initialMsg.text, currentLang);
    }
  }, [isOpen]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  // Multi-language Speech Synthesis with Dynamic Voice Matching & Graceful Phonetic Fallback
  const speakResponse = (text: string, lang: SupportedLanguage) => {
    if (!synthRef.current) return;
    try {
      synthRef.current.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 0.95; // Slightly measured rate for clearer regional phonetic articulation
      utterance.pitch = 1.0;

      // Dynamically select best available voice
      let availableVoices = voicesRef.current;
      if (!availableVoices || availableVoices.length === 0) {
        availableVoices = synthRef.current.getVoices();
        voicesRef.current = availableVoices;
      }

      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (lang === 'te-IN' || lang.startsWith('te')) {
        // Priority 1: Exact Telugu language tag (te-IN or te_IN)
        matchedVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase() === 'te-in' ||
            v.lang.toLowerCase() === 'te_in' ||
            v.lang.toLowerCase().startsWith('te-')
        );
        // Priority 2: Voice name containing Telugu / Google Telugu / Mohan
        if (!matchedVoice) {
          matchedVoice = availableVoices.find(
            (v) =>
              v.name.toLowerCase().includes('telugu') ||
              v.name.toLowerCase().includes('mohan')
          );
        }
        // Priority 3: Fallback to Indian English or Indian Hindi voice for localized accent if no offline Telugu voice
        if (!matchedVoice) {
          matchedVoice = availableVoices.find(
            (v) =>
              v.lang.toLowerCase().includes('in') ||
              v.name.toLowerCase().includes('india')
          );
        }
      } else if (lang === 'hi-IN' || lang.startsWith('hi')) {
        matchedVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase() === 'hi-in' ||
            v.lang.toLowerCase() === 'hi_in' ||
            v.lang.toLowerCase().startsWith('hi') ||
            v.name.toLowerCase().includes('hindi')
        );
      } else {
        matchedVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase() === 'en-in' ||
            v.lang.toLowerCase() === 'en_in' ||
            v.lang.toLowerCase().startsWith('en')
        );
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (err) => {
        console.warn('Speech synthesis utterance error:', err);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle voice listening
  const toggleListening = () => {
    stopSpeaking();
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported on this browser. You can type your query in the text box.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Auto-detect language with Telugu and Hindi script & common phonetics
  const detectLanguage = (text: string): SupportedLanguage => {
    // Check Telugu Unicode range: \u0C00-\u0C7F
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
    // Transliterated Telugu phrases
    if (/\b(namaskaram|namaskaramu|ela unnaru|bagunnara|daktar|vaidyudu|aushadham|mandulu|raktham|pariksha|jvaram|tagginchandi)\b/i.test(text)) {
      return 'te-IN';
    }
    // Check Devanagari/Hindi Unicode range: \u0900-\u097F
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
    // Transliterated Hindi phrases
    if (/\b(namaste|kaise ho|doctor sahab|dawa|davai|bukhar|dill|aspatal)\b/i.test(text)) {
      return 'hi-IN';
    }
    return currentLang;
  };

  // Intelligent Healthcare & Navigation Knowledge Base
  const handleUserQuery = (query: string) => {
    const q = query.toLowerCase().trim();
    const detected = detectLanguage(query);
    if (detected !== currentLang) {
      setCurrentLang(detected);
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    let responseText = '';
    let action: { label: string; onClick: () => void } | undefined;

    // 1. Emergency & Ambulance Queries
    if (
      q.includes('emergency') ||
      q.includes('ambulance') ||
      q.includes('sos') ||
      q.includes('accident') ||
      q.includes('chest pain') ||
      q.includes('heart attack') ||
      q.includes('stroke') ||
      q.includes('ఆంబులెన్స్') ||
      q.includes('ఎమర్జెన్సీ') ||
      q.includes('एम्बुलेंस') ||
      q.includes('आपातकाल')
    ) {
      if (detected === 'te-IN') {
        responseText =
          'అత్యవసర హెల్ప్‌లైన్: దయచేసి వెంటనే మా 24/7 అత్యవసర బృందానికి 9581582220 నంబర్‌కు కాల్ చేయండి. మా GPS స్మార్ట్ అంబులెన్స్ సదుపాయం సిద్ధంగా ఉంది.';
      } else if (detected === 'hi-IN') {
        responseText =
          'आपातकालीन सहायता: कृपया तुरंत हमारे 24/7 इमरजेंसी नंबर 9581582220 पर कॉल करें। हमारी जीपीएस स्मार्ट एम्बुलेंस और मेडिकल टीम तैयार है।';
      } else {
        responseText =
          'CRITICAL ALERT: If this is a medical emergency, please call our 24/7 Emergency SOS Line immediately at 9581582220 or 9393934621. We have GPS-tracked ICU ambulances on standby.';
      }
      action = {
        label: 'Call 24/7 Emergency SOS (9581582220)',
        onClick: () => {
          window.location.href = 'tel:9581582220';
        },
      };
    }

    // 2. Doctor Consultation & Appointments
    else if (
      q.includes('doctor') ||
      q.includes('consult') ||
      q.includes('appointment') ||
      q.includes('physician') ||
      q.includes('specialist') ||
      q.includes('డాక్టర్') ||
      q.includes('కన్సల్టేషన్') ||
      q.includes('डॉक्टर') ||
      q.includes('अपॉइंटमेंट')
    ) {
      if (detected === 'te-IN') {
        responseText =
          'ఎన్‌హెల్త్ ద్వారా మీరు ఇంట్లోనే ఆన్‌లైన్ వీడియో కన్సల్టేషన్ లేదా డాక్టర్ హోమ్ విజిట్‌ను సులభంగా బుక్ చేసుకోవచ్చు. నిమిషాల్లో కనెక్ట్ అవ్వండి.';
      } else if (detected === 'hi-IN') {
        responseText =
          'एनहेल्थ के साथ आप आसानी से ऑनलाइन डॉक्टर वीडियो परामर्श या घर पर डॉक्टर विजिट बुक कर सकते हैं। डिजिटल पर्ची तुरंत उपलब्ध होती है।';
      } else {
        responseText =
          'Nhealth provides instant Online Video Doctor Consultations as well as Doctor Home Visits with certified general physicians and specialists. Would you like to book an appointment now?';
      }
      action = {
        label: 'Book Doctor Consultation',
        onClick: () => {
          onClose();
          onOpenServiceBooking('Online Doctor Consultations');
        },
      };
    }

    // 3. Lab Tests & Home Diagnostics
    else if (
      q.includes('lab') ||
      q.includes('test') ||
      q.includes('blood') ||
      q.includes('diagnostic') ||
      q.includes('sugar') ||
      q.includes('thyroid') ||
      q.includes('ల్యాబ్') ||
      q.includes('రక్త పరీక్ష') ||
      q.includes('लैब') ||
      q.includes('ब्लड टेस्ट')
    ) {
      if (detected === 'te-IN') {
        responseText =
          'మా వద్ద NABL గుర్తింపు పొందిన ల్యాబ్ పరీక్షలు మరియు ఇంట్లోనే నమూనా సేకరణ (బ్లడ్/యూరిన్) అందుబాటులో ఉన్నాయి. రిపోర్టులు 12 నుండి 24 గంటల్లో డిజిటల్‌గా వస్తాయి.';
      } else if (detected === 'hi-IN') {
        responseText =
          'एनहेल्थ आपके घर पर दर्द-रहित ब्लड व पैथोलॉजी टेस्ट सैंपल कलेक्शन उपलब्ध कराता है। 12 से 24 घंटों में एनएबीएल प्रमाणित रिपोर्ट पाएं।';
      } else {
        responseText =
          'Nhealth offers sterile doorstep blood and pathology sample collection by certified phlebotomists. All tests are processed in NABL-accredited labs with digital reports within 12-24 hours.';
      }
      action = {
        label: 'Book Home Lab Tests',
        onClick: () => {
          onClose();
          onOpenServiceBooking('Home Diagnostics & Lab Tests');
        },
      };
    }

    // 4. Vital Lens AI Vitals Scanner
    else if (
      q.includes('vital') ||
      q.includes('lens') ||
      q.includes('pulse') ||
      q.includes('heart rate') ||
      q.includes('spo2') ||
      q.includes('scan') ||
      q.includes('వైటల్స్') ||
      q.includes('वाइटल्स')
    ) {
      if (detected === 'te-IN') {
        responseText =
          'ఎన్‌హెల్త్ వైటల్ లెన్స్ మీ కెమెరా ద్వారా ముఖ స్కాన్ చేసి హృదయ స్పందన రేటు, శ్వాస రేటు మరియు ఎస్పీఓ2 వంటి ముఖ్యమైన అంశాలను లెక్కిస్తుంది.';
      } else if (detected === 'hi-IN') {
        responseText =
          'एनहेल्थ वाइटल लेंस आपके स्मार्टफोन कैमरे से कांटेक्टलेस फेशियल स्कैन करके हार्ट रेट, सांस दर और अनुमानित SpO2 को मापता है।';
      } else {
        responseText =
          'Nhealth Vital Lens is our contactless AI biometric scanner. Using only your camera for 30 seconds, it evaluates heart rate, respiratory rate, HRV, and blood oxygen trends.';
      }
      action = {
        label: 'Open Nhealth Vital Lens',
        onClick: () => {
          onClose();
          onOpenVitalLens();
        },
      };
    }

    // 5. Nursing Care & Eldercare
    else if (
      q.includes('nurse') ||
      q.includes('nursing') ||
      q.includes('elder') ||
      q.includes('senior') ||
      q.includes('attendant') ||
      q.includes('bedside') ||
      q.includes('నర్సింగ్') ||
      q.includes('వృద్ధుల') ||
      q.includes('नर्सिंग') ||
      q.includes('बुजुर्ग')
    ) {
      if (detected === 'te-IN') {
        responseText =
          'మా వద్ద శిక్షణ పొందిన నర్సులు మరియు కేర్-టేకర్లు అందుబాటులో ఉన్నారు. సర్జరీ తర్వాత సంరక్షణ, ఇంజెక్షన్లు, మరియు సీనియర్ సిటిజన్స్ అసిస్టెన్స్ కోసం బుక్ చేసుకోండి.';
      } else if (detected === 'hi-IN') {
        responseText =
          'एनहेल्थ पेशेवर नर्सिंग और बुजुर्गों की सेवा के लिए प्रशिक्षित अटेंडेंट प्रदान करता है। पोस्ट-ऑपरेटिव और बेडसाइड देखभाल उपलब्ध है।';
      } else {
        responseText =
          'Nhealth provides qualified B.Sc/GNM certified nurses and compassionate bedside attendants for elderly care, IV infusions, post-operative rehabilitation, and 12/24-hour shifts.';
      }
      action = {
        label: 'Book Nursing Care at Home',
        onClick: () => {
          onClose();
          onOpenServiceBooking('Specialized Nursing Care at Home');
        },
      };
    }

    // 6. Physiotherapy
    else if (
      q.includes('physio') ||
      q.includes('back pain') ||
      q.includes('knee') ||
      q.includes('joint') ||
      q.includes('paralysis') ||
      q.includes('stroke') ||
      q.includes('ఫిజియో') ||
      q.includes('నొప్పి') ||
      q.includes('फिजियो')
    ) {
      if (detected === 'te-IN') {
        responseText =
          'కీళ్ల నొప్పులు, పక్షవాతం, వెన్నునొప్పి మరియు శస్త్రచికిత్స అనంతర రికవరీ కోసం సర్టిఫైడ్ ఫిజియోథెరపిస్టులు మీ ఇంటి వద్దకే వస్తారు.';
      } else if (detected === 'hi-IN') {
        responseText =
          'एनहेल्थ प्रमाणित फिजियोथेरेपिस्ट आपके घर पर न्यूरो, आर्थो और स्पाइन पुनर्वास चिकित्सा प्रदान करते हैं।';
      } else {
        responseText =
          'Our certified physiotherapists visit your residence with specialized portable electrotherapy equipment for orthopedic, neurological, and post-surgery rehabilitation.';
      }
      action = {
        label: 'Schedule Home Physiotherapy',
        onClick: () => {
          onClose();
          onOpenServiceBooking('Physiotherapy at Home');
        },
      };
    }

    // 7. Pharmacy & Medicines
    else if (
      q.includes('medicine') ||
      q.includes('pharmacy') ||
      q.includes('tablet') ||
      q.includes('drug') ||
      q.includes('మందులు') ||
      q.includes('दवा')
    ) {
      if (detected === 'te-IN') {
        responseText =
          '100% నిజమైన మందులను మీ ఇంటి వద్దకే 2 నుండి 4 గంటల్లో డెలివరీ చేస్తాము. ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేసి ఆర్డర్ చేయండి.';
      } else if (detected === 'hi-IN') {
        responseText =
          '100% असली दवाइयां सीधे आपके घर पर 2 से 4 घंटे के अंदर पहुंचाई जाती हैं। बैच वेरिफिकेशन के साथ पूरी सुरक्षा।';
      } else {
        responseText =
          'Doorstep Pharmacy by Nhealth guarantees 100% genuine pharmaceuticals and chronic refill delivery within 2 to 4 hours in temperature-monitored packages.';
      }
      action = {
        label: 'Order Doorstep Pharmacy',
        onClick: () => {
          onClose();
          onOpenServiceBooking('Doorstep Pharmacy');
        },
      };
    }

    // 8. Partner With Us / Portal Navigation
    else if (
      q.includes('partner') ||
      q.includes('onboard') ||
      q.includes('join') ||
      q.includes('rider') ||
      q.includes('hospital join') ||
      q.includes('పార్ట్నర్') ||
      q.includes('पार्टनर')
    ) {
      responseText =
        'Doctors, Clinics, Diagnostic Labs, Hospitals, and Care Riders can join the Nhealth Unified Healthcare Network with zero onboarding fees and transparent settlements.';
      action = {
        label: 'Open Partner Portal',
        onClick: () => {
          onClose();
          onNavigateToRoute('partner-with-us', '/partner-with-us');
        },
      };
    }

    // 9. Contact Us & Support
    else if (
      q.includes('contact') ||
      q.includes('support') ||
      q.includes('phone') ||
      q.includes('call') ||
      q.includes('help') ||
      q.includes('నెంబర్') ||
      q.includes('సంప్రదించండి') ||
      q.includes('नंबर')
    ) {
      responseText =
        'You can reach Nhealth 24/7 Support by Phone at 9393934621, Emergency SOS at 9581582220, or via Email at support@nhealth.in.';
      action = {
        label: 'Call Support (+91 9393934621)',
        onClick: () => {
          window.location.href = 'tel:9393934621';
        },
      };
    }

    // 10. General Health & Wellness Tips
    else if (
      q.includes('fever') ||
      q.includes('cold') ||
      q.includes('cough') ||
      q.includes('headache') ||
      q.includes('diet') ||
      q.includes('water') ||
      q.includes('diabetes') ||
      q.includes('bp') ||
      q.includes('pressure')
    ) {
      responseText =
        'Health Tip: Stay well-hydrated with at least 2.5 to 3 liters of fluids daily. For mild fever or headache, take adequate rest, monitor temperature, and maintain light meals. If symptoms persist over 24-48 hours, consult a physician promptly.\n\nNotice: ' +
        LANGUAGE_CONFIG[detected].disclaimer;
      action = {
        label: 'Consult a Doctor Now',
        onClick: () => {
          onClose();
          onOpenServiceBooking('Online Doctor Consultations');
        },
      };
    }

    // 11. Default fallback
    else {
      if (detected === 'te-IN') {
        responseText = `నేను డాక్టర్ సంప్రదింపులు, హోమ్ టెస్టులు, మందుల డెలివరీ లేదా అంబులెన్స్ సేవలను బుక్ చేయడంలో మీకు సహాయపడగలను. మీరు ఏమి చేయాలనుకుంటున్నారు?`;
      } else if (detected === 'hi-IN') {
        responseText = `मैं आपको डॉक्टर कंसल्टेशन, लैब टेस्ट, होम नर्सिंग, या इमरजेंसी एम्बुलेंस बुक करने में मदद कर सकता हूं। कृपया बताएं कि आप क्या ढूंढ रहे हैं?`;
      } else {
        responseText = `I can help you schedule online/home doctor visits, book home lab tests, order doorstep pharmacy, request 24/7 ambulances, or answer wellness questions. What healthcare service do you need today?`;
      }
      action = {
        label: 'View All Healthcare Services',
        onClick: () => {
          onClose();
          onNavigateToSection('services');
        },
      };
    }

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      language: detected,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    speakResponse(responseText, detected);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleUserQuery(textInput);
    setTextInput('');
  };

  // Quick suggestion chips based on active tongue
  const getSuggestions = () => {
    if (currentLang === 'te-IN') {
      return [
        'డాక్టర్ సంప్రదింపు బుకింగ్',
        'హోమ్ ల్యాబ్ రక్త పరీక్ష',
        'అత్యవసర అంబులెన్స్',
        'వైటల్ లెన్స్ స్కాన్',
        'జ్వరం ఆరోగ్య సలహా',
      ];
    }
    if (currentLang === 'hi-IN') {
      return [
        'डॉक्टर अपॉइंटमेंट बुक करें',
        'होम लैब ब्लड टेस्ट',
        'इमरजेंसी एम्बुलेंस',
        'वाइटल लेंस स्कैन',
        'बुखार स्वास्थ्य सलाह',
      ];
    }
    return [
      'Book doctor at home',
      'Schedule lab test',
      'Emergency ambulance',
      'Scan my vitals',
      'Fever health advice',
    ];
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nhealth AI Voice Assistant"
      className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#000d1a]/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      {/* Responsive Dark Blue Console Container (16:9 on Desktop, Perfectly Sized on Mobile/Tablet) */}
      <div
        style={{
          maxHeight: 'min(85vh, 85dvh)',
        }}
        className="relative w-[92vw] sm:w-[90vw] md:w-full max-w-[420px] md:max-w-5xl max-h-[85vh] md:max-h-[90vh] md:aspect-[16/9] bg-[#00172d] border border-sky-500/30 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,180,216,0.3)] flex flex-col overflow-hidden text-white my-auto mx-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-[#002242] border-b border-sky-500/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Multi-colour gradient glowing icon badge */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-teal-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#00172d] rounded-full flex items-center justify-center">
                <Mic className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">
                  Nhealth Voice Assistant
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/30">
                  <Sparkles className="w-2.5 h-2.5 text-teal-300" /> Live AI
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-sky-200/70 truncate max-w-[190px] sm:max-w-none">
                Telugu, Hindi & English Healthcare AI
              </p>
            </div>
          </div>

          {/* Language Selector & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center bg-[#00172d] border border-sky-500/30 rounded-xl p-0.5 sm:p-1 text-xs">
              {(['en-IN', 'te-IN', 'hi-IN'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setCurrentLang(lang);
                    stopSpeaking();
                  }}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                    currentLang === lang
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-sky-200/70 hover:text-white'
                  }`}
                >
                  {LANGUAGE_CONFIG[lang].nativeName}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch {}
                }
                onClose();
              }}
              aria-label="Close Assistant"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-sky-950/60 hover:bg-red-500/20 text-sky-300 hover:text-red-400 border border-sky-500/20 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Dual Pane Body (Responsive: Scrollable flex on mobile/tablet, 16:9 grid on desktop) */}
        <div className="flex flex-col md:grid md:grid-cols-12 flex-1 overflow-y-auto md:overflow-hidden min-h-0">
          {/* Left Visualizer & Interactive Voice Controls (5 cols on md) */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#001c37] to-[#001326] p-3 sm:p-5 md:p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-sky-500/20 shrink-0">
            {/* Live Speech Wave Visualizer */}
            <div className="w-full flex flex-col items-center justify-center my-auto py-1 sm:py-3">
              {/* Outer pulsing ring orb */}
              <div className="relative flex items-center justify-center mb-2 sm:mb-4">
                <div
                  className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-600/30 to-teal-400/20 flex items-center justify-center border border-sky-400/30 transition-all duration-300 ${
                    isListening ? 'scale-105 sm:scale-110 shadow-[0_0_35px_rgba(56,189,248,0.5)]' : ''
                  }`}
                >
                  {/* Inner Voice Core */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#002b49] via-[#003d6b] to-[#00172d] border border-sky-300/40 flex items-center justify-center shadow-inner">
                    <Mic
                      className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-colors ${
                        isListening
                          ? 'text-teal-300 animate-pulse'
                          : isSpeaking
                          ? 'text-sky-300 animate-bounce'
                          : 'text-sky-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Animated sound wave bars around the orb */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-0.5 sm:gap-1 md:gap-1.5 opacity-90">
                  {audioLevel.map((lvl, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${lvl}%` }}
                      className="w-1 sm:w-1.5 bg-gradient-to-t from-teal-400 via-sky-300 to-indigo-400 rounded-full transition-all duration-100"
                    />
                  ))}
                </div>
              </div>

              {/* Status Indicator Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-center">
                <span
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                    isListening
                      ? 'bg-emerald-400 animate-ping'
                      : isSpeaking
                      ? 'bg-sky-400 animate-pulse'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px] sm:text-sm font-semibold text-sky-200">
                  {isListening
                    ? currentLang === 'te-IN'
                      ? 'మాట్లాడండి... మీ మాటలు వింటున్నాను'
                      : 'Listening continuously... Speak now'
                    : isSpeaking
                    ? currentLang === 'te-IN'
                      ? 'సమాధానం చెబుతున్నాను...'
                      : 'Speaking response...'
                    : currentLang === 'te-IN'
                    ? 'మైక్ నొక్కి మాట్లాడండి'
                    : 'Tap microphone to speak'}
                </span>
              </div>

              {/* Live interim transcript display */}
              {transcript && (
                <div className="w-full max-w-xs bg-sky-950/70 border border-sky-400/30 rounded-xl p-2 text-center text-[11px] sm:text-xs text-sky-200 animate-fade-in italic">
                  "{transcript}"
                </div>
              )}
            </div>

            {/* Voice Control Buttons */}
            <div className="w-full flex items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 shadow-red-500/30'
                    : 'bg-gradient-to-r from-teal-500 via-sky-600 to-indigo-600 text-white hover:from-teal-400 hover:via-sky-500 hover:to-indigo-500 shadow-sky-500/30 hover:scale-105'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" /> Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Start Voice Input
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  title="Mute voice synthesis"
                  className="p-2.5 sm:p-3 rounded-full bg-sky-950/80 hover:bg-sky-900 border border-sky-500/30 text-sky-300 hover:text-white transition-colors cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Chips (Localized for English, Telugu, and Hindi) */}
            <div className="w-full mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-sky-500/15">
              <p className="text-[10px] sm:text-[11px] text-sky-300/70 mb-1.5 font-medium">
                {currentLang === 'te-IN' ? 'ప్రశ్నించడానికి ఎంచుకోండి:' : 'Try asking:'}
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {getSuggestions().map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleUserQuery(sugg)}
                    className="text-[10.5px] sm:text-[11px] bg-sky-950/70 hover:bg-sky-900/90 text-sky-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-sky-500/20 hover:border-sky-400/50 transition-all cursor-pointer text-left"
                  >
                    "{sugg}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Conversation Stream & Text Fallback (7 cols on md) */}
          <div className="md:col-span-7 flex flex-col justify-between overflow-hidden bg-[#00172d]/90 flex-1 min-h-[220px] md:min-h-0">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 max-h-[35vh] md:max-h-none scrollbar-thin">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-end' : 'items-start'
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-xs shadow-md'
                        : 'bg-[#002242] text-sky-100 rounded-bl-xs border border-sky-500/20 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Interactive Action Button for Client-side Navigation */}
                    {m.action && (
                      <div className="mt-2.5 pt-2 border-t border-sky-500/20">
                        <button
                          type="button"
                          onClick={m.action.onClick}
                          className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <span>{m.action.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-sky-400/50 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Medical Disclaimer Banner */}
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#001c37] border-t border-sky-500/20 text-[10px] sm:text-[11px] text-sky-300/80 flex items-start gap-1.5 sm:gap-2 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Medical Disclaimer:</strong>{' '}
                {LANGUAGE_CONFIG[currentLang].disclaimer}
              </p>
            </div>

            {/* Persistent Contact Info Bar */}
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#001326] border-t border-sky-500/15 flex flex-wrap items-center justify-between gap-1 sm:gap-2 text-[10.5px] sm:text-[11px] text-sky-300/90 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <a
                  href="tel:9393934621"
                  className="flex items-center gap-1 sm:gap-1.5 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>Call: +91 93939 34621</span>
                </a>
                <a
                  href="mailto:support@nhealth.in"
                  className="flex items-center gap-1 sm:gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>support@nhealth.in</span>
                </a>
              </div>
              <span className="text-slate-400 text-[9.5px] sm:text-[10px]">Unified Healthcare AI</span>
            </div>

            {/* Text Input Fallback Bar */}
            <form
              onSubmit={handleTextSubmit}
              className="p-2 sm:p-3 bg-[#002242] border-t border-sky-500/20 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  currentLang === 'te-IN'
                    ? 'లేదా మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                    : currentLang === 'hi-IN'
                    ? 'या अपना सवाल यहां टाइप करें...'
                    : 'Or type your health query or service name...'
                }
                className="flex-1 bg-[#00172d] border border-sky-500/30 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm text-white placeholder-sky-300/40 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-1.5 sm:px-4 sm:py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
