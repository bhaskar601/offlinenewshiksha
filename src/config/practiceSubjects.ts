import type { LucideIcon } from "lucide-react";
import { Atom, BookOpen, Dna, Microscope } from "lucide-react";

export type PracticeSubjectCard = {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  iconBg: string;
  icon: LucideIcon;
};

/** Default NMMS-style subject list (Hindi labels, existing behaviour). */
export const DEFAULT_PRACTICE_SUBJECTS: PracticeSubjectCard[] = [
  {
    id: "गणित",
    name: "गणित",
    description: "गणना, बीजगणित, ज्यामिति आदि",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-100",
    icon: BookOpen,
  },
  {
    id: "विज्ञान",
    name: "विज्ञान",
    description: "भौतिकी, रसायन, जीव विज्ञान",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    iconBg: "bg-green-100",
    icon: Microscope,
  },
  {
    id: "सामाजिक%20विज्ञान",
    name: "सामाजिक विज्ञान",
    description: "इतिहास, भूगोल, नागरिकशास्त्र",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    iconBg: "bg-purple-100",
    icon: BookOpen,
  },
  {
    id: "मानसिक%20क्षमता%20परीक्षण",
    name: "मानसिक क्षमता परीक्षण",
    description: "तर्क, विश्लेषण, गणितीय क्षमता",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    iconBg: "bg-orange-100",
    icon: BookOpen,
  },
  {
    id: "vocab",
    name: "शब्द ज्ञान (Vocabulary)",
    description: "अर्थ, प्रयायवाची, विलोम, पैसेज आधारित शब्द अभ्यास",
    color: "from-indigo-500 to-fuchsia-500",
    bgColor: "bg-indigo-50",
    iconBg: "bg-indigo-100",
    icon: BookOpen,
  },
];

/**
 * Competitive exam track: English-only labels; API must serve questions for class `competitive`
 * with matching `subject` strings (Maths, Physics, Chemistry, Biology).
 */
export const COMPETITIVE_PRACTICE_SUBJECTS: PracticeSubjectCard[] = [
  {
    id: "Maths",
    name: "Maths",
    description: "Arithmetic, algebra, geometry — English medium",
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-50",
    iconBg: "bg-sky-100",
    icon: BookOpen,
  },
  {
    id: "Physics",
    name: "Physics",
    description: "Mechanics, energy, waves — English medium",
    color: "from-violet-500 to-indigo-600",
    bgColor: "bg-violet-50",
    iconBg: "bg-violet-100",
    icon: Atom,
  },
  {
    id: "Chemistry",
    name: "Chemistry",
    description: "Matter, reactions, periodic trends — English medium",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    icon: Microscope,
  },
  {
    id: "Biology",
    name: "Biology",
    description: "Cell, life processes, environment — English medium",
    color: "from-rose-500 to-orange-500",
    bgColor: "bg-rose-50",
    iconBg: "bg-rose-100",
    icon: Dna,
  },
];
