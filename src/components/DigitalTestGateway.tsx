import React, { useState, useEffect } from "react";
import { Play, RotateCcw, Activity, ShieldAlert, CheckCircle, Database, Sparkles } from "lucide-react";

interface DigitalTestGatewayProps {
  onTranslateCode: (code: string) => void;
}

export default function DigitalTestGateway({ onTranslateCode }: DigitalTestGatewayProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);
  
  // Real-time fluctuating sensor states
  const [telemetry, setTelemetry] = useState({
    rpm: 750,
    coolantTemp: 88,
    oilPressure: 42,
    voltage: 13.8,
    fuelTrim: 1.2,
    catalystTemp: 420
  });

  // Fluctuating values loop during active state
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const factor = isScanning ? 2.5 : 0.4;
        return {
          rpm: isScanning 
            ? Math.floor(1200 + Math.random() * 3200) 
            : Math.floor(740 + Math.random() * 30),
          coolantTemp: isScanning 
            ? Math.floor(88 + Math.random() * 12) 
            : Math.floor(87 + Math.random() * 2),
          oilPressure: isScanning 
            ? Math.floor(45 + Math.random() * 25) 
            : Math.floor(39 + Math.random() * 4),
          voltage: Math.round((13.7 + Math.random() * 0.3) * 10) / 10,
          fuelTrim: Math.round((1.0 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
          catalystTemp: isScanning 
            ? Math.floor(450 + Math.random() * 180) 
            : Math.floor(390 + Math.random() * 15)
        };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Scan simulation progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning) {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            setHasScanned(true);
            return 100;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isScanning]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setHasScanned(false);
  };

  const handleResetScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setHasScanned(false);
  };

  // Detected OBD faults list
  const detectedFaults = [
    { code: "P0300", name: "خلل اشتعال عشوائي متعدد (Misfire Detected)", system: "نظام الحقن والاشتعال", status: "نشط حالياً" },
    { code: "P0171", name: "خليط وقود فقير بالهواء في البنك 1 (System Too Lean)", system: "تغذية الوقود والهواء", status: "نشط حالياً" }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mb-12 p-6 md:p-8" id="digital-gateway-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xl font-bold tracking-tight text-white">البوابة الرقمية لفحص الحساسات الحية</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">عرض حي متقدم لبيانات المحرك، المكابس، الشكمان، والجهد الكهربائي ببروتوكول OBD-II</p>
        </div>

        <div className="flex items-center gap-2">
          {hasScanned && (
            <button
              onClick={handleResetScan}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تهيئة</span>
            </button>
          )}
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold transition text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Play className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? `جاري الفحص المباشر (${scanProgress}%)` : "بدء فحص الحساسات الشامل"}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible when scanning) */}
      {isScanning && (
        <div className="w-full bg-slate-900 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-100 ease-out"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
      )}

      {/* Interactive Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {/* RPM Card */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">دوران المحرك</span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black font-mono text-white tracking-tight">{telemetry.rpm}</p>
            <p className="text-[10px] text-slate-400 font-bold">RPM (سرعة الماكينة)</p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300" 
              style={{ width: `${Math.min((telemetry.rpm / 6000) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Coolant Temp Card */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">حرارة المحرك</span>
            <span className="text-xs font-mono text-slate-500">°C</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black font-mono text-white tracking-tight">{telemetry.coolantTemp}</p>
            <p className="text-[10px] text-slate-400 font-bold">درجة حرارة سائل التبريد</p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${telemetry.coolantTemp > 95 ? "bg-rose-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min((telemetry.coolantTemp / 120) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Oil Pressure Card */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">ضغط الزيت</span>
            <span className="text-xs font-mono text-slate-500">PSI</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black font-mono text-white tracking-tight">{telemetry.oilPressure}</p>
            <p className="text-[10px] text-slate-400 font-bold">ضغط تزييت السلندر</p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-sky-500 h-full transition-all duration-300" 
              style={{ width: `${Math.min((telemetry.oilPressure / 80) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Voltage Card */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">جهد البطارية</span>
            <span className="text-xs font-mono text-slate-500">V</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black font-mono text-white tracking-tight">{telemetry.voltage}</p>
            <p className="text-[10px] text-slate-400 font-bold">جهد الدينامو والكهرباء</p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300" 
              style={{ width: `${Math.min((telemetry.voltage / 16) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Catalyst Temp Card */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">دبة التلوث</span>
            <span className="text-xs font-mono text-slate-500">°C</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black font-mono text-white tracking-tight">{telemetry.catalystTemp}</p>
            <p className="text-[10px] text-slate-400 font-bold">حرارة علبة البيئة بالشكمان</p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-full transition-all duration-300" 
              style={{ width: `${Math.min((telemetry.catalystTemp / 800) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Fuel Trim Card */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">خليط البنزين</span>
            <span className="text-xs font-mono text-slate-500">Lambda</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black font-mono text-white tracking-tight">{telemetry.fuelTrim}</p>
            <p className="text-[10px] text-slate-400 font-bold">موازنة استهلاك الوقود</p>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-orange-500 h-full transition-all duration-300" 
              style={{ width: `${Math.min((telemetry.fuelTrim / 2) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Fault Logs display area */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm text-white">سجل الأخطاء النشطة وأعطال الكمبيوتر المكتشفة</h4>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
            {!hasScanned ? "بانتظار إجراء الفحص" : `تم رصد عدد: ${detectedFaults.length} عطل`}
          </span>
        </div>

        {!hasScanned && !isScanning ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            قم بالضغط على "بدء فحص الحساسات الشامل" في الأعلى لبدء قراءة سجل الكمبيوتر OBD-II واستخراج المشاكل النشطة بالسيارة.
          </div>
        ) : isScanning ? (
          <div className="text-center py-8 text-amber-400/80 text-xs animate-pulse flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>جاري قراءة بروتوكولات الكان-باص (CAN-bus) وفك الأكواد المشفرة...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {detectedFaults.map((fault) => (
              <div 
                key={fault.code} 
                className="bg-slate-950 p-4 rounded-xl border border-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-900/60 transition duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-950/50 text-red-400 rounded-lg border border-red-900/50">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded tracking-wide">{fault.code}</span>
                      <h5 className="font-bold text-xs text-white">{fault.name}</h5>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">المنظومة: {fault.system} | الحالة: <span className="text-red-400">{fault.status}</span></p>
                  </div>
                </div>

                <button
                  onClick={() => onTranslateCode(fault.code)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition self-end sm:self-auto"
                >
                  تحليل الكود وترجمته بالذكاء الاصطناعي 🧠
                </button>
              </div>
            ))}

            <div className="p-3 bg-emerald-950/20 text-emerald-400 rounded-lg border border-emerald-900/30 text-[10px] leading-relaxed flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>فحص باقي الأنظمة (نظام التوجيه ABS، أنظمة التكييف، الأكياس الهوائية SRS) سليمة بالكامل ولا تسجل أي أخطاء نشطة.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
