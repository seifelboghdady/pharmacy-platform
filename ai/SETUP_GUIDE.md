# Pharmacy AI Model — VS Code Setup Guide

## المحتويات
- `Pharmacy_data.xlsx` — الداتا الأصلية
- `pipeline_step1_clean_features.py` — التنظيف + الـ features (شغله الأول دايمًا)
- `cv_utils.py` — **جديد**: rolling-origin / nested time-series CV (بدل الـ split الواحد)
- `features.py` — **جديد**: بناء الـ features + الـ target المشترك بين كل الملفات (بدل تكرار الكود)
- `train_models.py` — **جديد، خطوة 2**: بيدرّب موديل LightGBM واحد عالمي، *مرة واحدة بس*، مع Optuna hyperparameter tuning جوه nested CV، ويحفظه على الديسك (`demand_model.joblib`)
- `pipeline_step3_final.py` — الموديل الكامل (يطلع جدول + CSV) — دلوقتي بيحمّل الموديل المحفوظ بس، مفيهوش تدريب خالص
- `model_comparison.py` — يقارن Naive baseline ضد LightGBM على عدة folds (مش split واحد)
- `evaluate_accuracy.py` — يحسب دقة الموديل (MAE/MAPE) + classification metrics لـ risk_level
- `ai_service.py` — الموديل كـ API (للـ backend team) — بيحمّل الموديل المحفوظ عند التشغيل، الـ `/predict` استدلال (inference) بس
- `app_ui.py` — واجهة تجربة محلية (Streamlit) — بتحمّل نفس الموديل المحفوظ، من غير تدريب لما تدوس Predict
- `requirements.txt` — كل المكتبات المطلوبة (Prophet اتشال، Optuna + joblib اتضافوا)

---

## ⚠️ ملاحظات المشرف (Mentor Review) وإزاي اتنفذت

هي دي كل نقطة من المراجعة، وإيه اللي اتعمل بالظبط بتاعها:

1. **"Drop Prophet — Large scale."**
   Prophet اتشال بالكامل من كل الملفات. بدل ما نعمل موديل Prophet منفصل لكل منتج (220 منتج، بيتدرب من الأول كل مرة)، بقى فيه موديل **LightGBM واحد عالمي** بياخد `ProductID`/`Category` كـ categorical features (`features.py`). ده اللي بيخلي الحل قابل للتوسع (scalable) لأي عدد منتجات.

2. **"How is the mobile app gonna capture stock_quantity? If not, AI is doing nothing."**
   ده مش حاجة الكود لوحده يقدر يحلها — ده متطلب على مستوى المنتج/الداتا. الكود اتعمل فيه تعليقات واضحة (`ai_service.py`, `app_ui.py`, `pipeline_step3_final.py`) بتأكد إن `current_stock`/`SIMULATED_current_stock` **لازم** يتستبدل بقيمة حقيقية جاية live من الموبايل. لو ده ملحقش، أي رقم `reorder_quantity` أو `risk_level` طالع من الموديل ملوش قيمة حقيقية في الإنتاج، مهما كان التوقع نفسه دقيق. **ده أهم نقطة مفتوحة قبل الإطلاق.**

3. **"2-way train/test split is inadequate... What if the 30 days is unusually quiet or heavy promotion? → inductive reasoning with unverified step."**
   بدل split واحد، كل التقييم (`model_comparison.py`, `evaluate_accuracy.py`) بقى بيشتغل على **عدة نوافذ اختبار من 30 يوم** موزعة على التاريخ (rolling-origin, في `cv_utils.py`)، فمفيش استنتاج من عينة واحدة ممكن تكون هادية أو فيها عرض كبير بالصدفة.

4. **"Comparison of models should implement Nested Cross-validation (CV) → TimeSeriesSplit or sklearn / train and test over multiple 30-Day folds, or rolling origin or sliding window."**
   اتنفذ في `cv_utils.py`: outer loop = rolling-origin folds (عدة نوافذ 30 يوم)، inner loop = `sklearn.TimeSeriesSplit` بيستخدم *بس* جوه بيانات التدريب بتاعة كل outer fold — ده بيتستخدم في `train_models.py` لضبط الـ hyperparameters من غير ما الـ tuning يشوف بيانات الاختبار النهائية.

5. **"ai_service.py instantiate brand new Prophet model from scratch → split inference from training → train once, then load it to memory to predict."**
   دلوقتي التدريب موجود في مكان واحد بس: `train_models.py`. الملفات التانية (`ai_service.py`, `app_ui.py`, `pipeline_step3_final.py`) بتحمّل `demand_model.joblib` مرة واحدة عند التشغيل (`joblib.load`) وبعدين بس بتعمل `.predict()` — مفيش تدريب في مسار الطلب/الـ request خالص.

6. **"Use LightGBM, it's good."**
   ده بقى الموديل الأساسي والوحيد (`LGBMRegressor`) في كل مكان.

7. **"Use hyperparameter tuning solutions, LGBM is sensitive → Use TPE from Optuna, Alt'd Gridsearch → Use optuna.integration.LightGBM."**
   `train_models.py` بيستخدم Optuna بالـ TPE sampler الافتراضي بتاعه لضبط الـ hyperparameters جوه الـ nested CV. لو حبيت أتمتة أسرع، `optuna.integration.lightgbm.LightGBMTuner` بديل جاهز مكتوب كـ ملاحظة في نفس الملف.

8. **"For regression: use MAE loss or MAPE (percent). For classification: use Precision, Recall, F1, Specificity, ROC curve."**
   `evaluate_accuracy.py` بقى فيه جزئين واضحين: Part 1 بيقيس التوقع (regression) بـ MAE + MAPE، وPart 2 بيقيس تصنيف الـ risk_level (Low/Medium/High) بـ Precision/Recall/F1 + confusion matrix + Specificity لكل فئة + ROC AUC لمشكلة "High risk ولا لأ".

---

## الخطوات على VS Code

### 1) افتح الفولدر في VS Code
`File → Open Folder` → اختار فولدر المشروع ده.

### 2) نصّب إضافة Python (لو مش مثبتة)
من الـ Extensions (Ctrl+Shift+X) دور على **"Python"** بتاعة Microsoft ونصبها.

### 3) افتح Terminal جوه VS Code
`Terminal → New Terminal` (أو Ctrl+`)

### 4) اعمل بيئة افتراضية (Virtual Environment) — مرة واحدة بس
```bash
python3 -m venv venv
```

**فعّلها:**
- على Windows:
```bash
venv\Scripts\activate
```
- على Mac/Linux:
```bash
source venv/bin/activate
```
(هتلاحظ اسم `(venv)` ظهر أول السطر — يعني اشتغلت صح)

> لو VS Code سألك "Select Interpreter" اختار اللي فيه `venv`.

### 5) نصّب المكتبات (مرة واحدة بس)
```bash
pip install -r requirements.txt
```

### 6) شغّل خطوة التنظيف والـ features (لازم تتعمل الأول دايمًا)
```bash
python pipeline_step1_clean_features.py
```
ده هيطلعلك ملفين جداد: `daily_features.parquet` و `product_ref.parquet`.

### 7) (جديد) درّب الموديل — مرة واحدة، أو كل ما الداتا تتغير
```bash
python train_models.py
```
ده هيعمل Optuna hyperparameter tuning جوه nested CV، وهيحفظلك `demand_model.joblib` و `model_metadata.json`. **الملفات التانية كلها بتعتمد على الملف ده** — لازم يتشغل الأول قبل step 3، الـ API، أو الـ UI.

### 8) شغّل التقرير الكامل
```bash
python pipeline_step3_final.py
```
هيطلعلك جدول في الـ Terminal + ملف `final_model_output.csv`. الملف ده بقى استدلال (inference) بس، مفيهوش تدريب.

### 9) (اختياري) شوف مقارنة الموديلين + الدقة
```bash
python model_comparison.py
python evaluate_accuracy.py
```

---

## تجربة الموديل بواجهة (الأسهل)
```bash
streamlit run app_ui.py
```
هيفتح المتصفح تلقائي على `http://localhost:8501`. تأكد إنك شغلت `train_models.py` قبل كده مرة واحدة على الأقل.

## تشغيل الموديل كـ API (للـ backend team)
```bash
uvicorn ai_service:app --reload --port 8000
```
افتح `http://localhost:8000/docs` لتجربته، أو ابعت الرابط `http://localhost:8000/predict` لزميلك في الفريق.

---

## ترتيب التشغيل الصحيح (مهم)
1. `pipeline_step1_clean_features.py` — مرة واحدة، أو كل ما الداتا الأصلية تتغير
2. `train_models.py` — مرة واحدة، أو كل ما `daily_features.parquet` يتغير
3. أي من: `pipeline_step3_final.py` / `ai_service.py` / `app_ui.py` — دول بس بيقروا، مبيدربوش

## ⚠️ حاجة لسه لازم تتحل قبل الإنتاج
`current_stock` (اللي بيتحسب منه `reorder_quantity` و `risk_level`) لسه **simulated**. الموبايل app لازم يبعت رقم حقيقي وحيّ للمخزون الفعلي — من غير كده، أي قرار reorder/risk طالع من الموديل مبني على رقم مش حقيقي.
