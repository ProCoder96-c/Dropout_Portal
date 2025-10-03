import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Users, 
  LogOut, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Bell,
  AlertTriangle,
  Send,
  CheckCircle,
  XCircle,
  MessageSquare
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  subject: string;
  attendance: number;
  overallGrade: string;
  gpa: number;
  assignments: number;
  completedAssignments: number;
  lastActivity: string;
  phoneNumber: string;
  parentContact: string;
  dropoutRisk: number;
  notificationsSent: {
    academicPerformance: boolean;
    counsellingInvite: boolean;
  };
}

interface TeacherDashboardProps {
  students: Student[];
  onLogout: () => void;
  selectedStudent: Student;
  onStudentSelect: (student: Student) => void;
  onSendNotification: (studentId: number, notificationType: 'academicPerformance' | 'counsellingInvite') => void;
}

export default function TeacherDashboard({ 
  students, 
  onLogout, 
  selectedStudent, 
  onStudentSelect,
  onSendNotification
}: TeacherDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-600 bg-green-100";
    if (attendance >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "text-green-600 bg-green-100";
    if (grade.includes("B")) return "text-blue-600 bg-blue-100";
    if (grade.includes("C")) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getDropoutRiskColor = (risk: number) => {
    if (risk < 25) return "text-green-600 bg-green-100";
    if (risk < 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getDropoutRiskLevel = (risk: number) => {
    if (risk < 25) return "Low";
    if (risk < 40) return "Medium";
    return "High";
  };

  // Calculate class statistics
  const classStats = {
    totalStudents: students.length,
    averageAttendance: Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length),
    averageCompletion: Math.round(students.reduce((sum, s) => sum + (s.completedAssignments / s.assignments * 100), 0) / students.length),
    activeStudents: students.filter(s => new Date(s.lastActivity) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    atRiskStudents: students.filter(s => s.dropoutRisk >= 40).length,
    averageDropoutRisk: Math.round(students.reduce((sum, s) => sum + s.dropoutRisk, 0) / students.length)
  };

  const atRiskStudents = students.filter(s => s.dropoutRisk >= 40);
  const pendingNotifications = students.filter(s => !s.notificationsSent.academicPerformance).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Teacher Dashboard</h1>
              <p className="text-xs text-gray-600">Mathematics - Grade 10</p>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="notifications">
                <div className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Alerts
                  {pendingNotifications > 0 && (
                    <Badge variant="destructive" className="w-4 h-4 text-xs p-0 flex items-center justify-center">
                      {pendingNotifications}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Class Statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <div>
                            <p className="text-xs text-gray-600">Total Students</p>
                            <p className="text-lg font-semibold">{classStats.totalStudents}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Avg Attendance</p>
                            <p className="text-lg font-semibold">{classStats.averageAttendance}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Avg Completion</p>
                            <p className="text-lg font-semibold">{classStats.averageCompletion}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-xs text-gray-600">At Risk Students</p>
                            <p className="text-lg font-semibold text-red-600">{classStats.atRiskStudents}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dropout Risk Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Dropout Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div>
                          <p className="text-green-600 font-semibold">
                            {students.filter(s => s.dropoutRisk < 25).length}
                          </p>
                          <p className="text-gray-600">Low Risk</p>
                        </div>
                        <div>
                          <p className="text-yellow-600 font-semibold">
                            {students.filter(s => s.dropoutRisk >= 25 && s.dropoutRisk < 40).length}
                          </p>
                          <p className="text-gray-600">Medium Risk</p>
                        </div>
                        <div>
                          <p className="text-red-600 font-semibold">
                            {students.filter(s => s.dropoutRisk >= 40).length}
                          </p>
                          <p className="text-gray-600">High Risk</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {atRiskStudents.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-red-600">High Risk Students:</p>
                          {atRiskStudents.slice(0, 3).map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-red-600">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{student.name}</p>
                                  <p className="text-xs text-gray-600">Risk: {student.dropoutRisk}%</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="h-6 text-xs px-2"
                                onClick={() => setSelectedStudent(student)}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="h-full m-0">
              <div className="h-full flex flex-col">
                {/* Search */}
                <div className="p-4 bg-white border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Students List */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {filteredStudents.map((student) => (
                      <Card 
                        key={student.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedStudent.id === student.id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => onStudentSelect(student)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="font-medium text-indigo-600">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium">{student.name}</h3>
                                <p className="text-xs text-gray-600">{student.email}</p>
                              </div>
                            </div>
                            <Badge className={getGradeColor(student.overallGrade)}>
                              {student.overallGrade}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">Attendance:</span>
                              <Badge size="sm" className={getAttendanceColor(student.attendance)}>
                                {student.attendance}%
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">Assignments:</span>
                              <span className="font-medium">{student.completedAssignments}/{student.assignments}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
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
                        Notification Center
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-lg font-semibold text-blue-600">
                            {students.filter(s => s.notificationsSent.academicPerformance).length}
                          </p>
                          <p className="text-xs text-gray-600">Performance Reports Sent</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-lg font-semibold text-orange-600">
                            {students.filter(s => s.notificationsSent.counsellingInvite).length}
                          </p>
                          <p className="text-xs text-gray-600">Counselling Invites Sent</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Send Academic Performance Reports */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Academic Performance Reports
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Send academic performance reports including marks, CGPA, and attendance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{student.name}</p>
                              <p className="text-xs text-gray-600">
                                GPA: {student.gpa} | Attendance: {student.attendance}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {student.notificationsSent.academicPerformance ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Sent</span>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 text-xs px-3"
                                onClick={() => onSendNotification(student.id, 'academicPerformance')}
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Send
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Counselling Invitations for At-Risk Students */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Counselling Invitations
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Send counselling invitations to students with dropout risk ≥ 40%
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {atRiskStudents.length === 0 ? (
                        <div className="text-center p-4 text-gray-500">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm">No students currently at high risk</p>
                          <p className="text-xs">All students have dropout risk below 40%</p>
                        </div>
                      ) : (
                        atRiskStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-red-600">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge className={getDropoutRiskColor(student.dropoutRisk)}>
                                    {student.dropoutRisk}% Risk
                                  </Badge>
                                  <span className="text-gray-600">
                                    Attendance: {student.attendance}% | GPA: {student.gpa}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {student.notificationsSent.counsellingInvite ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs">Invited</span>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="h-7 text-xs px-3"
                                  onClick={() => onSendNotification(student.id, 'counsellingInvite')}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Invite
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-indigo-600">
                            {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <CardTitle>{selectedStudent.name}</CardTitle>
                          <CardDescription>{selectedStudent.email}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">Grade</label>
                          <p className="font-medium">{selectedStudent.grade}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Subject</label>
                          <p className="font-medium">{selectedStudent.subject}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Overall Grade</label>
                          <Badge className={getGradeColor(selectedStudent.overallGrade)}>
                            {selectedStudent.overallGrade}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">GPA</label>
                          <p className="font-medium">{selectedStudent.gpa}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Attendance</label>
                          <Badge className={getAttendanceColor(selectedStudent.attendance)}>
                            {selectedStudent.attendance}%
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <label className="text-xs text-gray-600">Student Phone</label>
                            <p>{selectedStudent.phoneNumber}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Parent Contact</label>
                            <p>{selectedStudent.parentContact}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Dropout Risk Assessment
                        </h4>
                        <div className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Risk Level</span>
                            <Badge className={getDropoutRiskColor(selectedStudent.dropoutRisk)}>
                              {getDropoutRiskLevel(selectedStudent.dropoutRisk)} ({selectedStudent.dropoutRisk}%)
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>• Based on attendance, grades, and assignment completion</p>
                            <p>• Risk ≥40% indicates high dropout probability</p>
                            {selectedStudent.dropoutRisk >= 40 && (
                              <p className="text-red-600 font-medium">⚠️ Counselling recommended</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Academic Performance
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <label className="text-xs text-gray-600">Total Assignments</label>
                            <p className="font-medium">{selectedStudent.assignments}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Completed</label>
                            <p className="font-medium">{selectedStudent.completedAssignments}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Completion Rate</label>
                            <p className="font-medium">
                              {Math.round((selectedStudent.completedAssignments / selectedStudent.assignments) * 100)}%
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Last Activity</label>
                            <p className="font-medium">{selectedStudent.lastActivity}</p>
                          </div>
                        </div>
                      </div>
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