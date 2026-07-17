import React, { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle, ShieldCheck, Filter, Wrench, AlertCircle, Trash2, Tag } from "lucide-react";
import { SparePart } from "../types";

interface PartsMarketplaceProps {
  preselectedParts: string[];
  onCheckout: (totalCost: number, items: string[]) => void;
}

export default function PartsMarketplace({ preselectedParts, onCheckout }: PartsMarketplaceProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<SparePart[]>([]);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);

  // High quality mock spare parts database
  const sparePartsDatabase: SparePart[] = [
    { id: "p1", name: "طقم بواجي ليزر إيريديوم أصلي", code: "SP-PLUG-102", price: 180, warrantyYears: 2, category: "engine", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 14 },
    { id: "p2", name: "فحمات فرامل أمامية سيراميك كفالة تامة", code: "SP-BRK-509", price: 240, warrantyYears: 3, category: "brakes", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 9 },
    { id: "p3", name: "سير محرك مروحة ودينامو خارجي مقاوم للحرارة", code: "SP-BELT-320", price: 95, warrantyYears: 1, category: "engine", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 22 },
    { id: "p4", name: "حساس كمية تدفق الهواء MAF عالي الحساسية", code: "SP-SENS-741", price: 310, warrantyYears: 2, category: "electrical", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 5 },
    { id: "p5", name: "فلتر هواء محرك تنقية قصوى للمملكة", code: "SP-FLT-808", price: 65, warrantyYears: 1, category: "filters", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 40 },
    { id: "p6", name: "مساعدات هيدروليكية أمامية يمين ويسار", code: "SP-SUS-212", price: 680, warrantyYears: 4, category: "suspension", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 3 },
    { id: "p7", name: "كويل اشتعال شمعة محرك إلكتروني", code: "SP-COIL-401", price: 190, warrantyYears: 2, category: "engine", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 8 },
    { id: "p8", name: "فلتر زيت محرك تخليقي عالي الكثافة", code: "SP-FLT-909", price: 45, warrantyYears: 1, category: "filters", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 50 },
    { id: "p9", name: "حساس أكسجين شكمان خلفي قياسي", code: "SP-SENS-302", price: 290, warrantyYears: 2, category: "electrical", image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200", isOriginal: true, stock: 4 }
  ];

  // Map AI preselected text parts into actual store items
  useEffect(() => {
    if (preselectedParts.length > 0) {
      const partsToAdd: SparePart[] = [];
      preselectedParts.forEach((partName) => {
        // Simple text scanning matching parts in db
        const found = sparePartsDatabase.find(
          (dbPart) =>
            dbPart.name.toLowerCase().includes(partName.toLowerCase()) ||
            partName.toLowerCase().includes("بواجي") && dbPart.category === "engine" && dbPart.name.includes("بواجي") ||
            partName.toLowerCase().includes("فحمات") && dbPart.category === "brakes" ||
            partName.toLowerCase().includes("سير") && dbPart.name.includes("سير") ||
            partName.toLowerCase().includes("فلتر") && dbPart.category === "filters" ||
            partName.toLowerCase().includes("حساس") && dbPart.category === "electrical"
        );
        if (found && !cart.some((item) => item.id === found.id)) {
          partsToAdd.push(found);
        }
      });
      if (partsToAdd.length > 0) {
        setCart((prev) => [...prev, ...partsToAdd]);
      }
    }
  }, [preselectedParts]);

  const addToCart = (part: SparePart) => {
    if (cart.some((item) => item.id === part.id)) {
      alert("القطعة موجودة بالفعل في قائمة طلباتك!");
      return;
    }
    setCart([...cart, part]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckoutProcess = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, curr) => acc + curr.price, 0);
    const itemNames = cart.map((item) => item.name);
    onCheckout(total, itemNames);
    setIsCheckoutSuccess(true);
    setCart([]);
  };

  const categories = [
    { id: "all", label: "كل الأقسام" },
    { id: "engine", label: "أجزاء المحرك" },
    { id: "electrical", label: "الكهرباء والحساسات" },
    { id: "brakes", label: "الفرامل والمكابح" },
    { id: "filters", label: "الفلاتر والزيوت" },
    { id: "suspension", label: "المساعدات والتعليق" }
  ];

  const filteredParts = activeCategory === "all" 
    ? sparePartsDatabase 
    : sparePartsDatabase.filter((part) => part.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8 mb-12" id="parts-marketplace-section">
      <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">منصة طلب قطع الغيار المباشرة والمضمونة</h3>
          <p className="text-xs text-slate-400 mt-0.5">اطلب قطع الغيار اللازمة لإصلاح سيارتك بأسعار منافسة مع ضمان جودة معتمد يصل إلى 4 سنوات</p>
        </div>

        {/* AI Auto-Detect Badge */}
        {preselectedParts.length > 0 && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <Tag className="w-4 h-4 text-amber-600" />
            <span>تم التعرف تلقائياً على قطع الأعطال الموصى بها</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-8 space-y-6">
          {/* Categories Horizontal Filter */}
          <div className="flex flex-wrap gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold transition ${
                  activeCategory === cat.id
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
                    : "bg-slate-50 border border-slate-200/60 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Parts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredParts.map((part) => {
              const isRecommended = preselectedParts.some(
                (recPart) =>
                  part.name.toLowerCase().includes(recPart.toLowerCase()) ||
                  recPart.toLowerCase().includes("بواجي") && part.name.includes("بواجي") ||
                  recPart.toLowerCase().includes("فحمات") && part.category === "brakes"
              );

              return (
                <div 
                  key={part.id} 
                  className={`bg-slate-50/50 rounded-2xl border p-4 flex flex-col justify-between hover:border-slate-300 transition duration-300 ${
                    isRecommended ? "ring-2 ring-amber-500/30 bg-amber-50/10 border-amber-500/20" : "border-slate-100"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Part tag */}
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-slate-900 text-amber-400 font-bold px-2 py-0.5 rounded">
                        كود: {part.code}
                      </span>
                      {isRecommended && (
                        <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded animate-pulse">موصى به للأعطال</span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed min-h-[36px]">{part.name}</h4>
                    
                    <div className="space-y-1 text-[10px] text-slate-500">
                      <p className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ضمان جودة القطع: <b className="text-slate-700">{part.warrantyYears} سنوات</b></span>
                      </p>
                      <p className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        <span>النوع: {part.isOriginal ? "قطع غيار أصلية OEM" : "تجاري درجة أولى ممعتمد"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/50 mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold">السعر شامل الضريبة</p>
                      <p className="text-sm font-bold text-slate-800">{part.price} ريال</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(part)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl transition"
                      title="أضف إلى الطلبات"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Direct checkout and Cart Summary */}
        <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>سلة طلب قطع الغيار المحددة</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">سيتم ربط هذه القطع بملف صيانة سيارتك وفواتيرك تلقائياً</p>
            </div>

            {isCheckoutSuccess ? (
              <div className="py-6 text-center space-y-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <div>
                  <h5 className="font-bold text-xs text-slate-800">تم حجز وتخصيص قطع الغيار بنجاح!</h5>
                  <p className="text-[10px] text-slate-500 mt-1">القطع أصبحت محجوزة لسيارتك، وسيتم شحنها أو تركيبها مباشرة فور وصول سيارتك للورشة.</p>
                </div>
                <button
                  onClick={() => setIsCheckoutSuccess(false)}
                  className="text-xs font-bold text-slate-800 hover:underline"
                >
                  إضافة المزيد من القطع
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span>لا توجد قطع غيار محددة في السلة حالياً. حدد القطع أعلاه أو استخدم التشخيص السمعي بالذكاء الاصطناعي لملء السلة تلقائياً.</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center gap-2">
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800 line-clamp-1">{item.name}</h5>
                      <p className="text-[9px] text-slate-400 mt-0.5">الرمز: {item.code} | كفالة {item.warrantyYears} سنوات</p>
                      <p className="text-xs font-bold text-amber-600 mt-1">{item.price} ريال</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="إزالة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isCheckoutSuccess && cart.length > 0 && (
            <div className="pt-4 border-t border-slate-200 mt-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-700">
                <span>مجموع القطع المحجوزة:</span>
                <span className="font-bold text-slate-900">{cart.length} قطع</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-700">التكلفة الإجمالية للقطع:</span>
                <span className="text-lg font-black text-slate-900">{cartTotal} ريال</span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutProcess}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-amber-600/10"
              >
                تأكيد حجز قطع الغيار والتحويل للدفع الإلكتروني
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
