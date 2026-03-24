import React, { useState, useEffect } from 'react';
import { UserRole, Restaurant, Dish, UIPreset } from './types';
import { supabaseService } from './services/supabaseService';
import { Button, Input, ARModelViewer, NavItem } from './components/SharedComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Sub-Components Defined Here for Context Simplicity ---

const Sidebar: React.FC<{ role: UserRole; currentView: string; setView: (v: string) => void; onLogout: () => void; isOpen?: boolean; onClose?: () => void }> = ({ role, currentView, setView, onLogout, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose}></div>}
      
      <div className={`w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#001f3f] rounded-lg flex items-center justify-center text-white font-bold">
            {role === UserRole.SUPER_ADMIN ? 'SA' : 'CP'}
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">WebAR SaaS</h1>
            <p className="text-xs text-gray-500">{role === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Client Portal'}</p>
          </div>
          <button className="md:hidden ml-auto text-gray-400" onClick={onClose}>
             <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {role === UserRole.SUPER_ADMIN ? (
            <>
              <NavItem icon="dashboard" label="Global Overview" active={currentView === 'admin_dashboard'} onClick={() => { setView('admin_dashboard'); onClose?.(); }} />
              <NavItem icon="store" label="Restaurants" active={currentView === 'admin_restaurants'} onClick={() => { setView('admin_restaurants'); onClose?.(); }} />
              <NavItem icon="verified_user" label="System Health" active={currentView === 'admin_health'} onClick={() => { setView('admin_health'); onClose?.(); }} />
            </>
          ) : (
            <>
              <NavItem icon="analytics" label="Dashboard" active={currentView === 'portal_dashboard'} onClick={() => { setView('portal_dashboard'); onClose?.(); }} />
              <NavItem icon="restaurant_menu" label="Menu Management" active={currentView === 'portal_menu'} onClick={() => { setView('portal_menu'); onClose?.(); }} />
              <NavItem icon="palette" label="UI Preset Engine" active={currentView === 'portal_ui'} onClick={() => { setView('portal_ui'); onClose?.(); }} />
              <NavItem icon="mail" label="Email Manager" active={currentView === 'portal_email'} onClick={() => { setView('portal_email'); onClose?.(); }} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium w-full px-4 py-2">
            <span className="material-icons-round">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

// --- Super Admin Views ---

const SuperAdminDashboard = () => {
  const data = [
    { name: 'Mon', scans: 4000 },
    { name: 'Tue', scans: 3000 },
    { name: 'Wed', scans: 2000 },
    { name: 'Thu', scans: 2780 },
    { name: 'Fri', scans: 1890 },
    { name: 'Sat', scans: 2390 },
    { name: 'Sun', scans: 3490 },
  ];

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Scans</p>
              <h3 className="text-3xl font-bold text-[#001f3f] mt-2">24,567</h3>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">+12%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Restaurants</p>
              <h3 className="text-3xl font-bold text-[#001f3f] mt-2">412</h3>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">+5%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Dwell Time</p>
              <h3 className="text-3xl font-bold text-[#001f3f] mt-2">4m 12s</h3>
            </div>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Stable</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-6">Scan Velocity (Global)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <Bar dataKey="scans" fill="#001f3f" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Client Portal Views ---

const ClientDashboard = () => {
  const data = [
    { name: 'Mon', views: 240, orders: 120 },
    { name: 'Tue', views: 139, orders: 98 },
    { name: 'Wed', views: 980, orders: 400 },
    { name: 'Thu', views: 390, orders: 180 },
    { name: 'Fri', views: 480, orders: 210 },
    { name: 'Sat', views: 380, orders: 170 },
    { name: 'Sun', views: 430, orders: 230 },
  ];

  const topDishes = [
      { name: 'Butter Chicken', views: 450, conversion: '24%' },
      { name: 'Tandoori Platter', views: 380, conversion: '18%' },
      { name: 'Mango Lassi', views: 310, conversion: '32%' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 text-sm">Welcome back, FlavorFusion</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#001f3f]">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
            </select>
            <Button variant="secondary" className="!py-2" onClick={() => alert('Exporting data CSV...')}>
                <span className="material-icons-round text-sm">download</span>
                Export
            </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500">Total Menu Scans</p>
                <h3 className="text-3xl font-bold text-[#001f3f] mt-2">1,204</h3>
                <span className="text-green-600 text-xs font-bold mt-2 inline-flex items-center">
                    <span className="material-icons-round text-xs mr-0.5">trending_up</span>
                    +15.3%
                </span>
            </div>
            <span className="material-icons-round absolute -bottom-4 -right-4 text-9xl text-gray-50 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-500">qr_code_scanner</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
             <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500">AR Interactions</p>
                <h3 className="text-3xl font-bold text-[#001f3f] mt-2">856</h3>
                <span className="text-green-600 text-xs font-bold mt-2 inline-flex items-center">
                    <span className="material-icons-round text-xs mr-0.5">trending_up</span>
                    +8.2%
                </span>
            </div>
            <span className="material-icons-round absolute -bottom-4 -right-4 text-9xl text-gray-50 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-500">view_in_ar</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
             <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500">Click-to-Order Rate</p>
                <h3 className="text-3xl font-bold text-[#001f3f] mt-2">24.8%</h3>
                <span className="text-gray-500 text-xs font-bold mt-2 inline-flex items-center">
                    <span className="material-icons-round text-xs mr-0.5">remove</span>
                    0%
                </span>
            </div>
            <span className="material-icons-round absolute -bottom-4 -right-4 text-9xl text-gray-50 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-500">shopping_cart</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Engagement Overview</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#001f3f" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#001f3f" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                        <Area type="monotone" dataKey="views" stroke="#001f3f" fillOpacity={1} fill="url(#colorViews)" />
                        <Area type="monotone" dataKey="orders" stroke="#10b981" fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Items */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Top Performing Dishes</h3>
            <div className="space-y-4">
                {topDishes.map((dish, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-[#001f3f] text-sm">
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm">{dish.name}</h4>
                            <p className="text-xs text-gray-500">{dish.views} views</p>
                        </div>
                        <div className="text-right">
                             <span className="block font-bold text-green-600 text-sm">{dish.conversion}</span>
                             <span className="text-[10px] text-gray-400">Conv.</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-[#001f3f] font-bold hover:bg-blue-50 rounded-lg transition-colors">
                View Full Report
            </button>
        </div>
      </div>
    </div>
  );
};

const DishManagement = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    supabaseService.getRestaurantDishes('1').then(setDishes);
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-500 text-sm">Manage your dishes and AR assets</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <span className="material-icons-round">add</span>
          Add New Dish
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dishes.map((dish) => (
          <div key={dish.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-32 h-32 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative group">
              <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-icons-round text-white">edit</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{dish.name}</h3>
                  <span className="font-bold text-[#001f3f]">${dish.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dish.description}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  <span className="material-icons-round text-sm">check_circle</span>
                  AR Ready
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" className="px-3 py-1 text-xs">Edit</Button>
                  <Button variant="secondary" className="px-3 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Dish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input label="Dish Name" placeholder="e.g. Truffle Pasta" />
                <Input label="Price ($)" placeholder="24.00" type="number" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent outline-none h-24 resize-none" placeholder="Describe ingredients and flavors..." />
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="font-semibold text-[#001f3f] mb-2 flex items-center gap-2">
                  <span className="material-icons-round">view_in_ar</span>
                  AR Assets
                </h4>
                <p className="text-sm text-blue-700 mb-4">Upload your .glb and .usdz files here. They will be stored securely in the restaurant's isolated bucket.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100/50 transition-colors">
                    <span className="material-icons-round text-3xl text-blue-300 mb-2">cloud_upload</span>
                    <span className="text-sm font-medium text-blue-900">Upload .GLB (Android/Web)</span>
                  </div>
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100/50 transition-colors">
                    <span className="material-icons-round text-3xl text-blue-300 mb-2">cloud_upload</span>
                    <span className="text-sm font-medium text-blue-900">Upload .USDZ (iOS)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => setShowAddModal(false)}>Create Dish</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UIPresetEngine = () => {
  const [primaryColor, setPrimaryColor] = useState('#001f3f');
  const [font, setFont] = useState('Inter');

  return (
    <div className="p-8 h-full flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">UI Preset Engine</h2>
          <p className="text-gray-500 text-sm">Customize your public menu appearance</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Brand Color</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-12 rounded-lg cursor-pointer border-0 p-0"
              />
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{primaryColor}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Typography</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFont('Inter')}
                className={`p-4 border rounded-lg text-left ${font === 'Inter' ? 'border-[#001f3f] bg-blue-50' : 'border-gray-200'}`}
              >
                <span className="block font-bold text-lg mb-1" style={{fontFamily: 'Inter'}}>Sans Serif</span>
                <span className="text-xs text-gray-500">Clean & Modern</span>
              </button>
              <button 
                onClick={() => setFont('Playfair Display')}
                className={`p-4 border rounded-lg text-left ${font === 'Playfair Display' ? 'border-[#001f3f] bg-blue-50' : 'border-gray-200'}`}
              >
                <span className="block font-bold text-lg mb-1" style={{fontFamily: 'Playfair Display'}}>Serif</span>
                <span className="text-xs text-gray-500">Elegant & Classic</span>
              </button>
            </div>
          </div>
          
          <Button fullWidth>Save Preset</Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-[375px] h-[700px] border-[12px] border-gray-900 rounded-[40px] overflow-hidden shadow-2xl bg-gray-50 relative flex-shrink-0 mx-auto lg:mx-0">
        <div className="absolute top-0 w-full h-7 bg-gray-900/90 z-20 flex justify-between px-6 items-center text-[10px] text-white">
            <span>9:41</span>
            <div className="flex gap-1">
                <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
        </div>
        
        {/* Mock Menu Interface */}
        <div className="h-full overflow-y-auto no-scrollbar pb-20">
          <div className="bg-white p-6 pt-12 shadow-sm sticky top-0 z-10">
            <div className="flex justify-between items-center mb-4">
                <span className="material-icons-round text-gray-800">menu</span>
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
            <h3 style={{ fontFamily: font, color: primaryColor }} className="text-2xl font-bold">FlavorFusion</h3>
            <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                <span style={{ backgroundColor: primaryColor }} className="px-4 py-1.5 rounded-full text-white text-xs font-bold whitespace-nowrap">Desi</span>
                <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold whitespace-nowrap">Italian</span>
                <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold whitespace-nowrap">Drinks</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
               <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                 <div className="h-32 bg-gray-200 relative">
                    <img src={`https://picsum.photos/400/200?random=${i+10}`} className="w-full h-full object-cover" alt="Dish" />
                    <button style={{ backgroundColor: primaryColor }} className="absolute bottom-2 right-2 text-white p-2 rounded-full shadow-lg">
                        <span className="material-icons-round text-sm">view_in_ar</span>
                    </button>
                 </div>
                 <div className="p-3">
                    <div className="flex justify-between">
                        <h4 style={{ fontFamily: font }} className="font-bold text-gray-900">Delicious Dish {i}</h4>
                        <span style={{ color: primaryColor }} className="font-bold">$24</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">A wonderful description of this amazing dish that makes you hungry.</p>
                 </div>
               </div> 
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Public Menu View (Mobile) ---

const PublicMenu = () => {
  const [activeTab, setActiveTab] = useState('Desi');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ restaurant: Restaurant, dishes: Dish[], preset: UIPreset } | null>(null);

  useEffect(() => {
    supabaseService.getMenuBySlug('flavor-fusion').then(res => {
        setData(res);
        setLoading(false);
    });
  }, []);

  if (loading || !data) return <div className="flex h-screen items-center justify-center text-[#001f3f]"><span className="material-icons-round animate-spin text-4xl">sync</span></div>;

  const { restaurant, dishes, preset } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#001f3f] flex items-center justify-center text-white">
                    <span className="material-icons-round text-sm">restaurant</span>
                </div>
                <h1 style={{ fontFamily: preset.font_family }} className="font-bold text-lg text-gray-900">{restaurant.name}</h1>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-icons-round text-gray-600">search</span>
            </button>
        </div>
        
        {/* Categories */}
        <div className="px-4 pb-3 flex gap-3 overflow-x-auto no-scrollbar">
            {['Desi', 'Continental', 'Italian', 'Beverages'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    style={{ 
                        backgroundColor: activeTab === cat ? preset.primary_color : '#f3f4f6',
                        color: activeTab === cat ? 'white' : '#4b5563'
                    }}
                    className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
                >
                    {cat}
                </button>
            ))}
        </div>
      </header>

      {/* Featured Dish */}
      <div className="p-4 pb-0">
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-md">
            <img src="https://picsum.photos/800/400?random=featured" alt="Featured" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded w-fit mb-1">FEATURED</span>
                <h3 style={{ fontFamily: preset.font_family }} className="text-white font-bold text-xl">Chef's Special Thali</h3>
            </div>
        </div>
      </div>

      {/* Dish Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {dishes.map((dish) => (
            <div key={dish.id} className="flex flex-col gap-2 group cursor-pointer" onClick={() => setSelectedDish(dish)}>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                    <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-[#001f3f] flex items-center justify-center shadow-sm">
                        <span className="material-icons-round text-sm">view_in_ar</span>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-start">
                        <h3 style={{ fontFamily: preset.font_family }} className="font-bold text-gray-900 text-sm leading-tight">{dish.name}</h3>
                        <span style={{ color: preset.primary_color }} className="text-sm font-bold">${dish.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dish.description}</p>
                    <button 
                        style={{ backgroundColor: preset.primary_color }}
                        className="mt-3 w-full rounded-lg py-2 text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5"
                    >
                        <span className="material-icons-round text-sm">view_in_ar</span>
                        View in AR
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40">
         <div className="flex flex-col items-center gap-1 text-[#001f3f]">
            <span className="material-icons-round">restaurant_menu</span>
            <span className="text-[10px] font-bold">Menu</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-icons-round">favorite</span>
            <span className="text-[10px] font-medium">Favorites</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-gray-400 relative">
            <span className="material-icons-round">shopping_bag</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
            <span className="text-[10px] font-medium">Cart</span>
         </div>
         <div className="flex flex-col items-center gap-1 text-gray-400">
            <span className="material-icons-round">person</span>
            <span className="text-[10px] font-medium">Profile</span>
         </div>
      </div>

      {/* AR Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
            <div className="absolute top-4 left-4 z-50">
                <button onClick={() => setSelectedDish(null)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <span className="material-icons-round">arrow_back</span>
                </button>
            </div>
            
            <div className="flex-1 bg-black relative">
                {/* 
                   Implementation Note: 
                   Here we check if the user has scanned a table (simulated).
                   We force 1:1 scale using ar-scale="fixed" in the ModelViewer component.
                */}
                <div className="absolute top-20 left-0 right-0 text-center z-40 pointer-events-none">
                    <div className="bg-black/60 text-white px-4 py-2 rounded-full inline-block backdrop-blur-md text-sm font-medium">
                        Scan an empty table to place dish
                    </div>
                </div>
                
                <ARModelViewer 
                    src={selectedDish.glb_url || ''} 
                    poster={selectedDish.image_url} 
                    alt={selectedDish.name}
                    onView={() => {
                        supabaseService.logEvent({
                            restaurant_id: selectedDish.restaurant_id,
                            dish_id: selectedDish.id,
                            event_type: 'view_ar'
                        });
                    }}
                />
            </div>

            <div className="bg-white p-6 rounded-t-3xl -mt-6 relative z-10 shadow-2xl">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 style={{ fontFamily: preset.font_family }} className="text-2xl font-bold text-gray-900">{selectedDish.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{selectedDish.description}</p>
                    </div>
                    <span style={{ fontFamily: preset.font_family, color: preset.primary_color }} className="text-2xl font-bold">${selectedDish.price}</span>
                </div>
                <Button fullWidth onClick={() => alert('Added to cart!')}>Add to Order</Button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Controller ---

const App = () => {
  const [view, setView] = useState('portal_dashboard'); // Default to dashboard
  const [role, setRole] = useState<UserRole>(UserRole.RESTAURANT_OWNER); // Default to owner
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simple routing simulation
  const renderView = () => {
    switch (view) {
      case 'menu':
        return <PublicMenu />;
      case 'admin_dashboard':
      case 'admin_restaurants':
      case 'admin_health':
        return <SuperAdminDashboard />;
      case 'portal_dashboard':
        return <ClientDashboard />;
      case 'portal_menu':
        return <DishManagement />;
      case 'portal_ui':
        return <UIPresetEngine />;
      case 'portal_email':
        return <div className="p-8"><h1 className="text-2xl font-bold">Email Templates</h1><p className="text-gray-500">Manage automated emails here.</p></div>;
      default:
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#001f3f] mb-2">WebAR SaaS Platform</h1>
                    <p className="text-gray-600">Select a role to enter the demo</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => { setRole(UserRole.SUPER_ADMIN); setView('admin_dashboard'); }} className="w-40 py-4">Super Admin</Button>
                    <Button onClick={() => { setRole(UserRole.RESTAURANT_OWNER); setView('portal_dashboard'); }} className="w-40 py-4">Client Portal</Button>
                    <Button onClick={() => { setRole(UserRole.PUBLIC_USER); setView('menu'); }} variant="secondary" className="w-40 py-4">Public Menu</Button>
                </div>
            </div>
        );
    }
  };

  if (view === 'menu') return renderView();
  if (view === 'landing') return renderView();

  return (
    <div className="flex min-h-screen bg-[#f5f7f8]">
      <Sidebar 
        role={role} 
        currentView={view} 
        setView={setView} 
        onLogout={() => setView('landing')} 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      
      {/* Mobile Toggle & Main Content */}
      <div className="flex-1 md:ml-64 overflow-y-auto h-screen relative">
        <div className="md:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
           <h1 className="font-bold text-[#001f3f]">WebAR SaaS</h1>
           <button onClick={() => setMobileMenuOpen(true)}>
             <span className="material-icons-round text-gray-700">menu</span>
           </button>
        </div>
        {renderView()}
      </div>
    </div>
  );
};

export default App;