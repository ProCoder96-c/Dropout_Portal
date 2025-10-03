import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { GraduationCap, Users } from "lucide-react";

interface LoginPageProps {
  onRoleSelect: (role: "teacher" | "student") => void;
}

export default function LoginPage({ onRoleSelect }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | null>(null);

  const handleRoleSelection = (role: "teacher" | "student") => {
    setSelectedRole(role);
    // Small delay for visual feedback
    setTimeout(() => {
      onRoleSelect(role);
    }, 200);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">A Dropout Portal</h1>
            <p className="text-sm text-gray-600">Educational Management System</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Please select your role to continue</p>
        </div>

        <div className="space-y-4">
          {/* Teacher Role Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedRole === "teacher" 
                ? "border-indigo-500 bg-indigo-50 shadow-md transform scale-105" 
                : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
            }`}
            onClick={() => handleRoleSelection("teacher")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Teacher</CardTitle>
                    <CardDescription>Access student management dashboard</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  Educator
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• View and manage student records</p>
                <p>• Track attendance and grades</p>
                <p>• Monitor class performance</p>
              </div>
            </CardContent>
          </Card>

          {/* Student Role Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedRole === "student" 
                ? "border-green-500 bg-green-50 shadow-md transform scale-105" 
                : "border-gray-200 hover:border-green-300 hover:shadow-sm"
            }`}
            onClick={() => handleRoleSelection("student")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Student</CardTitle>
                    <CardDescription>View your academic progress</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Learner
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• View attendance and grades</p>
                <p>• Track academic performance</p>
                <p>• Monitor upcoming activities</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Demo Credentials</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Teacher:</span> Access full student management</p>
            <p><span className="font-medium">Student:</span> View personal academic data</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t">
        <p className="text-center text-xs text-gray-500">
          © 2025 A Dropout Portal. Educational Management System
        </p>
      </div>
    </div>
  );
}