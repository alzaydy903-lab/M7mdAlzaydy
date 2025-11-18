import { ReactNode } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  category: 'academic' | 'personal' | 'volunteering';
  image: string;
}

export interface Skill {
  id: string;
  name: string;
  iconName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  image: string;
}

export interface Goal {
  id: string;
  type: 'long' | 'short';
  title: string;
  description: string;
}