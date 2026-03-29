import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  Play, 
  ArrowRight,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubjectIcon from '@/components/SubjectIcon';
import { COMPETITIVE_PRACTICE_SUBJECTS, DEFAULT_PRACTICE_SUBJECTS } from '@/config/practiceSubjects';
import { isCompetitiveClass } from '@/lib/studentClass';

const StudentPractice: React.FC = () => {
  const competitive = isCompetitiveClass();

  const subjectRows = useMemo(
    () => (competitive ? COMPETITIVE_PRACTICE_SUBJECTS : DEFAULT_PRACTICE_SUBJECTS),
    [competitive],
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <Header />
      
      <main className="flex-1 px-4 py-8 sm:py-10">
        <div className="edu-container">
          
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {competitive ? (
              <Badge className="mb-4 border-amber-200 bg-amber-50 px-3 py-1 text-amber-900 hover:bg-amber-100">
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                Competitive · English medium
              </Badge>
            ) : (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-edu-blue to-edu-purple px-4 py-2 text-sm font-semibold text-white shadow-md">
                <Sparkles className="h-4 w-4" />
                Practice makes perfect
              </div>
            )}

            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              {competitive ? (
                <>
                  Choose a <span className="bg-gradient-to-r from-edu-blue to-edu-purple bg-clip-text text-transparent">subject</span>
                </>
              ) : (
                <>
                  प्रश्न <span className="bg-gradient-to-r from-edu-blue to-edu-purple bg-clip-text text-transparent">अभ्यास</span>
                </>
              )}
            </h1>

            <p className="text-base text-gray-600 sm:text-lg">
              {competitive
                ? 'Select Maths, Physics, Chemistry, or Biology. All practice content is shown in English.'
                : 'अपना विषय चुनें और हमारे प्रश्न बैंक से अभ्यास शुरू करें'}
            </p>
          </div>

          <div
            className={`grid gap-5 sm:gap-6 ${
              competitive
                ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            }`}
          >
            {subjectRows.map((subject) => {
              const IconComp = subject.icon;
              const href = `/student/practice/${subject.id}`;
              return (
                <Card 
                  key={subject.id}
                  className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${subject.bgColor}/40`}
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.12]`} />

                  <CardHeader className="relative z-10 pb-2">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner ${subject.iconBg} transition-transform duration-300 group-hover:scale-105`}>
                        {competitive ? (
                          <IconComp className="h-7 w-7 text-gray-800" strokeWidth={2} />
                        ) : (
                          <SubjectIcon subject={subject.id} size={28} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <CardTitle className="text-lg font-bold text-gray-900 transition-colors group-hover:text-gray-800 sm:text-xl">
                          {subject.name}
                        </CardTitle>
                        <CardDescription className="mt-1.5 text-sm leading-relaxed text-gray-600">
                          {subject.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 pb-2" />

                  <CardFooter className="relative z-10 pt-0">
                    <Link to={href} className="w-full">
                      <Button 
                        className={`w-full rounded-xl bg-gradient-to-r ${subject.color} py-5 text-base font-semibold text-black shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
                        size="sm"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {competitive ? 'Start practice' : 'अभ्यास शुरू करें'}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {!competitive && (
            <div className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-r from-edu-blue to-edu-purple p-8 text-center text-white shadow-xl sm:p-10">
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                  क्या आप अपने प्रदर्शन को बेहतर बनाने के लिए तैयार हैं?
                </h2>
                <p className="text-blue-100">
                  व्यापक प्रश्न बैंक से अभ्यास करें और परीक्षा के लिए आत्मविश्वास बनाएं।
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentPractice;
