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

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  categoryId: string;
  category?: Category;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string;
  duration: number;
  expiresAt?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryGroup {
  category: Category;
  stories: Story[];
}

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  videoUrl?: string;
  imageUrl?: string;
  difficulty: Difficulty;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  durationWeeks?: number;
  difficulty: Difficulty;
  imageUrl?: string;
  isActive: boolean;
  exercises: WorkoutPlanExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanExercise {
  id: string;
  workoutPlanId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets?: number;
  reps?: string;
  notes?: string;
}
