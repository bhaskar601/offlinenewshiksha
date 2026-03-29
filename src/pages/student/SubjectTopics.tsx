import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, AlertCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getApiBaseUrl } from "@/lib/apiBase";
import { isCompetitiveClass } from "@/lib/studentClass";

const API_URL = getApiBaseUrl();

const SubjectTopics: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState("भौतिकी");
  const competitive = isCompetitiveClass();

  // 🧠 Manually define topics for Physics, Chemistry, and Biology
const chemistryTopics = [
  "अम्ल, क्षारक एवं लवण",
  "कार्बन, कोयला एवं पेट्रोलियम",
  "कृत्रिम रेशे और प्लास्टिक",
  "धातुएं और अधातुएं",
  "रासायनिक अभिक्रिया",
  "हवा"
];

const biologyTopics = [
  "किशोरावस्था",
  "कोशिका",
  "चित्रण",
  "सूक्ष्मजीव",
  "फसल प्रबंधन"
];

const physicsTopics = [
  "चुंबक",
  "ताप संचरण",
  "घर्षण",
  "ध्वनि",
  "प्रकाश",
  "प्रकाश संश्लेषण",
  "बल और दाब",
  "विद्युत धारा"
];

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);

      try {
        const studentCookie = localStorage.getItem("student");

        let className: string | null = null;
        if (studentCookie) {
          const parsed = JSON.parse(studentCookie);
          className = parsed?.student?.class || parsed?.class || null;
        }

        if (!className) {
          setError("Class information not found in cookie.");
          setTopics([]);
          return;
        }

        if (!subject) {
          setError("Subject is not specified.");
          setTopics([]);
          return;
        }

        const res = await axios.get(
          `${API_URL}/questions/topics/${className}/${subject}`
        );

        if (res.data && Array.isArray(res.data.topics)) {
          setTopics(res.data.topics);
        } else {
          setError("Invalid topics data received from server.");
          setTopics([]);
        }
      } catch {
        setError("Failed to load topics. Please try again later.");
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject]);

  const getSubjectIcon = (subjectName: string) => {
    const icons: { [key: string]: string } = {
      Math: '📐',
      Maths: '📐',
      'Science': '🔬',
      'English': '📚',
      'Hindi': '📖',
      'History': '🏛️',
      'Geography': '🌍',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Biology': '🧬',
      गणित: '📐',
      विज्ञान: '🔬',
    };
    return icons[subjectName] || '📝';
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 font-medium">Loading topics...</p>
      <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the topics</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
      <div className="max-w-md rounded-2xl border border-gray-200/80 bg-white p-8 text-center shadow-lg">
        <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-bold text-gray-800">No topics available</h3>
        <p className="mb-6 text-gray-600">
          {competitive
            ? 'No questions are published for this subject yet. Ask your teacher to add English content for the competitive track, or try another subject.'
            : 'कोई टॉपिक नहीं मिला। कृपया बाद में फिर से कोशिश करें।'}
        </p>
        <Link to="/student">
          <Button className="rounded-xl bg-edu-blue px-6 shadow-md hover:bg-edu-blue/90">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderTopicCards = (filteredTopics: string[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
      {filteredTopics.map((topic, index) => {
        const topicPath = encodeURIComponent(topic);
        const subPath = encodeURIComponent(subject || '');
        return (
        <Card 
          key={topic} 
          className="group overflow-hidden border-0 bg-white/90 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-3 text-left text-lg font-bold text-gray-900 transition-colors group-hover:text-edu-blue">
                {topic}
              </CardTitle>
              <Badge 
                variant="outline" 
                className="shrink-0 border-edu-purple/30 bg-gradient-to-r from-purple-50 to-blue-50 text-xs font-medium text-purple-800"
              >
                #{index + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4 text-edu-blue" />
              <span>{competitive ? 'Practice questions' : 'प्रैक्टिस प्रश्न'}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
  <Link to={`/student/practice/${subPath}/${topicPath}`} className="w-full">
    <Button 
      className="w-full rounded-xl bg-gradient-to-r from-edu-blue to-edu-purple py-5 font-semibold text-black shadow-md transition-all hover:shadow-lg"
      size="sm"
    >
      <Play className="mr-2 h-4 w-4 text-black" />
      {competitive ? 'Start quiz' : 'Start Quiz'}
    </Button>
  </Link>
</CardFooter>
        </Card>
        );
      })}
    </div>
  );

  const scienceCategories = ["भौतिकी", "रसायन", "जीवविज्ञान"];

 const getFilteredScienceTopics = () => {
  if (subject !== "विज्ञान") return topics;

  const map: Record<string, string[]> = {
    भौतिकी: physicsTopics,
    रसायन: chemistryTopics,
    जीवविज्ञान: biologyTopics,
  };

  const allowedTopics = map[selectedSub] || [];

  return allowedTopics.filter(topic => topics.includes(topic));
};

const filteredTopics = getFilteredScienceTopics();


  const subjectLabel = subject ? decodeURIComponent(subject) : '';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
      <Header />

      <main className="flex-1 px-4 py-8 sm:py-10">
        <div className="edu-container">
          <div className="mb-8 sm:mb-10">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-200/80 bg-white shadow-md">
                <span className="text-3xl" aria-hidden>{getSubjectIcon(subjectLabel)}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                  {competitive ? (
                    <>
                      Topics · <span className="text-edu-blue">{subjectLabel}</span>
                    </>
                  ) : (
                    <>
                      {subjectLabel} <span className="font-semibold text-gray-600">के टॉपिक</span>
                    </>
                  )}
                </h1>
                <p className="mt-2 text-gray-600 sm:text-lg">
                  {competitive
                    ? 'Pick a topic to practice. Content is in English for the competitive track.'
                    : 'प्रश्नों का अभ्यास शुरू करने के लिए एक टॉपिक चुनें'}
                </p>
              </div>
            </div>

            {!loading && !error && topics.length > 0 && (
              <Badge variant="secondary" className="rounded-full bg-edu-blue/10 px-3 py-1 text-edu-blue">
                {topics.length} {competitive ? 'topics' : 'उपलब्ध टॉपिक'}
              </Badge>
            )}
          </div>

          {/* Science Subject Tabs */}
          {subject === "विज्ञान" && (
            <div className="flex gap-4 mb-6">
              {scienceCategories.map((sub) => (
                <Button
                  key={sub}
                  variant={selectedSub === sub ? "default" : "outline"}
                  onClick={() => setSelectedSub(sub)}
                >
                  {sub}
                </Button>
              ))}
            </div>
          )}

          {/* Content */}
          {loading && <LoadingState />}
          {error && <ErrorState />}
          {!loading && !error && topics.length === 0 && <EmptyState />}
          {!loading && !error && topics.length > 0 && renderTopicCards(filteredTopics)}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubjectTopics;
