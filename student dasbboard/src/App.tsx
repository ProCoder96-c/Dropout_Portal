import React, { useState } from "react";

// Import page components
import LoginPage from "./components/LoginPage";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import { Toaster } from "./components/ui/sonner";

// Function to calculate dropout risk percentage
const calculateDropoutRisk = (student: any) => {
  // Convert grade to numeric score
  const gradeToScore = (grade: string) => {
    if (grade.includes("A+")) return 95;
    if (grade.includes("A")) return 90;
    if (grade.includes("B+")) return 85;
    if (grade.includes("B")) return 80;
    if (grade.includes("C+")) return 75;
    if (grade.includes("C")) return 70;
    return 65;
  };

  const attendanceScore = student.attendance; // 0-100
  const gradeScore = gradeToScore(student.overallGrade); // 0-100  
  const assignmentCompletion = (student.completedAssignments / student.assignments) * 100; // 0-100
  const activityScore = new Date(student.lastActivity) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 100 : 50;

  // Calculate risk factors (higher values = lower risk)
  const attendanceRisk = 100 - attendanceScore;
  const gradeRisk = 100 - gradeScore;
  const assignmentRisk = 100 - assignmentCompletion;
  const activityRisk = 100 - activityScore;

  // Weighted average of risk factors
  const totalRisk = (attendanceRisk * 0.3 + gradeRisk * 0.3 + assignmentRisk * 0.25 + activityRisk * 0.15);
  
  return Math.min(Math.max(Math.round(totalRisk), 0), 100);
};

// Mock data for students
export const STUDENTS_DATA = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@school.edu",
    grade: "10th",
    subject: "Mathematics",
    attendance: 85,
    overallGrade: "A-",
    gpa: 3.7,
    assignments: 12,
    completedAssignments: 11,
    lastActivity: "2025-01-15",
    phoneNumber: "+1 (555) 123-4567",
    parentContact: "Mary Johnson - +1 (555) 123-4568",
    dropoutRisk: 0,
    notificationsSent: {
      academicPerformance: true,
      counsellingInvite: false
    }
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@school.edu",
    grade: "10th",
    subject: "Mathematics",
    attendance: 92,
    overallGrade: "A",
    gpa: 3.9,
    assignments: 12,
    completedAssignments: 12,
    lastActivity: "2025-01-16",
    phoneNumber: "+1 (555) 234-5678",
    parentContact: "John Smith - +1 (555) 234-5679",
    dropoutRisk: 0,
    notificationsSent: {
      academicPerformance: true,
      counsellingInvite: false
    }
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol.davis@school.edu",
    grade: "10th",
    subject: "Mathematics",
    attendance: 65,
    overallGrade: "C+",
    gpa: 2.8,
    assignments: 12,
    completedAssignments: 8,
    lastActivity: "2025-01-10",
    phoneNumber: "+1 (555) 345-6789",
    parentContact: "Linda Davis - +1 (555) 345-6790",
    dropoutRisk: 0,
    notificationsSent: {
      academicPerformance: false,
      counsellingInvite: false
    }
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@school.edu",
    grade: "10th",
    subject: "Mathematics",
    attendance: 88,
    overallGrade: "A-",
    gpa: 3.6,
    assignments: 12,
    completedAssignments: 11,
    lastActivity: "2025-01-16",
    phoneNumber: "+1 (555) 456-7890",
    parentContact: "Robert Wilson - +1 (555) 456-7891",
    dropoutRisk: 0,
    notificationsSent: {
      academicPerformance: true,
      counsellingInvite: false
    }
  },
  {
    id: 5,
    name: "Emma Brown",
    email: "emma.brown@school.edu",
    grade: "10th",
    subject: "Mathematics",
    attendance: 95,
    overallGrade: "A+",
    gpa: 4.0,
    assignments: 12,
    completedAssignments: 12,
    lastActivity: "2025-01-16",
    phoneNumber: "+1 (555) 567-8901",
    parentContact: "Sarah Brown - +1 (555) 567-8902",
    dropoutRisk: 0,
    notificationsSent: {
      academicPerformance: true,
      counsellingInvite: false
    }
  },
  {
    id: 6,
    name: "Frank Miller",
    email: "frank.miller@school.edu",
    grade: "10th",
    subject: "Mathematics",
    attendance: 58,
    overallGrade: "D+",
    gpa: 2.2,
    assignments: 12,
    completedAssignments: 7,
    lastActivity: "2025-01-08",
    phoneNumber: "+1 (555) 678-9012",
    parentContact: "Michael Miller - +1 (555) 678-9013",
    dropoutRisk: 0,
    notificationsSent: {
      academicPerformance: false,
      counsellingInvite: false
    }
  }
].map(student => ({
  ...student,
  dropoutRisk: calculateDropoutRisk(student)
}));

// Mock data for student performance (for student dashboard)
export const STUDENT_PERFORMANCE_DATA = {
  student: {
    id: 1,
    name: "Alice Johnson",
    grade: "10th",
    studentId: "STU001",
    email: "alice.johnson@school.edu"
  },
  notifications: {
    academicPerformanceReceived: true,
    counsellingAvailable: false,
    counsellingScheduled: null,
    recentNotifications: [
      {
        id: 1,
        type: "academic_performance",
        title: "Academic Performance Update",
        message: "Your monthly academic performance report is now available.",
        date: "2025-01-15",
        read: true
      }
    ]
  },
  attendance: {
    totalDays: 180,
    presentDays: 153,
    absentDays: 27,
    percentage: 85,
    monthlyData: [
      { month: "Sep", present: 20, absent: 2 },
      { month: "Oct", present: 18, absent: 4 },
      { month: "Nov", present: 19, absent: 3 },
      { month: "Dec", present: 16, absent: 6 },
      { month: "Jan", present: 12, absent: 1 }
    ]
  },
  grades: {
    overall: "A-",
    gpa: 3.7,
    subjects: [
      { subject: "Mathematics", grade: "A", score: 92 },
      { subject: "Science", grade: "A-", score: 88 },
      { subject: "English", grade: "B+", score: 85 },
      { subject: "History", grade: "A", score: 90 },
      { subject: "Art", grade: "A+", score: 95 }
    ],
    monthlyProgress: [
      { month: "Sep", gpa: 3.2 },
      { month: "Oct", gpa: 3.4 },
      { month: "Nov", gpa: 3.6 },
      { month: "Dec", gpa: 3.5 },
      { month: "Jan", gpa: 3.7 }
    ]
  },
  activities: {
    totalActivities: 15,
    completedActivities: 13,
    completionRate: 87,
    upcomingDeadlines: [
      { title: "Math Assignment 3", dueDate: "2025-01-20", subject: "Mathematics" },
      { title: "Science Project", dueDate: "2025-01-25", subject: "Science" },
      { title: "History Essay", dueDate: "2025-01-28", subject: "History" }
    ],
    recentSubmissions: [
      { title: "Math Quiz 2", submittedDate: "2025-01-15", grade: "A", subject: "Mathematics" },
      { title: "Art Portfolio", submittedDate: "2025-01-14", grade: "A+", subject: "Art" },
      { title: "English Essay", submittedDate: "2025-01-12", grade: "B+", subject: "English" }
    ]
  }
};

type ViewMode = "login" | "teacher" | "student";
type UserRole = "teacher" | "student" | null;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS_DATA[0]);
  const [studentsData, setStudentsData] = useState(STUDENTS_DATA);
  const [studentPerformanceData, setStudentPerformanceData] = useState(STUDENT_PERFORMANCE_DATA);

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    if (role === "teacher") {
      setViewMode("teacher");
    } else if (role === "student") {
      setViewMode("student");
    }
  };

  const handleLogout = () => {
    setViewMode("login");
    setUserRole(null);
  };

  const handleStudentSelection = (student: typeof STUDENTS_DATA[0]) => {
    setSelectedStudent(student);
  };

  const handleSendNotification = (studentId: number, notificationType: 'academicPerformance' | 'counsellingInvite') => {
    setStudentsData(prev => prev.map(student => 
      student.id === studentId 
        ? {
            ...student,
            notificationsSent: {
              ...student.notificationsSent,
              [notificationType]: true
            }
          }
        : student
    ));

    // Update student performance data if it's the current student
    if (studentId === 1) {
      setStudentPerformanceData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          academicPerformanceReceived: notificationType === 'academicPerformance' ? true : prev.notifications.academicPerformanceReceived,
          counsellingAvailable: notificationType === 'counsellingInvite' ? true : prev.notifications.counsellingAvailable,
          recentNotifications: [
            ...prev.notifications.recentNotifications,
            {
              id: Date.now(),
              type: notificationType,
              title: notificationType === 'academicPerformance' ? 'Academic Performance Update' : 'Counselling Invitation',
              message: notificationType === 'academicPerformance' 
                ? 'Your academic performance report has been sent by your teacher.'
                : 'You have been invited for academic counselling. Please check your schedule.',
              date: new Date().toISOString().split('T')[0],
              read: false
            }
          ]
        }
      }));
    }
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case "login":
        return <LoginPage onRoleSelect={handleRoleSelection} />;
      
      case "teacher":
        return (
          <TeacherDashboard 
            students={studentsData}
            onLogout={handleLogout}
            selectedStudent={selectedStudent}
            onStudentSelect={handleStudentSelection}
            onSendNotification={handleSendNotification}
          />
        );
      
      case "student":
        return (
          <StudentDashboard 
            performanceData={studentPerformanceData}
            onLogout={handleLogout}
          />
        );
      
      default:
        return <LoginPage onRoleSelect={handleRoleSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Container */}
      <div className="w-full min-h-screen bg-[#ffffff] relative">
        {renderCurrentView()}
      </div>
    </div>
  );
}