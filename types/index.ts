export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  capacity: number;
  instructor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  course?: Course;
  title?: string;
  coachName?: string;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
  isRecurring: boolean;
  specificDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  categoryId: string;
  category?: VideoCategory;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BmiRecord {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  age: number;
  gender: 'MALE' | 'FEMALE';
  height: number;
  weight: number;
  bmiValue: number;
  category: string;
  status: 'OK' | 'CAUTION' | 'NOT_OK';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BmiStats {
  totalRecords: number;
  totalUsers: number;
  recentRecords: number;
  statusDistribution: {
    OK?: number;
    CAUTION?: number;
    NOT_OK?: number;
  };
  categoryDistribution: {
    [key: string]: number;
  };
}
