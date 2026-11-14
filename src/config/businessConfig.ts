/**
 * CREWW MOBILE AUTO DETAILING — Master Business Configuration
 * Professional American Mobile Detailing
 * All original copywriting, authentic imagery, and strictly 3 services.
 */

export interface DetailPackage {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  regularPrice: number;
  offerPrice: number;
  specialOfferPrice: number;
  savings: number;
  badge: string;
  isBestValue?: boolean;
  image: string;
  inclusions: string[];
  features: string[];
  detailedInclusions: { category: string; items: string[] }[];
}

export const EXTERIOR_INCLUSIONS = [
  "Pressure Washer Rinse",
  "Foam Soap Hand Wash",
  "Buffer Wax",
  "Tire Degreasing",
  "Dressing Wheels, Tires and Rims",
  "Cleaning Door Jambs and Trunk Seals",
  "Microfiber Towel Drying",
];

export const INTERIOR_INCLUSIONS = [
  "Vacuuming All Carpets and Seats",
  "Wiping Down Interior Surfaces",
  "Dressing Interior Surfaces",
  "Leather Conditioning",
  "Shampooing Stained Areas",
  "Pet Hair Removal",
  "Cleaning Interior Windows",
];

export const FULL_INCLUSIONS = [...EXTERIOR_INCLUSIONS, ...INTERIOR_INCLUSIONS];

export const BUSINESS_CONFIG = {
  name: "CREWW MOBILE AUTO DETAILING",
  shortName: "CREWW",
  officialBadgePath: "/assets/aistudio/Sleek_Blue_Crew_Auto_Detailing_Badge_f6a27b68.png",
  officialLogoPath: "/assets/aistudio/Sleek_Blue_Crew_Auto_Detailing_Badge_f6a27b68.png",
  tagline: "Precision On-Site Automotive Detailing",
  email: "crewwmobileautodetailing@gmail.com",
  serviceTerritory: "United States (On-Site Mobile Detailing)",

  // STRICT: Only Instagram profile
  instagram: {
    handle: "@creww.mobile.autodetailing",
    url: "https://www.instagram.com/creww.mobile.autodetailing/",
  },

  // Generated authentic automotive assets
  assets: {
    heroCar: "/assets/images/hero_luxury_black_porsche_1794157850643.jpg",
    exteriorService: "/assets/images/service_exterior_foam_clean_1794157870757.jpg",
    interiorService: "/assets/images/service_interior_cockpit_detail_1794157851350.jpg",
    fullDetailService: "/assets/images/service_full_detail_ceramic_clean_1794157870698.jpg",
  },

  /**
   * EXACT THREE DETAILING PACKAGES
   */
  packages: [
    {
      id: "exterior-detailing",
      name: "Exterior Detailing",
      subtitle: "Paint Decontamination & Protective Gloss Seal",
      tagline: "Touchless pressure pre-rinse, hand foam wash, machine buffer wax, and complete wheel rim dressing performed at your doorstep.",
      regularPrice: 229,
      offerPrice: 169,
      specialOfferPrice: 169,
      savings: 60,
      badge: "Save $60 · Limited Special",
      image: "/assets/images/service_exterior_foam_clean_1794157870757.jpg",
      inclusions: EXTERIOR_INCLUSIONS,
      features: EXTERIOR_INCLUSIONS,
      detailedInclusions: [
        {
          category: "Wash, Decontamination & Finish",
          items: [
            "Pressure Washer Rinse",
            "Foam Soap Hand Wash",
            "Buffer Wax",
            "Microfiber Towel Drying",
          ],
        },
        {
          category: "Wheels, Rubber & Seals",
          items: [
            "Tire Degreasing",
            "Dressing Wheels, Tires and Rims",
            "Cleaning Door Jambs and Trunk Seals",
          ],
        },
      ],
    },
    {
      id: "interior-detailing",
      name: "Interior Detailing",
      subtitle: "Deep Fiber Extraction & Leather Conditioning",
      tagline: "Total cabin sanitization with high-suction vacuum extraction, steam-treated stain shampooing, leather nourishment, and streak-free glass.",
      regularPrice: 229,
      offerPrice: 189,
      specialOfferPrice: 189,
      savings: 40,
      badge: "Save $40 · Limited Special",
      image: "/assets/images/service_interior_cockpit_detail_1794157851350.jpg",
      inclusions: INTERIOR_INCLUSIONS,
      features: INTERIOR_INCLUSIONS,
      detailedInclusions: [
        {
          category: "Seats, Carpets & Pet Hair",
          items: [
            "Vacuuming All Carpets and Seats",
            "Shampooing Stained Areas",
            "Pet Hair Removal",
          ],
        },
        {
          category: "Cabin Surfaces & Glass",
          items: [
            "Wiping Down Interior Surfaces",
            "Dressing Interior Surfaces",
            "Leather Conditioning",
            "Cleaning Interior Windows",
          ],
        },
      ],
    },
    {
      id: "full-detailing",
      name: "Full Interior & Exterior Detailing",
      subtitle: "Complete Bumper-to-Bumper Master Transformation",
      tagline: "Our signature package combining every exterior decontamination process with deep interior extraction for complete showroom renewal.",
      regularPrice: 299,
      offerPrice: 229,
      specialOfferPrice: 229,
      savings: 70,
      badge: "Best Value · Save $70",
      isBestValue: true,
      image: "/assets/images/service_full_detail_ceramic_clean_1794157870698.jpg",
      inclusions: FULL_INCLUSIONS,
      features: FULL_INCLUSIONS,
      detailedInclusions: [
        {
          category: "Exterior Master Processes",
          items: EXTERIOR_INCLUSIONS,
        },
        {
          category: "Interior Cabin Processes",
          items: INTERIOR_INCLUSIONS,
        },
      ],
    },
  ] as DetailPackage[],

  /**
   * The CREWW Standard - 6 Operational Differentiators
   */
  pillars: [
    {
      title: "Spot-Free Wash & Rinse",
      description: "Commercial pressure rinsing, pH-balanced foam hand wash, and plush microfiber drying performed cleanly using your on-site water connection.",
    },
    {
      title: "On-Site Utility Setup",
      description: "Water and electricity are required for our service. If unavailable at your location, indicate 'No' when booking and our team will manually verify arrangements.",
    },
    {
      title: "Buffer Wax Paint Defense",
      description: "Carefully calibrated random-orbital polishers seal vehicle paint pores with high-grade synthetic wax for deep gloss and hydrophobic water beading.",
    },
    {
      title: "Hot Fiber Extraction",
      description: "High-heat steam and fabric shampoo penetrate carpet weaves to eliminate embedded road grime, drink spills, and stubborn pet dander.",
    },
    {
      title: "Upfront Fixed Pricing",
      description: "The rate you see is the rate you pay. Zero mileage surcharges, fuel multipliers, or unexpected checkout adjustments.",
    },
    {
      title: "Walkthrough Inspection",
      description: "You review the finished interior and exterior with your lead technician before final payment is completed.",
    },
  ],
};
