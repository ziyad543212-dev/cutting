import { useEffect, useState } from "react";
import { solveGuillotineCutting } from "./guillotineSolver.js";

const COLORS = [
  "#dceafe",
  "#d9f3f8",
  "#e1e8f4",
  "#d7e8ff",
  "#e3f0f7",
  "#d7e4f7",
  "#deeff1",
  "#e3eaf5",
  "#d5ecfa",
  "#e6eefb",
];

const translations = {
  en: {
    documentTitle: "Panel Cut Optimizer",
    brand: "PANEL CUT",
    brandSub: "OPTIMIZER",
    language: "العربية",
    status: "Guillotine-safe layouts",
    eyebrow: "WORKSHOP PLANNING TOOL",
    headline: "Make every sheet count.",
    intro:
      "Build a kerf-aware cutting plan with full-span cuts, reusable offcuts, and a clear sequence for the saw operator.",
    print: "Print workshop plan",
    stock: "Stock configuration",
    stockHelp: "Set master sheet dimensions and blade kerf. Sheet quantity is calculated automatically.",
    sheetLength: "Sheet length",
    sheetWidth: "Sheet width",
    kerf: "Blade kerf / thickness",
    parts: "Parts list",
    partsHelp: "Add each part size, quantity, and rotation preference.",
    addPart: "Add part",
    partLabel: "Part / label",
    length: "Length",
    width: "Width",
    quantity: "Quantity",
    rotate: "Rotate 90°",
    delete: "Delete part {n}",
    partN: "Part {n}",
    noParts: "No parts yet. Add a part to start your cut list.",
    commonUnit: "All dimensions must use the same unit. Part labels are optional.",
    unitError: "Enter a sheet dimension greater than zero.",
    kerfError: "Kerf must be zero or greater.",
    noPartsError: "Add at least one part.",
    validLength: "Enter a valid length.",
    validWidth: "Enter a valid width.",
    validQuantity: "Quantity must be a whole number above zero.",
    tooLarge: "{label} is larger than the stock sheet in every allowed orientation.",
    reviewInputs: "Review the highlighted part inputs.",
    failure: "Unable to optimize.",
    optimize: "Calculate / optimize",
    calculating: "Calculating…",
    sawRule:
      "Every planned cut spans one complete edge-to-edge section. Blade thickness is deducted from the remaining material after each cut.",
    complete: "OPTIMIZATION COMPLETE",
    plan: "Your cutting plan",
    passes: "{n} sort-and-pack passes compared",
    summary: "Optimization summary",
    sheets: "Total sheets needed",
    partsPlaced: "{n} parts placed",
    usedArea: "Part area",
    usedAreaDetail: "Total area used by parts",
    waste: "Total waste",
    wasteDetail: "{area} area, including kerf and non-reusable scrap",
    largestOffcut: "Largest offcut",
    none: "None",
    sheetN: "Sheet {n}",
    noReusable: "No reusable rectangle",
    stockArea: "Stock area: {area}",
    usableOffcuts: "Usable offcuts: {area}",
    kerfLoss: "Kerf loss: {area}",
    part: "Part",
    reusable: "Reusable offcut",
    kerfLine: "Kerf / cut line",
    rotated: "rotated",
    sheetPart: "{n} part",
    sheetParts: "{n} parts",
    cut: "{n} cut",
    cuts: "{n} cuts",
    cuttingSequence: "Cutting sequence",
    noCuts: "No interior cuts required: the part uses the full sheet.",
    reusableOffcuts: "Reusable offcuts",
    actualScrap: "Scrap remnants",
    scrapLoss: "Non-reusable scrap: {area}",
    areaSuffix: "area",
    noOffcuts: "No reusable offcuts.",
    noScrap: "No scrap remnants.",
    scrapLabel: "SCRAP {length} × {width}",
    viewDetails: "Fullscreen / view details",
    closeDiagram: "Close diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resetZoom: "Reset zoom",
    modalHelp: "Scroll or pan to inspect the full-size cutting diagram.",
    offcutLabel: "OFFCUT {length} × {width}",
    crosscut:
      "Crosscut {position} from the left edge of the {length} × {width} section at ({x}, {y}); the blade travels across the full {span} width.",
    rip:
      "Rip {position} from the near edge of the {length} × {width} section at ({x}, {y}); the blade travels across the full {span} length.",
    stockCutError:
      "A part cannot be separated from the stock with the entered kerf. Check its dimensions or reduce the kerf.",
    solverError: "The optimizer could not create a valid cutting layout. Check the dimensions and kerf.",
    safety:
      "Layouts use strict guillotine cuts. Verify the setup against your saw and material before cutting.",
    footerUnit: "All dimensions in the same unit",
    footerBrand: "Panel Cut Optimizer",
    developer: "Developer",
    email: "Email",
    whatsapp: "WhatsApp / Phone",
    name: "Ziad Alajwoa",
    footerContact: "Questions or feedback? Get in touch.",
  },
  ar: {
    documentTitle: "محسّن قص الألواح",
    brand: "قص الألواح",
    brandSub: "المحسِّن",
    language: "English",
    status: "تخطيطات قص مستقيمة",
    eyebrow: "أداة تخطيط الورشة",
    headline: "استفد من كل لوح.",
    intro:
      "أنشئ خطة قص تراعي سُمك الشفرة، وتتضمن قصات كاملة بين الحواف وبقايا قابلة لإعادة الاستخدام وتسلسلاً واضحاً للمشغّل.",
    print: "طباعة خطة الورشة",
    stock: "إعدادات اللوح والشفرة",
    stockHelp: "أدخل أبعاد اللوح الرئيسي وسُمك الشفرة. تُحسب كمية الألواح تلقائياً.",
    sheetLength: "طول اللوح",
    sheetWidth: "عرض اللوح",
    kerf: "سُمك الشفرة / فاقد القص",
    parts: "قائمة القطع",
    partsHelp: "أدخل أبعاد كل قطعة وكميتها وإمكانية تدويرها.",
    addPart: "إضافة قطعة",
    partLabel: "اسم / تسمية القطعة",
    length: "الطول",
    width: "العرض",
    quantity: "الكمية",
    rotate: "تدوير ٩٠°",
    delete: "حذف القطعة {n}",
    partN: "القطعة {n}",
    noParts: "لا توجد قطع بعد. أضف قطعة لبدء قائمة القص.",
    commonUnit: "استخدم وحدة قياس واحدة لجميع الأبعاد. تسمية القطعة اختيارية.",
    unitError: "أدخل بُعداً للوح أكبر من صفر.",
    kerfError: "يجب أن يكون فاقد القص صفراً أو أكبر.",
    noPartsError: "أضف قطعة واحدة على الأقل.",
    validLength: "أدخل طولاً صالحاً.",
    validWidth: "أدخل عرضاً صالحاً.",
    validQuantity: "يجب أن تكون الكمية عدداً صحيحاً أكبر من صفر.",
    tooLarge: "{label} أكبر من اللوح في جميع الاتجاهات المسموح بها.",
    reviewInputs: "راجع مدخلات القطع المحددة.",
    failure: "تعذّر تحسين المخطط.",
    optimize: "احسب / حسّن المخطط",
    calculating: "جارٍ الحساب…",
    sawRule:
      "تمتد كل قصة مخططة بين حافتين كاملتين للجزء. يُخصم سُمك الشفرة من المادة المتبقية بعد كل قصة.",
    complete: "اكتمل التحسين",
    plan: "خطة القص",
    passes: "تمت مقارنة {n} تخطيطات",
    summary: "ملخص التحسين",
    sheets: "إجمالي الألواح المطلوبة",
    partsPlaced: "تم توزيع {n} قطعة",
    usedArea: "مساحة القطع",
    usedAreaDetail: "المساحة الإجمالية المستخدمة للقطع",
    waste: "إجمالي الهدر",
    wasteDetail: "{area} مساحة، بما فيها فاقد الشفرة والقصاصات غير القابلة للاستخدام",
    largestOffcut: "أكبر قطعة متبقية",
    none: "لا يوجد",
    sheetN: "اللوح {n}",
    noReusable: "لا توجد قطعة مستطيلة قابلة للاستخدام",
    stockArea: "مساحة الألواح: {area}",
    usableOffcuts: "البقايا القابلة للاستخدام: {area}",
    kerfLoss: "فاقد الشفرة: {area}",
    part: "قطعة",
    reusable: "بقايا قابلة للاستخدام",
    kerfLine: "فاقد الشفرة / خط القص",
    rotated: "مدوّرة",
    sheetPart: "{n} قطعة",
    sheetParts: "{n} قطع",
    cut: "{n} قصة",
    cuts: "{n} قصات",
    cuttingSequence: "تسلسل القص",
    noCuts: "لا حاجة لقصات داخلية؛ القطعة تستخدم اللوح بالكامل.",
    reusableOffcuts: "البقايا القابلة للاستخدام",
    actualScrap: "قصاصات غير قابلة للاستخدام",
    scrapLoss: "قصاصات غير قابلة للاستخدام: {area}",
    areaSuffix: "مساحة",
    noOffcuts: "لا توجد بقايا قابلة للاستخدام.",
    noScrap: "لا توجد قصاصات غير قابلة للاستخدام.",
    scrapLabel: "قصاصات {length} × {width}",
    viewDetails: "ملء الشاشة / عرض التفاصيل",
    closeDiagram: "إغلاق المخطط",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    resetZoom: "إعادة ضبط التكبير",
    modalHelp: "مرّر أو حرّك لعرض مخطط القص بالحجم الكامل.",
    offcutLabel: "بقايا {length} × {width}",
    crosscut:
      "اقطع عرضياً على بُعد {position} من الحافة اليسرى لقسم {length} × {width} عند ({x}، {y})؛ تمر الشفرة عبر العرض كاملاً ({span}).",
    rip:
      "اقطع طولياً على بُعد {position} من الحافة القريبة لقسم {length} × {width} عند ({x}، {y})؛ تمر الشفرة عبر الطول كاملاً ({span}).",
    stockCutError:
      "تعذّر فصل قطعة عن اللوح باستخدام فاقد القص المدخل. تحقق من الأبعاد أو قلّل فاقد القص.",
    solverError: "تعذّر إنشاء مخطط قص صالح. تحقق من الأبعاد وسُمك الشفرة.",
    safety:
      "تعتمد التخطيطات قصاً مستقيماً كاملاً. تحقق من الإعدادات والمواد قبل بدء القص.",
    footerUnit: "جميع الأبعاد بوحدة واحدة",
    footerBrand: "محسّن قص الألواح",
    developer: "المطوّر",
    email: "البريد الإلكتروني",
    whatsapp: "واتساب / الهاتف",
    name: "زياد الأجوة",
    footerContact: "للاستفسارات أو الملاحظات، تواصل معنا.",
  },
};

function formatNumber(value, language = "en") {
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en", {
    maximumSignificantDigits: 12,
    useGrouping: false,
  }).format(value);
}

function formatArea(value, language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en", {
    maximumFractionDigits: 3,
  }).format(value);
}

function newPart(id) {
  return {
    id: `part-${id}`,
    label: "",
    length: "",
    width: "",
    quantity: "1",
    allowRotation: true,
  };
}

function interpolate(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function TextField({ label, value, onChange, min = "0", step = "any" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      <input
        className="field-input"
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PartList({ parts, setParts, errors, t }) {
  function updatePart(id, field, value) {
    setParts((current) =>
      current.map((part) => (part.id === id ? { ...part, [field]: value } : part)),
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-7">
        <div>
          <h2 className="section-title">{t("parts")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("partsHelp")}</p>
        </div>
        <button
          className="button-secondary"
          type="button"
          onClick={() =>
            setParts((current) => [
              ...current,
              newPart(
                Math.max(
                  0,
                  ...current.map((part) => Number(part.id.replace("part-", "")) || 0),
                ) + 1,
              ),
            ])
          }
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          {t("addPart")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[790px] border-collapse text-start">
          <thead>
            <tr className="bg-slate-50/80 text-xs uppercase tracking-[0.1em] text-slate-500">
              <th className="px-5 py-3 font-semibold sm:px-7">{t("partLabel")}</th>
              <th className="px-3 py-3 font-semibold">{t("length")}</th>
              <th className="px-3 py-3 font-semibold">{t("width")}</th>
              <th className="px-3 py-3 font-semibold">{t("quantity")}</th>
              <th className="px-3 py-3 text-center font-semibold">{t("rotate")}</th>
              <th className="px-5 py-3 text-end font-semibold sm:px-7" />
            </tr>
          </thead>
          <tbody>
            {parts.map((part, index) => {
              const label = interpolate(t("partN"), { n: index + 1 });
              return (
                <tr className="border-t border-slate-200 align-top" key={part.id}>
                  <td className="px-5 py-4 sm:px-7">
                    <input
                      className="field-input"
                      aria-label={t("partLabel")}
                      placeholder={label}
                      value={part.label}
                      onChange={(event) => updatePart(part.id, "label", event.target.value)}
                    />
                  </td>
                  {["length", "width"].map((field) => (
                    <td className="px-3 py-4" key={field}>
                      <input
                        className="field-input"
                        aria-label={`${label} — ${t(field)}`}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={part[field]}
                        onChange={(event) => updatePart(part.id, field, event.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-4">
                    <input
                      className="field-input"
                      aria-label={`${label} — ${t("quantity")}`}
                      type="number"
                      min="1"
                      step="1"
                      value={part.quantity}
                      onChange={(event) => updatePart(part.id, "quantity", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <label className="inline-flex min-h-11 items-center justify-center">
                      <input
                        className="toggle-input"
                        type="checkbox"
                        aria-label={`${label} — ${t("rotate")}`}
                        checked={part.allowRotation}
                        onChange={(event) =>
                          updatePart(part.id, "allowRotation", event.target.checked)
                        }
                      />
                    </label>
                  </td>
                  <td className="px-5 py-4 text-end sm:px-7">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={interpolate(t("delete"), { n: index + 1 })}
                      onClick={() =>
                        setParts((current) => current.filter((item) => item.id !== part.id))
                      }
                    >
                      <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {errors?.[part.id] && (
                      <p className="mt-1 max-w-36 text-xs text-red-700">{errors[part.id]}</p>
                    )}
                  </td>
                </tr>
              );
            })}
            {parts.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center text-sm text-slate-500">
                  {t("noParts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 sm:px-7">
        {t("commonUnit")}
      </div>
    </section>
  );
}

function PartDiagram({ part, color, fontSize, language, rotatedText, label }) {
  const canLabel = part.length > fontSize * 6 && part.width > fontSize * 3.3;
  return (
    <g>
      <rect
        x={part.x}
        y={part.y}
        width={part.length}
        height={part.width}
        rx={Math.min(part.length, part.width) * 0.025}
        fill={color}
        stroke="#ffffff"
        strokeWidth={Math.max(fontSize * 0.13, 0.7)}
        vectorEffect="non-scaling-stroke"
      />
      {canLabel && (
        <g pointerEvents="none">
          <text
            x={part.x + part.length / 2}
            y={part.y + part.width / 2 - fontSize * 0.15}
            textAnchor="middle"
            className="diagram-label"
            fontSize={fontSize}
          >
            {label}
          </text>
          <text
            x={part.x + part.length / 2}
            y={part.y + part.width / 2 + fontSize * 1.05}
            textAnchor="middle"
            className="diagram-dimension"
            fontSize={fontSize * 0.78}
          >
            {formatNumber(part.originalLength, language)} ×{" "}
            {formatNumber(part.originalWidth, language)}
            {part.rotated ? ` · ${rotatedText}` : ""}
          </text>
        </g>
      )}
    </g>
  );
}

function OffcutDiagram({
  offcut,
  fontSize,
  hatchId,
  scrapHatchId,
  language,
  label,
  scrapLabel,
}) {
  const canLabel = offcut.length > fontSize * 5 && offcut.width > fontSize * 2.8;
  return (
    <g>
      <rect
        x={offcut.x}
        y={offcut.y}
        width={offcut.length}
        height={offcut.width}
        fill={`url(#${offcut.usable ? hatchId : scrapHatchId})`}
        stroke={offcut.usable ? "#526a7e" : "#8a6470"}
        strokeWidth={Math.max(fontSize * 0.12, 0.7)}
        strokeDasharray={offcut.usable ? `${fontSize * 0.45} ${fontSize * 0.35}` : undefined}
        vectorEffect="non-scaling-stroke"
      />
      {canLabel && (
        <text
          x={offcut.x + offcut.length / 2}
          y={offcut.y + offcut.width / 2 + fontSize * 0.3}
          textAnchor="middle"
          className="offcut-label"
          fontSize={fontSize * 0.78}
        >
          {interpolate(offcut.usable ? label : scrapLabel, {
            length: formatNumber(offcut.length, language),
            width: formatNumber(offcut.width, language),
          })}
        </text>
      )}
    </g>
  );
}

function CutDiagram({
  sheet,
  sheetLength,
  sheetWidth,
  colorByPartId,
  labelByPartId,
  language,
  t,
  expanded = false,
  zoom = 1,
}) {
  const fontSize = Math.max(3, Math.min(20, Math.min(sheetLength, sheetWidth) * 0.028));
  const hatchId = `sheet-${sheet.sheetNumber}-offcut-hatch`;
  const scrapHatchId = `sheet-${sheet.sheetNumber}-scrap-hatch`;
  const clipId = `sheet-${sheet.sheetNumber}-clip`;
  return (
    <svg
      className={expanded ? "sheet-diagram sheet-diagram-expanded" : "sheet-diagram"}
      style={expanded ? { width: `${960 * zoom}px` } : undefined}
      viewBox={`0 0 ${sheetLength} ${sheetWidth}`}
      role="img"
      aria-label={interpolate(t("sheetN"), { n: sheet.sheetNumber })}
    >
      <defs>
        <pattern
          id={hatchId}
          width={Math.max(3, fontSize * 1.1)}
          height={Math.max(3, fontSize * 1.1)}
          patternTransform="rotate(35)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100%" height="100%" fill="#f3f6f9" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={Math.max(3, fontSize * 1.1)}
            stroke="#bdcbd8"
            strokeWidth={Math.max(0.7, fontSize * 0.11)}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern
          id={scrapHatchId}
          width={Math.max(3, fontSize * 1.1)}
          height={Math.max(3, fontSize * 1.1)}
          patternUnits="userSpaceOnUse"
        >
          <rect width="100%" height="100%" fill="#f1e9ec" />
          <path
            d={`M0 0 L${Math.max(3, fontSize * 1.1)} ${Math.max(3, fontSize * 1.1)}`}
            stroke="#c7aeb7"
            strokeWidth={Math.max(0.7, fontSize * 0.11)}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={sheetLength} height={sheetWidth} />
        </clipPath>
      </defs>
      <rect
        x="0"
        y="0"
        width={sheetLength}
        height={sheetWidth}
        fill="#ffffff"
        stroke="#334155"
        strokeWidth={Math.max(1, fontSize * 0.15)}
        vectorEffect="non-scaling-stroke"
      />
      <g clipPath={`url(#${clipId})`}>
        {sheet.free.map((offcut) => (
          <OffcutDiagram
            key={offcut.id}
            offcut={offcut}
            fontSize={fontSize}
            hatchId={hatchId}
            scrapHatchId={scrapHatchId}
            language={language}
            label={t("offcutLabel")}
            scrapLabel={t("scrapLabel")}
          />
        ))}
        {sheet.parts.map((part) => (
          <PartDiagram
            key={part.pieceId}
            part={part}
            color={colorByPartId[part.partId]}
            fontSize={fontSize}
            language={language}
            rotatedText={t("rotated")}
            label={labelByPartId[part.partId] ?? part.label}
          />
        ))}
        {sheet.cuts.map((cut) => {
          const vertical = cut.axis === "length";
          return (
            <g key={cut.number}>
              {cut.kerf > 0 ? (
                <rect
                  x={vertical ? cut.x - cut.kerf / 2 : cut.x}
                  y={vertical ? cut.y : cut.y - cut.kerf / 2}
                  width={vertical ? cut.kerf : cut.parent.length}
                  height={vertical ? cut.parent.width : cut.kerf}
                  fill="#153b68"
                  opacity="0.25"
                />
              ) : (
                <line
                  x1={cut.x}
                  y1={cut.y}
                  x2={vertical ? cut.x : cut.x + cut.span}
                  y2={vertical ? cut.y + cut.span : cut.y}
                  stroke="#153b68"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <circle
                cx={vertical ? cut.x : cut.x + cut.span / 2}
                cy={vertical ? cut.y + cut.span / 2 : cut.y}
                r={fontSize * 0.72}
                fill="#153b68"
                stroke="#ffffff"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={vertical ? cut.x : cut.x + cut.span / 2}
                y={(vertical ? cut.y + cut.span / 2 : cut.y) + fontSize * 0.24}
                textAnchor="middle"
                className="cut-number"
                fontSize={fontSize * 0.66}
              >
                {cut.number}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function formatCut(cut, language, t) {
  const parent = cut.parent;
  const common = {
    position: formatNumber(cut.localPosition, language),
    length: formatNumber(parent.length, language),
    width: formatNumber(parent.width, language),
    x: formatNumber(parent.x, language),
    y: formatNumber(parent.y, language),
    span: formatNumber(cut.span, language),
  };
  return interpolate(t(cut.axis === "length" ? "crosscut" : "rip"), common);
}

function SheetPlan({
  sheet,
  result,
  colorByPartId,
  labelByPartId,
  language,
  t,
  onOpenDetails,
}) {
  return (
    <article className="sheet-card print-sheet">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-7">
        <div>
          <p className="eyebrow">{interpolate(t("sheetN"), { n: String(sheet.sheetNumber).padStart(2, "0") })}</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {formatNumber(result.sheetLength, language)} × {formatNumber(result.sheetWidth, language)}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-900">
            {interpolate(sheet.parts.length === 1 ? t("sheetPart") : t("sheetParts"), { n: sheet.parts.length })}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
            {interpolate(sheet.cuts.length === 1 ? t("cut") : t("cuts"), { n: sheet.cuts.length })}
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-4 sm:p-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="min-w-0">
          <div className="diagram-frame">
            <CutDiagram
              sheet={sheet}
              sheetLength={result.sheetLength}
              sheetWidth={result.sheetWidth}
              colorByPartId={colorByPartId}
              labelByPartId={labelByPartId}
              language={language}
              t={t}
            />
          </div>
          <button
            className="button-secondary print-hide mt-3 w-full justify-center sm:w-auto"
            type="button"
            onClick={onOpenDetails}
            title={t("viewDetails")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3M8 8h8v8H8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("viewDetails")}
          </button>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2"><i className="legend-part" />{t("part")}</span>
            <span className="inline-flex items-center gap-2"><i className="legend-offcut" />{t("reusable")}</span>
            <span className="inline-flex items-center gap-2"><i className="legend-scrap" />{t("actualScrap")}</span>
            <span className="inline-flex items-center gap-2"><i className="legend-cut" />{t("kerfLine")}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {sheet.parts.map((part) => (
              <span
                key={part.pieceId}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700"
              >
                <i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colorByPartId[part.partId] }} />
                {labelByPartId[part.partId] ?? part.label}: {formatNumber(part.originalLength, language)} ×{" "}
                {formatNumber(part.originalWidth, language)}
                {part.rotated && <span className="text-slate-500">({t("rotated")})</span>}
              </span>
            ))}
          </div>
        </div>

        <aside className="cut-guide">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h4 className="font-bold text-slate-900">{t("cuttingSequence")}</h4>
            <span className="text-xs text-slate-600">
              {t("kerf")} {formatNumber(result.kerf, language)}
            </span>
          </div>
          {sheet.cuts.length > 0 ? (
            <ol className="space-y-3">
              {sheet.cuts.map((cut) => (
                <li className="flex gap-3" key={cut.number}>
                  <span className="cut-step-number">{formatNumber(cut.number, language)}</span>
                  <p className="pt-0.5 text-sm leading-6 text-slate-700">
                    {formatCut(cut, language, t)}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm leading-6 text-slate-600">{t("noCuts")}</p>
          )}

          <div className="mt-6 border-t border-slate-300 pt-4">
            <h5 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
              {t("reusableOffcuts")}
            </h5>
            {sheet.free.some((offcut) => offcut.usable) ? (
              <ul className="mt-2 space-y-2">
                {sheet.free.filter((offcut) => offcut.usable).map((offcut) => (
                  <li className="flex justify-between gap-3 text-sm text-slate-700" key={offcut.id}>
                    <span>{formatNumber(offcut.length, language)} × {formatNumber(offcut.width, language)}</span>
                    <span>{formatArea(offcut.length * offcut.width, language)} {t("areaSuffix")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">{t("noOffcuts")}</p>
            )}
          </div>
          <div className="mt-5 border-t border-slate-300 pt-4">
            <h5 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
              {t("actualScrap")}
            </h5>
            {sheet.free.some((offcut) => !offcut.usable) ? (
              <ul className="mt-2 space-y-2">
                {sheet.free.filter((offcut) => !offcut.usable).map((offcut) => (
                  <li className="flex justify-between gap-3 text-sm text-slate-700" key={offcut.id}>
                    <span>{formatNumber(offcut.length, language)} × {formatNumber(offcut.width, language)}</span>
                    <span>{formatArea(offcut.length * offcut.width, language)} {t("areaSuffix")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">{t("noScrap")}</p>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}

function DiagramModal({
  sheet,
  result,
  colorByPartId,
  labelByPartId,
  language,
  t,
  zoom,
  setZoom,
  onClose,
}) {
  if (!sheet) return null;

  return (
    <div
      className="diagram-modal-overlay fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="diagram-modal-title"
        aria-modal="true"
        className="flex h-full flex-col text-white"
        dir={language === "ar" ? "rtl" : "ltr"}
        role="dialog"
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/15 px-4 py-3 sm:px-7">
          <div>
            <h2 className="text-lg font-bold" id="diagram-modal-title">
              {interpolate(t("sheetN"), { n: sheet.sheetNumber })}
            </h2>
            <p className="mt-1 text-xs text-slate-300">{t("modalHelp")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={t("zoomOut")}
              className="rounded-lg border border-white/20 px-3 py-2 text-lg hover:bg-white/10 disabled:opacity-40"
              disabled={zoom <= 0.5}
              onClick={() => setZoom((current) => Math.max(0.5, current - 0.25))}
              title={t("zoomOut")}
              type="button"
            >
              −
            </button>
            <button
              className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => setZoom(1)}
              title={t("resetZoom")}
              type="button"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              aria-label={t("zoomIn")}
              className="rounded-lg border border-white/20 px-3 py-2 text-lg hover:bg-white/10 disabled:opacity-40"
              disabled={zoom >= 2.5}
              onClick={() => setZoom((current) => Math.min(2.5, current + 0.25))}
              title={t("zoomIn")}
              type="button"
            >
              +
            </button>
            <button
              autoFocus
              aria-label={t("closeDiagram")}
              className="ms-2 rounded-lg bg-white/10 px-4 py-2 text-xl font-bold hover:bg-white/20"
              onClick={onClose}
              title={t("closeDiagram")}
              type="button"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-7">
          <div className="w-max min-w-full">
            <CutDiagram
              sheet={sheet}
              sheetLength={result.sheetLength}
              sheetWidth={result.sheetWidth}
              colorByPartId={colorByPartId}
              labelByPartId={labelByPartId}
              language={language}
              t={t}
              expanded
              zoom={zoom}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Summary({ result, language, t }) {
  const largest = result.largestOffcut;
  const stats = [
    {
      label: t("sheets"),
      value: result.totalSheetsNeeded,
      detail: interpolate(t("partsPlaced"), { n: result.pieceCount }),
      icon: "▦",
    },
    {
      label: t("usedArea"),
      value: formatArea(result.usedArea, language),
      detail: t("usedAreaDetail"),
      icon: "↗",
    },
    {
      label: t("waste"),
      value: `${formatNumber(result.wastePercentage, language)}%`,
      detail: interpolate(t("wasteDetail"), { area: formatArea(result.wasteArea, language) }),
      icon: "◌",
    },
    {
      label: t("largestOffcut"),
      value: largest
        ? `${formatNumber(largest.length, language)} × ${formatNumber(largest.width, language)}`
        : t("none"),
      detail: largest ? interpolate(t("sheetN"), { n: largest.sheetNumber }) : t("noReusable"),
      icon: "▱",
    },
  ];

  return (
    <section aria-label={t("summary")} className="summary-grid">
      {stats.map((stat) => (
        <div className="summary-card" key={stat.label}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <span aria-hidden="true" className="summary-icon">{stat.icon}</span>
          </div>
          <p className="mt-4 break-words text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-600">{stat.detail}</p>
        </div>
      ))}
      <div className="col-span-full flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-slate-600">
        <span>{interpolate(t("stockArea"), { area: formatArea(result.stockArea, language) })}</span>
        <span>{interpolate(t("usableOffcuts"), { area: formatArea(result.usableOffcutArea, language) })}</span>
        <span>{interpolate(t("scrapLoss"), { area: formatArea(result.scrapArea, language) })}</span>
        <span>{interpolate(t("kerfLoss"), { area: formatArea(result.kerfWasteArea, language) })}</span>
        <span>{interpolate(t("passes"), { n: result.heuristicPasses })}</span>
      </div>
    </section>
  );
}

function validateInput(sheetLengthRaw, sheetWidthRaw, kerfRaw, parts, language, t) {
  const errors = {};
  const sheetLength = Number.parseFloat(sheetLengthRaw);
  const sheetWidth = Number.parseFloat(sheetWidthRaw);
  const kerf = Number.parseFloat(kerfRaw);
  if (!Number.isFinite(sheetLength) || sheetLength <= 0) errors.sheetLength = t("unitError");
  if (!Number.isFinite(sheetWidth) || sheetWidth <= 0) errors.sheetWidth = t("unitError");
  if (!Number.isFinite(kerf) || kerf < 0) errors.kerf = t("kerfError");
  if (parts.length === 0) errors.parts = t("noPartsError");

  const rowErrors = {};
  if (!errors.sheetLength && !errors.sheetWidth) {
    parts.forEach((part, index) => {
      const length = Number.parseFloat(part.length);
      const width = Number.parseFloat(part.width);
      const quantity = Number(part.quantity);
      const label = part.label.trim() || interpolate(t("partN"), { n: index + 1 });
      const messages = [];
      if (!Number.isFinite(length) || length <= 0) messages.push(t("validLength"));
      if (!Number.isFinite(width) || width <= 0) messages.push(t("validWidth"));
      if (!Number.isSafeInteger(quantity) || quantity < 1) messages.push(t("validQuantity"));
      if (
        Number.isFinite(length) &&
        Number.isFinite(width) &&
        length > 0 &&
        width > 0 &&
        quantity > 0
      ) {
        const fitsNormally = length <= sheetLength && width <= sheetWidth;
        const fitsRotated =
          part.allowRotation && width <= sheetLength && length <= sheetWidth;
        if (!fitsNormally && !fitsRotated) {
          messages.push(interpolate(t("tooLarge"), { label }));
        }
      }
      if (messages.length > 0) rowErrors[part.id] = messages[0];
    });
  }

  return {
    errors,
    rowErrors,
    valid: Object.keys(errors).length === 0 && Object.keys(rowErrors).length === 0 && parts.length > 0,
    dimensions: { sheetLength, sheetWidth, kerf },
  };
}

export default function App() {
  const [language, setLanguage] = useState("en");
  const [sheetLength, setSheetLength] = useState("");
  const [sheetWidth, setSheetWidth] = useState("");
  const [kerf, setKerf] = useState("");
  const [parts, setParts] = useState([newPart(1)]);
  const [nextPartId, setNextPartId] = useState(2);
  const [result, setResult] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const t = (key) => translations[language][key];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = translations[language].documentTitle;
  }, [language]);

  useEffect(() => {
    if (!selectedSheet) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function dismissOnEscape(event) {
      if (event.key === "Escape") setSelectedSheet(null);
    }
    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [selectedSheet]);

  function optimize(event) {
    event.preventDefault();
    const validation = validateInput(sheetLength, sheetWidth, kerf, parts, language, t);
    setFieldErrors(validation.errors);
    setRowErrors(validation.rowErrors);
    setResult(null);
    setSelectedSheet(null);
    setError("");

    if (!validation.valid) {
      setError(
        validation.errors.parts ??
          Object.values(validation.errors)[0] ??
          t("reviewInputs"),
      );
      return;
    }

    setIsCalculating(true);
    try {
      const normalizedParts = parts.map((part, index) => ({
        ...part,
        label: part.label.trim() || interpolate(t("partN"), { n: index + 1 }),
        length: Number.parseFloat(part.length),
        width: Number.parseFloat(part.width),
        quantity: Number(part.quantity),
      }));
      setResult(solveGuillotineCutting({ ...validation.dimensions, parts: normalizedParts }));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError);
      setError(
        /cannot be separated from the stock/i.test(message)
          ? t("stockCutError")
          : t("solverError"),
      );
    } finally {
      setIsCalculating(false);
    }
  }

  const colorByPartId = result
    ? Object.fromEntries(
        [...new Set(result.sheets.flatMap((sheet) => sheet.parts.map((part) => part.partId)))].map(
          (partId, index) => [partId, COLORS[index % COLORS.length]],
        ),
      )
    : {};
  const labelByPartId = Object.fromEntries(
    parts.map((part, index) => [
      part.id,
      part.label.trim() || interpolate(t("partN"), { n: index + 1 }),
    ]),
  );

  return (
    <main dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-700 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a className="flex items-center gap-3" href="#" aria-label={t("brand")}>
            <span className="brand-mark" aria-hidden="true">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
                <rect x="3" y="3" width="19" height="19" rx="3" stroke="currentColor" strokeWidth="1.7" />
                <path d="M12.5 3v19M3 12.5h9.5m0 0H22" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-extrabold tracking-tight text-white">{t("brand")}</span>
              <span className="block text-[10px] font-semibold tracking-[0.19em] text-blue-200">{t("brandSub")}</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs font-medium text-slate-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              {t("status")}
            </div>
            <button
              type="button"
              className="language-toggle"
              onClick={() => setLanguage((current) => (current === "en" ? "ar" : "en"))}
              aria-label={t("language")}
            >
              <span aria-hidden="true">文</span>
              {t("language")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-11">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{t("headline")}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">{t("intro")}</p>
          </div>
          {result && (
            <button className="button-secondary print-hide" type="button" onClick={() => window.print()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2m-10-3h10v7H7v-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M18 12h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              {t("print")}
            </button>
          )}
        </div>

        <form className="space-y-5 print-hide" onSubmit={optimize} noValidate>
          <section className="card p-5 sm:p-7">
            <div className="mb-5">
              <h2 className="section-title">{t("stock")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("stockHelp")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label={t("sheetLength")} value={sheetLength} onChange={setSheetLength} />
              <TextField label={t("sheetWidth")} value={sheetWidth} onChange={setSheetWidth} />
              <TextField label={t("kerf")} value={kerf} min="0" onChange={setKerf} />
            </div>
            {(fieldErrors.sheetLength || fieldErrors.sheetWidth || fieldErrors.kerf) && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {fieldErrors.sheetLength || fieldErrors.sheetWidth || fieldErrors.kerf}
              </p>
            )}
          </section>

          <hr className="section-divider" />
          <PartList parts={parts} setParts={setParts} errors={rowErrors} t={t} />

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900" role="alert">
              <span className="font-bold">{t("failure")} </span>{error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-xs leading-5 text-slate-600">{t("sawRule")}</p>
            <button className="button-primary" type="submit" disabled={isCalculating}>
              {isCalculating ? t("calculating") : t("optimize")}
              {!isCalculating && (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {result && (
          <>
            <hr className="section-divider my-10" />
            <section className="space-y-6" aria-live="polite">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">{t("complete")}</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{t("plan")}</h2>
                </div>
                <p className="text-xs text-slate-600">{interpolate(t("passes"), { n: result.heuristicPasses })}</p>
              </div>
              <Summary result={result} language={language} t={t} />
              <hr className="section-divider" />
              <div className="space-y-5">
                {result.sheets.map((sheet) => (
                  <SheetPlan
                    key={sheet.sheetNumber}
                    sheet={sheet}
                    result={result}
                    colorByPartId={colorByPartId}
                    labelByPartId={labelByPartId}
                    language={language}
                    t={t}
                    onOpenDetails={() => {
                      setDiagramZoom(1);
                      setSelectedSheet(sheet);
                    }}
                  />
                ))}
              </div>
              <p className="pb-2 text-center text-xs text-slate-600">{t("safety")}</p>
            </section>
            <DiagramModal
              sheet={selectedSheet}
              result={result}
              colorByPartId={colorByPartId}
              labelByPartId={labelByPartId}
              language={language}
              t={t}
              zoom={diagramZoom}
              setZoom={setDiagramZoom}
              onClose={() => setSelectedSheet(null)}
            />
          </>
        )}

        <footer className="developer-footer mt-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="eyebrow">{t("developer")}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">{t("name")}</h2>
              <p className="mt-1 text-sm text-slate-600">{t("footerContact")}</p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <a className="contact-link" href="mailto:ziyad543212@gmail.com">
                <span className="contact-icon" aria-hidden="true">✉</span>
                <span><span className="contact-caption">{t("email")}</span>ziyad543212@gmail.com</span>
              </a>
              <a
                className="contact-link"
                href="https://wa.me/963991387428"
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.1 0C5.55 0 .22 5.32.22 11.87c0 2.1.55 4.15 1.6 5.96L.12 24l6.34-1.66a11.9 11.9 0 0 0 5.64 1.43h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.15-3.47-8.41ZM12.1 21.75h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.66-.24-.38a9.84 9.84 0 0 1-1.51-5.24c0-5.46 4.45-9.9 9.92-9.9a9.83 9.83 0 0 1 7.01 2.9 9.84 9.84 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.92 9.92Zm5.44-7.42c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.68-1.63-.93-2.23-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.42-.08-.13-.28-.2-.58-.35Z" />
                  </svg>
                </span>
                <span><span className="contact-caption">{t("whatsapp")}</span>00963991387428</span>
              </a>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
            {t("footerBrand")} · {t("footerUnit")}
          </div>
        </footer>
      </div>
    </main>
  );
}
