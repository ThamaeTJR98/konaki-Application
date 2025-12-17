
import React from 'react';
import { UserRole } from '../types';
import Logo from './Logo';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="flex min-h-[100dvh] bg-stone-50 font-sans relative">
      
      {/* Left Panel - Brand (Hidden on small mobile) */}
      <div className="hidden lg:flex w-1/2 bg-green-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-black/80"></div>
        
        <div className="relative z-10 text-center p-12 text-white max-w-lg">
           <div className="w-48 h-48 mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-full p-6 shadow-2xl border border-white/20">
             <Logo />
           </div>
           <h1 className="text-5xl font-bold mb-4 tracking-tight">KONAKI AI</h1>
           <p className="text-xl text-green-100 font-light leading-relaxed">
             The intelligent assistant bridging the gap between landholders and farmers in Lesotho.
           </p>
        </div>
      </div>

      {/* Right Panel - Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
         <div className="w-full max-w-md space-y-8 animate-fade-in-up">
            
            {/* Centered logo for mobile */}
            <div className="lg:hidden flex justify-center">
              <div className="w-24 h-24 bg-white rounded-full p-4 shadow-md border border-stone-100 text-green-900">
                <Logo />
              </div>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-stone-900 mb-2">Rea U Amohela!</h2>
                <p className="text-stone-500">
                    Welcome! Please select how you will use Konaki AI today.
                </p>
            </div>

            <div className="space-y-4">
                <RoleButton 
                    role={UserRole.FARMER}
                    icon="👩🏽‍🌾"
                    title="Sehoai"
                    desc="Ke batla mobu oa ho lema (I am looking for land)"
                    color="green"
                    onClick={onSelectRole}
                />
                
                <RoleButton 
                    role={UserRole.LANDHOLDER}
                    icon="🏡"
                    title="Mong'a Mobu"
                    desc="Ke na le mobu o fumanehang (I have land)"
                    color="stone"
                    onClick={onSelectRole}
                />

                <RoleButton 
                    role={UserRole.PROVIDER}
                    icon="🚜"
                    title="Mofani oa Lisebelisoa"
                    desc="Ke hirisetsa lisebelisoa (I provide equipment)"
                    color="orange"
                    onClick={onSelectRole}
                />
            </div>

            <p className="text-center text-xs text-stone-400 mt-8">
                By continuing, you agree to our Terms of Service geared towards the Land Act 2010 of Lesotho.
            </p>
         </div>
      </div>
    </div>
  );
};

const RoleButton = ({ role, icon, title, desc, color, onClick }: any) => {
    const colors = {
        green: "border-green-200 hover:bg-green-50 hover:border-green-500",
        stone: "border-stone-200 hover:bg-stone-50 hover:border-stone-500",
        orange: "border-orange-200 hover:bg-orange-50 hover:border-orange-500"
    };

    return (
        <button 
            onClick={() => onClick(role)}
            className={`w-full flex items-center p-4 border-2 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md active:scale-[0.98] bg-white ${colors[color as keyof typeof colors]}`}
        >
            <div className="w-12 h-12 flex items-center justify-center text-3xl bg-stone-50 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div className="text-left flex-1">
                <span className="block font-bold text-stone-900 text-lg">{title}</span>
                <span className="text-sm text-stone-500 group-hover:text-stone-700 transition-colors">{desc}</span>
            </div>
            <div className="text-stone-300 group-hover:text-stone-800 transition-colors">
                →
            </div>
        </button>
    );
};

export default RoleSelector;
