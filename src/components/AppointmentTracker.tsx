import React, { useState } from "react";
import { Calendar, Clock, Car, User, Phone, CheckCircle, ListTodo, ChevronLeft, ChevronRight, Search, FileText, Download } from "lucide-react";
import { Appointment, MaintenanceHistory, VehicleType } from "../types";

interface AppointmentTrackerProps {
  appointments: Appointment[];
  history: MaintenanceHistory[];
  onAddAppointment: (app: Omit<Appointment, "id" | "status">) => void;
  activeTrackingId: string | null;
}

export default function AppointmentTracker({ appointments, history, onAddAppointment, activeTrackingId }: AppointmentTrackerProps) {
  // Appointment Form state
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("2026-07-20");
  const [time, setTime] = useState("10:00");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("gasoline");
  const [serviceType, setServiceType] = useState("فحص شامل وتصفية ماكينة");
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);

  // History search state
  const [historySearch, setHistorySearch] = useState("");

  // Live Repair tracking stage
  // Simulated tracking steps
  const trackingSteps = [
    { step: 1, title: "استلام السيارة والمعاينة", desc: "تم استقبال السيارة وتسجيل الكيلومترات وتوثيق الملاحظات الخارجية.", status: "completed" },
    { step: 2, title: "الفحص الذكي بالكمبيوتر والذكاء الاصطناعي", desc: "إجراء الفحص المبدئي وبث أصوات المحرك لتشخيص الأعطال الكامنة.", status: "completed" },
    { step: 3, title: "طلب وتوريد قطع الغيار المضمونة", desc: "تأمين قطع الغيار الأصلية من منصة الشركاء بضمان جودة معتمد.", status: "completed" },
    { step: 4, title: "الإصلاح والميكانيكا والكهرباء", desc: "يقوم كادرنا المعتمد بتركيب القطع ومعايرة المحرك بإشراف هندسي.", status: "current" },
    { step: 5, title: "اختبار الجودة والقيادة التجريبية", desc: "التأكد من زوال صوت العطل كلياً ومطابقة الحساسات في البوابة الرقمية.", status: "pending" },
    { step: 6, title: "جاهزة للاستلام والغسيل", desc: "السيارة جاهزة تماماً للاستلام مع تسليم الفاتورة والتقرير الرقمي المعتمد.", status: "pending" }
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !vehicleModel) {
      alert("الرجاء تعبئة جميع الحقول المطلوبة لحجز موعدك!");
      return;
    }

    const newApp = {
      clientName,
      phone,
      date,
      time,
      vehicleModel,
      vehicleType,
      serviceType
    };

    onAddAppointment(newApp);
    setBookedDetails(newApp);
    setIsBooked(true);

    // Reset form
    setClientName("");
    setPhone("");
    setVehicleModel("");
  };

  const filteredHistory = history.filter((h) => 
    h.vehicleModel.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.description.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12" id="appointment-tracker-section">
      {/* Left Column: Booking Form and Tracking */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Repair Live Tracker */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
          <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                <h3 className="text-lg font-bold text-slate-800">التتبع اللحظي لحالة الصيانة الجارية</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">تابع تطورات سيارتك خطوة بخطوة من أي مكان</p>
            </div>
            <div className="bg-slate-100 text-slate-800 text-xs px-3 py-1.5 rounded-xl font-bold font-mono">
              رقم التتبع: {activeTrackingId || "TRK-98305"}
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pr-6 border-r-2 border-slate-100 space-y-6">
            {trackingSteps.map((step) => (
              <div key={step.step} className="relative">
                {/* Node icon */}
                <div className={`absolute top-0 right-[-31px] w-[14px] h-[14px] rounded-full border-2 transition-all ${
                  step.status === "completed" 
                    ? "bg-amber-600 border-amber-600 shadow shadow-amber-600/30" 
                    : step.status === "current"
                    ? "bg-amber-100 border-amber-600 animate-pulse scale-125"
                    : "bg-white border-slate-300"
                }`} />

                <div className={`p-4 rounded-2xl border transition-all ${
                  step.status === "current" 
                    ? "bg-slate-50/50 border-amber-500/30 shadow-md shadow-amber-600/5" 
                    : "border-transparent"
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${
                      step.status === "completed" 
                        ? "text-slate-800 line-through decoration-slate-300 decoration-1" 
                        : step.status === "current"
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}>
                      {step.title}
                    </h4>
                    {step.status === "completed" && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">مكتمل</span>
                    )}
                    {step.status === "current" && (
                      <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md font-bold animate-pulse">جاري العمل حالياً</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Scheduling */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-800">حجز موعد صيانة ذكي وآلي</h3>
            <p className="text-xs text-slate-400 mt-0.5">احجز موعدك لضمان عدم الانتظار وتوفير الفحص الفوري بالذكاء الاصطناعي</p>
          </div>

          {isBooked ? (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">تم حجز موعدك وتأكيده بنجاح!</h4>
                <p className="text-xs text-slate-500 mt-1">تلقينا طلبك وسيقوم النظام بإرسال تذكير على رقم جوالك فوراً.</p>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-xl text-right text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">العميل:</span>
                  <span className="font-bold text-slate-700">{bookedDetails.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الموعد:</span>
                  <span className="font-bold text-slate-700">{bookedDetails.date} في تمام {bookedDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">السيارة والخدمة:</span>
                  <span className="font-bold text-slate-700">{bookedDetails.vehicleModel} ({bookedDetails.serviceType})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBooked(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                حجز موعد جديد
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">اسم العميل بالكامل *</label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                      placeholder="عبدالله محمد الحربي"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">رقم الجوال *</label>
                  <div className="relative">
                    <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs text-left focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ الموعد *</label>
                  <div className="relative">
                    <Calendar className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الوقت المفضل *</label>
                  <div className="relative">
                    <Clock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition appearance-none"
                    >
                      <option value="08:00">08:00 صباحاً</option>
                      <option value="09:00">09:00 صباحاً</option>
                      <option value="10:00">10:00 صباحاً</option>
                      <option value="11:00">11:00 صباحاً</option>
                      <option value="13:00">01:00 ظهراً</option>
                      <option value="14:00">02:00 ظهراً</option>
                      <option value="16:00">04:00 عصراً</option>
                      <option value="17:00">05:00 مساءً</option>
                      <option value="19:00">07:00 مساءً</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">موديل ومصنع السيارة *</label>
                  <div className="relative">
                    <Car className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                      placeholder="لكزس ES 350 2021"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نوع طاقة السيارة</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  >
                    <option value="gasoline">بنزين</option>
                    <option value="diesel">ديزل (سولار)</option>
                    <option value="hybrid">هجين (بنزين + كهرباء)</option>
                    <option value="electric">كهربائية بالكامل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الخدمة المطلوبة</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                  >
                    <option value="فحص شامل وتصفية ماكينة">فحص شامل وتصفية ماكينة</option>
                    <option value="صيانة كهرباء وميكانيكا محرك">صيانة كهرباء وميكانيكا محرك</option>
                    <option value="تغيير زيت وفلاتر دوري دوري">تغيير زيت وفلاتر دوري</option>
                    <option value="إصلاح فرامل ومكابح وهوبات">إصلاح فرامل ومكابح وهوبات</option>
                    <option value="تشخيص وبرمجة كمبيوتر السيارة">تشخيص وبرمجة كمبيوتر السيارة</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition duration-300 shadow-md shadow-amber-600/10"
              >
                تأكيد حجز الموعد وإرسال بيانات المعاينة للورشة
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Maintenance History Log */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8 h-full flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">السجل الشامل وتاريخ الصيانة السابق</h3>
              <p className="text-xs text-slate-400 mt-0.5">تقارير وفواتير عمليات الصيانة لمركبات العميل</p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                placeholder="ابحث بطراز السيارة أو وصف العطل..."
              />
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد سجلات صيانة تطابق مدخلات البحث.
                </div>
              ) : (
                filteredHistory.map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:border-slate-300 transition duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{rec.vehicleModel}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">التاريخ: {rec.date} | المسافة: {rec.mileage.toLocaleString()} كم</p>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-amber-400 font-bold px-2 py-0.5 rounded-md">
                        {rec.cost} ريال
                      </span>
                    </div>

                    <div className="border-t border-slate-200/50 pt-2 text-xs text-slate-600">
                      <p className="font-semibold text-[10px] text-slate-400 mb-0.5">الخدمة المنجزة:</p>
                      <p className="leading-relaxed text-[11px]">{rec.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {rec.partsReplaced.map((part, index) => (
                        <span key={index} className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                          {part}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>منتهية ومكفولة 100%</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => alert(`جاري تنزيل الفاتورة الضريبية وتقارير فحص المركبة ${rec.vehicleModel} بصيغة PDF...`)}
                        className="text-[10px] text-slate-500 hover:text-amber-600 font-bold flex items-center gap-1 transition"
                      >
                        <Download className="w-3 h-3" />
                        <span>تنزيل التقرير والفاتورة</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <FileText className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">عقود الصيانة الدورية الشاملة</span>
                <span>توفر الورشة إمكانية الحصول على تقارير دورية دقيقة عن حالة المركبة مباشرة عبر حسابك، لتقليل الأعطال المفاجئة.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
