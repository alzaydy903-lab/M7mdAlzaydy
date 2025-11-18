import React from 'react';
import { Achievement, Goal, Skill, Testimonial } from './types';

// Data uses string IDs and iconNames for Firestore compatibility
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "إنشاء موقع إلكتروني",
    description: "قمت بتصميم وبرمجة هذا الموقع بنفسي ليكون بوابتي لمشاركة إنجازاتي وأهدافي مع العالم.",
    year: "2024",
    category: "academic",
    image: "https://picsum.photos/seed/coding/600/400"
  },
  {
    id: "2",
    title: "مساعدة كبار السن في الحي",
    description: "أقوم بمساعدة كبار السن في حيي في مهام بسيطة مثل عبور الشارع أو حمل المشتريات. هذا العمل علمني أهمية العطاء والاحترام.",
    year: "2023",
    category: "volunteering",
    image: "https://picsum.photos/seed/elderly/600/400"
  },
  {
    id: "3",
    title: "الفوز في مسابقة رياضية",
    description: "فزت بالمركز الأول في بطولة كرة القدم المدرسية بعد منافسة قوية، مما علمني أهمية العمل الجماعي.",
    year: "2024",
    category: "personal",
    image: "https://picsum.photos/seed/running/600/400"
  }
];

export const SKILLS: Skill[] = [
  { id: "1", name: "السرعة", iconName: "Zap" },
  { id: "2", name: "الذكاء", iconName: "Brain" },
];

export const HOBBIES: Skill[] = [
  { id: "1", name: "كرة القدم", iconName: "Footprints" },
  { id: "2", name: "التبادل", iconName: "Sword" },
  { id: "3", name: "ريادة الأعمال", iconName: "Briefcase" },
];

export const GOALS: Goal[] = [
  {
    id: "1",
    type: "long",
    title: "طويلة المدى",
    description: "إنشاء منصة تعليمية متكاملة تساعد الشباب على تعلم التداول بأمان وذكاء."
  },
  {
    id: "2",
    type: "short",
    title: "قصيرة المدى",
    description: "تعلم أساسيات التداول والاستثمار بشكل أعمق."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "أ. أحمد المصري",
    role: "الرياضيات",
    comment: "محمد طالب مجتهد ويظهر فهماً عميقاً للمفاهيم الرياضية. لديه قدرة ممتازة على حل المشكلات.",
    image: "https://picsum.photos/seed/t1/100/100"
  },
  {
    id: "2",
    name: "أ. فاطمة علي",
    role: "العلوم",
    comment: "يتمتع بشغف كبير للاستكشاف والتعلم. دائماً ما يطرح أسئلة ذكية ويشارك بفعالية.",
    image: "https://picsum.photos/seed/t2/100/100"
  },
  {
    id: "3",
    name: "أ. خالد عبدالله",
    role: "اللغة العربية",
    comment: "يمتلك موهبة في التعبير والكتابة، وأعماله دائماً ما تكون مدروسة ومنظمة بشكل جيد.",
    image: "https://picsum.photos/seed/t3/100/100"
  }
];