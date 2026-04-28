// ROOTIX — Official monthly pricing (EGP)
export interface Package {
  students: number;
  price: number;
  label?: string;
  highlight?: boolean;
  note?: string;
}

export const PACKAGES: Package[] = [
  { students: 50, price: 500, label: "بداية" },
  { students: 75, price: 750 },
  { students: 100, price: 900 },
  { students: 150, price: 1200 },
  { students: 200, price: 1950, label: "الأكثر طلباً", highlight: true },
  { students: 300, price: 2650 },
  { students: 500, price: 3900 },
  { students: 750, price: 5450 },
  { students: 850, price: 6500 },
  { students: 1000, price: 7150 },
  { students: 1200, price: 8000 },
  { students: 1300, price: 8450 },
  { students: 1400, price: 8900 },
  { students: 1500, price: 9000, note: "عرض خاص" },
  { students: 1501, price: 10000, label: "+1500 طالب", note: "عرض لفترة محدودة" },
];

export function findPackage(students: number): Package {
  // Find smallest package that fits the student count
  return (
    PACKAGES.find((p) => p.students >= students) ?? PACKAGES[PACKAGES.length - 1]
  );
}

export function priceForStudents(students: number): number {
  return findPackage(students).price;
}

// PRO tier adds roughly +10-20% depending on tier
export const PRO_MULTIPLIER = 1.15;

export function proPriceForStudents(students: number): number {
  return Math.round(priceForStudents(students) * PRO_MULTIPLIER);
}
