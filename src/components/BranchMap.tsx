import React, { useState } from "react";
import { MapPin, Navigation, Phone, Clock, Compass, ShieldCheck, Check } from "lucide-react";
import { WorkshopBranch } from "../types";

export default function BranchMap() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("b-riyadh");
  const [nearestCalculated, setNearestCalculated] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Workshop branches list in Saudi Arabia
  const branches: WorkshopBranch[] = [
    { id: "b-riyadh", name: "الفرع الرئيسي - الرياض (شمال الرياض)", city: "الرياض", address: "طريق الملك فهد، حي الصحافة، الرياض", phone: "+966 11 405 1200", lat: 24.7136, lng: 46.6753, isCertified: true, workingHours: "08:00 ص - 10:00 م" },
    { id: "b-jeddah", name: "مركز خدمة العروس - جدة", city: "جدة", address: "طريق المدينة المنورة، حي الروضة، جدة", phone: "+966 12 606 3400", lat: 21.5433, lng: 39.1728, isCertified: true, workingHours: "08:00 ص - 10:00 م" },
    { id: "b-dammam", name: "فرع المنطقة الشرقية - الدمام", city: "الدمام", address: "طريق الأمير محمد بن فهد، الدمام", phone: "+966 13 833 4500", lat: 26.4207, lng: 50.0888, isCertified: true, workingHours: "08:00 ص - 09:00 م" },
    { id: "b-medina", name: "مركز خدمة طيبة - المدينة المنورة", city: "المدينة المنورة", address: "طريق خالد بن الوليد، المدينة المنورة", phone: "+966 14 848 9900", lat: 24.4672, lng: 39.6111, isCertified: true, workingHours: "09:00 ص - 09:00 م" },
    { id: "b-abha", name: "فرع المنطقة الجنوبية - أبها", city: "أبها", address: "طريق الملك فهد، حي المنهل، أبها", phone: "+966 17 228 1100", lat: 18.2164, lng: 42.5053, isCertified: false, workingHours: "08:00 ص - 08:00 م" }
  ];

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Geolocation calculator for nearest branch
  const handleDetectNearestBranch = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم خاصية تحديد الموقع الجغرافي.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Calculate simple Euclidean distance to find nearest branch
        let minDistance = Infinity;
        let nearest: WorkshopBranch = branches[0];

        branches.forEach((b) => {
          const d = Math.sqrt(Math.pow(b.lat - userLat, 2) + Math.pow(b.lng - userLng, 2));
          if (d < minDistance) {
            minDistance = d;
            nearest = b;
          }
        });

        setSelectedBranchId(nearest.id);
        setNearestCalculated(nearest.name);
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        alert("فشل تحديد موقعك الجغرافي. تأكد من إعطاء الصلاحية في المتصفح ثم أعد المحاولة.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-12 p-6 md:p-8" id="branches-map-section">
      <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">خريطة الفروع ومراكز الخدمة المعتمدة بالمملكة</h3>
          <p className="text-xs text-slate-400 mt-0.5">حدد أقرب فروعنا في الرياض، جدة، المنطقة الشرقية، المدينة المنورة، وأبها لخدمتكم فوراً</p>
        </div>

        <button
          onClick={handleDetectNearestBranch}
          disabled={isLocating}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold transition text-xs flex items-center gap-2"
        >
          <Compass className={`w-4 h-4 text-amber-400 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "جاري تحديد الموقع..." : "تحديد موقعي التلقائي وحساب أقرب فرع"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Custom Interactive Vector Map of Saudi Arabia */}
        <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-slate-800 relative flex flex-col justify-between overflow-hidden min-h-[380px]">
          {/* Subtle grid lines background overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">الخريطة التفاعلية للمملكة العربية السعودية</span>
            <span className="text-[10px] text-slate-400">اضغط على المدينة لتحديد الفرع</span>
          </div>

          {/* Interactive SVG representation of KSA with branches mapped */}
          <div className="w-full h-64 my-auto relative flex items-center justify-center">
            {/* Outline SVG of Saudi Arabia (simplified artistic/conceptual representation for lightweight premium visual) */}
            <svg viewBox="0 0 400 300" className="w-full h-full max-w-[450px] opacity-25">
              <path 
                d="M 50,220 C 60,250 110,280 160,270 C 210,260 250,230 280,240 C 310,250 350,220 370,190 C 390,160 380,110 350,90 C 320,70 300,50 260,40 C 220,30 180,50 140,60 C 100,70 80,90 60,110 C 40,130 30,190 50,220 Z" 
                fill="none" 
                stroke="#d97706" 
                strokeWidth="2" 
                strokeDasharray="4 4"
              />
            </svg>

            {/* Render Pulsing City Points on top of coordinates */}
            {/* Riyadh Point: center-ish (x: 230, y: 150) */}
            <button
              onClick={() => setSelectedBranchId("b-riyadh")}
              style={{ left: "55%", top: "45%" }}
              className="absolute z-10 group -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-75 ${selectedBranchId === "b-riyadh" ? "scale-150" : "scale-75"}`} />
                <div className={`rounded-full p-1.5 shadow-lg border transition ${selectedBranchId === "b-riyadh" ? "bg-amber-500 border-white text-slate-950 scale-125" : "bg-slate-900 border-amber-500 text-amber-500 group-hover:scale-110"}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute top-8 bg-slate-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">الرياض (الرئيسي)</span>
              </div>
            </button>

            {/* Jeddah Point: west Coast (x: 100, y: 180) */}
            <button
              onClick={() => setSelectedBranchId("b-jeddah")}
              style={{ left: "28%", top: "58%" }}
              className="absolute z-10 group -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-75 ${selectedBranchId === "b-jeddah" ? "scale-150" : "scale-75"}`} />
                <div className={`rounded-full p-1.5 shadow-lg border transition ${selectedBranchId === "b-jeddah" ? "bg-amber-500 border-white text-slate-950 scale-125" : "bg-slate-900 border-amber-500 text-amber-500 group-hover:scale-110"}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute top-8 bg-slate-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">جدة</span>
              </div>
            </button>

            {/* Dammam Point: east Coast (x: 320, y: 110) */}
            <button
              onClick={() => setSelectedBranchId("b-dammam")}
              style={{ left: "78%", top: "35%" }}
              className="absolute z-10 group -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-75 ${selectedBranchId === "b-dammam" ? "scale-150" : "scale-75"}`} />
                <div className={`rounded-full p-1.5 shadow-lg border transition ${selectedBranchId === "b-dammam" ? "bg-amber-500 border-white text-slate-950 scale-125" : "bg-slate-900 border-amber-500 text-amber-500 group-hover:scale-110"}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute top-8 bg-slate-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">الدمام</span>
              </div>
            </button>

            {/* Medina Point: north-west inland (x: 120, y: 120) */}
            <button
              onClick={() => setSelectedBranchId("b-medina")}
              style={{ left: "32%", top: "36%" }}
              className="absolute z-10 group -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-75 ${selectedBranchId === "b-medina" ? "scale-150" : "scale-75"}`} />
                <div className={`rounded-full p-1.5 shadow-lg border transition ${selectedBranchId === "b-medina" ? "bg-amber-500 border-white text-slate-950 scale-125" : "bg-slate-900 border-amber-500 text-amber-500 group-hover:scale-110"}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute top-8 bg-slate-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">المدينة المنورة</span>
              </div>
            </button>

            {/* Abha Point: South-west (x: 160, y: 240) */}
            <button
              onClick={() => setSelectedBranchId("b-abha")}
              style={{ left: "42%", top: "78%" }}
              className="absolute z-10 group -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-75 ${selectedBranchId === "b-abha" ? "scale-150" : "scale-75"}`} />
                <div className={`rounded-full p-1.5 shadow-lg border transition ${selectedBranchId === "b-abha" ? "bg-amber-500 border-white text-slate-950 scale-125" : "bg-slate-900 border-amber-500 text-amber-500 group-hover:scale-110"}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute top-8 bg-slate-900 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">أبها</span>
              </div>
            </button>
          </div>

          {/* Quick Notification of Nearest Branch */}
          {nearestCalculated && (
            <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-xl flex items-center gap-2 text-xs text-amber-400 z-10 animate-bounce">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>تم تحديد أقرب مركز خدمة لموقعك الحالي: <b>{nearestCalculated}</b></span>
            </div>
          )}
        </div>

        {/* Right column: Selected Branch Information metrics */}
        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">فرع منطقة {selectedBranch.city}</span>
                {selectedBranch.isCertified ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مجمع صيانة معتمد</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold">فرع صيانة دورية خفيفة</span>
                )}
              </div>
              <h4 className="text-lg font-black text-slate-800">{selectedBranch.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{selectedBranch.address}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200/50 text-xs">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                <span className="text-slate-400 font-medium">رقم التواصل المباشر بالفرع</span>
                <a href={`tel:${selectedBranch.phone}`} className="font-bold text-slate-800 hover:text-amber-600 transition flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-mono">{selectedBranch.phone}</span>
                </a>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60">
                <span className="text-slate-400 font-medium">ساعات عمل استقبال الصيانة</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedBranch.workingHours}</span>
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400">ميزات وخدمات هذا المركز:</span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>خدمات فحص كمبيوتر وتصفية ماكينة فورية.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>توفر قسم خاص للكهرباء والتكييف وصيانة العضلات.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>مستودع متكامل لقطع الغيار المضمونة مع التركيب الفوري.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-6">
            <button
              onClick={() => alert(`جاري توليد رابط الخرائط والاتجاهات لفرعنا بـ ${selectedBranch.city}...`)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>إرسال اتجاهات المركز إلى جوالي (GPS)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
