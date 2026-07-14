export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  intro: string;
  items: FaqItem[];
};

export const faqSections: FaqSection[] = [
  {
    title: "Emergency Response",
    intro:
      "For urgent property damage, direct phone contact is the safest first step.",
    items: [
      {
        question: "What should I do first after water, fire, or storm damage?",
        answer:
          "If there is an immediate danger, call emergency services first. When it is safe, you may call ActFAST and/or your insurer first, based on your circumstances and discretion. Calling ActFAST can provide practical guidance about immediate next steps, including which appropriate parties may need to be contacted. If you can do so without risk, stop the source, avoid disturbing affected materials, and take basic photos.",
      },
      {
        question: "Is the website contact form an emergency-response channel?",
        answer:
          "No. Contact forms and online messages are useful for general inquiries, but they are not guaranteed emergency-response channels. For urgent restoration help, call ActFAST directly at 604-518-5129.",
      },
      {
        question: "What information should I have ready when I call?",
        answer:
          "Helpful details include your address or service area, the type of damage, when it happened, whether the source is still active, any visible safety concerns, and whether you have already contacted your insurer or property manager.",
      },
    ],
  },
  {
    title: "Insurance & Claims",
    intro:
      "Restoration work often involves documentation, estimates, adjusters, and approvals.",
    items: [
      {
        question: "Can ActFAST help with my insurance claim?",
        answer:
          "ActFAST can help document the loss, prepare restoration information, and communicate with your insurer or adjuster when authorized. Your insurance provider determines coverage, deductibles, limits, approvals, and claim decisions.",
      },
      {
        question: "Do I need insurance approval before emergency mitigation starts?",
        answer:
          "Emergency mitigation is always the first stage of the restoration process and is time-sensitive because continued moisture, smoke residue, or exposure can cause further damage. How the work proceeds after mitigation may vary based on the loss conditions and insurance process. ActFAST can help explain the practical next steps, but coverage decisions remain with your insurer.",
      },
      {
        question: "Will my project timeline depend on the insurance process?",
        answer:
          "Yes. Emergency mitigation is always the first stage and may proceed differently from repair approvals, material selections, supplements, and final rebuild work to help prevent further damage. The overall timeline will depend on the loss conditions, required work, availability, and insurance claim decisions.",
      },
    ],
  },
  {
    title: "Water Damage",
    intro:
      "Water damage work focuses on controlling the source, removing water, drying affected materials, and documenting progress.",
    items: [
      {
        question: "What happens during water damage restoration?",
        answer:
          "The process typically includes an initial assessment, water extraction where needed, moisture checks, drying equipment, monitoring, removal of unsalvageable materials when appropriate, and repair planning after affected areas are ready for rebuild. Prompt mitigation also aims to preserve as many affected items as reasonably possible, helping minimize the extent of damage and related restoration costs.",
      },
      {
        question: "How long does drying take?",
        answer:
          "Drying time depends on the materials affected, the amount of water, ventilation, temperature, humidity, and how quickly work begins. Some areas dry quickly, while deeper saturation or hidden moisture can require longer monitoring.",
      },
      {
        question: "Why are fans and dehumidifiers left on site?",
        answer:
          "Drying equipment helps create conditions that remove moisture from affected materials and the surrounding air. Equipment placement and run time may change after moisture readings and site conditions are reviewed.",
      },
    ],
  },
  {
    title: "Fire, Smoke & Odor",
    intro:
      "Fire losses can involve structural damage, smoke residue, odor, contents, and safety concerns.",
    items: [
      {
        question: "Can smoke damage affect rooms away from the fire?",
        answer:
          "Yes, smoke and soot can travel beyond the main fire area through air movement, open spaces, and HVAC pathways. A site assessment helps determine which areas and materials may need cleaning, deodorizing, or repair.",
      },
      {
        question: "Can odor always be removed?",
        answer:
          "Odor treatment depends on the source, materials affected, severity, and access to contaminated areas. Professional cleaning and deodorizing can help, but the proper method depends on the specific loss conditions.",
      },
      {
        question: "When can repairs begin after a fire?",
        answer:
          "Repair timing depends on safety clearance, scope development, insurer or owner approvals, debris removal, cleaning needs, permits where applicable, and material availability.",
      },
    ],
  },
  {
    title: "Mold / Mould",
    intro:
      "Mold-related work should be handled carefully, with attention to moisture sources, containment, and appropriate cleaning methods.",
    items: [
      {
        question: "What should I do if I see mold or smell a musty odor?",
        answer:
          "Avoid disturbing the area, do not dry-brush or blow air across visible growth, and look for possible moisture sources. ActFAST can assess the restoration side of the issue and recommend next steps based on the site conditions.",
      },
      {
        question: "Do I always need mold testing?",
        answer:
          "Not always. In some cases, visible growth and moisture history can guide remediation planning. In other situations, sampling or review by a qualified indoor environmental professional may be recommended.",
      },
      {
        question: "Can ActFAST give health advice about mold exposure?",
        answer:
          "No. ActFAST can discuss restoration concerns and site conditions, but health questions should be directed to a qualified medical professional, especially if occupants have symptoms or sensitivities.",
      },
    ],
  },
  {
    title: "Asbestos & Older Buildings",
    intro:
      "In British Columbia, older buildings may contain asbestos-containing materials that require proper assessment before disturbance.",
    items: [
      {
        question: "What should I do if asbestos may be present?",
        answer:
          "Do not cut, sand, remove, or disturb suspected material. In B.C., asbestos work may require qualified assessment, licensing, certification, containment, and disposal steps depending on the situation.",
      },
      {
        question: "Why can asbestos affect restoration timelines?",
        answer:
          "If affected building materials may contain asbestos, restoration work may need to pause until the material is assessed and the proper work procedure is determined. This helps protect occupants, workers, and the property.",
      },
      {
        question: "Can ActFAST coordinate asbestos-related work?",
        answer:
          "ActFAST can help coordinate the restoration workflow and involve qualified or licensed professionals where asbestos-related assessment or abatement is required.",
      },
    ],
  },
  {
    title: "Contents & Pack-Out",
    intro:
      "Contents restoration protects belongings while structural work is assessed, cleaned, dried, or repaired.",
    items: [
      {
        question: "What is a pack-out?",
        answer:
          "A pack-out involves listing, packing, separating, and storing belongings from affected areas so cleaning, drying, demolition, or repair work can proceed. Affected, unaffected, valuable, and especially fragile items are identified and handled according to their condition and project needs. Food and medications are not included in the pack-out.",
      },
      {
        question: "Will every damaged item be restorable?",
        answer:
          "Not always. Restorability depends on the item, material, contamination type, severity, pre-loss condition, and insurance or owner direction. Items are typically reviewed and documented before decisions are made.",
      },
      {
        question: "Can I access my belongings while they are stored?",
        answer:
          "Contents work may take place between the emergency mitigation and final repair phases. Access to stored belongings may be possible with coordination, depending on the storage location, inventory status, safety conditions, and project logistics. It is best to identify and request important items early so the team can plan around them.",
      },
    ],
  },
  {
    title: "Repairs, Rebuild & Service Areas",
    intro:
      "After mitigation, many projects move into repair planning, approvals, scheduling, and final walkthroughs.",
    items: [
      {
        question: "Does ActFAST handle repairs after mitigation?",
        answer:
          "Yes, ActFAST provides restoration and repair services after losses such as water, fire, smoke, mold-related damage, and other approved repair scopes. The final scope depends on site conditions, approvals, and project requirements.",
      },
      {
        question: "Which areas does ActFAST serve?",
        answer:
          "ActFAST serves Surrey, Metro Vancouver, and the Okanagan branch service area. If you are nearby but unsure whether your property is covered, call and the team can confirm availability.",
      },
      {
        question: "What happens near the end of a project?",
        answer:
          "The end of a project often includes completion checks, remaining touch-ups if needed, documentation, and a final walkthrough or closeout conversation so expectations are clear before the file is wrapped up.",
      },
    ],
  },
];

export const faqJsonLdItems = faqSections.flatMap((section) =>
  section.items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }))
);
