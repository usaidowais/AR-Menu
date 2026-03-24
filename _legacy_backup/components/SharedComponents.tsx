import React from 'react';
import { Dish, UIPreset } from '../types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', fullWidth?: boolean }> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "bg-[#001f3f] text-white hover:bg-[#003366] shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input 
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent outline-none transition-all ${className}`}
      {...props}
    />
  </div>
);

export const ARModelViewer: React.FC<{ 
  src: string; 
  poster: string; 
  alt: string; 
  onView?: () => void; 
}> = ({ src, poster, alt, onView }) => {
  const handleARStart = () => {
    if (onView) onView();
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-50">
      <model-viewer
        src={src}
        poster={poster}
        alt={alt}
        shadow-intensity="1"
        camera-controls
        touch-action="pan-y"
        ar
        ar-scale="fixed" 
        ar-modes="webxr scene-viewer quick-look"
        on-ar-status={(e: any) => {
            if(e.detail.status === 'session-started') handleARStart();
        }}
        class="w-full h-full"
      >
        <button slot="ar-button" className="absolute bottom-4 right-4 bg-[#001f3f] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 z-50">
          <span className="material-icons-round text-lg">view_in_ar</span>
          View in AR
        </button>
        
        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: `url(${poster})`}}>
           <div className="bg-black/20 absolute inset-0"></div>
           <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-[#001f3f] z-10 flex items-center gap-2">
             <span className="material-icons-round animate-spin">sync</span>
             Loading 3D Model...
           </div>
        </div>
      </model-viewer>
      
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-white/50">
        AR Scale: 1:1 Fixed
      </div>
    </div>
  );
};

export const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-[#001f3f] text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
  >
    <span className="material-icons-round">{icon}</span>
    <span className="font-medium text-sm">{label}</span>
  </button>
);