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
    'nav.dashboard': 'Dashboard',
    'nav.calendar': 'Calendar',
    'nav.clients': 'Clients',
    'nav.services': 'Services',
    'nav.availability': 'Availability',
    'nav.booking-form': 'Booking Form',
    'nav.analytics': 'Analytics',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.todayAppointments': 'Today\'s Appointments',
    'dashboard.monthlyRevenue': 'Monthly Revenue',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.completionRate': 'Completion Rate',
    'dashboard.todaySchedule': 'Today\'s Schedule',
    'dashboard.noAppointments': 'No appointments scheduled for today',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.newAppointment': 'New Appointment',
    'calendar.view': 'View',
    'calendar.day': 'Day',
    'calendar.week': 'Week',
    'calendar.month': 'Month',
    'calendar.custom': 'Custom',
    
    // Clients
    'clients.title': 'Clients',
    'clients.newClient': 'New Client',
    'clients.search': 'Search clients...',
    'clients.name': 'Name',
    'clients.email': 'Email',
    'clients.phone': 'Phone',
    'clients.status': 'Status',
    'clients.lastVisit': 'Last Visit',
    'clients.totalAppointments': 'Total Appointments',
    'clients.actions': 'Actions',
    'clients.edit': 'Edit',
    'clients.delete': 'Delete',
    'clients.active': 'Active',
    'clients.inactive': 'Inactive',
    
    // Services
    'services.title': 'Services',
    'services.newService': 'New Service',
    'services.name': 'Name',
    'services.price': 'Price',
    'services.duration': 'Duration',
    'services.description': 'Description',
    'services.actions': 'Actions',
    'services.edit': 'Edit',
    'services.delete': 'Delete',
    
    // Availability
    'availability.title': 'Availability Settings',
    'availability.description': 'Configure your working hours for each day of the week.',
    'availability.save': 'Save Availability',
    'availability.saving': 'Saving...',
    'availability.morning': 'Morning:',
    'availability.afternoon': 'Afternoon:',
    'availability.closed': 'Closed',
    'availability.to': 'to',
    
    // Booking Form
    'bookingForm.title': 'Booking Form',
    'bookingForm.description': 'Customize your public booking form',
    'bookingForm.formTitle': 'Form Title',
    'bookingForm.formDescription': 'Description',
    'bookingForm.backgroundColor': 'Background Color',
    'bookingForm.buttonColor': 'Button Color',
    'bookingForm.shareForm': 'Share Your Booking Form',
    'bookingForm.bookingUrl': 'Booking URL',
    'bookingForm.shareOnFacebook': 'Share on Facebook',
    'bookingForm.shareOnWhatsApp': 'Share on WhatsApp',
    'bookingForm.saveChanges': 'Save Changes',
    
    // Modals
    'modal.newClient': 'New Client',
    'modal.editClient': 'Edit Client',
    'modal.clientDescription': 'Add a new client to your database',
    'modal.updateClientDescription': 'Update client information',
    'modal.fullName': 'Full Name',
    'modal.emailAddress': 'Email Address',
    'modal.phoneNumber': 'Phone Number',
    'modal.whatsappNumber': 'WhatsApp Number',
    'modal.notes': 'Notes',
    'modal.cancel': 'Cancel',
    'modal.create': 'Create',
    'modal.update': 'Update',
    'modal.saving': 'Saving...',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
    'common.search': 'Search...',
    'common.actions': 'Actions',
    'common.status': 'Status',
    
    // Days of week
    'days.monday': 'Monday',
    'days.tuesday': 'Tuesday',
    'days.wednesday': 'Wednesday',
    'days.thursday': 'Thursday',
    'days.friday': 'Friday',
    'days.saturday': 'Saturday',
    'days.sunday': 'Sunday',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.businessName': 'Business Name (Optional)',
    'auth.phone': 'Phone (Optional)',
    'auth.createAccount': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
  },
  pt: {
    // Navigation
    'nav.dashboard': 'Painel',
    'nav.calendar': 'Calendário',
    'nav.clients': 'Clientes',
    'nav.services': 'Serviços',
    'nav.availability': 'Disponibilidade',
    'nav.booking-form': 'Formulário',
    'nav.analytics': 'Análises',
    'nav.logout': 'Sair',
    
    // Dashboard
    'dashboard.title': 'Painel de Controle',
    'dashboard.todayAppointments': 'Consultas de Hoje',
    'dashboard.monthlyRevenue': 'Receita Mensal',
    'dashboard.totalClients': 'Total de Clientes',
    'dashboard.completionRate': 'Taxa de Conclusão',
    'dashboard.todaySchedule': 'Agenda de Hoje',
    'dashboard.noAppointments': 'Nenhuma consulta agendada para hoje',
    
    // Calendar
    'calendar.title': 'Calendário',
    'calendar.newAppointment': 'Nova Consulta',
    'calendar.view': 'Visualizar',
    'calendar.day': 'Dia',
    'calendar.week': 'Semana',
    'calendar.month': 'Mês',
    'calendar.custom': 'Personalizado',
    
    // Clients
    'clients.title': 'Clientes',
    'clients.newClient': 'Novo Cliente',
    'clients.search': 'Buscar clientes...',
    'clients.name': 'Nome',
    'clients.email': 'Email',
    'clients.phone': 'Telefone',
    'clients.status': 'Status',
    'clients.lastVisit': 'Última Visita',
    'clients.totalAppointments': 'Total de Consultas',
    'clients.actions': 'Ações',
    'clients.edit': 'Editar',
    'clients.delete': 'Excluir',
    'clients.active': 'Ativo',
    'clients.inactive': 'Inativo',
    
    // Services
    'services.title': 'Serviços',
    'services.newService': 'Novo Serviço',
    'services.name': 'Nome',
    'services.price': 'Preço',
    'services.duration': 'Duração',
    'services.description': 'Descrição',
    'services.actions': 'Ações',
    'services.edit': 'Editar',
    'services.delete': 'Excluir',
    
    // Availability
    'availability.title': 'Configurações de Disponibilidade',
    'availability.description': 'Configure seus horários de trabalho para cada dia da semana.',
    'availability.save': 'Salvar Disponibilidade',
    'availability.saving': 'Salvando...',
    'availability.morning': 'Manhã:',
    'availability.afternoon': 'Tarde:',
    'availability.closed': 'Fechado',
    'availability.to': 'até',
    
    // Booking Form
    'bookingForm.title': 'Formulário de Agendamento',
    'bookingForm.description': 'Personalize seu formulário público de agendamento',
    'bookingForm.formTitle': 'Título do Formulário',
    'bookingForm.formDescription': 'Descrição',
    'bookingForm.backgroundColor': 'Cor de Fundo',
    'bookingForm.buttonColor': 'Cor do Botão',
    'bookingForm.shareForm': 'Compartilhe Seu Formulário de Agendamento',
    'bookingForm.bookingUrl': 'URL de Agendamento',
    'bookingForm.shareOnFacebook': 'Compartilhar no Facebook',
    'bookingForm.shareOnWhatsApp': 'Compartilhar no WhatsApp',
    'bookingForm.saveChanges': 'Salvar Alterações',
    
    // Modals
    'modal.newClient': 'Novo Cliente',
    'modal.editClient': 'Editar Cliente',
    'modal.clientDescription': 'Adicionar um novo cliente ao seu banco de dados',
    'modal.updateClientDescription': 'Atualizar informações do cliente',
    'modal.fullName': 'Nome Completo',
    'modal.emailAddress': 'Endereço de Email',
    'modal.phoneNumber': 'Número de Telefone',
    'modal.whatsappNumber': 'Número do WhatsApp',
    'modal.notes': 'Observações',
    'modal.cancel': 'Cancelar',
    'modal.create': 'Criar',
    'modal.update': 'Atualizar',
    'modal.saving': 'Salvando...',
    
    // Common
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.cancel': 'Cancelar',
    'common.search': 'Buscar...',
    'common.actions': 'Ações',
    'common.status': 'Status',
    
    // Days of week
    'days.monday': 'Segunda-feira',
    'days.tuesday': 'Terça-feira',
    'days.wednesday': 'Quarta-feira',
    'days.thursday': 'Quinta-feira',
    'days.friday': 'Sexta-feira',
    'days.saturday': 'Sábado',
    'days.sunday': 'Domingo',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.register': 'Registrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.fullName': 'Nome Completo',
    'auth.businessName': 'Nome da Empresa (Opcional)',
    'auth.phone': 'Telefone (Opcional)',
    'auth.createAccount': 'Criar Conta',
    'auth.alreadyHaveAccount': 'Já tem uma conta?',
    'auth.dontHaveAccount': 'Não tem uma conta?',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

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