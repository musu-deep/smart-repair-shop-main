import React, { useState } from "react";
import { Gauge, ShieldCheck, FileText, CheckCircle, RefreshCcw, Bell, ArrowLeftRight, Landmark } from "lucide-react";
import { MaintenanceContract } from "../types";

interface ContractsAndAutomationProps {
  onAddAppointment: (serviceType: string, vehicleModel: string, vehicleType: string) => void;
}

export default function ContractsAndAutomation({ onAddAppointment }: ContractsAndAutomationProps) {
  // Mileage & automation states
  const [odometer, setOdometer] = useState(48500);
  const [lastOilChange, setLastOilChange] = useState(45000);
  const [lastFilterChange, setLastFilterChange] = useState(40000);

  // Contracts state
  const [contracts, setContracts] = useState<MaintenanceContract[]>([
    { id: "c-1", entityName: "شركة نقليات الرياض اللوجستية", contractType: "platinum", startDate: "2026-01-10", durationMonths: 12, vehicleCount: 25, totalCost: 45000, status: "active" },
    { id: "c-2", entityName: "مؤسسة فهد للمقاولات العامة", contractType: "gold", startDate: "2026-03-15", durationMonths: 12, vehicleCount: 8, totalCost: 18000, status: "active" }
  ]);

  const [companyName, setCompanyName] = useState("");
  const [vehicleCount, setVehicleCount] = useState(5);
  const [tier, setTier] = useState<"silver" | "gold" | "platinum">("gold");
  const [isContractRequested, setIsContractRequested] = useState(false);

  // Constants
  const oilInterval = 10000; // Oil changes every 10,000 km
  const filterInterval = 20000; // Filters every 20,000 km

  const nextOilDue = lastOilChange + oilInterval;
  const nextFilterDue = lastFilterChange + filterInterval;

  const oilRemaining = nextOilDue - odometer;
  const filterRemaining = nextFilterDue - odometer;

  const oilPercentage = Math.max(0, Math.min(100, (oilRemaining / oilInterval) * 100));
  const filterPercentage = Math.max(0, Math.min(100, (filterRemaining / filterInterval) * 100));

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      alert("الرجاء إدخال اسم الشركة أو المؤسسة!");
      return;
    }

    const calculatedCost = vehicleCount * (tier === "platinum" ? 2200 : tier === "gold" ? 1500 : 900);
    const newContract: MaintenanceContract = {
      id: `c-${Date.now()}`,
      entityName: companyName,
      contractType: tier,
      startDate: new Date().toISOString().split("T")[0],
      durationMonths: 12,
      vehicleCount,
      totalCost: calculatedCost,
      status: "pending"
    };

    setContracts([newContract, ...contracts]);
    setIsContractRequested(true);
    setCompanyName("");
  };

  const triggerAutoOilAppointment = () => {
    onAddAppointment("تغيير زيت المحرك التخليقي 10,000 كم", "سيارة العميل الحالية", "gasoline");
    alert("تم مجدولة موعد تغيير الزيت آلياً في أقرب فرع لسيارتك! تفقّد جدول المواعيد في الأعلى.");
  };

  const triggerAutoFilterAppointment = () => {
    onAddAppointment("تغيير الفلاتر وتصفية هواء الماكينة", "سيارة العميل الحالية", "gasoline");
    alert("تم مجدولة موعد تغيير الفلاتر وتصفية الهواء آلياً في أقرب فرع لسيارتك! تفقّد جدول المواعيد في الأعلى.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12" id="contracts-automation-section">
      
      {/* Left Column: Automated oil/filters schedule */}
      <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-800">تغيير الزيوت والفلاتر الآلي (حسب العداد الفعلي)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">يقوم النظام بحساب جودة ولزوجة الزيوت تلقائياً بناءً على الكيلومترات المقطوعة فعلياً</p>
        </div>

        {/* Interactive Odometer Slider */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">قراءة عداد الكيلومترات الفعلي الحالي:</span>
            <span className="text-lg font-black font-mono text-slate-900 bg-amber-100 px-3 py-1 rounded-lg">
              {odometer.toLocaleString()} كم
            </span>
          </div>

          <input
            type="range"
            min={40000}
            max={70000}
            step={500}
            value={odometer}
            onChange={(e) => setOdometer(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>40,000 كم</span>
            <span>55,000 كم (متوسط مبيعات)</span>
            <span>70,000 كم</span>
          </div>
        </div>

        {/* Oil and Filter Status Progress bars */}
        <div className="space-y-6">
          {/* 1. Oil Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">حالة صلاحية زيت المحرك</span>
              <span className={`font-bold ${oilRemaining <= 1000 ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>
                {oilRemaining > 0 ? `متبقي ${oilRemaining.toLocaleString()} كم` : "منتهي الصلاحية فوراً!"}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${oilRemaining <= 1500 ? "bg-rose-500" : "bg-amber-500"}`}
                style={{ width: `${oilPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <p className="text-[10px] text-slate-400">آخر تبديل: {lastOilChange.toLocaleString()} كم | الاستبدال القادم: {nextOilDue.toLocaleString()} كم</p>
              
              {oilRemaining <= 1500 && (
                <button
                  onClick={triggerAutoOilAppointment}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-lg text-[10px] flex items-center gap-1.5 animate-bounce"
                >
                  <Bell className="w-3 h-3 text-rose-600" />
                  <span>جدولة تغيير الزيت آلياً</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Filters Status */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">حالة فلتر الهواء وفلتر المكيف</span>
              <span className={`font-bold ${filterRemaining <= 2000 ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>
                {filterRemaining > 0 ? `متبقي ${filterRemaining.toLocaleString()} كم` : "يجب تبديل الفلاتر!"}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${filterRemaining <= 2500 ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{ width: `${filterPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <p className="text-[10px] text-slate-400">آخر تبديل: {lastFilterChange.toLocaleString()} كم | الاستبدال القادم: {nextFilterDue.toLocaleString()} كم</p>
              
              {filterRemaining <= 2500 && (
                <button
                  onClick={triggerAutoFilterAppointment}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold rounded-lg text-[10px] flex items-center gap-1.5"
                >
                  <Bell className="w-3 h-3 text-amber-600" />
                  <span>جدولة استبدال الفلاتر آلياً</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50/40 rounded-xl border border-amber-100 text-xs text-slate-600 leading-relaxed">
          <b>ℹ️ ميزة المزامنة الذكية:</b> يقوم النظام بمطابقة قراءة العداد الفعلية لسيارتك عند ربطها بالكمبيوتر في ورشتنا، ويقوم بتنبيهك تلقائياً عبر الرسائل النصية والبريد الإلكتروني بمجرد اقتراب موعد استبدال السوائل لحماية كفاءة المحرك.
        </div>
      </div>

      {/* Right Column: Corporate maintenance contracting */}
      <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-800">فرص وعقود الصيانة الدورية للشركات والجهات المعتمدة</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">حلول أساطيل النقل والشركات مع ضمان جودة الأداء الميكانيكي والكهربائي وتخفيضات دورية</p>
          </div>

          {/* New contract request form */}
          {isContractRequested ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-3 mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">تم تسجيل طلب التعاقد بنجاح!</h4>
              <p className="text-xs text-slate-500 leading-relaxed">سيقوم مستشار مبيعات قطاع الشركات بالاتصال بكم خلال 24 ساعة لتقديم عرض الأسعار وتوقيع اتفاقية الصيانة الشاملة.</p>
              <button
                onClick={() => setIsContractRequested(false)}
                className="text-xs font-bold text-slate-700 hover:underline"
              >
                تقديم طلب لشركة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleContractSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">اسم الشركة / الجهة المعتمدة *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                    placeholder="مؤسسة عبدالله للمقاولات"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">عدد سيارات الأسطول المتوقع *</label>
                  <input
                    type="number"
                    min={2}
                    max={500}
                    required
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">فئة باقة الصيانة المفضلة</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  >
                    <option value="platinum">البلاتينية (شامل قطع الغيار والعمالة والسطحات)</option>
                    <option value="gold">الذهبية (شامل الفحوصات وتخفيض 25% على القطع)</option>
                    <option value="silver">الفضية (جدولة الفلاتر والزيوت والبرمجة مجاناً)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-bold">التكلفة السنوية التقديرية للسيارة</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {tier === "platinum" ? "2,200 ريال / سنة" : tier === "gold" ? "1,500 ريال / سنة" : "900 ريال / سنة"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition"
              >
                إرسال طلب صيانة الأسطول بأسعار تفضيلية معتمدة
              </button>
            </form>
          )}

          {/* Active corporate contracts list */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 block">العقود النشطة الحالية (قطاع الشركات):</span>
            
            <div className="space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800 text-[11px]">{c.entityName}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">تاريخ البدء: {c.startDate} | أسطول: {c.vehicleCount} مركبة</p>
                  </div>

                  <div className="text-right">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {c.status === "active" ? "عقد ساري المفعول" : "تحت المراجعة"}
                    </span>
                    <p className="text-[10px] font-bold text-slate-700 mt-1">{c.totalCost.toLocaleString()} ريال / سنة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 mt-6 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>عقودنا المعتمدة مصممة لمطابقة معايير جودة الأداء الميكانيكي للهيئة السعودية للمواصفات والمقاييس.</span>
        </div>
      </div>

    </div>
  );
}
