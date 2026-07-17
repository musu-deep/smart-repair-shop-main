import React, { useState } from "react";
import { CreditCard, Shield, CheckCircle2, DollarSign, ArrowLeftRight, Download, Receipt } from "lucide-react";

interface DigitalPaymentProps {
  amount: number;
  itemDescription: string;
  onPaymentSuccess: () => void;
}

export default function DigitalPayment({ amount, itemDescription, onPaymentSuccess }: DigitalPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<"mada" | "applepay" | "visa">("mada");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || "";
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (value.length >= 2) {
      setExpiry(value.substring(0, 2) + "/" + value.substring(2, 4));
    } else {
      setExpiry(value);
    }
  };

  const executePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod !== "applepay" && (!cardNumber || !cardName || !cvv)) {
      alert("الرجاء إدخال بيانات البطاقة الماليّة كاملة لتمرير عملية الدفع!");
      return;
    }

    setIsProcessing(true);
    
    // Simulate secure bank gateway handshake delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setReceiptNumber(`REC-${Math.floor(Math.random() * 900000) + 100000}`);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-12 p-6 md:p-8" id="payment-gateway-section">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-slate-800">بوابة الدفع الإلكتروني الفوري والمباشر</h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">تسديد فواتير الصيانة المباشرة وحجز قطع الغيار بضمان تشفير سعودي بنسبة 100%</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form checkout */}
        <div className="lg:col-span-7">
          {isPaid ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">تمت معالجة السداد بنجاح!</h4>
                <p className="text-xs text-slate-500 mt-1">تلقينا مبلغ الفاتورة، وتم ربط الدفعة بملف الصيانة وقطع الغيار المضمونة.</p>
              </div>

              <div className="bg-white border border-slate-100 p-4 rounded-xl text-right text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم الإيصال المالي:</span>
                  <span className="font-bold text-slate-800 font-mono">{receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المبلغ المدفوع:</span>
                  <span className="font-bold text-slate-800">{amount} ريال سعودي</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">البند / المشتريات:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{itemDescription}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => alert("جاري تنزيل نسخة الفاتورة الضريبية الرسمية المعتمدة... ")}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>تحميل الفاتورة الضريبية</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  إجراء عملية دفع أخرى
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={executePayment} className="space-y-6">
              {/* Payment Methods selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">اختر طريقة الدفع المفضلة:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "mada", label: "بطاقة مدى (Mada)" },
                    { id: "applepay", label: "Apple Pay" },
                    { id: "visa", label: "Visa / MasterCard" }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`py-3 px-4 rounded-xl font-bold text-xs border transition flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === method.id
                          ? "bg-amber-50 border-amber-400 text-amber-800 shadow"
                          : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "applepay" ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-950 font-black tracking-tighter">
                     Pay
                  </div>
                  <p className="text-xs text-slate-400">انقر على الزر أدناه لإتمام عملية السداد السريعة باستخدام بصمة الجوال أو رمز المرور.</p>
                  <button
                    type="submit"
                    className="w-full max-w-xs mx-auto py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-sm transition flex items-center justify-center gap-2"
                  >
                    <span>الدفع السريع بـ  Pay</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">اسم حامل البطاقة *</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                        placeholder="ALAA M ALHARBI"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">رقم بطاقة الصراف *</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs tracking-wider focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                        placeholder="4000 1234 5678 9010"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ انتهاء الصلاحية *</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs text-center focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">الرمز السري (CVV) *</label>
                      <input
                        type="password"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        maxLength={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs text-center focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-500/50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري التحقق الآمن مع البنك المركزي (SAMA)...</span>
                      </>
                    ) : (
                      <span>تسديد المبلغ بأمان الآن ({amount} ريال)</span>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Right Column: Invoice summary details */}
        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center gap-1.5 text-slate-800 font-bold text-sm">
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>موجز الفاتورة والخدمات الخاضعة للضريبة</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">البند المحدد:</span>
                  <span className="font-bold text-slate-800">{itemDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الضريبة المضافة (15%):</span>
                  <span className="font-semibold text-slate-700">شاملة وموضحة</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                  <span className="font-bold text-slate-800">إجمالي المبلغ المستحق:</span>
                  <span className="font-black text-amber-600">{amount} ريال سعودي</span>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-slate-200/60 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">مزايا السداد داخل التطبيق:</span>
                <ul className="space-y-1.5 text-[10px] text-slate-500">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span>تأكيد حجز قطع الغيار لسيارتك فوراً لتفادي غياب الموزعين.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span>تأهيل الفواتير في ملف صيانة السيارة الدوري.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span>استرداد مالي (Cashback) 5% على رصيد محفظتك للصيانات القادمة.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-[10px] text-slate-400">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>معتمد بنسبة 100% من مؤسسة النقد وبوابة الدفع السعودية مادا ومحمي بخاصية التحقق ثلاثي الأبعاد 3D Secure.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
