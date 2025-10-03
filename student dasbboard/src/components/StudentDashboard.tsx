import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { toast } from "sonner@2.0.3";
import { 
  LogOut, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Bell,
  MessageSquare,
  Mail,
  Heart,
  Star,
  Lightbulb,
  IndianRupee,
  GraduationCap,
  Building2,
  Users,
  FileText,
  ExternalLink,
  CreditCard,
  Banknote,
  Target,
  HandHeart,
  UserCheck,
  Share2,
  Briefcase,
  Phone,
  MapPin,
  Calendar1,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface PerformanceData {
  student: {
    id: number;
    name: string;
    grade: string;
    studentId: string;
    email: string;
  };
  notifications: {
    academicPerformanceReceived: boolean;
    counsellingAvailable: boolean;
    counsellingScheduled: string | null;
    recentNotifications: Array<{
      id: number;
      type: string;
      title: string;
      message: string;
      date: string;
      read: boolean;
    }>;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
    monthlyData: Array<{
      month: string;
      present: number;
      absent: number;
    }>;
  };
  grades: {
    overall: string;
    gpa: number;
    subjects: Array<{
      subject: string;
      grade: string;
      score: number;
    }>;
    monthlyProgress: Array<{
      month: string;
      gpa: number;
    }>;
  };
  activities: {
    totalActivities: number;
    completedActivities: number;
    completionRate: number;
    upcomingDeadlines: Array<{
      title: string;
      dueDate: string;
      subject: string;
    }>;
    recentSubmissions: Array<{
      title: string;
      submittedDate: string;
      grade: string;
      subject: string;
    }>;
  };
}

interface StudentDashboardProps {
  performanceData: PerformanceData;
  onLogout: () => void;
}

export default function StudentDashboard({ performanceData, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { student, attendance, grades, activities, notifications } = performanceData;
  
  const unreadNotifications = notifications.recentNotifications.filter(n => !n.read).length;

  // Motivational quotes for students
  const motivationalQuotes = [
    {
      quote: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      category: "Education",
      icon: "book"
    },
    {
      quote: "The beautiful thing about learning is that nobody can take it away from you.",
      author: "B.B. King",
      category: "Learning",
      icon: "lightbulb"
    },
    {
      quote: "Success is the sum of small efforts, repeated day in and day out.",
      author: "Robert Collier",
      category: "Success",
      icon: "star"
    },
    {
      quote: "Don't let what you cannot do interfere with what you can do.",
      author: "John Wooden",
      category: "Motivation",
      icon: "heart"
    },
    {
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "Dreams",
      icon: "star"
    },
    {
      quote: "It is during our darkest moments that we must focus to see the light.",
      author: "Aristotle",
      category: "Perseverance",
      icon: "lightbulb"
    },
    {
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "Confidence",
      icon: "heart"
    },
    {
      quote: "Learning never exhausts the mind.",
      author: "Leonardo da Vinci",
      category: "Learning",
      icon: "book"
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "Passion",
      icon: "heart"
    },
    {
      quote: "Excellence is not a skill, it's an attitude.",
      author: "Ralph Marston",
      category: "Excellence",
      icon: "star"
    },
    {
      quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
      author: "Ralph Waldo Emerson",
      category: "Inner Strength",
      icon: "lightbulb"
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "Courage",
      icon: "heart"
    }
  ];

  const getQuoteIcon = (iconType: string) => {
    switch (iconType) {
      case "book":
        return <BookOpen className="w-4 h-4" />;
      case "lightbulb":
        return <Lightbulb className="w-4 h-4" />;
      case "star":
        return <Star className="w-4 h-4" />;
      case "heart":
        return <Heart className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getQuoteColor = (category: string) => {
    const colors = {
      "Education": "border-blue-200 bg-blue-50 text-blue-700",
      "Learning": "border-green-200 bg-green-50 text-green-700",
      "Success": "border-purple-200 bg-purple-50 text-purple-700",
      "Motivation": "border-orange-200 bg-orange-50 text-orange-700",
      "Dreams": "border-pink-200 bg-pink-50 text-pink-700",
      "Perseverance": "border-indigo-200 bg-indigo-50 text-indigo-700",
      "Confidence": "border-teal-200 bg-teal-50 text-teal-700",
      "Passion": "border-red-200 bg-red-50 text-red-700",
      "Excellence": "border-yellow-200 bg-yellow-50 text-yellow-700",
      "Inner Strength": "border-cyan-200 bg-cyan-50 text-cyan-700",
      "Courage": "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
    return colors[category as keyof typeof colors] || "border-gray-200 bg-gray-50 text-gray-700";
  };

  // Financial Aid Data
  const governmentScholarships = [
    {
      id: 1,
      name: "Post Matric Scholarship Scheme",
      provider: "Ministry of Social Justice & Empowerment",
      amount: "₹3,000 - ₹12,000/year",
      eligibility: "SC/ST students, Family income < ₹2.5 lakh",
      deadline: "October 31, 2025",
      status: "Open",
      category: "Government",
      description: "For students pursuing higher secondary education and beyond.",
      applicationUrl: "https://scholarships.gov.in/",
      detailsUrl: "https://socialjustice.nic.in/schemes/post-matric-scholarship-scheme"
    },
    {
      id: 2,
      name: "National Scholarship Portal (NSP)",
      provider: "Government of India",
      amount: "₹10,000 - ₹20,000/year",
      eligibility: "Merit-based, Family income < ₹8 lakh",
      deadline: "November 30, 2025",
      status: "Open",
      category: "Government",
      description: "Central scheme for scholarships across various categories.",
      applicationUrl: "https://scholarships.gov.in/",
      detailsUrl: "https://scholarships.gov.in/aboutus"
    },
    {
      id: 3,
      name: "Chief Minister's Scholarship",
      provider: "State Government",
      amount: "₹5,000 - ₹15,000/year",
      eligibility: "State residents, Merit score > 75%",
      deadline: "December 15, 2025",
      status: "Open",
      category: "State",
      description: "State-level merit scholarship for deserving students.",
      applicationUrl: "https://mahadbt.maharashtra.gov.in/",
      detailsUrl: "https://mahadbt.maharashtra.gov.in/schemes"
    }
  ];

  const privateScholarships = [
    {
      id: 4,
      name: "Tata Scholarship Program",
      provider: "Tata Trusts",
      amount: "₹25,000 - ₹50,000/year",
      eligibility: "Merit-based, Family income < ₹4 lakh",
      deadline: "January 15, 2026",
      status: "Open",
      category: "Private",
      description: "Supporting students from economically disadvantaged backgrounds.",
      applicationUrl: "https://www.tatatrusts.org/our-work/individual-grants-programme/educational-grants",
      detailsUrl: "https://www.tatatrusts.org/"
    },
    {
      id: 5,
      name: "Sitaram Jindal Foundation",
      provider: "Jindal Foundation",
      amount: "₹30,000/year",
      eligibility: "Academic excellence, Rural background",
      deadline: "February 28, 2026",
      status: "Open",
      category: "NGO",
      description: "Scholarship for rural students pursuing higher education.",
      applicationUrl: "https://www.jindalfoundation.org/scholarships",
      detailsUrl: "https://www.jindalfoundation.org/"
    },
    {
      id: 6,
      name: "Dr. APJ Abdul Kalam Scholarship",
      provider: "Kalam Foundation",
      amount: "₹20,000/year",
      eligibility: "STEM students, Merit score > 80%",
      deadline: "March 31, 2026",
      status: "Open",
      category: "NGO",
      description: "Encouraging excellence in science and technology education.",
      applicationUrl: "https://www.ignitekalam.org/scholarships",
      detailsUrl: "https://www.ignitekalam.org/"
    }
  ];

  const loanOptions = [
    {
      id: 1,
      name: "Education Loan - Basic",
      provider: "State Bank of India",
      amount: "Up to ₹7.5 lakh",
      interestRate: "9.85% p.a.",
      type: "Traditional Bank Loan",
      repayment: "After course completion + 1 year",
      features: ["No collateral required", "Simple interest during study", "Flexible repayment"],
      applicationUrl: "https://www.sbi.co.in/web/personal-banking/loans/education-loans",
      detailsUrl: "https://www.sbi.co.in/web/personal-banking/loans/education-loans/education-loan"
    },
    {
      id: 2,
      name: "Micro Education Finance",
      provider: "Grameen Capital",
      amount: "₹10,000 - ₹1 lakh",
      interestRate: "12% p.a.",
      type: "Microfinance",
      repayment: "6 months after graduation",
      features: ["Quick approval", "Minimal documentation", "Community-based lending"],
      applicationUrl: "https://www.grameencapital.in/education-loan",
      detailsUrl: "https://www.grameencapital.in/"
    },
    {
      id: 3,
      name: "Income Share Agreement",
      provider: "Future Skills Academy",
      amount: "Full course fees",
      interestRate: "Pay 15% of income for 3 years",
      type: "ISA Model",
      repayment: "Only after getting job > ₹25,000/month",
      features: ["No upfront payment", "Income-based repayment", "Job guarantee program"],
      applicationUrl: "https://futureskills.org/isa-program",
      detailsUrl: "https://futureskills.org/"
    }
  ];

  const aiMatches = [
    {
      scholarship: "Post Matric Scholarship Scheme",
      matchScore: 95,
      reason: "High match based on your academic performance and family income criteria",
      nextStep: "Complete application on NSP portal"
    },
    {
      scholarship: "Tata Scholarship Program",
      matchScore: 88,
      reason: "Strong match based on academic merit and economic background",
      nextStep: "Submit essay and recommendation letters"
    },
    {
      scholarship: "Dr. APJ Abdul Kalam Scholarship",
      matchScore: 82,
      reason: "Good match for your excellent performance in Mathematics and Science",
      nextStep: "Prepare for online aptitude test"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-700 border-green-200";
      case "Closing Soon": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Closed": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Government": return <Building2 className="w-4 h-4" />;
      case "State": return <Building2 className="w-4 h-4" />;
      case "Private": return <Users className="w-4 h-4" />;
      case "NGO": return <Heart className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  // Crowdfunding Campaign Data
  const studentCampaign = {
    id: 1,
    studentName: "Alice Johnson",
    title: "Help Alice Complete Her Engineering Dreams",
    story: "Alice is a brilliant student pursuing Computer Science Engineering. Due to her father's recent job loss during the pandemic, the family is struggling to pay her tuition fees. She maintains a 3.7 GPA and is passionate about coding and technology.",
    targetAmount: 120000,
    raisedAmount: 67500,
    feePending: 52500,
    supporters: 23,
    daysLeft: 45,
    category: "Education",
    urgencyLevel: "Medium",
    academicDetails: {
      currentGPA: 3.7,
      attendance: 85,
      course: "B.Tech Computer Science",
      year: "2nd Year",
      previousAchievements: [
        "Dean's List - Semester 3",
        "Coding Competition Winner 2024",
        "Best Project Award - Data Structures"
      ]
    },
    familyBackground: {
      fatherOccupation: "Recently unemployed (due to company closure)",
      motherOccupation: "Homemaker",
      familyIncome: "Currently ₹15,000/month (savings)",
      siblings: "One younger sister in 10th grade"
    },
    recentContributions: [
      { donor: "Anonymous Alumni", amount: 5000, message: "Keep going! Education is the key to success.", date: "2025-01-15" },
      { donor: "Tech Corp Foundation", amount: 15000, message: "Supporting future tech leaders.", date: "2025-01-14" },
      { donor: "Local NGO - Educare", amount: 7500, message: "We believe in your potential.", date: "2025-01-13" }
    ]
  };

  // Alumni Support Network Data
  const alumniMentors = [
    {
      id: 1,
      name: "Rahul Sharma",
      graduationYear: 2018,
      currentRole: "Senior Software Engineer at Google",
      company: "Google India",
      location: "Bangalore",
      specialization: "Computer Science & AI",
      mentorshipType: "Both Financial & Career",
      biography: "Started from a similar financial background. Received scholarship support during college and now wants to give back to the community.",
      supportOffered: {
        financial: "₹25,000/semester",
        career: "Weekly mentoring sessions, internship opportunities",
        networking: "Tech industry connections"
      },
      previousStudentsHelped: 8,
      matchingCriteria: ["Computer Science", "Financial Need", "High Academic Performance"],
      availability: "Available",
      contactPreference: "Video calls on weekends"
    },
    {
      id: 2,
      name: "Priya Patel",
      graduationYear: 2019,
      currentRole: "Product Manager at Microsoft",
      company: "Microsoft India",
      location: "Hyderabad",
      specialization: "Engineering Management",
      mentorshipType: "Career Guidance",
      biography: "Overcame financial struggles through scholarships and part-time work. Passionate about helping students navigate career choices.",
      supportOffered: {
        financial: "Not currently offering",
        career: "Monthly career guidance, resume reviews, interview prep",
        networking: "Product management roles referrals"
      },
      previousStudentsHelped: 12,
      matchingCriteria: ["Any Engineering", "Career Guidance", "Leadership Skills"],
      availability: "Available",
      contactPreference: "Monthly video sessions"
    },
    {
      id: 3,
      name: "Dr. Amit Kumar",
      graduationYear: 2015,
      currentRole: "Research Scientist & Entrepreneur",
      company: "Own Startup - EduTech Solutions",
      location: "Pune",
      specialization: "Research & Innovation",
      mentorshipType: "Internship & Skill Development",
      biography: "Founded an EdTech startup after completing PhD. Offers internships and skill development programs for students in need.",
      supportOffered: {
        financial: "Paid internships worth ₹15,000/month",
        career: "Real-world project experience, startup ecosystem exposure",
        networking: "Startup and research community"
      },
      previousStudentsHelped: 25,
      matchingCriteria: ["Any STEM Field", "Innovation Interest", "Hands-on Learning"],
      availability: "Available",
      contactPreference: "In-person meetings preferred"
    }
  ];

  // Community Fundraising Statistics
  const communityStats = {
    totalStudentsHelped: 247,
    totalAmountRaised: 12450000,
    activeAlumni: 156,
    successStories: 89,
    averageTimeToFund: 28 // days
  };

  // Recent Success Stories
  const successStories = [
    {
      id: 1,
      studentName: "Rajesh Kumar",
      course: "B.Sc Physics",
      amountRaised: 85000,
      currentStatus: "Graduated with Honors, now working at ISRO",
      supportType: "Alumni Sponsorship + Community",
      year: 2024
    },
    {
      id: 2,
      studentName: "Sunita Rani",
      course: "B.Com Accounting",
      amountRaised: 45000,
      currentStatus: "Completed CA, now helping other students",
      supportType: "Crowdfunding Campaign",
      year: 2024
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "border-red-300 bg-red-50 text-red-700";
      case "Medium": return "border-orange-300 bg-orange-50 text-orange-700";
      case "Low": return "border-green-300 bg-green-50 text-green-700";
      default: return "border-gray-300 bg-gray-50 text-gray-700";
    }
  };

  // Function to handle scholarship/loan applications
  const handleApplyNow = (name: string, url: string) => {
    toast.success(`Redirecting to ${name} application portal...`, {
      description: "You will be redirected to the official website.",
      duration: 3000,
    });
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewDetails = (name: string, url: string) => {
    toast.info(`Opening ${name} details...`, {
      description: "Loading detailed information.",
      duration: 2000,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleConnectAlumni = (alumniName: string) => {
    toast.success(`Connection request sent to ${alumniName}!`, {
      description: "They will be notified and will contact you soon.",
      duration: 4000,
    });
  };

  const handleShareCampaign = () => {
    // Copy campaign link to clipboard
    const campaignLink = `https://eduportal.com/campaigns/${studentCampaign.id}`;
    navigator.clipboard.writeText(campaignLink).then(() => {
      toast.success("Campaign link copied to clipboard!", {
        description: "Share it with your friends and family.",
        duration: 3000,
      });
    }).catch(() => {
      toast.error("Failed to copy link", {
        description: "Please try again.",
        duration: 2000,
      });
    });
  };

  const handleScheduleCounselling = () => {
    toast.success("Counselling session request sent!", {
      description: "You will receive a confirmation email with the schedule.",
      duration: 4000,
    });
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "text-green-600 bg-green-100";
    if (grade.includes("B")) return "text-blue-600 bg-blue-100";
    return "text-orange-600 bg-orange-100";
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  // Prepare chart colors
  const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  // Prepare attendance pie chart data
  const attendancePieData = [
    { name: 'Present', value: attendance.presentDays, color: '#10B981' },
    { name: 'Absent', value: attendance.absentDays, color: '#EF4444' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Student Portal</h1>
              <p className="text-xs text-gray-600">{student.name} - {student.grade}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 py-2 bg-white border-b">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="financial">
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  <span className="hidden sm:inline">Aid</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="quotes">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="hidden sm:inline">Quotes</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <div className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="w-4 h-4 text-xs p-0 flex items-center justify-center">
                      {unreadNotifications}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Attendance</p>
                            <p className={`text-lg font-semibold ${getAttendanceColor(attendance.percentage)}`}>
                              {attendance.percentage}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">GPA</p>
                            <p className="text-lg font-semibold text-green-600">{grades.gpa}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <div>
                            <p className="text-xs text-gray-600">Overall Grade</p>
                            <Badge className={getGradeColor(grades.overall)}>
                              {grades.overall}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Activities</p>
                            <p className="text-lg font-semibold text-purple-600">
                              {activities.completionRate}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* GPA Progress Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        GPA Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={grades.monthlyProgress}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis 
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                              domain={[3.0, 4.0]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="gpa" 
                              stroke="#4F46E5" 
                              strokeWidth={2}
                              dot={{ fill: '#4F46E5', strokeWidth: 2, r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Counselling Status */}
                  {notifications.counsellingAvailable && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                          <MessageSquare className="w-4 h-4" />
                          Counselling Available
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-orange-700">
                            Your teacher has invited you for academic counselling to help improve your performance.
                          </p>
                          <Button 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleScheduleCounselling}
                          >
                            Schedule Counselling
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Upcoming Deadlines */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Upcoming Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activities.upcomingDeadlines.map((deadline, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <p className="text-sm font-medium">{deadline.title}</p>
                            <p className="text-xs text-gray-600">{deadline.subject}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {deadline.dueDate}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Attendance Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Attendance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-green-600">{attendance.presentDays}</p>
                          <p className="text-xs text-gray-600">Present Days</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-red-600">{attendance.absentDays}</p>
                          <p className="text-xs text-gray-600">Absent Days</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-blue-600">{attendance.totalDays}</p>
                          <p className="text-xs text-gray-600">Total Days</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Attendance Rate</span>
                          <span className={`font-medium ${getAttendanceColor(attendance.percentage)}`}>
                            {attendance.percentage}%
                          </span>
                        </div>
                        <Progress value={attendance.percentage} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Attendance Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Monthly Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={attendance.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis 
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                            />
                            <Bar dataKey="present" fill="#10B981" />
                            <Bar dataKey="absent" fill="#EF4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Present</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Absent</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attendance Pie Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Attendance Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={attendancePieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={50}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {attendancePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Present ({attendance.presentDays})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>Absent ({attendance.absentDays})</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Grades Tab */}
            <TabsContent value="grades" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Overall Performance */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Overall Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{grades.gpa}</p>
                        <p className="text-sm text-gray-600">Current GPA</p>
                        <Badge className={`mt-2 ${getGradeColor(grades.overall)}`}>
                          {grades.overall}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subject Grades */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Subject Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {grades.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{subject.subject}</p>
                            <p className="text-sm text-gray-600">Score: {subject.score}%</p>
                          </div>
                          <Badge className={getGradeColor(subject.grade)}>
                            {subject.grade}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Grades Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Subject Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={grades.subjects} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              type="number" 
                              fontSize={10}
                              tick={{ fontSize: 10 }}
                              domain={[0, 100]}
                            />
                            <YAxis 
                              type="category" 
                              dataKey="subject" 
                              fontSize={8}
                              tick={{ fontSize: 8 }}
                              width={60}
                            />
                            <Bar dataKey="score" fill="#4F46E5" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Notification Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Mail className="w-4 h-4 text-blue-600" />
                            {notifications.academicPerformanceReceived ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">Academic Report</p>
                          <p className={`text-xs font-medium ${notifications.academicPerformanceReceived ? 'text-green-600' : 'text-gray-500'}`}>
                            {notifications.academicPerformanceReceived ? 'Received' : 'Pending'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <MessageSquare className="w-4 h-4 text-orange-600" />
                            {notifications.counsellingAvailable ? (
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">Counselling</p>
                          <p className={`text-xs font-medium ${notifications.counsellingAvailable ? 'text-orange-600' : 'text-green-600'}`}>
                            {notifications.counsellingAvailable ? 'Available' : 'Not Required'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Counselling Status Card */}
                  <Card className={notifications.counsellingAvailable ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-base flex items-center gap-2 ${notifications.counsellingAvailable ? 'text-orange-700' : 'text-green-700'}`}>
                        <MessageSquare className="w-4 h-4" />
                        Counselling Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {notifications.counsellingAvailable ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span className="font-medium text-orange-700">Counselling Invitation</span>
                            </div>
                            <p className="text-sm text-orange-700 mb-3">
                              Your teacher has recommended academic counselling to help improve your performance and address any challenges you may be facing.
                            </p>
                            <div className="space-y-2 text-xs text-orange-600">
                              <p>• Personalized academic guidance</p>
                              <p>• Study strategy development</p>
                              <p>• Performance improvement planning</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={handleScheduleCounselling}
                          >
                            Schedule Counselling Session
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center p-3">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-700 font-medium mb-1">You're doing great!</p>
                          <p className="text-xs text-green-600">
                            No counselling required at this time. Keep up the excellent work!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Notifications */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {notifications.recentNotifications.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications yet</p>
                          <p className="text-xs">Check back later for updates</p>
                        </div>
                      ) : (
                        notifications.recentNotifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {notification.type === 'academic_performance' ? (
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <MessageSquare className="w-4 h-4 text-orange-600" />
                                  )}
                                  <span className="font-medium text-sm">{notification.title}</span>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                                <p className="text-xs text-gray-500">{notification.date}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Activity Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-blue-600">{activities.totalActivities}</p>
                          <p className="text-xs text-gray-600">Total</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-600">{activities.completedActivities}</p>
                          <p className="text-xs text-gray-600">Completed</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-purple-600">{activities.completionRate}%</p>
                          <p className="text-xs text-gray-600">Rate</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Progress</span>
                          <span className="font-medium text-purple-600">{activities.completionRate}%</span>
                        </div>
                        <Progress value={activities.completionRate} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Submissions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Recent Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activities.recentSubmissions.map((submission, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div>
                            <p className="font-medium">{submission.title}</p>
                            <p className="text-xs text-gray-600">{submission.subject} • {submission.submittedDate}</p>
                          </div>
                          <Badge className={getGradeColor(submission.grade)}>
                            {submission.grade}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Upcoming Deadlines */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Upcoming Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {activities.upcomingDeadlines.map((deadline, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <p className="font-medium">{deadline.title}</p>
                            <p className="text-xs text-gray-600">{deadline.subject}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {deadline.dueDate}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Financial Aid Tab */}
            <TabsContent value="financial" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                        <IndianRupee className="w-4 h-4" />
                        Financial Aid & Scholarships
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        Find scholarships, loans, and financial support for your education
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* AI-Powered Matches */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-green-700">
                        <Target className="w-4 h-4" />
                        AI-Recommended Matches
                      </CardTitle>
                      <CardDescription className="text-green-600">
                        Based on your profile, academic performance, and background
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {aiMatches.map((match, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-green-800">{match.scholarship}</span>
                            <Badge className="bg-green-200 text-green-800">
                              {match.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700 mb-2">{match.reason}</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">{match.nextStep}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Government Scholarships */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        Government Scholarships
                      </CardTitle>
                      <CardDescription>
                        Central and state government scholarship programs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {governmentScholarships.map((scholarship) => (
                        <div key={scholarship.id} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(scholarship.category)}
                              <span className="font-medium text-blue-800">{scholarship.name}</span>
                            </div>
                            <Badge className={getStatusColor(scholarship.status)}>
                              {scholarship.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700 mb-2">{scholarship.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 mb-3">
                            <div>
                              <span className="font-medium">Amount:</span> {scholarship.amount}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> {scholarship.deadline}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Eligibility:</span> {scholarship.eligibility}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleApplyNow(scholarship.name, scholarship.applicationUrl)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Apply Now
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(scholarship.name, scholarship.detailsUrl)}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Private & NGO Scholarships */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        Private & NGO Scholarships
                      </CardTitle>
                      <CardDescription>
                        Scholarships from private organizations and NGOs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {privateScholarships.map((scholarship) => (
                        <div key={scholarship.id} className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(scholarship.category)}
                              <span className="font-medium text-purple-800">{scholarship.name}</span>
                            </div>
                            <Badge className={getStatusColor(scholarship.status)}>
                              {scholarship.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-700 mb-2">{scholarship.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-purple-600 mb-3">
                            <div>
                              <span className="font-medium">Amount:</span> {scholarship.amount}
                            </div>
                            <div>
                              <span className="font-medium">Deadline:</span> {scholarship.deadline}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Eligibility:</span> {scholarship.eligibility}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleApplyNow(scholarship.name, scholarship.applicationUrl)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Apply Now
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(scholarship.name, scholarship.detailsUrl)}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Student Loans & Financing */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        Student Loans & Financing
                      </CardTitle>
                      <CardDescription>
                        Education loans and micro-financing options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loanOptions.map((loan) => (
                        <div key={loan.id} className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4 text-orange-600" />
                              <span className="font-medium text-orange-800">{loan.name}</span>
                            </div>
                            <Badge className="bg-orange-200 text-orange-800">
                              {loan.type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-orange-600 mb-3">
                            <div>
                              <span className="font-medium">Amount:</span> {loan.amount}
                            </div>
                            <div>
                              <span className="font-medium">Interest:</span> {loan.interestRate}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Repayment:</span> {loan.repayment}
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-medium text-orange-700 mb-1">Key Features:</p>
                            <ul className="text-xs text-orange-600 space-y-1">
                              {loan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-orange-600 hover:bg-orange-700"
                              onClick={() => handleApplyNow(loan.name, loan.applicationUrl)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Apply Now
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(loan.name, loan.detailsUrl)}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Learn More
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Crowdfunding Campaign */}
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                        <HandHeart className="w-4 h-4" />
                        Your Crowdfunding Campaign
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        Community support for your educational journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Campaign Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Progress</span>
                          <span className="text-sm text-blue-600">
                            ₹{studentCampaign.raisedAmount.toLocaleString()} / ₹{studentCampaign.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(studentCampaign.raisedAmount / studentCampaign.targetAmount) * 100} 
                          className="h-3 bg-blue-100" 
                        />
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-2 bg-white rounded-lg border border-blue-200">
                            <p className="text-lg font-semibold text-blue-700">{studentCampaign.supporters}</p>
                            <p className="text-xs text-blue-600">Supporters</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-blue-200">
                            <p className="text-lg font-semibold text-green-700">₹{studentCampaign.feePending.toLocaleString()}</p>
                            <p className="text-xs text-blue-600">Still Needed</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-blue-200">
                            <p className="text-lg font-semibold text-orange-700">{studentCampaign.daysLeft}</p>
                            <p className="text-xs text-blue-600">Days Left</p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Contributions */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-800">Recent Support</p>
                        {studentCampaign.recentContributions.slice(0, 2).map((contribution, index) => (
                          <div key={index} className="p-2 bg-white rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-blue-800">{contribution.donor}</span>
                              <span className="text-sm font-semibold text-green-600">₹{contribution.amount.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-blue-600 italic">"{contribution.message}"</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 flex-1"
                          onClick={handleShareCampaign}
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share Campaign
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-300 text-blue-700"
                          onClick={() => toast.info("Story editor opening soon!", { duration: 2000 })}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Edit Story
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alumni Support Network */}
                  <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                        <UserCheck className="w-4 h-4" />
                        Alumni Support Network
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        Connect with alumni mentors and sponsors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Matched Alumni */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-purple-800">Recommended Mentors</p>
                        {alumniMentors.slice(0, 2).map((alumni) => (
                          <div key={alumni.id} className="p-3 bg-white rounded-lg border border-purple-200">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-purple-800">{alumni.name}</p>
                                <p className="text-sm text-purple-600">{alumni.currentRole}</p>
                                <p className="text-xs text-purple-500">{alumni.company} • {alumni.location}</p>
                              </div>
                              <Badge className="bg-purple-200 text-purple-800 text-xs">
                                {alumni.graduationYear}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <p className="text-xs text-purple-700">{alumni.biography}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {alumni.supportOffered.financial !== "Not currently offering" && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <DollarSign className="w-3 h-3" />
                                    <span>Financial Support</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Briefcase className="w-3 h-3" />
                                  <span>Career Guidance</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-purple-600 hover:bg-purple-700 text-xs"
                                onClick={() => handleConnectAlumni(alumni.name)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Connect
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-purple-300 text-purple-700 text-xs"
                                onClick={() => toast.info(`Viewing ${alumni.name}'s profile...`, { duration: 2000 })}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-700">
                        <ChevronRight className="w-3 h-3 mr-1" />
                        View All Alumni Mentors
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Community Impact */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-green-700">
                        <Users className="w-4 h-4" />
                        Community Impact
                      </CardTitle>
                      <CardDescription className="text-green-600">
                        See how our community supports education
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-xl font-semibold text-green-700">{communityStats.totalStudentsHelped}</p>
                          <p className="text-xs text-green-600">Students Helped</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-xl font-semibold text-green-700">₹{(communityStats.totalAmountRaised / 10000000).toFixed(1)}Cr</p>
                          <p className="text-xs text-green-600">Total Raised</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-xl font-semibold text-green-700">{communityStats.activeAlumni}</p>
                          <p className="text-xs text-green-600">Active Alumni</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-xl font-semibold text-green-700">{communityStats.successStories}</p>
                          <p className="text-xs text-green-600">Success Stories</p>
                        </div>
                      </div>

                      {/* Success Stories */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-800">Recent Success Stories</p>
                        {successStories.map((story) => (
                          <div key={story.id} className="p-2 bg-white rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-green-800">{story.studentName}</span>
                              <Badge className="bg-green-200 text-green-800 text-xs">
                                {story.year}
                              </Badge>
                            </div>
                            <p className="text-xs text-green-600">{story.course} • ₹{story.amountRaised.toLocaleString()} raised</p>
                            <p className="text-xs text-green-700 font-medium">{story.currentStatus}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Financial Support */}
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        Emergency Financial Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-red-700">
                          Facing immediate financial difficulties? We're here to help.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Contact Counselor
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                            <Users className="w-3 h-3 mr-1" />
                            Student Helpline
                          </Button>
                        </div>
                        <div className="text-xs text-red-600">
                          <p>📞 Emergency Helpline: 1800-111-565</p>
                          <p>📧 Email: financial.aid@school.edu</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Motivational Quotes Tab */}
            <TabsContent value="quotes" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <Card className="border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                        <Heart className="w-4 h-4" />
                        Daily Inspiration
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        Motivational quotes to inspire your learning journey
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Quote of the Day */}
                  <Card className="border-2 border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
                        <Star className="w-4 h-4" />
                        Quote of the Day
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-3">
                        <blockquote className="text-lg font-medium text-yellow-800 italic">
                          "{motivationalQuotes[0].quote}"
                        </blockquote>
                        <p className="text-sm text-yellow-600">— {motivationalQuotes[0].author}</p>
                        <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
                          {motivationalQuotes[0].category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Quotes Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {motivationalQuotes.slice(1).map((quote, index) => (
                      <Card key={index} className={`border ${getQuoteColor(quote.category)}`}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                {getQuoteIcon(quote.icon)}
                              </div>
                              <blockquote className="text-sm font-medium italic flex-1">
                                "{quote.quote}"
                              </blockquote>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs opacity-80">— {quote.author}</p>
                              <Badge variant="outline" className="text-xs">
                                {quote.category}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Inspiration Footer */}
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700">Keep Growing!</span>
                        <Star className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-green-600">
                        Remember, every small step forward is progress. You've got this!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}