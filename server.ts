import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "smart-repair-shop",
    aiMode: getGeminiClient() ? "live" : "simulation",
    timestamp: new Date().toISOString(),
  });
});

// Helper to safely get the Gemini API client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("⚠️ GEMINI_API_KEY is not set or using default value. Server will run in simulation mode.");
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return aiClient;
  } catch (err) {
    console.error("❌ Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

// 🟢 API Route: AI Acoustic Audio Diagnosis
app.post("/api/diagnose", async (req, res) => {
  const { soundType, carModel, fuelType, customNotes } = req.body;

  const client = getGeminiClient();

  if (!client) {
    // Graceful simulation fallback when GEMINI_API_KEY is missing
    console.log("Using simulation mode for acoustic diagnosis");
    const simulatedResponse = getSimulatedAcousticDiagnosis(soundType, carModel, fuelType);
    return res.json({
      ...simulatedResponse,
      isSimulated: true,
      customNotes: customNotes || ""
    });
  }

  try {
    const prompt = `أنت خبير فحص وتشخيص أعطال السيارات بالذكاء الاصطناعي لورشة "الورشة الذكية" في المملكة العربية السعودية.
حلل المشكلة التالية وقدم تقريراً مفصلاً ومنسقاً باللغة العربية:
نوع الصوت/العطل المحدد: ${soundType}
موديل السيارة: ${carModel}
نوع المحرك/الوقود: ${fuelType}
ملاحظات إضافية من السائق: ${customNotes || "لا توجد"}

قم بتحليل هذا الصوت بدقة ووصف خصائصه السمعية وتأثيره على المحرك أو العجلات. ترجم هذا العطل لثلاث فئات بلغة بسيطة وسهلة الفهم:
1. لغة النظام (بيانات تقنية دقيقة)
2. لغة فني الإصلاح (خطوات ميكانيكية عملية لإصلاح العطل)
3. لغة صاحب السيارة (تفسير مبسط وواضح للمشكلة ومدى خطورتها باللغة العربية العامية السعودية أو الفصحى المبسطة).

يجب أن تكون التكلفة التقديرية بالريال السعودي (SAR) كرقم فقط (مثال: 450).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            soundAnalysis: {
              type: Type.STRING,
              description: "وصف علمي دقيق لخصائص الصوت والترددات ومصدرها الأساسي بالسيارة."
            },
            likelyCause: {
              type: Type.STRING,
              description: "السبب الرئيسي المحتمل لحدوث هذا الصوت."
            },
            systemDetails: {
              type: Type.STRING,
              description: "لغة النظام: توصيف تقني دقيق للمكونات والأنظمة المتأثرة."
            },
            mechanicInstructions: {
              type: Type.STRING,
              description: "لغة فني الإصلاح: الخطوات العملية المطلوبة للفحص اليدوي والإصلاح أو الاستبدال."
            },
            ownerExplanation: {
              type: Type.STRING,
              description: "لغة صاحب السيارة: شرح مبسط جداً للمشكلة، هل هي خطيرة، وماذا يجب عليه فعله حالياً."
            },
            severity: {
              type: Type.STRING,
              description: "مستوى الخطورة: يجب أن يكون أحد القيم التالية فقط: 'Critical' أو 'Warning' أو 'Normal'."
            },
            estimatedCost: {
              type: Type.INTEGER,
              description: "التكلفة التقديرية للإصلاح بالريال السعودي (SAR) كرقم صحيح فقط."
            },
            requiredParts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "قائمة بقطع الغيار المطلوبة لعملية الإصلاح."
            },
            estimatedTime: {
              type: Type.STRING,
              description: "الوقت المقدر لإتمام عملية الصيانة (مثلاً: ساعتين، يوم عمل، إلخ)."
            }
          },
          required: [
            "soundAnalysis",
            "likelyCause",
            "systemDetails",
            "mechanicInstructions",
            "ownerExplanation",
            "severity",
            "estimatedCost",
            "requiredParts",
            "estimatedTime"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(text.trim());
    return res.json({
      ...parsedData,
      isSimulated: false
    });
  } catch (error: any) {
    console.error("Error during live Gemini diagnosis:", error);
    // Fallback to simulation on actual API error
    const simulatedResponse = getSimulatedAcousticDiagnosis(soundType, carModel, fuelType);
    return res.json({
      ...simulatedResponse,
      isSimulated: true,
      error: error.message
    });
  }
});

// 🟢 API Route: AI OBD-II Code Translation & Guide
app.post("/api/translate-code", async (req, res) => {
  const { code, carModel } = req.body;

  const client = getGeminiClient();

  if (!client) {
    console.log("Using simulation mode for OBD code translation");
    const simulatedResponse = getSimulatedCodeTranslation(code, carModel);
    return res.json({
      ...simulatedResponse,
      isSimulated: true
    });
  }

  try {
    const prompt = `أنت خبير محترف ومترجم أكواد أعطال السيارات OBD-II لورشة السيارات "الورشة الذكية".
قم بترجمة وتفصيل كود العطل التالي:
الكود: ${code}
موديل السيارة: ${carModel || "عامة"}

يجب ترجمة وتوصيف العطل بالتفصيل لثلاثة أطراف:
1. لغة النظام (System Language): المواصفات الفنية وقيم الحساسات المتأثرة.
2. لغة الفني (Mechanic Guide): خطوات الصيانة اليدوية والميكانيكية الدقيقة والقطع التي يجب فحصها.
3. لغة المالك (Owner Explanation): شرح بلغة بسيطة ومريحة جداً يفهمها أي سائق، مع توضيح مدى سلامة قيادة المركبة وتأثير العطل على المدى القريب والبعيد.

يجب أن تكون التكلفة بالريال السعودي (SAR) كرقم فقط (مثال: 320).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            systemDescription: {
              type: Type.STRING,
              description: "لغة النظام: التوصيف التقني التفصيلي وقراءات الحساس المتوقعة."
            },
            mechanicGuide: {
              type: Type.STRING,
              description: "لغة الفني: خطوات الصيانة، الفحص بالملتيميتر، ومكونات الدائرة التي يجب اختبارها."
            },
            ownerExplanation: {
              type: Type.STRING,
              description: "لغة المالك: تبسيط المشكلة، هل تسبب توقف السيارة فجأة، وما هو الإجراء العاجل."
            },
            severity: {
              type: Type.STRING,
              description: "مستوى الخطورة: يجب أن يكون أحد القيم التالية: 'Critical' أو 'Warning' أو 'Normal'."
            },
            estimatedCost: {
              type: Type.INTEGER,
              description: "التكلفة التقريبية بالريال السعودي (SAR) كرقم صحيح فقط."
            },
            requiredParts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "قطع الغيار المقترحة والمطلوبة للإصلاح لطلبها مباشرة."
            }
          },
          required: [
            "code",
            "systemDescription",
            "mechanicGuide",
            "ownerExplanation",
            "severity",
            "estimatedCost",
            "requiredParts"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(text.trim());
    return res.json({
      ...parsedData,
      isSimulated: false
    });
  } catch (error: any) {
    console.error("Error during live Gemini code translation:", error);
    const simulatedResponse = getSimulatedCodeTranslation(code, carModel);
    return res.json({
      ...simulatedResponse,
      isSimulated: true,
      error: error.message
    });
  }
});

// 🟢 API Route: AI Guided Self-Diagnosis
app.post("/api/self-diagnose", async (req, res) => {
  const { symptomArea, symptoms, smokeColor, carModel, fuelType } = req.body;
  const client = getGeminiClient();

  if (!client) {
    console.log("Using simulation mode for self diagnosis");
    const simulatedResponse = getSimulatedSelfDiagnosis(symptomArea, symptoms, smokeColor, carModel, fuelType);
    return res.json({
      ...simulatedResponse,
      isSimulated: true
    });
  }

  try {
    const prompt = `أنت خبير فحص ميكانيكي ومستشار صيانة لورشة "الورشة الذكية" في السعودية.
قم بتحليل مدخلات الفحص الذاتي للسيارة التالية وقدم تقريراً باللغة العربية:
طراز السيارة: ${carModel || "عامة"}
نوع المحرك: ${fuelType || "بنزين"}
منطقة العطل الرئيسية: ${symptomArea}
الأعراض الدقيقة المختارة: ${Array.isArray(symptoms) ? symptoms.join("، ") : (symptoms || "لا توجد")}
لون دخان الشكمان: ${smokeColor || "طبيعي / لا يوجد"}

حلل هذه الأعراض معاً كمنظومة متكاملة، وحدد المشكلة المحتملة بدقة، واقترح خطة عمل واضحة لمالك السيارة وفني الورشة لتشخيص وحل المشكلة.
يجب أن تكون التكلفة التقديرية بالريال السعودي (SAR) كرقم فقط (مثال: 550).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosisName: { type: Type.STRING, description: "اسم التشخيص المحتمل بالعربية" },
            diagnosticSummary: { type: Type.STRING, description: "ملخص التشخيص التفصيلي للمشكلة وأسبابها" },
            faultsList: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "الأجزاء أو القطع المحتمل تلفها"
            },
            urgency: { type: Type.STRING, description: "الخطورة: Immediate أو Caution أو ScheduleSoon" },
            estimatedCost: { type: Type.INTEGER, description: "التكلفة التقريبية بالريال السعودي كرقم صحيح فقط" },
            actionPlan: { type: Type.STRING, description: "خطة العمل المقترحة والخطوات القادمة" },
            requiredParts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "قطع الغيار المطلوبة للطلب"
            },
            estimatedTime: { type: Type.STRING, description: "الوقت المقدر للإصلاح" }
          },
          required: [
            "diagnosisName",
            "diagnosticSummary",
            "faultsList",
            "urgency",
            "estimatedCost",
            "actionPlan",
            "requiredParts",
            "estimatedTime"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const parsedData = JSON.parse(text.trim());
    return res.json({ ...parsedData, isSimulated: false });
  } catch (error: any) {
    console.error("Error during live Gemini self-diagnosis:", error);
    const simulatedResponse = getSimulatedSelfDiagnosis(symptomArea, symptoms, smokeColor, carModel, fuelType);
    return res.json({ ...simulatedResponse, isSimulated: true, error: error.message });
  }
});

// 🟢 API Route: AI Visual Component Scan
app.post("/api/visual-scan", async (req, res) => {
  const { scanType, carModel } = req.body;
  const client = getGeminiClient();

  if (!client) {
    console.log("Using simulation mode for visual scan");
    const simulatedResponse = getSimulatedVisualScan(scanType, carModel);
    return res.json({
      ...simulatedResponse,
      isSimulated: true
    });
  }

  try {
    const prompt = `أنت خبير فحص بصري وكاميرات وتحليل فني بالذكاء الاصطناعي لورشة "الورشة الذكية" في السعودية.
قم بتحليل المكون البصري التالي للسيارة:
نوع المسح البصري: ${scanType} (مثال: dashboard_lights لرموز الطبلون، engine_bay للمحرك من الداخل، brake_pads للعجلات والمكابح)
طراز السيارة: ${carModel || "عامة"}

حدد الجزء الدقيق المتأثر، والعطل المرصود بالمسح البصري الذكي، وقدم إحداثيات تقريبية (faultPointerX و faultPointerY كأرقام من 0 إلى 100) لتحديد مكان العطل على الرسم التخطيطي للسيارة.
مثال للإحداثيات:
- إذا كان العطل في المحرك/الرديتر (مقدمة السيارة): faultPointerX يتراوح بين 45-55 و faultPointerY بين 25-40.
- إذا كان العطل في المكابح الأمامية: faultPointerX يتراوح بين 70-80 و faultPointerY بين 50-70.
- إذا كان العطل في الشكمان أو العادم (مؤخرة السيارة): faultPointerX يتراوح بين 45-55 و faultPointerY بين 75-90.
- إذا كان العطل في الطبلون أو الحساسات الداخلية: faultPointerX يتراوح بين 30-40 و faultPointerY بين 40-55.

يجب أن تكون التكلفة بالريال السعودي كرقم فقط (مثال: 600).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scannedComponent: { type: Type.STRING, description: "الجزء البصري الذي تم التعرف عليه بالعربية" },
            detectedFault: { type: Type.STRING, description: "العطل المكتشف بالمسح البصري بالعربية" },
            faultPointerX: { type: Type.INTEGER, description: "إحداثي س على الرسم التخطيطي من 0 لـ 100" },
            faultPointerY: { type: Type.INTEGER, description: "إحداثي ص على الرسم التخطيطي من 0 لـ 100" },
            detailedExplanation: { type: Type.STRING, description: "شرح تفصيلي وتحليلي للمشكلة البصرية" },
            solution: { type: Type.STRING, description: "التوصية العملية لإصلاح العطل" },
            estimatedCost: { type: Type.INTEGER, description: "التكلفة التقديرية بالريال السعودي كرقم صحيح فقط" },
            requiredParts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "قطع الغيار المطلوبة للطلب"
            }
          },
          required: [
            "scannedComponent",
            "detectedFault",
            "faultPointerX",
            "faultPointerY",
            "detailedExplanation",
            "solution",
            "estimatedCost",
            "requiredParts"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const parsedData = JSON.parse(text.trim());
    return res.json({ ...parsedData, isSimulated: false });
  } catch (error: any) {
    console.error("Error during live Gemini visual scan:", error);
    const simulatedResponse = getSimulatedVisualScan(scanType, carModel);
    return res.json({ ...simulatedResponse, isSimulated: true, error: error.message });
  }
});

// 🔹 Mock Data Generators for robust offline testing
function getSimulatedSelfDiagnosis(symptomArea: string, symptoms: any, smokeColor: string, carModel: string, fuelType: string) {
  const model = carModel || "تويوتا لاندكروزر";
  const area = symptomArea || "engine";
  
  const results: Record<string, any> = {
    "engine": {
      diagnosisName: "خلل في احتراق الخليط وضعف في كفاءة الكويلات والشرارة",
      diagnosticSummary: `بناءً على الأعراض المدخلة لسيارة ${model}، بما في ذلك تفتفة الماكينة وضعف السحب، يتبين وجود خلل في شمعات الاحتراق (البواجي) أو تهريب في كويلات الكهرباء، مما يجعل الماكينة تعمل بجهد غير متزن. تزداد هذه حالة تفتفة وسحب المحرك سوءاً مع تشغيل مكيف الهواء مما يعرض الماكينة لحمل إضافي.`,
      faultsList: ["شمعات احتراق منتهية العمر (Spark Plugs)", "تهريب شرارة في كويل أسطوانة معين", "اتساخ في بوابة الهواء الثروتل"],
      urgency: "Caution",
      estimatedCost: 450,
      actionPlan: "ننصح بفك شمعات الاحتراق وفحص لونها ورأس السيراميك، والتحقق من عدم وجود زيت محرك في تجويف البواجي (تهريب وجه غطاء البلوف). يوصى أيضاً بتنظيف بوابة الهواء وإعادة برمجتها.",
      requiredParts: ["طقم بواجي ليزر أصلية", "وجه غطاء بلوف", "بخاخ أسيديلكو أصلي لتنظيف البوابة"],
      estimatedTime: "ساعتين"
    },
    "brakes": {
      diagnosisName: "تآكل فحمات الفرامل مع تضرر سطح الهوبات الدوارة",
      diagnosticSummary: `الرجفة المصاحبة للفرامل مع صدور صوت صفير معدني حاد عند الضغط تشير بقوة إلى انتهاء عمر الفحمات (القمشة) تماماً، حيث تبدأ الحديدة التحذيرية بالاحتكاك المباشر بقرص الهوب، وهو ما يسبب تجريحه ورجفة في المقود أثناء الكبح السريع.`,
      faultsList: ["تآكل فحمات المكابح الأمامية بنسبة 95%", "اعوجاج أو خشونة في الهوبات الأمامية (Rotors)"],
      urgency: "Immediate",
      estimatedCost: 380,
      actionPlan: "يجب استبدال فحمات الفرامل فوراً، وخرط الهوبات (أو استبدالها إن كانت سماكتها أقل من الحد الآمن للسلامة)، مع فحص وتنظيف كليبرات الفرامل وتشحيمها جيدا.",
      requiredParts: ["فحمات فرامل أمامي درجة أولى", "علبة زيت فرامل DOT4 مخصص", "خدمة خرط الهوبات في المخرطة المعتمدة"],
      estimatedTime: "ساعة ونصف"
    },
    "dashboard": {
      diagnosisName: "خلل في قراءات حساس الأكسجين الخلفي أو دبة التلوث",
      diagnosticSummary: `ظهور لمبة المحرك الصفراء (Check Engine) مترافقاً مع زيادة طفيفة في استهلاك الوقود يشير في الغالب لخلل في دورة معالجة العادم أو حساس تدفق الهواء (MAF) أو قراءات خاطئة لحساس الشكمان.`,
      faultsList: ["اتساخ حساس تدفق الهواء (MAF Sensor)", "ضعف أداء حساس الشكمان (O2 Sensor)"],
      urgency: "ScheduleSoon",
      estimatedCost: 280,
      actionPlan: "ننصح بفحص السيارة بجهاز تشخيص الأعطال لاستخراج الكود المخزن بدقة. كخطوة أولى، يمكن محاولة تنظيف حساس الهواء ببخاخ جاف خاص بالالكترونيات.",
      requiredParts: ["بخاخ منظف حساسات جاف متطور", "حساس أكسجين أصلي (في حال ثبوت تلفه)"],
      estimatedTime: "ساعة واحدة"
    }
  };

  return results[area] || results["engine"];
}

function getSimulatedVisualScan(scanType: string, carModel: string) {
  const model = carModel || "لكزس ES350";
  
  const results: Record<string, any> = {
    "dashboard_lights": {
      scannedComponent: "شاشة عداد الطبلون (Instrument Cluster HUD)",
      detectedFault: "رمز لمبة الماكينة الصفراء مع رمز نظام مانع الانزلاق (Check Engine + Traction Control)",
      faultPointerX: 38,
      faultPointerY: 48,
      detailedExplanation: `أظهر المسح البصري لطبلون سيارتك ${model} إضاءة لمبة فحص المحرك الصفراء الكلاسيكية مرافقة للمبة مانع الانزلاق. هذا الاقتران يحدث عادةً كإجراء حماية يتخذه كمبيوتر السيارة لإلغاء تنشيط نظام التحكم في الجر بشكل مؤقت بسبب رصد خلل في أداء أحد السلندرات (Misfire).`,
      solution: "إجراء تشخيص OBD-II لمعرفة السلندر المتعطل تحديداً، والتحقق من سلامة البوجي والكويل الخاص به لتنشيط الأنظمة من جديد.",
      estimatedCost: 350,
      requiredParts: ["كويل دينسو أصلي بديل", "شمعة احتراق واحدة بوش"]
    },
    "engine_bay": {
      scannedComponent: "مجموعة السيور وبكرات التوجيه بالمحرك (Serpentine Belt & Tensioner)",
      detectedFault: "اهتراء وتصدع في سير المكينة الخارجي مع تذبذب في حركة بكرة الشداد",
      faultPointerX: 52,
      faultPointerY: 34,
      detailedExplanation: "كشف الفحص البصري الفوري لمحرك السيارة عن وجود علامات اهتراء وشقوق عرضية واضحة على السطح الداخلي لسير المحرك، مع تذبذب غير طبيعي في بكرة الشداد مما يسبب زقزقة مستمرة نتيجة لارتخاء الضغط المطلوب.",
      solution: "ننصح بشدة باستبدال السير الخارجي قبل انقطاعه المفاجئ الذي يؤدي لتوقف عجلة القيادة الهيدروليكية والدينامو ومضخة المياه فوراً.",
      estimatedCost: 240,
      requiredParts: ["سير ماكينة خارجي أصلي بضمان سنة", "بكرة شداد متكاملة مع القاعدة"]
    },
    "brake_pads": {
      scannedComponent: "منظومة الهوب والفحمات الأمامية اليسرى (Front Left Brake System)",
      detectedFault: "تآكل فحمات المكابح وتعديها للحد الآمن متبقي 1.2 ملم فقط",
      faultPointerX: 74,
      faultPointerY: 62,
      detailedExplanation: "أظهر التحليل البصري التلقائي لكاميرا الفحص وصول مادة الاحتكاك في الفحمات إلى مرحلة حرجة جداً، وبداية ملامسة التنبيه المعدني لسطح قرص الهوب، مما يؤثر سلباً على مسافة الكبح وسلامة القيادة العامة.",
      solution: "استبدال فحمات الفرامل الأمامية في أسرع وقت ممكن وعمل تنظيف وصنفرة خفيفة لسطح الهوب لتجنب الأصوات والرجفات المزعجة.",
      estimatedCost: 400,
      requiredParts: ["طقم فحمات فرامل أمامي ياباني أصلي", "علبة سائل غسيل مكابح بخاخ"]
    }
  };

  return results[scanType] || results["engine_bay"];
}

function getSimulatedAcousticDiagnosis(soundType: string, carModel: string, fuelType: string) {
  const cleanModel = carModel || "تويوتا كامري";
  const cleanFuel = fuelType || "بنزين";

  const soundDatabase: Record<string, any> = {
    "engine_knocking": {
      soundAnalysis: "صوت طرق معدني متكرر وحاد من الجزء السفلي للمحرك يزداد تردده مع زيادة سرعة دوران المحرك (RPM). التردد يتراوح بين 50 إلى 120 هرتز.",
      likelyCause: "تآكل سبيكة عمود الكرنك (Connecting Rod Bearings) أو استخدام وقود ذو رقم أوكتان منخفض مما يسبب اشتعالاً مبكراً.",
      systemDetails: "لغة النظام: خلل في توقيت الاشتعال (Ignition Timing Retard)، حساس الطرق (Knock Sensor) يسجل اهتزازات غير طبيعية تتجاوز 4.5G، وضغط زيت المحرك يقل عن الحدود القياسية عند سرعة الخمول.",
      mechanicInstructions: "لغة الفني: فحص ضغط الزيت أولاً. فك كرتير المحرك (Oil Pan) وفحص برادة المعادن. اختبار سبيكة عمود الكرنك وقياس الخلوص (Clearance) باستخدام البلاستيجيت واستبدال السبائك التالفة وتصفية المحرك.",
      ownerExplanation: "لغة صاحب السيارة: هناك صوت طقطقة حديدية واضحة داخل الماكينة. هذا يعني أن الأجزاء الداخلية للمحرك تحتك بقوة بسبب ضعف التزييت أو تآكل قطع داخلية. ننصحك بعدم قيادة السيارة لمسافات طويلة لتجنب تلف الماكينة بالكامل (توضيب الماكينة).",
      severity: "Critical",
      estimatedCost: 1800,
      requiredParts: ["طقم سبائك ثابت ومتحرك", "وجه كرتير زيت الماكينة", "زيت محرك أصلي 5W-30", "فلتر زيت أصلي"],
      estimatedTime: "يومين عمل"
    },
    "wheel_squeaking": {
      soundAnalysis: "صوت صفير حاد ومستمر يصدر من جهة العجلات الأمامية أثناء القيادة، يختفي أو يزداد عند الضغط على دواسة المكابح.",
      likelyCause: "تآكل فحمات المكابح (Brake Pads) وصولاً لعلامة التحذير المعدنية، أو تراكم الأوساخ والبرادة داخل الهوب.",
      systemDetails: "لغة النظام: سماكة مادة الاحتكاك للفحمات أقل من 2 ملم. حساس تآكل الفحمات يسجل قصر في الدائرة المغلقة. انخفاض طفيف في مستوى زيت الفرامل بالعلبة الرئيسية.",
      mechanicInstructions: "لغة الفني: فك العجلات، فحص سماكة الفحمات الأمامية، قياس استواء سطح الهوب (Brake Rotor) والتأكد من عدم وجود حفر أو اعوجاج، خرط الهوبات إذا استدعى الأمر، تنظيف كليبر الفرامل وتشحيم المسامير.",
      ownerExplanation: "لغة صاحب السيارة: الصوت الذي تسمعه هو صفير الفرامل (الفحمات). هذا نظام تنبيه ذكي وميكانيكي يخبرك بأن عمر الفرامل قارب على الانتهاء. القيادة آمنة حالياً ولكن يجب تبديل الفحمات قريباً قبل أن تتلف الهوبات وتزداد التكلفة.",
      severity: "Warning",
      estimatedCost: 350,
      requiredParts: ["فحمات فرامل أمامي أصلية مع ضمان", "منظف مكابح بخاخ"],
      estimatedTime: "ساعة واحدة"
    },
    "belt_shrieking": {
      soundAnalysis: "صوت صرير أو زقزقة مرتفعة جداً ومزعجة من مقدمة المحرك، تظهر بوضوح عند تشغيل السيارة صباحاً أو عند تشغيل مكيف الهواء.",
      likelyCause: "ارتخاء سير المحرك الخارجي (Serpentine Belt) أو تآكله، أو تلف بكرة شداد السير (Belt Tensioner Bearing).",
      systemDetails: "لغة النظام: انزلاق السير الخارجي مما يؤدي إلى هبوط مؤقت في جهد المولد (Alternator Voltage) إلى أقل من 13.2 فولت، وزيادة الحمل الميكانيكي على مضخة التوجيه المعزز والكمبريسور.",
      mechanicInstructions: "لغة الفني: فحص حالة السير بالنظر للتأكد من عدم وجود تشققات. اختبار بكرة الشداد يدوياً للتأكد من سلاسة دورانها وغياب أي صوت خشونة ميكانيكي. ضبط شد السير أو استبداله بالكامل والشداد.",
      ownerExplanation: "لغة صاحب السيارة: هذا هو صوت 'سير المكينة' أو الشداد. الصوت يظهر لأن السير يرتخي وينزلق على البكرات، خاصة مع الرطوبة أو عند تشغيل المكيف. المشكلة ليست خطيرة جداً فوراً ولكن انقطاع السير فجأة سيوقف الدينامو ومكيف السيارة وعجلة القيادة.",
      severity: "Warning",
      estimatedCost: 220,
      requiredParts: ["سير محرك خارجي أصلي", "بكرة شداد السير"],
      estimatedTime: "45 دقيقة"
    },
    "exhaust_roaring": {
      soundAnalysis: "صوت زئير أو هدير جهوري مرتفع يصدر من أسفل السيارة، يزداد بشدة عند الضغط على دواسة البنزين وتسارع السيارة.",
      likelyCause: "وجود ثقب أو كسر في مواسير العادم (Exhaust Pipe)، أو تلف وجه دبة التلوث (Catalytic Converter Exhaust Gasket).",
      systemDetails: "لغة النظام: تسريب في غازات العادم قبل الحساس الخلفي للأكسجين، مما يؤدي إلى قراءة خاطئة لنسبة الهواء إلى الوقود (Air-Fuel Ratio Mixture) وظهور كود الغازات.",
      mechanicInstructions: "لغة الفني: رفع السيارة على الرافعة وفحص خط العادم بالكامل من المانيفولد إلى الشكمان الخلفي. البحث عن آثار الكربون الأسود التي تدل على موقع التسريب. استبدال الوجه التالف أو لحام الكسر.",
      ownerExplanation: "لغة صاحب السيارة: هناك تهريب في شكمان السيارة أو كسر بسيط في المواسير تحت الماكينة. هذا يجعل صوت السيارة رياضياً وصاخباً بشكل مزعج وقد يتسبب في تسرب غازات ضارة لداخل المقصورة واستهلاك زائد للوقود.",
      severity: "Warning",
      estimatedCost: 280,
      requiredParts: ["وجه دبة التلوث / عادم", "جلود تعليق الشكمان (اختياري)"],
      estimatedTime: "ساعتين"
    }
  };

  return soundDatabase[soundType] || {
    soundAnalysis: `تحليل أولي للصوت المصاحب لسيارة ${cleanModel} (${cleanFuel}): الصوت غير اعتيادي ويشير إلى خلل ميكانيكي أو كهربائي متوسط الأهمية.`,
    likelyCause: "خلل في التروس أو احتكاك سطحي غير مشحم.",
    systemDetails: "لغة النظام: رصد ذبذبات غير قياسية عبر مستشعرات الحركة المجاورة للمحرك، الحاجة إلى تصفير قراءات الحساس بعد المعاينة اليدوية.",
    mechanicInstructions: "لغة الفني: تنظيف المكون الخارجي، التحقق من مستويات السوائل المحيطة، وتزييت الوصلات الميكانيكية.",
    ownerExplanation: "لغة صاحب السيارة: هناك خشونة بسيطة تحتاج فحصاً ميكانيكياً خفيفاً لتفادي تضخمها. ننصح بجدولة موعد فحص شامل في مركزنا.",
    severity: "Normal",
    estimatedCost: 150,
    requiredParts: ["منظف ومذيب صدأ وشحوم", "زيت تزييت مخصص للتروس"],
    estimatedTime: "ساعة واحدة"
  };
}

function getSimulatedCodeTranslation(code: string, carModel: string) {
  const codeDatabase: Record<string, any> = {
    "P0300": {
      code: "P0300",
      systemDescription: "لغة النظام: كود عشوائي لعدم احتراق الأسطوانات (Random/Multiple Cylinder Misfire Detected). وحدة التحكم (ECU) ترصد تذبذباً في سرعة دوران عمود الكرنك بنسبة تتجاوز 2% عبر حساس الـ CKP، مما يشير لغياب الانفجار ببعض الأسطوانات.",
      mechanicGuide: "لغة الفني: فحص بواجي المحرك (Spark Plugs)، فحص كويلات الاشتعال (Ignition Coils) عن طريق التبادل وتجربة التشغيل، قياس ضغط طرمبة البنزين (Fuel Pressure) والتأكد من عدم وجود تهريب هواء من مجمع السحب (Vacuum Leak).",
      ownerExplanation: "لغة المالك: هذا الكود يعني وجود تقطيع أو تفتفة في الماكينة بسبب عدم احتراق البنزين بشكل كامل في الأسطوانات. قد تلاحظ تفتفة ورجفة بالسيارة عند التوقف وضعف في السحب وتفتفة لمبة المكينة. المشكلة تستدعي الإصلاح لتجنب تلف دبة التلوث الكاتلايزر.",
      severity: "Warning",
      estimatedCost: 380,
      requiredParts: ["طقم بواجي أصلية ليزر", "كويل اشتعال (إذا لزم الأمر)"]
    },
    "P0171": {
      code: "P0171",
      systemDescription: "لغة النظام: خليط وقود فقير جداً في البنك الأول (System Too Lean Bank 1). قراءة حساس الأكسجين (O2 Sensor) تشير لزيادة نسبة الأكسجين في غازات العادم، والتحكم قصير المدى في الوقود (Short Term Fuel Trim) يتجاوز +25%.",
      mechanicGuide: "لغة الفني: فحص تهريب خراطيم الهواء (Vacuum Hose Leaks)، تنظيف أو استبدال حساس تدفق الهواء (MAF Sensor) باستخدام بخاخ الكترونيات مخصص، وفحص عمل البخاخات وطرمبة البنزين للتأكد من وصول كمية وقود كافية.",
      ownerExplanation: "لغة المالك: كمية الهواء الداخلة للماكينة أكثر من البنزين المطلوب. هذا يسبب زيادة استهلاك البنزين وتفتفة خفيفة في الماكينة. السبب الشائع هو اتساخ حساس الهواء (الماف) أو وجود شق في لي الهواء الأسود. فحص وتنظيف الحساس يحل المشكلة غالباً.",
      severity: "Warning",
      estimatedCost: 190,
      requiredParts: ["بخاخ منظف حساس الهواء MAF", "لي هواء جديد (في حال وجود تشقق)"]
    },
    "P0420": {
      code: "P0420",
      systemDescription: "لغة النظام: كفاءة نظام دبة التلوث أقل من الحد المسموح (Catalyst System Efficiency Below Threshold Bank 1). قراءات حساس الأكسجين قبل وبعد الدبة متطابقة تقريباً، مما يشير لعدم قدرة الفحم الداخلي على معالجة الغازات السامة.",
      mechanicGuide: "لغة الفني: فحص عدم وجود تسريب لغازات العادم قبل الدبة. التأكد من سلامة حساس الأكسجين الخلفي. استخدام كاميرا فحص داخلية لرؤية شمعات الكاتلايزر والتأكد من عدم انسدادها أو ذوبانها.",
      ownerExplanation: "لغة المالك: هذا كود 'دبة التلوث' أو علبة البيئة. يعني أن الدبة المسؤولة عن تصفية غازات الشكمان أصبحت غير فعالة بالكامل أو تالفة. قد يسبب هذا رائحة كربون خلف السيارة أو ضعف بسيط في العزم. يمكنك القيادة بأمان لكن لمبة المحرك ستظل مضاءة.",
      severity: "Normal",
      estimatedCost: 1200,
      requiredParts: ["دبة تلوث بيئية متوافقة", "حساس أكسجين خلفي أصلي"]
    },
    "P0301": {
      code: "P0301",
      systemDescription: "لغة النظام: عدم احتراق الأسطوانة رقم 1 (Cylinder 1 Misfire Detected). قراءات التوقيت تشير إلى غياب نبضة العزم من البستون الأول، مع تسجيل خلل في دائرة الحقن أو الاشتعال المخصصة للسلندر الأول.",
      mechanicGuide: "لغة الفني: تبديل الكويل رقم 1 مع رقم 2 لمعرفة ما إذا كان العطل سينتقل. قياس نبضة البخاخ رقم 1. فحص ضغط السلندر الداخلي (Compression Test) في حال استمرار المشكلة.",
      ownerExplanation: "لغة المالك: الماكينة لا تعمل بكامل قوتها بسبب توقف السلندر (البستون) رقم 1 عن العمل بالكامل. ستشعر برجة قوية جداً في السيارة وتأخر في الاستجابة عند الضغط على دواسة الوقود. يجب عدم القيادة لمسافات طويلة والإصلاح فوراً لئلا يتأثر المحرك.",
      severity: "Critical",
      estimatedCost: 420,
      requiredParts: ["كويل محرك أصلي للسلندر الأول", "شمعة احتراق واحدة"]
    }
  };

  return codeDatabase[code] || {
    code: code || "P0000",
    systemDescription: `لغة النظام: الكود يشير إلى تنبيه عام من وحدة التحكم المركزية بخصوص منظومة الدائرة المغلقة. مستشعرات القياس تسجل قراءات خارج النطاق الطبيعي المقنن بنسبة 5%.`,
    mechanicGuide: `لغة الفني: استخدام جهاز التشخيص المتقدم لمسح الأخطاء وإجراء اختبار حي (Actuator Test). فحص التوصيلات الكهربائية والفيوزات الملحقة بالمستشعر المعني.`,
    ownerExplanation: `لغة المالك: هذا تنبيه إلكتروني غير حرج يتعلق بأحد الحساسات الثانوية بالسيارة. لمبة المحرك قد تضاء، ننصح بزيارة الورشة للتحقق وإعادة ضبط الكمبيوتر بأسعار منافسة وبسيطة.`,
    severity: "Normal",
    estimatedCost: 150,
    requiredParts: ["فيوزات كهربائية بديلة", "بخاخ ملامسات كهربائية"]
  };
}


// --- Setup Vite Middleware or Static Assets Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [الورشة الذكية] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
