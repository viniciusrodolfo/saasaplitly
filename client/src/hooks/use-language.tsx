import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'calendar': 'Calendar',
    'clients': 'Clients', 
    'services': 'Services',
    'availability': 'Availability',
    'bookingForm': 'Booking Form',
    'analytics': 'Analytics',
    'logout': 'Logout',
    'appointmentManager': 'Appointment Manager',
    'professional': 'Professional',
    'toggleTheme': 'Toggle Theme',
    
    // Header descriptions
    'welcomeMessage': "Welcome back! Here's what's happening today.",
    'calendarDescription': "Manage your appointments and schedule.",
    'clientsDescription': "View and manage your client information.",
    'servicesDescription': "Configure your services and pricing.",
    'availabilityDescription': "Set your working hours and availability.",
    'bookingFormDescription': "Customize your public booking form.",
    'analyticsDescription': "View your business insights and metrics.",
    'defaultDescription': "Manage your business effectively.",
    
    // Dashboard
    'todayAppointments': 'Today\'s Appointments',
    'monthlyRevenue': 'Monthly Revenue',
    'totalClients': 'Total Clients',
    'completionRate': 'Completion Rate',
    'todaySchedule': 'Today\'s Schedule',
    'noAppointments': 'No appointments scheduled for today',
    
    // Common
    'loading': 'Loading...',
    'save': 'Save',
    'cancel': 'Cancel',
    'create': 'Create',
    'update': 'Update',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'close': 'Close',
    'search': 'Search...',
    'saving': 'Saving...',
    'morning': 'Morning:',
    'afternoon': 'Afternoon:',
    'closed': 'Closed',
    'to': 'to',
  },
  pt: {
    // Navigation  
    'dashboard': 'Dashboard',
    'calendar': 'Calendário',
    'clients': 'Clientes',
    'services': 'Serviços',
    'availability': 'Disponibilidade',
    'bookingForm': 'Formulário de Agendamento',
    'analytics': 'Relatórios',
    'logout': 'Sair',
    'appointmentManager': 'Gerenciador de Agendamentos',
    'professional': 'Profissional',
    'toggleTheme': 'Alternar Tema',
    
    // Header descriptions
    'welcomeMessage': "Bem-vindo de volta! Veja o que está acontecendo hoje.",
    'calendarDescription': "Gerencie seus agendamentos e horários.",
    'clientsDescription': "Visualize e gerencie informações dos clientes.",
    'servicesDescription': "Configure seus serviços e preços.",
    'availabilityDescription': "Defina seus horários de trabalho e disponibilidade.",
    'bookingFormDescription': "Personalize seu formulário público de agendamento.",
    'analyticsDescription': "Visualize insights e métricas do seu negócio.",
    'defaultDescription': "Gerencie seu negócio efetivamente.",
    
    // Dashboard
    'todayAppointments': 'Agendamentos de Hoje',
    'monthlyRevenue': 'Receita Mensal', 
    'totalClients': 'Total de Clientes',
    'completionRate': 'Taxa de Conclusão',
    'todaySchedule': 'Agenda de Hoje',
    'noAppointments': 'Nenhum agendamento para hoje',
    
    // Common
    'loading': 'Carregando...',
    'save': 'Salvar',
    'cancel': 'Cancelar',
    'create': 'Criar',
    'update': 'Atualizar',
    'delete': 'Excluir',
    'edit': 'Editar',
    'view': 'Visualizar',
    'close': 'Fechar',
    'search': 'Pesquisar...',
    'saving': 'Salvando...',
    'morning': 'Manhã:',
    'afternoon': 'Tarde:',
    'closed': 'Fechado',
    'to': 'até',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt'); // Default to Portuguese

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}