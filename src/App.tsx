import React, { useState, useRef, useEffect } from "react";
import { Cpu, ShieldAlert, Sparkles, Phone, Clock, Landmark, Volume2, Wrench, Shield, ShoppingBag, Calendar, Compass, CreditCard, Activity, CheckCircle, ChevronLeft, Award, HelpCircle } from "lucide-react";
import { Appointment, MaintenanceHistory, VehicleType, SparePart } from "./types";
import AIDiagnosis from "./components/AIDiagnosis";
import DigitalTestGateway from "./components/DigitalTestGateway";
import AppointmentTracker from "./components/AppointmentTracker";
import PartsMarketplace from "./components/PartsMarketplace";
import BranchMap from "./components/BranchMap";
import ContractsAndAutomation from "./components/ContractsAndAutomation";
import DigitalPayment from "./components/DigitalPayment";
const heroImage1 = "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1800&q=85";
const heroImage2 = "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1800&q=85";
const heroImage3 = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1800&q=85";
const heroImage4 = "https://images.unsplash.com/photo-1632823471565-1ecdf5c6d7f5?auto=format&fit=crop&w=1800&q=85";

export default function App() {
  const [activeTab, setActiveTab] = useState<"diagnosis" | "sensors" | "tracker" | "parts" | "branches" | "contracts" | "payment">("diagnosis");
  
  // Slideshow images state
  const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Global States
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "a-1", clientName: "أحمد بن فهد الدوسري", phone: "+966 50 123 4567", date: "2026-07-18", time: "09:00", vehicleModel: "هيونداي توسان 2021", vehicleType: "gasoline", serviceType: "فحص شامل وتصفية ماكينة", status: "confirmed" },
    { id: "a-2", clientName: "سليمان الغامدي", phone: "+966 55 987 6543", date: "2026-07-19", time: "16:00", vehicleModel: "تويوتا كامري هجينة 2023", vehicleType: "hybrid", serviceType: "تغيير زيت وفلاتر دوري دوري", status: "in_progress" }
  ]);

  const [history, setHistory] = useState<MaintenanceHistory[]>([
    { id: "h-1", date: "2026-06-10", vehicleModel: "تويوتا لاندكروزر 2018", vehicleType: "diesel", mileage: 125000, cost: 1250, description: "صيانة ميكانيكا محرك ديزل كامل، تغيير وجه المحرك الخارجي وتصفية البخاخات وتنظيف دبة التلوث التالفة بالكامل.", partsReplaced: ["وجه غطاء المحرك", "فلتر ديزل رئيسي", "منظف كربون"] },
    { id: "h-2", date: "2026-05-24", vehicleModel: "تسلا موديل 3 2022", vehicleType: "electric", mileage: 42000, cost: 450, description: "برمجة شاملة وتحديث كمبيوتر السيارة الرئيسي، فحص حزمة البطاريات وجهد المحركات الكهربائية، وضبط موازنة العضلات والمساعدات.", partsReplaced: ["برمجيات وتحديثات فنية"] },
    { id: "h-3", date: "2026-04-12", vehicleModel: "لكزس ES 350 2020", vehicleType: "gasoline", mileage: 88000, cost: 720, description: "تغيير فحمات الفرامل الأمامية والخلفية مع خرط الهوبات الأمامية وضبط حساسات الفرامل الذكية وتعبئة الزيت.", partsReplaced: ["فحمات أمامية أصلية", "زيت فرامل بوش"] }
  ]);

  const [preselectedParts, setPreselectedParts] = useState<string[]>([]);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>("TRK-90412");
  
  // Payment states
  const [paymentAmount, setPaymentAmount] = useState<number>(350);
  const [paymentDescription, setPaymentDescription] = useState<string>("صيانة فحمات فرامل وخدمة خرط الهوبات");

  const handleAddAppointment = (app: Omit<Appointment, "id" | "status">) => {
    const newAppointment: Appointment = {
      ...app,
      id: `app-${Date.now()}`,
      status: "confirmed"
    };
    setAppointments([newAppointment, ...appointments]);
  };

  const handleOrderParts = (parts: string[]) => {
    setPreselectedParts(parts);
    setActiveTab("parts");
    
    // Smooth scroll to parts section
    const el = document.getElementById("parts-marketplace-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleTranslateCodeFromGateway = (code: string) => {
    // Send code translation task directly to AI tab
    setActiveTab("diagnosis");
    // Trigger scroll
    const el = document.getElementById("ai-diagnosis-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckoutFromParts = (total: number, items: string[]) => {
    setPaymentAmount(total);
    setPaymentDescription(`قطع غيار أصلية محجوزة: ${items.join(" + ")}`);
    setActiveTab("payment");
    
    const el = document.getElementById("payment-gateway-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handlePaymentSuccess = () => {
    // Add transaction to history
    const newHistory: MaintenanceHistory = {
      id: `h-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      vehicleModel: "سيارة العميل الحالية",
      vehicleType: "gasoline",
      mileage: 50200,
      cost: paymentAmount,
      description: `شراء وتركيب ${paymentDescription}`,
      partsReplaced: preselectedParts.length > 0 ? preselectedParts : ["قطع غيار متنوعة"]
    };
    setHistory([newHistory, ...history]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* Dynamic Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">الورشة الذكية للصيانة</h1>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-md">برؤية الذكاء الاصطناعي 🧠</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">صيانة ميكانيكا، كهرباء، فحص كمبيوتر وتتبع لحظي مباشر مع ضمان الجودة بالمملكة</p>
            </div>
          </div>

          {/* Quick contact / Opening Info */}
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/50 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="block text-slate-400 font-bold text-[10px]">أوقات استقبال الورش المعتمدة</span>
                <span className="font-semibold text-white">08:00 صباحاً - 10:00 مساءً</span>
              </div>
            </div>

            <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/50 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <div>
                <span className="block text-slate-400 font-bold text-[10px]">الرقم الوطني الموحد للصيانة</span>
                <span className="font-semibold text-white font-mono">9200-AUTO-966</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Hero Announcement & Services Overview */}
      <section className="text-white py-16 md:py-24 relative overflow-hidden" id="hero-section">
        {/* Full-bleed background image slideshow with modern transitions */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          {heroImages.map((imgSrc, idx) => (
            <img 
              key={idx}
              src={imgSrc} 
              alt={`الورشة الذكية للصيانة المعتمدة - مشهد ${idx + 1}`} 
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${
                idx === currentHeroIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          ))}
          {/* Lightened overlays to let the ultra-HD images shine through beautifully with high clarity */}
          <div className="absolute inset-0 bg-slate-950/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-slate-950/45 to-slate-950/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 z-10" />
          <div className="absolute inset-0 bg-amber-500/[0.03] mix-blend-color-dodge z-10" />
        </div>

        {/* Slide indicators at the bottom */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentHeroIndex ? "w-8 bg-amber-400 shadow-md shadow-amber-400/50" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Futuristic glowing grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-15 pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Glassmorphism Text block */}
            <div className="lg:col-span-8 space-y-6 text-right backdrop-blur-md bg-white/[0.04] p-6 sm:p-8 md:p-10 rounded-[32px] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
              {/* Subtle top light overlay */}
              <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex flex-wrap gap-2 items-center relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-white/15 rounded-full text-xs text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>أحدث تقنيات التشخيص السمعي والبرمجة بالمملكة</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-white/15 rounded-full text-xs text-emerald-300 font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>معتمد من الهيئة السعودية للمواصفات SASO</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black leading-tight text-white tracking-tight relative z-10">
                ورشة المستقبل لصيانة سيارتك <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300">
                  ميكانيكا، كهرباء، وتشخيص ذكي بالصوت
                </span>
              </h2>
              
              <p className="text-slate-100 text-sm md:text-base leading-relaxed max-w-2xl relative z-10 font-bold drop-shadow-sm">
                تجمع ورشتنا المعتمدة بين الخبرة الميكانيكية الطويلة والذكاء الاصطناعي الفائق. نوفر فحصاً فورياً دقيقاً عبر تحليل أصوات المحركات والعجلات لتحديد المشكلة فوراً بلغة ميسرة يفهمها العميل والفني، مع خريطة فروع تغطي مدن المملكة، وسلة شراء مباشرة لقطع الغيار الأصلية المضمونة.
              </p>

              {/* Micro Feature badges inside glass-layered items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-white/10 my-4 relative z-10">
                <div className="flex items-start gap-2 text-right bg-white/[0.05] backdrop-blur-md p-3 rounded-2xl border border-white/15">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-50">فحص سمعي فوري بالذكاء الاصطناعي</h4>
                    <p className="text-[11px] text-slate-200 mt-0.5 font-bold">اكتشاف فوري للمشاكل عبر التسجيل الصوتي لمكابح أو عادم أو ماكينة السيارة.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-right bg-white/[0.05] backdrop-blur-md p-3 rounded-2xl border border-white/15">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-50">قطع غيار أصلية بضمان كامل</h4>
                    <p className="text-[11px] text-slate-200 mt-0.5 font-bold">منصة تواصل مباشرة مع الموردين الرسميين المعتمدين بخصومات حصرية.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2 relative z-10">
                <a 
                  href="#ai-diagnosis-section"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("diagnosis");
                    document.getElementById("ai-diagnosis-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition duration-300 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <span>ابدأ الفحص السمعي بالذكاء الاصطناعي 🔊</span>
                </a>
                <button 
                  onClick={() => {
                    setActiveTab("sensors");
                    document.getElementById("navigation-tabs")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs transition border border-white/25 backdrop-blur-md flex items-center gap-2"
                >
                  <span>بوابة الاختبار الحية والبرمجة 📈</span>
                </button>
              </div>
            </div>
 
            {/* Right Column: Key metrics card inside a modern glass container */}
            <div className="lg:col-span-4 space-y-4">
              <div className="backdrop-blur-md bg-white/[0.04] p-6 rounded-[28px] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-right space-y-4 relative overflow-hidden">
                {/* Subtle visual lighting accent */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] text-amber-300 font-mono font-bold tracking-wider">AI DIAGNOSTIC HUD V2.4</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                </div>
 
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] text-slate-200 font-bold">حالة النظام الفني</span>
                    <span className="block text-xs font-black text-emerald-300 mt-0.5">معتمد ومراقب آلياً (SASO) ✅</span>
                  </div>
 
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                      <span className="block text-[9px] text-slate-200 font-bold">دقة التشخيص</span>
                      <span className="block text-sm font-black text-amber-300 mt-0.5">99.4%</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                      <span className="block text-[9px] text-slate-200 font-bold">فروع معتمدة</span>
                      <span className="block text-sm font-black text-amber-300 mt-0.5">5 فروع</span>
                    </div>
                  </div>
                </div>
 
                <div className="border-t border-white/10 pt-3 flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-200 font-bold">ضمان الاصلاح المعتمد</span>
                    <span className="block text-[11px] font-bold text-white">كفالة جودة متكاملة حتى 4 سنوات</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Tabbed Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1" id="main-content">
        
        {/* Navigation Tabs bar */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 border-b border-slate-200" id="navigation-tabs">
          {[
            { id: "diagnosis", label: "التشخيص الذكي (سمعي وأكواد)", icon: Cpu, badge: "جديد بالذكاء الاصطناعي" },
            { id: "sensors", label: "بوابة الاختبار الرقمية المباشرة", icon: Activity, badge: "حي" },
            { id: "tracker", label: "المواعيد وتتبع الإصلاح اللحظي", icon: Calendar },
            { id: "parts", label: "منصة قطع الغيار المباشرة", icon: ShoppingBag, badge: preselectedParts.length > 0 ? "جاهزة" : undefined },
            { id: "branches", label: "خريطة فروع المملكة وفروعنا", icon: Compass },
            { id: "contracts", label: "العداد الآلي وعقود صيانة الشركات", icon: Landmark },
            { id: "payment", label: "بوابة الدفع الإلكتروني", icon: CreditCard }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 rounded-2xl font-bold text-xs whitespace-nowrap transition duration-300 flex items-center gap-2 relative ${
                  isSelected 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : "bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected ? "bg-amber-500 text-slate-950" : "bg-amber-100 text-amber-800"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Workspace Display Routing based on activeTab state */}
        <div className="transition-all duration-300">
          {activeTab === "diagnosis" && (
            <AIDiagnosis 
              onAddAppointment={(service, model, fuel) => {
                handleAddAppointment({
                  clientName: "حجز تلقائي من الذكاء الاصطناعي",
                  phone: "+966 50 000 0000",
                  date: "2026-07-20",
                  time: "09:00",
                  vehicleModel: model,
                  vehicleType: fuel,
                  serviceType: service
                });
                setActiveTab("tracker");
              }}
              onOrderParts={handleOrderParts}
            />
          )}

          {activeTab === "sensors" && (
            <DigitalTestGateway 
              onTranslateCode={handleTranslateCodeFromGateway}
            />
          )}

          {activeTab === "tracker" && (
            <AppointmentTracker 
              appointments={appointments}
              history={history}
              onAddAppointment={handleAddAppointment}
              activeTrackingId={activeTrackingId}
            />
          )}

          {activeTab === "parts" && (
            <PartsMarketplace 
              preselectedParts={preselectedParts}
              onCheckout={handleCheckoutFromParts}
            />
          )}

          {activeTab === "branches" && (
            <BranchMap />
          )}

          {activeTab === "contracts" && (
            <ContractsAndAutomation 
              onAddAppointment={(service, model, fuel) => {
                handleAddAppointment({
                  clientName: "العداد الآلي لتغيير الزيوت",
                  phone: "+966 50 000 0000",
                  date: "2026-07-20",
                  time: "08:00",
                  vehicleModel: model,
                  vehicleType: fuel as VehicleType,
                  serviceType: service
                });
                setActiveTab("tracker");
              }}
            />
          )}

          {activeTab === "payment" && (
            <DigitalPayment 
              amount={paymentAmount}
              itemDescription={paymentDescription}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>

      </main>

      {/* Footer Info */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-right mt-12" id="app-footer-info">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-extrabold text-sm text-white mb-3">الورشة الذكية للصيانة المتكاملة</h4>
            <p className="leading-relaxed">المركز المعتمد الأول بالمملكة لدمج الذكاء الاصطناعي في الفحص الشامل، والبرمجة العصبية للحساسات، وخدمات الميكانيكا والكهرباء الدقيقة تحت سقف واحد.</p>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3">فروع الورشة بالمملكة</h4>
            <p className="leading-relaxed">شمال الرياض (الفرع الرئيسي)، جدة (طريق المدينة)، الدمام (شارع محمد بن فهد)، المدينة المنورة (طريق خالد بن الوليد)، وأبها (حي المنهل).</p>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white mb-3">الضمان والجودة والموثوقية</h4>
            <p className="leading-relaxed">جميع قطع الغيار المباعة أصلية ومكفولة بفاتورة ضريبية رسمية تخضع للضمان والأنظمة المعتمدة في الهيئة السعودية للمواصفات والمقاييس لضمان الأداء الأقصى.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
          <span>© {new Date().getFullYear()} الورشة الذكية للصيانة المتكاملة. جميع الحقوق محفوظة لقطاع السيارات الذكية بالمملكة.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amber-500">سياسة الخصوصية والأمان</a>
            <a href="#" className="hover:text-amber-500">شروط الصيانة المعتمدة</a>
            <a href="#" className="hover:text-amber-500">بوابة الموردين وقطع الغيار</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
