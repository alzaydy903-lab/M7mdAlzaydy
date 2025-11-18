import React, { useState, createContext, useContext, useEffect } from 'react';
import { 
  ArrowRight, 
  Languages, 
  Briefcase, 
  Quote, 
  Mail, 
  Lock, 
  Unlock, 
  Edit2, 
  Check, 
  X,
  LogOut,
  Plus,
  Trash2,
  Image as ImageIcon,
  Star,
  Loader2,
  Upload,
  RefreshCw
} from 'lucide-react';
import { ACHIEVEMENTS, SKILLS, HOBBIES, GOALS, TESTIMONIALS } from './constants';
import { Achievement, Skill, Goal, Testimonial } from './types';
import SectionTitle from './components/SectionTitle';
import TradingSimulator from './components/TradingSimulator';
import SkillCard from './components/SkillCard';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// --- Context & Types ---

interface ContentState {
  heroName: string;
  heroRole: string;
  aboutText: string;
  contactEmail: string;
}

interface AppData {
  content: ContentState;
  achievements: Achievement[];
  skills: Skill[];
  hobbies: Skill[];
  goals: Goal[];
  testimonials: Testimonial[];
}

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (v: boolean) => void;
  data: AppData;
  loading: boolean;
  updateContent: (key: keyof ContentState, value: string) => void;
  addEntity: <T>(collection: keyof AppData, item: T) => void;
  updateEntity: (collection: keyof AppData, id: string, field: string, value: any) => void;
  removeEntity: (collection: keyof AppData, id: string) => void;
}

const AdminContext = createContext<AdminContextType>({} as AdminContextType);

// --- Helper Components ---

const EditableText = ({ 
  value, 
  onSave,
  className = "", 
  multiline = false,
  as: Component = 'p' 
}: { 
  value: string; 
  onSave: (val: string) => void;
  className?: string; 
  multiline?: boolean;
  as?: any;
}) => {
  const { isAdmin } = useContext(AdminContext);
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => { setLocalValue(value); }, [value]);

  if (!isAdmin) return <Component className={className}>{value}</Component>;

  const handleSave = () => {
    onSave(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative w-full inline-block z-10">
        {multiline ? (
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={`w-full bg-[#1a1f2e] text-white border-2 border-cyan-500 rounded-lg p-3 outline-none min-h-[150px] ${className}`}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className={`w-full bg-[#1a1f2e] text-white border-2 border-cyan-500 rounded-lg p-2 outline-none ${className}`}
            autoFocus
          />
        )}
        <div className="absolute -top-10 left-0 flex gap-2 bg-black/90 border border-gray-700 rounded-lg p-1.5 z-20 shadow-xl">
          <button onClick={handleSave} className="p-1.5 text-green-400 hover:bg-white/10 rounded-md transition-colors" title="حفظ"><Check size={18} /></button>
          <button onClick={handleCancel} className="p-1.5 text-red-400 hover:bg-white/10 rounded-md transition-colors" title="إلغاء"><X size={18} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer inline-block w-full" onClick={() => setIsEditing(true)}>
      <Component className={`${className} border-2 border-transparent group-hover:border-cyan-500/30 group-hover:bg-white/5 rounded-lg transition-all duration-200`}>
        {value || <span className="text-gray-500 italic text-sm">اضغط للتعديل...</span>}
      </Component>
      <span className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500 text-black p-1.5 rounded-full shadow-lg scale-75 group-hover:scale-100 z-10">
        <Edit2 size={14} />
      </span>
    </div>
  );
};

const EditableImage = ({ 
  src, 
  alt, 
  onSave, 
  className 
}: { 
  src: string; 
  alt: string; 
  onSave: (url: string) => void; 
  className: string 
}) => {
  const { isAdmin } = useContext(AdminContext);
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(src);

  if (!isAdmin) return <img src={src} alt={alt} className={className} />;

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple size check (~800KB) to avoid hitting Firestore 1MB limit easily
      if (file.size > 800 * 1024) {
        alert("عذراً، حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 800 كيلوبايت لضمان حفظها في قاعدة البيانات.");
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setUrl(base64);
      } catch (error) {
        console.error("Error converting file:", error);
      }
    }
  };

  const handleSave = () => {
    onSave(url);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUrl(src);
    setIsEditing(false);
  };

  return (
    <div className="relative group w-full h-full">
      <img src={src} alt={alt} className={className} />
      
      {isEditing ? (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-20 gap-3 border border-cyan-500/30">
           <div className="w-full">
             <label className="block text-gray-400 text-xs mb-1">رابط الصورة (URL)</label>
             <input 
               type="text" 
               value={url.startsWith('data:') ? '(صورة مرفوعة من الجهاز)' : url} 
               onChange={e => setUrl(e.target.value)}
               className="w-full bg-[#1a1f2e] text-white text-xs p-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
               placeholder="https://example.com/image.jpg"
               disabled={url.startsWith('data:')}
             />
           </div>

           <div className="w-full relative">
              <label className="flex items-center justify-center gap-2 w-full cursor-pointer bg-gray-800 hover:bg-gray-700 text-white text-xs py-2.5 px-4 rounded border border-dashed border-gray-600 hover:border-cyan-500 transition-colors">
                <Upload size={14} />
                <span>رفع صورة من الجهاز</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
           </div>

           <div className="flex gap-2 mt-1 w-full">
             <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1.5 rounded text-xs font-bold transition-colors">حفظ</button>
             <button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-1.5 rounded text-xs font-bold transition-colors">إلغاء</button>
           </div>
        </div>
      ) : (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="absolute top-2 right-2 bg-black/60 hover:bg-cyan-500 hover:text-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm"
          title="تغيير الصورة"
        >
          <ImageIcon size={16} />
        </button>
      )}
    </div>
  );
};

const LoginModal: React.FC = () => {
  const { isLoginOpen, setIsLoginOpen, setIsAdmin } = useContext(AdminContext);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!isLoginOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAdmin(true);
      setIsLoginOpen(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0e121b] border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={() => setIsLoginOpen(false)}
          className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-8">
          <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-cyan-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">دخول المشرف</h2>
          <p className="text-gray-400 mt-2 text-sm">أدخل كلمة المرور لتعديل المحتوى</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="كلمة المرور"
              className={`w-full bg-[#1a1f2e] border ${error ? 'border-red-500' : 'border-gray-700'} rounded-xl p-4 text-white focus:border-cyan-400 focus:outline-none transition-colors text-center text-lg tracking-widest`}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2 text-center">كلمة المرور غير صحيحة</p>}
          </div>
          <button 
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Site Sections ---

const Header: React.FC = () => {
  const { isAdmin, setIsAdmin, setIsLoginOpen } = useContext(AdminContext);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-gray-800 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => isAdmin ? setIsAdmin(false) : setIsLoginOpen(true)}
            className="relative group"
            title={isAdmin ? "تسجيل خروج" : "دخول المشرف"}
          >
            {isAdmin ? (
               <LogOut className="text-red-400 cursor-pointer hover:text-red-300 transition-colors" />
            ) : (
               <ArrowRight className="text-white cursor-pointer hover:text-cyan-400 transition-colors" />
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {isAdmin ? 'خروج' : 'دخول'}
            </span>
          </div>
          <Languages className="text-white cursor-pointer hover:text-cyan-400 transition-colors" />
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <Unlock size={12} />
              وضع التعديل
            </span>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-white">ملف إنجازاتي</h1>
        </div>
      </div>
    </header>
  );
};

const Hero: React.FC = () => {
  const { data, updateContent } = useContext(AdminContext);
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-black relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-2 bg-white rounded-full h-2 opacity-50 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 bg-cyan-400 rounded-full h-1 opacity-70"></div>
      
      <div className="max-w-4xl w-full flex flex-col items-center gap-2">
        <EditableText 
          value={data.content.heroName} 
          onSave={(val) => updateContent('heroName', val)}
          as="h1"
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
        />
        
        <EditableText
          value={data.content.heroRole}
          onSave={(val) => updateContent('heroRole', val)}
          className="text-cyan-400 text-lg md:text-xl font-medium tracking-wide mt-2"
        />
      </div>
    </section>
  );
};

const About: React.FC = () => {
  const { data, updateContent } = useContext(AdminContext);
  return (
    <section className="py-20 px-4 bg-black">
      <SectionTitle title="نبذة عني" />
      <div className="max-w-3xl mx-auto text-center">
        <EditableText 
          value={data.content.aboutText}
          onSave={(val) => updateContent('aboutText', val)}
          multiline
          className="text-gray-300 text-lg md:text-xl leading-relaxed"
        />
      </div>
    </section>
  );
};

const Achievements: React.FC = () => {
  const { data, updateEntity, addEntity, removeEntity, isAdmin } = useContext(AdminContext);
  const [filter, setFilter] = useState<'all' | 'academic' | 'volunteering' | 'personal'>('all');

  const filtered = filter === 'all' 
    ? data.achievements 
    : data.achievements.filter(item => item.category === filter);

  const tabs = [
    { id: 'all', label: 'الكل' },
    { id: 'academic', label: 'أكاديمي' },
    { id: 'volunteering', label: 'تطوعي' },
    { id: 'personal', label: 'شخصي' },
  ];

  const handleAdd = () => {
    const newAchievement: Omit<Achievement, 'id'> = {
      title: "عنوان جديد",
      description: "وصف الإنجاز الجديد...",
      year: new Date().getFullYear().toString(),
      category: "personal",
      image: "https://picsum.photos/seed/new/600/400"
    };
    addEntity('achievements', newAchievement);
  };

  return (
    <section className="py-20 px-4 bg-black">
      <SectionTitle title="الإنجازات" />
      
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab.id 
                ? 'bg-cyan-400 text-black' 
                : 'bg-[#1a1f2e] text-gray-300 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.map(item => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-[#0e121b] border border-gray-800 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10">
            {isAdmin && (
              <button 
                onClick={() => removeEntity('achievements', item.id)}
                className="absolute top-2 right-2 z-30 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <Trash2 size={16} />
              </button>
            )}
            
            <div className="h-48 overflow-hidden relative">
              <EditableImage 
                src={item.image} 
                alt={item.title} 
                onSave={(url) => updateEntity('achievements', item.id, 'image', url)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
              />
            </div>
            <div className="p-6 relative">
               <div className="absolute -top-4 left-4 bg-[#1a1f2e] text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-gray-700 shadow-lg z-20">
                 <EditableText 
                   value={item.year} 
                   onSave={(val) => updateEntity('achievements', item.id, 'year', val)}
                 />
               </div>
              <div className="mb-3 mt-2">
                <EditableText 
                  value={item.title}
                  onSave={(val) => updateEntity('achievements', item.id, 'title', val)}
                  className="text-xl font-bold text-white block"
                />
              </div>
              <div className="text-gray-400 text-sm leading-relaxed mb-4 min-h-[60px]">
                <EditableText 
                  value={item.description}
                  onSave={(val) => updateEntity('achievements', item.id, 'description', val)}
                  multiline
                />
              </div>
              <div className="flex justify-end">
                <span className="text-xs text-gray-500 cursor-pointer" onClick={() => {
                   if(isAdmin) {
                     const cats = ['academic', 'personal', 'volunteering'];
                     const next = cats[(cats.indexOf(item.category) + 1) % cats.length];
                     updateEntity('achievements', item.id, 'category', next);
                   }
                }}>
                   {item.category === 'academic' ? 'أكاديمي' : item.category === 'volunteering' ? 'تطوعي' : 'شخصي'}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isAdmin && (
          <button 
            onClick={handleAdd}
            className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors group"
          >
            <div className="bg-gray-800 group-hover:bg-cyan-500/20 p-4 rounded-full mb-4 transition-colors">
              <Plus size={32} />
            </div>
            <span className="font-bold">إضافة إنجاز جديد</span>
          </button>
        )}
      </div>
    </section>
  );
};

const SkillsSection: React.FC = () => {
  const { data, addEntity, removeEntity, isAdmin } = useContext(AdminContext);

  const handleAddSkill = (type: 'skills' | 'hobbies') => {
    const newItem: Omit<Skill, 'id'> = {
      name: "مهارة جديدة",
      iconName: "Star"
    };
    addEntity(type, newItem);
  };

  return (
    <section className="py-20 px-4 bg-black">
      <SectionTitle title="المهارات" />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Hobbies Column */}
        <div>
          <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">الهوايات</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {data.hobbies.map((skill) => (
              <SkillCard 
                key={skill.id} 
                skill={skill} 
                isAdmin={isAdmin}
                onDelete={() => removeEntity('hobbies', skill.id)}
              />
            ))}
            {isAdmin && (
              <button onClick={() => handleAddSkill('hobbies')} className="bg-gray-800 hover:bg-cyan-900 text-cyan-400 rounded-full p-2 border border-cyan-500/30">
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>
        {/* Skills Column */}
        <div>
          <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">المهارات</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {data.skills.map((skill) => (
              <SkillCard 
                key={skill.id} 
                skill={skill} 
                isAdmin={isAdmin}
                onDelete={() => removeEntity('skills', skill.id)}
              />
            ))}
             {isAdmin && (
              <button onClick={() => handleAddSkill('skills')} className="bg-gray-800 hover:bg-cyan-900 text-cyan-400 rounded-full p-2 border border-cyan-500/30">
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Goals: React.FC = () => {
  const { data, updateEntity, addEntity, removeEntity, isAdmin } = useContext(AdminContext);

  const handleAdd = () => {
    const newGoal: Omit<Goal, 'id'> = {
      type: 'short',
      title: 'هدف جديد',
      description: 'اكتب تفاصيل الهدف هنا...'
    };
    addEntity('goals', newGoal);
  };

  return (
    <section className="py-20 px-4 bg-black">
      <SectionTitle title="الأهداف" />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.goals.map((goal) => (
          <div key={goal.id} className="group relative bg-[#0e121b] border border-gray-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-cyan-900/50 transition-colors">
             {isAdmin && (
              <button 
                onClick={() => removeEntity('goals', goal.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <Trash2 size={14} />
              </button>
            )}
            <div className="mb-4 w-full flex justify-center">
              <EditableText
                value={goal.title}
                onSave={(val) => updateEntity('goals', goal.id, 'title', val)}
                className="text-2xl font-bold text-cyan-400"
              />
            </div>
            <div className="text-gray-300 text-lg leading-relaxed w-full">
              <EditableText
                value={goal.description}
                onSave={(val) => updateEntity('goals', goal.id, 'description', val)}
                multiline
              />
            </div>
          </div>
        ))}
        {isAdmin && (
          <button 
            onClick={handleAdd}
            className="border-2 border-dashed border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all min-h-[200px]"
          >
            <Plus size={32} />
            <span className="mt-2 font-bold">إضافة هدف</span>
          </button>
        )}
      </div>
    </section>
  );
};

const Testimonials: React.FC = () => {
  const { data, updateEntity, addEntity, removeEntity, isAdmin } = useContext(AdminContext);

  const handleAdd = () => {
    const newTestimonial: Omit<Testimonial, 'id'> = {
      name: "الاسم",
      role: "الصفة",
      comment: "نص التعليق...",
      image: "https://picsum.photos/seed/newt/100/100"
    };
    addEntity('testimonials', newTestimonial);
  };

  return (
    <section className="py-20 px-4 bg-black">
      <SectionTitle title="تعليقات المعلمين" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {data.testimonials.map(t => (
          <div key={t.id} className="group relative bg-[#0e121b] border border-gray-800 p-6 rounded-2xl">
            {isAdmin && (
              <button 
                onClick={() => removeEntity('testimonials', t.id)}
                className="absolute top-2 right-2 z-30 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <Trash2 size={14} />
              </button>
            )}
            <Quote className="absolute top-6 left-6 text-gray-700/30 w-12 h-12" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-900 relative">
                <EditableImage
                  src={t.image}
                  alt={t.name}
                  onSave={(url) => updateEntity('testimonials', t.id, 'image', url)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-white">
                  <EditableText
                    value={t.name}
                    onSave={(val) => updateEntity('testimonials', t.id, 'name', val)}
                  />
                </div>
                <div className="text-cyan-400 text-sm">
                   <EditableText
                    value={t.role}
                    onSave={(val) => updateEntity('testimonials', t.id, 'role', val)}
                  />
                </div>
              </div>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed relative z-10">
              <EditableText
                value={t.comment}
                onSave={(val) => updateEntity('testimonials', t.id, 'comment', val)}
                multiline
              />
            </div>
          </div>
        ))}
        {isAdmin && (
          <button 
             onClick={handleAdd}
             className="border-2 border-dashed border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all min-h-[200px]"
          >
            <Plus size={32} />
            <span className="mt-2 font-bold">إضافة تعليق</span>
          </button>
        )}
      </div>
    </section>
  );
};

const CommentForm: React.FC = () => {
  const { addEntity } = useContext(AdminContext);
  const [formData, setFormData] = useState({ name: '', role: '', comment: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) return;

    setStatus('submitting');
    
    const newComment = {
      name: formData.name,
      role: formData.role || 'زائر',
      comment: formData.comment,
      // Generate a default avatar based on the name
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D8ABC&color=fff`
    };

    try {
      await addEntity('testimonials', newComment);
      setStatus('success');
      setFormData({ name: '', role: '', comment: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('idle');
      alert("حدث خطأ أثناء إرسال التعليق");
    }
  };

  return (
    <section className="py-20 px-4 bg-black">
      <SectionTitle title="أضف تعليقاً" />
      <div className="max-w-2xl mx-auto bg-[#0e121b] border border-gray-800 rounded-2xl p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">اسمك</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">صفتك (معلم، صديق...)</label>
              <input 
                type="text" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                placeholder="مثال: زائر"
                className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors"
                dir="rtl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">تعليقك</label>
            <textarea 
              required
              rows={4}
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors resize-none"
              dir="rtl"
            ></textarea>
          </div>
          <div className="flex justify-center">
            <button 
              type="submit"
              disabled={status === 'submitting'}
              className={`bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${status === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
               {status === 'submitting' ? (
                 <>
                   <Loader2 className="animate-spin" size={20} />
                   <span>جاري الإرسال...</span>
                 </>
               ) : status === 'success' ? (
                 <>
                   <Check size={20} />
                   <span>تم الإرسال بنجاح!</span>
                 </>
               ) : (
                 <span>إرسال التعليق</span>
               )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  const { data, updateContent } = useContext(AdminContext);
  return (
    <footer className="bg-[#020202] border-t border-gray-900 py-12 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-8">تواصل معي</h2>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
            <Mail className="text-cyan-400" />
            <EditableText 
              value={data.content.contactEmail}
              onSave={(val) => updateContent('contactEmail', val)}
              as="span"
              className="text-lg dir-ltr"
            />
          </div>
          <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
            <Briefcase className="text-cyan-400" />
            <span className="text-lg">{data.content.heroName}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          © 2025 {data.content.heroName}. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

// --- Main App Wrapper ---

function App() {
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTakesLong, setLoadingTakesLong] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Combined Data State
  const [data, setData] = useState<AppData>({
    content: {
      heroName: "",
      heroRole: "",
      aboutText: "",
      contactEmail: ""
    },
    achievements: [],
    skills: [],
    hobbies: [],
    goals: [],
    testimonials: []
  });

  // --- Data Fetching & Seeding ---
  useEffect(() => {
    let mounted = true;
    const initData = async () => {
      setLoading(true);
      setLoadingTakesLong(false);

      // Timeout to show "Takes long" message
      const timer = setTimeout(() => {
        if (mounted && loading) {
          setLoadingTakesLong(true);
        }
      }, 5000);

      try {
        // 1. Content Helper
        const fetchContent = async () => {
           const contentRef = doc(db, "site_content", "main");
           const contentSnap = await getDoc(contentRef);
           if (contentSnap.exists()) {
             return contentSnap.data() as ContentState;
           } else {
             const defaultContent: ContentState = {
               heroName: "محمد عبدالرحمن الزايدي",
               heroRole: "الأول متوسط – مدارس الاندلس الاهليه",
               aboutText: "طالب طموح وشغوف بالتعلم، أسعى لاستكشاف عالم الأسواق المالية وتكنولوجيا المعلومات لمساعدة الآخرين على فهم التداول بأسلوب مبتكر وآمن.",
               contactEmail: "alzaydy901@gmail.com"
             };
             await setDoc(contentRef, defaultContent);
             return defaultContent;
           }
        };

        // 2. Collections Helper
        const fetchOrSeed = async <T extends { id: string }>(key: string, defaultData: T[]) => {
          const colRef = collection(db, key);
          const snapshot = await getDocs(colRef);
          
          if (snapshot.empty && defaultData.length > 0) {
            // Seed collection
            const batch = writeBatch(db);
            const createdItems: T[] = [];
            
            defaultData.forEach(item => {
              const newDocRef = doc(collection(db, key));
              // We remove the explicit ID from data if we want auto-id, 
              // but here we can just use the doc ID as the source of truth
              const { id, ...dataWithoutId } = item as any;
              batch.set(newDocRef, dataWithoutId);
              createdItems.push({ ...item, id: newDocRef.id });
            });
            
            await batch.commit();
            return createdItems;
          } else {
            return snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as T[];
          }
        };

        // 3. Parallel Fetching
        const [
          contentRes,
          achievementsRes,
          skillsRes,
          hobbiesRes,
          goalsRes,
          testimonialsRes
        ] = await Promise.all([
          fetchContent(),
          fetchOrSeed('achievements', ACHIEVEMENTS),
          fetchOrSeed('skills', SKILLS),
          fetchOrSeed('hobbies', HOBBIES),
          fetchOrSeed('goals', GOALS),
          fetchOrSeed('testimonials', TESTIMONIALS)
        ]);

        if (mounted) {
          setData({
            content: contentRes,
            achievements: achievementsRes,
            skills: skillsRes,
            hobbies: hobbiesRes,
            goals: goalsRes,
            testimonials: testimonialsRes
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (mounted) setLoadingTakesLong(true); // Show retry on error too
      } finally {
        clearTimeout(timer);
      }
    };

    initData();

    return () => { mounted = false; };
  }, [retryCount]);

  // --- CRUD Operations ---

  const updateContent = async (key: keyof ContentState, value: string) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      content: { ...prev.content, [key]: value }
    }));
    
    // Firestore update
    const contentRef = doc(db, "site_content", "main");
    await updateDoc(contentRef, { [key]: value });
  };

  const addEntity = async <T,>(collectionName: keyof AppData, item: T) => {
    // Firestore Add
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, item as any);
    
    // Update Local State
    const newItem = { ...item, id: docRef.id };
    setData(prev => ({
      ...prev,
      [collectionName]: [...(prev[collectionName] as any[]), newItem]
    }));
  };

  const removeEntity = async (collectionName: keyof AppData, id: string) => {
    // Optimistic Update
    setData(prev => ({
      ...prev,
      [collectionName]: (prev[collectionName] as any[]).filter((item: any) => item.id !== id)
    }));

    // Firestore Delete
    await deleteDoc(doc(db, collectionName, id));
  };

  const updateEntity = async (collectionName: keyof AppData, id: string, field: string, value: any) => {
    // Optimistic Update
    setData(prev => ({
      ...prev,
      [collectionName]: (prev[collectionName] as any[]).map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));

    // Firestore Update
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-cyan-400 animate-spin" size={48} />
        <p className="text-gray-400 animate-pulse">جاري تحميل البيانات...</p>
        {loadingTakesLong && (
          <div className="flex flex-col items-center gap-2 mt-4">
             <p className="text-red-400 text-sm">التحميل يستغرق وقتاً أطول من المعتاد.</p>
             <button 
               onClick={() => setRetryCount(c => c + 1)}
               className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
             >
               <RefreshCw size={16} />
               <span>إعادة المحاولة</span>
             </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ 
      isAdmin, 
      setIsAdmin, 
      isLoginOpen, 
      setIsLoginOpen, 
      data,
      loading, 
      updateContent,
      addEntity,
      removeEntity,
      updateEntity
    }}>
      <div className="min-h-screen bg-black text-white font-cairo selection:bg-cyan-500/30">
        <LoginModal />
        <Header />
        <main>
          <Hero />
          <About />
          <Achievements />
          <SkillsSection />
          <Goals />
          <Testimonials />
          <CommentForm />
          <TradingSimulator />
        </main>
        <Footer />
      </div>
    </AdminContext.Provider>
  );
}

export default App;