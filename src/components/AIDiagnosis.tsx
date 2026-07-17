import React, { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Disc, AlertTriangle, Cpu, Wrench, Shield, ShoppingBag, 
  Calendar, CheckCircle2, ChevronRight, Volume2, Camera, Video, 
  PhoneCall, Send, RefreshCw, Eye, Activity, HelpCircle, UserCheck, 
  ArrowLeftRight, Signal, Link, Check, AlertCircle
} from "lucide-react";
import { DiagnosisResult, CodeTranslationResult, VehicleType } from "../types";

interface AIDiagnosisProps {
  onAddAppointment: (serviceType: string, vehicleModel: string, vehicleType: VehicleType) => void;
  onOrderParts: (parts: string[]) => void;
}

export default function AIDiagnosis({ onAddAppointment, onOrderParts }: AIDiagnosisProps) {
  const [activeTab, setActiveTab] = useState<"acoustic" | "obd" | "remote">("acoustic");
  
  // Acoustic State
  const [carModel, setCarModel] = useState("تويوتا كامري 2022");
  const [fuelType, setFuelType] = useState<VehicleType>("gasoline");
  const [selectedSound, setSelectedSound] = useState("engine_knocking");
  const [customNotes, setCustomNotes] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // OBD Code State
  const [obdCode, setObdCode] = useState("P0300");
  const [isTranslatingCode, setIsTranslatingCode] = useState(false);
  const [codeResult, setCodeResult] = useState<CodeTranslationResult | null>(null);

  // --- Remote & Self Diagnosis State ---
  const [activeRemoteSubTab, setActiveRemoteSubTab] = useState<"self" | "visual" | "session">("self");
  
  // 1. Self Diagnosis Wizard State
  const [selfSymptomArea, setSelfSymptomArea] = useState<"engine" | "brakes" | "dashboard">("engine");
  const [selfSelectedSymptoms, setSelfSelectedSymptoms] = useState<string[]>([]);
  const [selfSmokeColor, setSelfSmokeColor] = useState<string>("none");
  const [isSelfDiagnosing, setIsSelfDiagnosing] = useState(false);
  const [selfDiagnosisResult, setSelfDiagnosisResult] = useState<any>(null);

  // 2. Visual Camera AI Scanner State
  const [visualScanType, setVisualScanType] = useState<"dashboard_lights" | "engine_bay" | "brake_pads">("dashboard_lights");
  const [isVisualScanning, setIsVisualScanning] = useState(false);
  const [visualScanProgress, setVisualScanProgress] = useState(0);
  const [visualScanResult, setVisualScanResult] = useState<any>(null);
  const [selectedBlueprintMarker, setSelectedBlueprintMarker] = useState<boolean>(false);

  // 3. Remote Support Session State
  const [remoteSessionActive, setRemoteSessionActive] = useState(false);
  const [remoteSessionCode, setRemoteSessionCode] = useState("");
  const [isConnectingSession, setIsConnectingSession] = useState(false);
  const [activeRemoteCall, setActiveRemoteCall] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "tech"; text: string; time: string }>>([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [userChatInput, setUserChatInput] = useState("");
  const [telemetry, setTelemetry] = useState({ rpm: 750, temp: 88, voltage: 13.8 });

  // Sound presets with Arabic labels
  const soundPresets = [
    { id: "engine_knocking", label: "طقطقة المحرك المعدنية (Engine Knock)", type: "gasoline" },
    { id: "wheel_squeaking", label: "صفير فرملة العجلات (Wheel Squeak)", type: "all" },
    { id: "belt_shrieking", label: "صرير سير الماكينة (Belt Squeal)", type: "gasoline" },
    { id: "exhaust_roaring", label: "هدير تسريب العادم (Exhaust Leak)", type: "all" },
  ];

  // OBD common codes list
  const commonObdCodes = [
    { code: "P0300", desc: "تقطيع عشوائي بالاحتراق (Random Misfire)" },
    { code: "P0171", desc: "خليط وقود فقير بالهواء (System Too Lean)" },
    { code: "P0420", desc: "ضعف كفاءة دبة التلوث (Catalyst Inefficient)" },
    { code: "P0301", desc: "توقف احتراق السلندر الأول (Cylinder 1 Misfire)" },
  ];

  // Self-diagnosis symptom lists by area
  const symptomsByArea = {
    engine: [
      { id: "misfire", label: "تفتفة أو رجفة غير طبيعية في المكينة" },
      { id: "loss_power", label: "ضعف العزم والتسارع عند الضغط على البنزين" },
      { id: "hard_start", label: "تأخر أو صعوبة في تشغيل السيارة صباحاً" },
      { id: "overheating", label: "ارتفاع مؤشر درجة حرارة المحرك عن المعتاد" },
    ],
    brakes: [
      { id: "squeal", label: "صوت صفير أو صرير معدني حاد عند الضغط على الفرامل" },
      { id: "vibration", label: "رجفة واهتزاز في مقود السيارة مع كبح الفرامل" },
      { id: "soft_pedal", label: "دواسة الفرامل خفيفة جداً أو تبدو إسفنجية" },
      { id: "pull", label: "انحراف السيارة لجهة واحدة عند الفرملة المفاجئة" },
    ],
    dashboard: [
      { id: "check_engine", label: "لمبة فحص المحرك الصفراء (Check Engine) مضيئة" },
      { id: "abs_light", label: "لمبة نظام مانع الانزلاق أو ABS مضيئة" },
      { id: "oil_light", label: "لمبة تحذير ضغط زيت الماكينة ترمش أو ثابتة" },
      { id: "battery_light", label: "لمبة تحذير الدينامو وشحن البطارية حمراء" },
    ]
  };

  // Automated dialogue for the Remote Technician Session
  const automatedTechChat = [
    { sender: "tech", text: "أهلاً بك يا فندم في بوابتنا للدعم الفني الرقمي من الورشة الذكية. معك المهندس خالد العتيبي من مركز الرياض." },
    { sender: "tech", text: "لقد قمت الآن بربط حساسات سيارتك عبر بوابتنا اللاسلكية. يظهر لي ضغط الماكينة وحرارة سائل التبريد بصورة ممتازة." },
    { sender: "tech", text: "لو سمحت، اضغط على دواسة الوقود برفق لبضع ثوان حتى ترتفع سرعة دوران الماكينة (RPM) لنرى استجابة حساسات الاحتراق الحية." },
    { sender: "tech", text: "ممتاز، أرى قفزة بسيطة في معدل اختلال الاحتراق (Misfire) في الأسطوانة رقم 3 عند تخطي 2500 دورة. هل يمكنك توجيه كاميرا الهاتف نحو غطاء المحرك والكويل الثالث تحديداً؟" },
    { sender: "tech", text: "رائع، أرى بالمسح البصري المباشر آثار زيت خفيفة حول فتحة البوجي مما يسبب تهريب الشرارة. هذا عطل بسيط ومضمون." },
    { sender: "tech", text: "لقد قمت بتجهيز كويل أصلي جديد ووجه غطاء البلوف في فرعنا الأقرب إليك (فرع الصحافة)، وحجزت لك موعداً سريعاً سيستغرق 15 دقيقة فقط للتركيب والبرمجة!" }
  ];

  // Fluctuating values during active Support Session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRemoteCall) {
      interval = setInterval(() => {
        setTelemetry((prev) => ({
          rpm: Math.floor(740 + Math.random() * 40 + (Math.random() > 0.8 ? 1200 : 0)),
          temp: Math.floor(88 + Math.random() * 3),
          voltage: Math.round((13.7 + Math.random() * 0.2) * 10) / 10
        }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [activeRemoteCall]);

  // Handle acoustic sound play simulation
  const audioInterval = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isPlayingSound) {
      audioInterval.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingSound(false);
            return 0;
          }
          return prev + 5;
        });
      }, 150);
    } else {
      if (audioInterval.current) {
        clearInterval(audioInterval.current);
      }
    }
    return () => {
      if (audioInterval.current) clearInterval(audioInterval.current);
    };
  }, [isPlayingSound]);

  const toggleSoundPlay = () => {
    setIsPlayingSound(!isPlayingSound);
    if (!isPlayingSound) {
      setAudioProgress(0);
    }
  };

  // Acoustic AI diagnosis caller
  const handleAcousticDiagnosis = async () => {
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soundType: selectedSound,
          carModel,
          fuelType,
          customNotes
        })
      });
      const data = await response.json();
      setDiagnosisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // OBD translation caller
  const handleCodeTranslation = async (codeToTranslate?: string) => {
    const codeVal = codeToTranslate || obdCode;
    if (codeToTranslate) {
      setObdCode(codeToTranslate);
    }
    setIsTranslatingCode(true);
    setCodeResult(null);
    try {
      const response = await fetch("/api/translate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeVal,
          carModel
        })
      });
      const data = await response.json();
      setCodeResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslatingCode(false);
    }
  };

  // 1. Guided Self-Diagnosis caller
  const handleSelfDiagnosis = async () => {
    setIsSelfDiagnosing(true);
    setSelfDiagnosisResult(null);
    try {
      const response = await fetch("/api/self-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptomArea: selfSymptomArea,
          symptoms: selfSelectedSymptoms,
          smokeColor: selfSmokeColor,
          carModel,
          fuelType
        })
      });
      const data = await response.json();
      setSelfDiagnosisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSelfDiagnosing(false);
    }
  };

  // Toggle checklist selection
  const handleSymptomToggle = (id: string) => {
    setSelfSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 2. Visual AI Scanner Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisualScanning) {
      timer = setInterval(() => {
        setVisualScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsVisualScanning(false);
            fetchVisualScanResult();
            return 100;
          }
          return prev + 10;
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isVisualScanning]);

  const handleStartVisualScan = () => {
    setIsVisualScanning(true);
    setVisualScanProgress(0);
    setVisualScanResult(null);
    setSelectedBlueprintMarker(false);
  };

  const fetchVisualScanResult = async () => {
    try {
      const response = await fetch("/api/visual-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanType: visualScanType,
          carModel
        })
      });
      const data = await response.json();
      setVisualScanResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Support Session Generator
  const handleGenerateSession = () => {
    setIsConnectingSession(true);
    setTimeout(() => {
      const randomCode = `${Math.floor(100 + Math.random() * 900)}-DIAG-${Math.floor(1000 + Math.random() * 9000)}`;
      setRemoteSessionCode(randomCode);
      setRemoteSessionActive(true);
      setIsConnectingSession(false);
    }, 1200);
  };

  const handleStartCall = () => {
    setActiveRemoteCall(true);
    setChatMessages([]);
    setCurrentChatIndex(0);
  };

  // Sequentially inject technician chat messages
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeRemoteCall && currentChatIndex < automatedTechChat.length) {
      timer = setTimeout(() => {
        setChatMessages((prev) => [...prev, automatedTechChat[currentChatIndex]]);
        setCurrentChatIndex((prev) => prev + 1);
      }, currentChatIndex === 0 ? 500 : 4500);
    }
    return () => clearTimeout(timer);
  }, [activeRemoteCall, currentChatIndex]);

  const handleSendUserMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;
    const newMessage = { sender: "user" as const, text: userChatInput, time: "الآن" };
    setChatMessages((prev) => [...prev, newMessage]);
    setUserChatInput("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-12" id="ai-diagnosis-section">
      {/* Tab Switcher */}
      <div className="flex flex-col md:flex-row border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
        <button
          onClick={() => setActiveTab("acoustic")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "acoustic"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/15"
              : "text-slate-600 hover:bg-slate-100/70"
          }`}
        >
          <Volume2 className="w-5 h-5" />
          <span>التشخيص السمعي بالذكاء الاصطناعي</span>
        </button>
        
        <button
          onClick={() => setActiveTab("obd")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "obd"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
              : "text-slate-600 hover:bg-slate-100/70"
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span>مترجم أكواد الأعطال OBD-II</span>
        </button>

        <button
          onClick={() => setActiveTab("remote")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "remote"
              ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/15"
              : "text-slate-600 hover:bg-slate-100/70"
          }`}
        >
          <Signal className="w-5 h-5 animate-pulse" />
          <span>بوابة التشخيص الذاتي والرقمي عن بعد</span>
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "acoustic" ? (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Parameters Inputs */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">معلومات المركبة</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">طراز وموديل السيارة</label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                        placeholder="مثال: تويوتا هيلوكس 2020، هيونداي سوناتا"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">نوع المحرك / الطاقة</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "gasoline", label: "بنزين" },
                          { id: "diesel", label: "ديزل" },
                          { id: "hybrid", label: "هجين (Hybrid)" },
                          { id: "electric", label: "كهربائي بالكامل" },
                        ].map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFuelType(type.id as VehicleType)}
                            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                              fuelType === type.id
                                ? "bg-amber-50 border-amber-300 text-amber-700"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">أصوات الأعطال المسجلة</h3>
                  <p className="text-xs text-slate-400 mb-3">حدد أحد أصوات المحرك أو العجلات الشائعة للمعاينة والتحليل الفوري بالذكاء الاصطناعي</p>
                  
                  <div className="space-y-2">
                    {soundPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedSound(preset.id);
                          setIsPlayingSound(false);
                          setAudioProgress(0);
                        }}
                        className={`w-full p-3 rounded-xl border text-right transition flex items-center justify-between ${
                          selectedSound === preset.id
                            ? "bg-slate-900 text-white border-slate-900"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm font-medium">{preset.label}</span>
                        <Disc className={`w-4 h-4 ${selectedSound === preset.id ? "animate-spin text-amber-400" : "text-slate-400"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Audio Tape Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">مشغل محاكاة الصوت</span>
                    <span className="text-xs font-mono text-slate-500">{isPlayingSound ? `${audioProgress}%` : "جاهز لبث الصوت"}</span>
                  </div>
                  
                  {/* Dynamic waveform visualizer */}
                  <div className="h-12 flex items-end justify-center gap-1.5 px-2 bg-slate-950 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />
                    {Array.from({ length: 24 }).map((_, i) => {
                      const heights = isPlayingSound 
                        ? [30, 80, 50, 95, 40, 70, 85, 20, 60, 45, 90, 75, 35, 80, 55, 95, 42, 68, 88, 25, 63, 49, 92, 70]
                        : [20, 15, 10, 15, 20, 15, 10, 15, 20, 15, 10, 15, 20, 15, 10, 15, 20, 15, 10, 15, 20, 15, 10, 15];
                      
                      const height = heights[i % heights.length];
                      const activeHeight = isPlayingSound ? Math.random() * 80 + 20 : height;

                      return (
                        <div
                          key={i}
                          style={{ height: `${isPlayingSound ? activeHeight : height}%` }}
                          className={`w-1.5 rounded-t-sm transition-all duration-150 ${
                            isPlayingSound ? "bg-amber-400" : "bg-slate-700"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={toggleSoundPlay}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      {isPlayingSound ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-amber-400" />
                          <span>استماع لعينة الصوت</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ملاحظات إضافية حول سلوك السيارة</label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition text-sm"
                    placeholder="مثال: يزداد الصوت عند الالتفاف لليمين، أو تظهر رجفة خفيفة في المقود..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAcousticDiagnosis}
                  disabled={isDiagnosing}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-2xl transition duration-300 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-3 text-base"
                >
                  {isDiagnosing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري إرسال عينة الصوت والتحليل بالذكاء الاصطناعي...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-5 h-5" />
                      <span>بدء التشخيص الصوتي الفوري بالذكاء الاصطناعي</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Side: Analysis Display */}
              <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                {isDiagnosing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-bounce">
                      <Cpu className="w-8 h-8 text-amber-600 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">جاري معالجة الموجات الصوتية لتردد المحرك...</h4>
                      <p className="text-slate-500 text-sm max-w-sm mt-1">يقوم نموذج الذكاء الاصطناعي بمطابقة الطيف الصوتي مع مئات المشاكل المسجلة في المملكة وهندسة حلولها.</p>
                    </div>
                    <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 animate-infinite-loading rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                ) : diagnosisResult ? (
                  <div className="space-y-6">
                    {/* Diagnostic Result Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-slate-800">تقرير التشخيص الذكي المعتمد</h4>
                          {diagnosisResult.isSimulated && (
                            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded-md">محاكاة غير متصلة</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">رقم التقرير الآلي: #AI-{Math.floor(Math.random() * 90000) + 10000}</p>
                      </div>
                      
                      {/* Severity Flag */}
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto ${
                        diagnosisResult.severity === "Critical" 
                          ? "bg-rose-50 text-rose-700 border border-rose-200" 
                          : diagnosisResult.severity === "Warning" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          {diagnosisResult.severity === "Critical" ? "خطير - إصلاح فوري" : 
                           diagnosisResult.severity === "Warning" ? "تحذير - يحتاج مراجعة" : "عادي / تصفية قريبة"}
                        </span>
                      </div>
                    </div>

                    {/* Acoustic Wave Description */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                      <h5 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>التحليل السمعي للموجة الترددية:</span>
                      </h5>
                      <p className="text-sm text-slate-700 leading-relaxed">{diagnosisResult.soundAnalysis}</p>
                    </div>

                    {/* The 3 Audiences Tabbed Box */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 flex items-center gap-1 border-b border-slate-200">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>ترجمة الأعطال المتكاملة لثلاث جهات:</span>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {/* 1. System Language */}
                        <div className="p-4 space-y-1">
                          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-slate-900" />
                            🖥️ لغة النظام وقراءة الكمبيوتر (System Language):
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pr-4">{diagnosisResult.systemDetails}</p>
                        </div>

                        {/* 2. Mechanic Language */}
                        <div className="p-4 space-y-1 bg-slate-50/30">
                          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-600" />
                            🔧 لغة فني الصيانة وخطوات الفحص (Mechanic Guide):
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pr-4">{diagnosisResult.mechanicInstructions}</p>
                        </div>

                        {/* 3. Car Owner Language */}
                        <div className="p-4 space-y-1">
                          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            👤 لغة صاحب السيارة بلغة بسيطة (Owner Friendly):
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pr-4">{diagnosisResult.ownerExplanation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Diagnostic Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 rounded-lg text-amber-700">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400">التكلفة التقديرية للإصلاح</p>
                          <p className="text-base font-bold text-slate-800">{diagnosisResult.estimatedCost} ريال سعودي</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400">الوقت التقديري والضمان</p>
                          <p className="text-xs font-bold text-slate-800">{diagnosisResult.estimatedTime} / ضمان معتمد</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => onOrderParts(diagnosisResult.requiredParts)}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>اطلب قطع الغيار مباشرة ({diagnosisResult.requiredParts.length} قطع)</span>
                      </button>
                      <button
                        onClick={() => onAddAppointment("فحص وصيانة صوت محرك", carModel, fuelType)}
                        className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>احجز موعد الصيانة فوراً</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Volume2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-700">بانتظار التقاط أو بث صوت محرك السيارة</h4>
                      <p className="text-slate-400 text-xs max-w-xs mt-1">اختر إحدى عينات أصوات العطل من لوحة التحكم واضغط على زر البدء لكي يعمل تشخيص الذكاء الاصطناعي.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "obd" ? (
          <div>
            {/* OBD Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: OBD Code Form */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">إدخال كود العطل يدوياً</h3>
                  <p className="text-xs text-slate-400 mb-3">إذا قمت بفحص سيارتك بجهاز OBD-II الصغير، الصق الكود هنا لترجمته فوراً إلى لغة مفهومة.</p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={obdCode}
                        onChange={(e) => setObdCode(e.target.value.toUpperCase())}
                        maxLength={5}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-900/20 focus:border-slate-950 outline-none transition uppercase text-center font-mono text-lg font-bold tracking-widest"
                        placeholder="P0300"
                      />
                      <button
                        onClick={() => handleCodeTranslation()}
                        disabled={isTranslatingCode || !obdCode}
                        className="px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold rounded-xl text-xs transition"
                      >
                        {isTranslatingCode ? "جاري الترجمة..." : "ترجمة الكود"}
                      </button>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-slate-400 mb-2">أكواد شائعة الاستخدام في المملكة للتجربة:</span>
                      <div className="grid grid-cols-1 gap-2">
                        {commonObdCodes.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleCodeTranslation(c.code)}
                            className="p-3 text-right bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition flex items-center justify-between"
                          >
                            <span className="font-mono font-bold text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{c.code}</span>
                            <span className="text-xs text-slate-600 truncate mr-2">{c.desc}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Cpu className="w-4 h-4 animate-pulse" />
                    <span>ربط ذكي للأكواد</span>
                  </div>
                  <p>يقوم النظام بالبحث في قواعد بيانات الصيانة الدولية بالإضافة لقاعدة بيانات الورش المعتمدة في الرياض وجدة، لتقدير سعر وتوافر قطع الغيار بدقة مبهرة.</p>
                </div>
              </div>

              {/* Right Column: OBD Translation Display */}
              <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                {isTranslatingCode ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 animate-spin">
                      <Cpu className="w-8 h-8 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800">جاري الاستعلام عن كود العطل...</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">يتصل النظام بمحرك التشخيص الذكي الخاص بـ الورشة الذكية لاستخراج لغة النظام ولغة الفني ولغة المالك للسيارة.</p>
                    </div>
                  </div>
                ) : codeResult ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-white bg-slate-900 px-3 py-1 rounded-xl tracking-widest">{codeResult.code}</span>
                          <h4 className="text-base font-bold text-slate-800">ترجمة وفك شفرة الكود الفوري</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">تحديد المكونات المتأثرة بدقة 99.8% بالذكاء الاصطناعي</p>
                      </div>
                      
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        codeResult.severity === "Critical" 
                          ? "bg-rose-50 text-rose-700 border border-rose-200" 
                          : codeResult.severity === "Warning" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          {codeResult.severity === "Critical" ? "خطير" : 
                           codeResult.severity === "Warning" ? "تحذير" : "اعتيادي"}
                        </span>
                      </div>
                    </div>

                    {/* Integrated 3 view boxes */}
                    <div className="space-y-4">
                      {/* View 1: System */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h5 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-900" />
                          <span>🖥️ لغة النظام وقراءة الكمبيوتر والبروتوكول:</span>
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed pl-2">{codeResult.systemDescription}</p>
                      </div>

                      {/* View 2: Mechanic */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h5 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <span>🔧 لغة فني الصيانة وخطوات المعاينة في الورشة:</span>
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed pl-2">{codeResult.mechanicGuide}</p>
                      </div>

                      {/* View 3: Owner */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h5 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span>👤 لغة صاحب السيارة بلغة مبسطة ومريحة:</span>
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed pl-2">{codeResult.ownerExplanation}</p>
                      </div>
                    </div>

                    {/* Pricing estimation */}
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400">التكلفة المتوقعة للإصلاح الشامل</span>
                        <p className="text-lg font-bold text-slate-800 mt-0.5">{codeResult.estimatedCost} ريال سعودي</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400">قطع الغيار اللازمة</span>
                        <p className="text-xs font-bold text-amber-700 mt-0.5">{codeResult.requiredParts.join(" + ")}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => onOrderParts(codeResult.requiredParts)}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>اطلب قطع الغيار اللازمة مباشرة</span>
                      </button>
                      <button
                        onClick={() => onAddAppointment(`إصلاح كود العطل ${codeResult.code}`, carModel, fuelType)}
                        className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>احجز موعد الصيانة فوراً</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-700">بانتظار إدخال كود OBD-II للترجمة</h4>
                      <p className="text-slate-400 text-xs max-w-xs mt-1">اكتب الكود يدوياً أو حدد كوداً من قائمة الأكواد الشائعة لرؤية ترجمة الذكاء الاصطناعي لثلاثة أطراف.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* ==================== REMOTE DIAGNOSIS =================== */
          /* ========================================================= */
          <div>
            {/* Sub Tabs Selection */}
            <div className="flex border-b border-slate-100 pb-4 mb-8 overflow-x-auto gap-2">
              <button
                onClick={() => setActiveRemoteSubTab("self")}
                className={`py-2 px-4 rounded-lg font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeRemoteSubTab === "self"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>📝 مستشار التشخيص الذاتي الموجه</span>
              </button>

              <button
                onClick={() => setActiveRemoteSubTab("visual")}
                className={`py-2 px-4 rounded-lg font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeRemoteSubTab === "visual"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Camera className="w-4 h-4 text-amber-500" />
                <span>📷 الفحص البصري الفوري بالكاميرا</span>
              </button>

              <button
                onClick={() => setActiveRemoteSubTab("session")}
                className={`py-2 px-4 rounded-lg font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeRemoteSubTab === "session"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Video className="w-4 h-4 text-amber-500" />
                <span>📡 جلسة التشخيص والدعم الرقمي عن بعد</span>
              </button>
            </div>

            {/* Sub Tab: Guided Self Diagnosis */}
            {activeRemoteSubTab === "self" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Wizard Panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">📝 استبيان الفحص والتشخيص الذاتي</h4>
                    <p className="text-xs text-slate-400">حدد المشاكل والأعراض بدقة، وسيعمل المحرك الذكي على فك شفرتها وإسقاطها على تقرير معتمد.</p>
                  </div>

                  {/* Area Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">1. منطقة العطل الرئيسية بالسيارة:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "engine" as const, label: "المحرك والماكينة", icon: Cpu },
                        { id: "brakes" as const, label: "المكابح والفرامل", icon: Wrench },
                        { id: "dashboard" as const, label: "لوحة القيادة والطبلون", icon: AlertTriangle }
                      ].map((area) => {
                        const IconComponent = area.icon;
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => {
                              setSelfSymptomArea(area.id);
                              setSelfSelectedSymptoms([]);
                              setSelfDiagnosisResult(null);
                            }}
                            className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                              selfSymptomArea === area.id
                                ? "bg-amber-50 border-amber-500 text-amber-700 font-bold"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                            }`}
                          >
                            <IconComponent className="w-5 h-5 text-amber-600" />
                            <span className="text-[11px] leading-tight">{area.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Symptom Checkbox List */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">2. حدد كل الأعراض المصاحبة:</label>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {symptomsByArea[selfSymptomArea].map((sym) => (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => handleSymptomToggle(sym.id)}
                          className={`w-full p-3 rounded-xl border text-right transition flex items-center gap-2 text-xs font-medium ${
                            selfSelectedSymptoms.includes(sym.id)
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            selfSelectedSymptoms.includes(sym.id)
                              ? "bg-amber-500 border-amber-500 text-slate-950"
                              : "border-slate-300"
                          }`}>
                            {selfSelectedSymptoms.includes(sym.id) && "✓"}
                          </span>
                          <span>{sym.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Smoke Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">3. هل يظهر دخان غريب من العادم (الشكمان)؟</label>
                    <select
                      value={selfSmokeColor}
                      onChange={(e) => setSelfSmokeColor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition text-xs"
                    >
                      <option value="none">لا يوجد دخان (طبيعي)</option>
                      <option value="black">دخان أسود غامق (تفتفة بنزين واحتراق زائد)</option>
                      <option value="white">دخان أبيض كثيف ورطوبة (خلل برديتر أو كرتير رأس الماكينة)</option>
                      <option value="blue">دخان مائل للزرقة ورائحة زيت (نقص زيت المكينة وتآكل الشنابر)</option>
                    </select>
                  </div>

                  {/* Trigger Action */}
                  <button
                    type="button"
                    onClick={handleSelfDiagnosis}
                    disabled={isSelfDiagnosing || selfSelectedSymptoms.length === 0}
                    className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-2xl transition duration-300 shadow-lg shadow-amber-600/15 flex items-center justify-center gap-2"
                  >
                    {isSelfDiagnosing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري فحص وتأصيل الأعطال ميكانيكياً...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-5 h-5" />
                        <span>بدء التشخيص الذاتي المدعوم بالذكاء الاصطناعي</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Response / Report Panel */}
                <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  {isSelfDiagnosing ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 animate-spin">
                        <Cpu className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">جاري تحليل الأعطال وتقييم التكلفة...</h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">يقوم الذكاء الاصطناعي بالتحقق من مصفوفة الأعراض وربطها بقطع الغيار الضرورية في السوق السعودي.</p>
                      </div>
                    </div>
                  ) : selfDiagnosisResult ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <h4 className="text-base font-bold text-slate-800">{selfDiagnosisResult.diagnosisName}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">تشخيص ذكي مبني على الفحص الذاتي الموجه</p>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          selfDiagnosisResult.urgency === "Immediate"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : selfDiagnosisResult.urgency === "Caution"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}>
                          {selfDiagnosisResult.urgency === "Immediate" ? "إصلاح طارئ" :
                           selfDiagnosisResult.urgency === "Caution" ? "مراجعة قريبة" : "صيانة اعتيادية"}
                        </span>
                      </div>

                      {/* Summary text */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-sm">
                        <strong className="text-slate-800 block mb-1">التقرير التحليلي الفني لسيارتك:</strong>
                        {selfDiagnosisResult.diagnosticSummary}
                      </div>

                      {/* Potential parts list */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <strong className="text-xs text-slate-800 block">القطع والأنظمة المشتبه بتلفها:</strong>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                          {selfDiagnosisResult.faultsList.map((fault: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{fault}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Plan and Actions */}
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                        <strong className="font-bold flex items-center gap-1 mb-1">
                          <Wrench className="w-3.5 h-3.5 text-amber-700" />
                          <span>توصيات الصيانة المباشرة:</span>
                        </strong>
                        {selfDiagnosisResult.actionPlan}
                      </div>

                      {/* Pricing Estimation Row */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 block font-bold">التكلفة التقديرية المتوسطة</span>
                          <span className="text-base font-black text-slate-800">{selfDiagnosisResult.estimatedCost} ريال سعودي</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold">زمن الإصلاح المتوقع</span>
                          <span className="text-xs font-bold text-slate-800">{selfDiagnosisResult.estimatedTime} تقريباً</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => onOrderParts(selfDiagnosisResult.requiredParts)}
                          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-amber-400" />
                          <span>طلب قطع الصيانة التلقائية</span>
                        </button>
                        <button
                          onClick={() => onAddAppointment("إصلاح وفحص ذاتي ميكانيكي", carModel, fuelType)}
                          className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>احجز موعد الصيانة الموصى به</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <HelpCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-700">بانتظار إجابة استبيان الصيانة</h4>
                        <p className="text-slate-400 text-xs max-w-xs mt-1">أجب على الأسئلة في اليمين واضغط على زر التحليل للحصول على التقرير التفصيلي الفوري بأسعار قطع الغيار.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub Tab: Visual Camera AI Scan */}
            {activeRemoteSubTab === "visual" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Scanner setup */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">📷 المسح الضوئي والبصري بالكاميرا</h4>
                    <p className="text-xs text-slate-400">وجه كاميرا جهازك المحمول نحو الجزء المشتبه به، وسيقوم الذكاء الاصطناعي بتحليله والتعرف على كود العطل بالصورة وتحديد موقعه هندسياً.</p>
                  </div>

                  {/* Mode selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">1. حدد وضعية الفحص البصري لتوجيه العدسة:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "dashboard_lights" as const, label: "فحص طبلون السيارة ولمبات التنبيه المضيئة 🖥️" },
                        { id: "engine_bay" as const, label: "فحص غطاء الماكينة والأجزاء الداخلية للمحرك 🔧" },
                        { id: "brake_pads" as const, label: "فحص العجلات، الفرامل، وهوبات القيادة ⚙️" }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setVisualScanType(mode.id);
                            setVisualScanResult(null);
                          }}
                          className={`w-full p-3 text-right rounded-xl border text-xs font-semibold transition ${
                            visualScanType === mode.id
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scanner Visual Container */}
                  <div className="relative bg-slate-950 aspect-video rounded-2xl border-4 border-slate-900 overflow-hidden flex items-center justify-center">
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span>CAM SCAN LIVE</span>
                    </div>

                    {isVisualScanning ? (
                      <div className="absolute inset-0 z-20 bg-slate-950/60 flex flex-col items-center justify-center text-center p-4">
                        <Activity className="w-10 h-10 text-amber-400 animate-spin mb-2" />
                        <span className="text-xs font-bold text-amber-400 tracking-wide">جاري بث الموجة والتحليل البصري ({visualScanProgress}%)</span>
                        
                        {/* Laser red sweep line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-md shadow-red-500/80 animate-laser-sweep" style={{
                          animation: "laser 1.2s infinite linear"
                        }} />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-400 p-4">
                        {visualScanType === "dashboard_lights" && (
                          <div className="space-y-2">
                            <span className="text-3xl">🚗</span>
                            <p className="text-[11px] max-w-xs text-slate-400 leading-normal">محاكاة كاميرا الطبلون: وجه العدسة نحو أضواء السرعة والعدادات</p>
                          </div>
                        )}
                        {visualScanType === "engine_bay" && (
                          <div className="space-y-2">
                            <span className="text-3xl">🔧</span>
                            <p className="text-[11px] max-w-xs text-slate-400 leading-normal">محاكاة كاميرا المحرك: وجه العدسة لغطاء الماكينة وسير المكينة</p>
                          </div>
                        )}
                        {visualScanType === "brake_pads" && (
                          <div className="space-y-2">
                            <span className="text-3xl">⚙️</span>
                            <p className="text-[11px] max-w-xs text-slate-400 leading-normal">محاكاة كاميرا العجلات: وجه العدسة نحو ثغرات الجنوط لرؤية الهوب</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Styled viewfinder corners */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                  </div>

                  <button
                    type="button"
                    onClick={handleStartVisualScan}
                    disabled={isVisualScanning}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold rounded-2xl transition duration-300 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span>تشغيل الفحص البصري الفوري وتوجيه العدسة</span>
                  </button>
                </div>

                {/* Diagram & Highlight output */}
                <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  {isVisualScanning ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-bounce">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">تحليل العلامات البصرية المفتوحة...</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">يجرى تصنيف الصورة وقراءة رموز الأعطال وعزل أطياف المشكلة بالذكاء الاصطناعي.</p>
                      </div>
                    </div>
                  ) : visualScanResult ? (
                    <div className="space-y-6">
                      <div className="border-b border-slate-200/60 pb-3">
                        <h4 className="text-base font-bold text-slate-800">موقع وإشارة العطل المحتمل على الهيكل 📍</h4>
                        <p className="text-xs text-slate-400 mt-1">المكون المرصود: <strong className="text-amber-600 font-bold">{visualScanResult.scannedComponent}</strong></p>
                      </div>

                      {/* Interactive blueprint diagram of a car chassis */}
                      <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative h-56 flex items-center justify-center overflow-hidden">
                        {/* Technical Grid background */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
                        
                        {/* Minimalist Top-down Car blueprint */}
                        <div className="w-36 h-48 border-2 border-slate-700 rounded-3xl relative flex flex-col items-center bg-slate-900/40">
                          {/* Cabin interior border */}
                          <div className="absolute inset-x-3 top-16 bottom-10 border border-slate-800 rounded-lg" />
                          
                          {/* Hood (engine front) lines */}
                          <div className="absolute inset-x-2 top-0 h-14 border-b border-slate-800 flex items-center justify-center">
                            <span className="text-[8px] font-mono font-bold text-slate-700 tracking-wider">ENGINE</span>
                          </div>

                          {/* Wheels */}
                          <div className="absolute -left-3.5 top-6 w-3.5 h-10 bg-slate-800 rounded-md border border-slate-600" />
                          <div className="absolute -right-3.5 top-6 w-3.5 h-10 bg-slate-800 rounded-md border border-slate-600" />
                          <div className="absolute -left-3.5 bottom-6 w-3.5 h-10 bg-slate-800 rounded-md border border-slate-600" />
                          <div className="absolute -right-3.5 bottom-6 w-3.5 h-10 bg-slate-800 rounded-md border border-slate-600" />
                          
                          {/* Front bumper/lights */}
                          <div className="absolute -top-1 w-12 h-1.5 bg-slate-700 rounded-b-sm" />
                          {/* Exhaust pipes at back */}
                          <div className="absolute -bottom-2 w-1.5 h-3 bg-slate-700 rounded-sm left-6" />
                          <div className="absolute -bottom-2 w-1.5 h-3 bg-slate-700 rounded-sm right-6" />
                        </div>

                        {/* Flashing Dynamic fault pin */}
                        <div 
                          className="absolute z-10 cursor-pointer group"
                          style={{
                            left: `${visualScanResult.faultPointerX || 50}%`,
                            top: `${visualScanResult.faultPointerY || 40}%`
                          }}
                          onClick={() => setSelectedBlueprintMarker(!selectedBlueprintMarker)}
                        >
                          {/* Ping wave */}
                          <span className="absolute -left-2.5 -top-2.5 w-7 h-7 rounded-full bg-red-500/80 animate-ping" />
                          {/* Center point */}
                          <span className="absolute -left-1.5 -top-1.5 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          </span>

                          {/* Hover Tooltip or Click popup */}
                          <div className="absolute right-6 -top-6 bg-slate-900 border border-amber-500 text-white rounded-lg p-2.5 shadow-xl w-40 text-right z-30 pointer-events-none select-none">
                            <span className="text-[9px] font-bold text-amber-400 block mb-0.5">عطل مرصود هنا ⚠</span>
                            <span className="text-[10px] block leading-snug">{visualScanResult.scannedComponent}</span>
                          </div>
                        </div>

                        {/* Visual pointer labels */}
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-2 text-left">
                          <span className="text-[9px] text-slate-500 block">إحداثيات العطل</span>
                          <span className="text-[10px] font-mono text-amber-500 font-bold">X: {visualScanResult.faultPointerX}% | Y: {visualScanResult.faultPointerY}%</span>
                        </div>
                      </div>

                      {/* Diagnostic Breakdown Card */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                        <div className="border-b border-slate-100 pb-2">
                          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full mb-1 inline-block border border-red-100">خلل مرئي متبلوَر</span>
                          <h5 className="font-bold text-slate-800">{visualScanResult.detectedFault}</h5>
                        </div>

                        <p className="text-slate-600 leading-relaxed">{visualScanResult.detailedExplanation}</p>
                        
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-950 font-medium leading-relaxed">
                          <strong className="block text-emerald-800 mb-1">✓ الحل والتوصية المباشرة للسلامة:</strong>
                          {visualScanResult.solution}
                        </div>
                      </div>

                      {/* Pricing block */}
                      <div className="flex items-center justify-between bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-400 block font-bold">التكلفة الإجمالية التقريبية للمكون</span>
                          <span className="text-base font-black text-slate-800">{visualScanResult.estimatedCost} ريال سعودي</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-bold">قطع الاستبدال المطلوبة</span>
                          <span className="text-[11px] font-bold text-amber-700">{visualScanResult.requiredParts.join(" + ")}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => onOrderParts(visualScanResult.requiredParts)}
                          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4 text-amber-400" />
                          <span>اطلب القطع المرئية فوراً</span>
                        </button>
                        <button
                          onClick={() => onAddAppointment(`إصلاح عطل مسح كاميرا: ${visualScanResult.scannedComponent}`, carModel, "gasoline")}
                          className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>جدولة صيانة واستبدال</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-700">بانتظار التقاط تفاصيل كاميرا الفحص</h4>
                        <p className="text-slate-400 text-xs max-w-xs mt-1">اختر وضعية المسح بالكاميرا، ووجّه العدسة يميناً ثم اضغط على زر البدء لتحديد وإسقاط العطل على المخطط التكتيكي للهيكل.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub Tab: Live Remote support session */}
            {activeRemoteSubTab === "session" && (
              <div className="space-y-6">
                {!remoteSessionActive ? (
                  <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center max-w-2xl mx-auto space-y-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                      <Signal className="w-8 h-8 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-800">📡 أطلق جلسة الاتصال الفني والتشخيص عن بعد</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">تتيح لك هذه المنظومة ربط حساسات سيارتك مباشرة وبث بيانات الـ OBD-II الحية لمهندس ميكانيكي سعودي معتمد بالمركز الرئيسي في الرياض، ومشاركته الصوت والكاميرا لتلقي التشخيص فائق الدقة بدون مغادرة موقعك!</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateSession}
                      disabled={isConnectingSession}
                      className="px-8 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold rounded-2xl transition duration-300 shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 mx-auto"
                    >
                      {isConnectingSession ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>جاري تهيئة قناة الاتصال الرقمية الآمنة...</span>
                        </>
                      ) : (
                        <>
                          <Signal className="w-5 h-5" />
                          <span>توليد كود الاتصال وبدء الجلسة الفنية الرقمية</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left side: Call HUD & Specialist video mockup */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between h-80">
                        {/* Status bar */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${activeRemoteCall ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            <span className="text-[11px] font-bold text-slate-300">
                              {activeRemoteCall ? "متصل بالمهندس الفني عن بعد 🟢" : "جلسة جاهزة للربط الفوري 📡"}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {remoteSessionCode}
                          </span>
                        </div>

                        {/* Specialist Video Interface Mockup */}
                        {activeRemoteCall ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 relative">
                            {/* Blinking Live label */}
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                              <span>LIVE VIDEO</span>
                            </div>

                            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-amber-500 overflow-hidden flex items-center justify-center shadow-lg shadow-amber-500/10">
                              <span className="text-4xl">👨‍🔧</span>
                            </div>
                            
                            <div>
                              <h5 className="font-bold text-sm text-white">المهندس خالد العتيبي</h5>
                              <p className="text-[10px] text-amber-400 font-bold">كبير مهندسي التشخيص الرقمي - الرياض</p>
                            </div>

                            {/* Audio waveform */}
                            <div className="flex items-center gap-1 h-6">
                              {Array.from({ length: 8 }).map((_, i) => (
                                <span 
                                  key={i} 
                                  className="w-1 bg-amber-400 rounded-full transition-all duration-150" 
                                  style={{
                                    height: `${Math.floor(20 + Math.random() * 80)}%`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                              <PhoneCall className="w-8 h-8" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-normal">سيتم مشاركة لوحة OBD-II الحية للسيارة وبث الحساسات الحية للمهندس عند الاتصال.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleStartCall}
                              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                            >
                              اتصل بالمهندس المناوب الآن 📞
                            </button>
                          </div>
                        )}

                        {/* Call controls */}
                        {activeRemoteCall && (
                          <div className="flex justify-center gap-2 pt-3 border-t border-slate-800">
                            <button
                              onClick={() => {
                                setActiveRemoteCall(false);
                                setRemoteSessionActive(false);
                              }}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition"
                            >
                              إنهاء المكالمة الحمراء
                            </button>
                            <span className="text-[10px] text-slate-500 self-center font-mono">مدة الاتصال: 02:45</span>
                          </div>
                        )}
                      </div>

                      {/* OBD Live Telemetry Broadcast synced */}
                      {activeRemoteCall && (
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-white space-y-4">
                          <strong className="text-[10px] text-amber-400 font-mono flex items-center gap-1.5 uppercase tracking-wider">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span>OBD-II LIVE TELEMETRY SYNCED (بث الحساسات النشط)</span>
                          </strong>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-[9px] text-slate-500 block">دوران المكينة</span>
                              <span className="text-base font-black font-mono text-emerald-400">{telemetry.rpm} <span className="text-[9px] text-slate-500 font-bold">RPM</span></span>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-[9px] text-slate-500 block">حرارة الراديتر</span>
                              <span className="text-base font-black font-mono text-emerald-400">{telemetry.temp} <span className="text-[9px] text-slate-500 font-bold">°C</span></span>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-[9px] text-slate-500 block">شحن الدينامو</span>
                              <span className="text-base font-black font-mono text-emerald-400">{telemetry.voltage} <span className="text-[9px] text-slate-500 font-bold">V</span></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right side: Live Chat conversation simulator */}
                    <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[450px]">
                      <div className="border-b border-slate-200/60 pb-3 mb-4">
                        <strong className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>صندوق محادثات الجلسة الرقمية</span>
                        </strong>
                      </div>

                      {/* Message Feed */}
                      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs py-10">
                            بانتظار بدء الاتصال بالمهندس لتنشيط صندوق المحادثة وعرض توجيهات الصيانة عن بعد.
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`flex flex-col max-w-[85%] ${
                                msg.sender === "user" ? "mr-auto items-end" : "ml-auto items-start"
                              }`}
                            >
                              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                msg.sender === "user"
                                  ? "bg-slate-900 text-white rounded-tr-none"
                                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm"
                              }`}>
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.sender === "user" ? "أنت" : "المهندس خالد"}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input form */}
                      <form onSubmit={handleSendUserMessage} className="flex gap-2 pt-3 border-t border-slate-200">
                        <input
                          type="text"
                          value={userChatInput}
                          onChange={(e) => setUserChatInput(e.target.value)}
                          disabled={!activeRemoteCall}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition disabled:bg-slate-100"
                          placeholder={activeRemoteCall ? "اكتب رسالة للمهندس خالد..." : "يجب بدء الاتصال الفني أولاً للدردشة..."}
                        />
                        <button
                          type="submit"
                          disabled={!activeRemoteCall || !userChatInput.trim()}
                          className="px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs transition flex items-center justify-center"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
