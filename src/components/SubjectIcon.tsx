
import React from 'react';
import { Book, BookText, Calculator, Dna, FlaskConical, Microscope, Users, Atom } from 'lucide-react';

interface SubjectIconProps {
  subject: string;
  size?: number;
  className?: string;
}

function normalizeSubject(subject: string): string {
  try {
    return decodeURIComponent(subject).trim();
  } catch {
    return subject.trim();
  }
}

const SubjectIcon: React.FC<SubjectIconProps> = ({ subject, size = 24, className = '' }) => {
  const raw = normalizeSubject(subject);
  const key = raw.toLowerCase();

  if (raw === 'गणित' || key === 'maths' || key === 'mathematics') {
    return <Calculator size={size} className={`text-edu-blue ${className}`} />;
  }
  if (raw === 'विज्ञान' || key === 'science') {
    return <FlaskConical size={size} className={`text-edu-green ${className}`} />;
  }
  if (key === 'physics') {
    return <Atom size={size} className={`text-violet-600 ${className}`} />;
  }
  if (key === 'chemistry') {
    return <Microscope size={size} className={`text-emerald-600 ${className}`} />;
  }
  if (key === 'biology') {
    return <Dna size={size} className={`text-rose-600 ${className}`} />;
  }
  if (raw === 'सामाजिक विज्ञान' || key === 'social') {
    return <Users size={size} className={`text-edu-purple ${className}`} />;
  }
  if (raw === 'मानसिक क्षमता परीक्षण' || key === 'mat') {
    return <BookText size={size} className={`text-edu-yellow ${className}`} />;
  }
  if (key === 'vocab') {
    return <Book size={size} className={`text-indigo-600 ${className}`} />;
  }

  return <Book size={size} className={`text-gray-500 ${className}`} />;
};

export default SubjectIcon;
