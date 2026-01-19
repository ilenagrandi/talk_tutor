import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const translations = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    
    // Splash & Onboarding
    appName: 'TalkTutor',
    appSubtitle: 'Master Every Conversation',
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
    
    onboarding: {
      step1: {
        title: 'AI-Powered Coaching',
        description: 'Get instant feedback on any conversation with advanced AI analysis'
      },
      step2: {
        title: 'Achieve Your Goals',
        description: 'Whether it is dating, networking, or resolving conflicts - we have got you covered'
      },
      step3: {
        title: 'Match Your Style',
        description: 'Choose from 6 communication tones to sound exactly how you want'
      },
      step4: {
        title: 'Analyze Anything',
        description: 'Upload screenshots, paste text, or share images - we will help you respond'
      }
    },
    
    // Auth
    auth: {
      login: 'Log In',
      signup: 'Sign Up',
      logout: 'Log Out',
      loginWithGoogle: 'Continue with Google',
      loginWithApple: 'Continue with Apple',
      loginWithEmail: 'Continue with Email',
      or: 'or',
      enterEmail: 'Enter your email',
      sendCode: 'Send Code',
      enterCode: 'Enter verification code',
      verify: 'Verify',
      welcomeBack: 'Welcome Back',
      getStartedFree: 'Get Started',
      loginDescription: 'Sign in to access your personalized communication coach'
    },
    
    // Home
    home: {
      title: 'TalkTutor',
      subtitle: 'Your AI Communication Coach',
      whatToAnalyze: 'What do you want to analyze?',
      text: 'Text',
      image: 'Image',
      pasteConversation: 'Paste your conversation here...',
      imageSelected: 'Image selected',
      changeImage: 'Change Image',
      additionalContext: 'Additional Context (Optional)',
      contextPlaceholder: 'Add context about the conversation, the person, or your situation...',
      howToSound: 'How do you want to sound?',
      selectTone: 'Select Tone',
      whatIsGoal: 'What is your goal?',
      selectGoal: 'Select Goal',
      analyze: 'Analyze & Get Suggestions',
      analyzing: 'Analyzing...'
    },
    
    // Tones
    tones: {
      professional: 'Professional',
      professionalDesc: 'Business-like and formal',
      friendly: 'Friendly',
      friendlyDesc: 'Warm and approachable',
      confident: 'Confident',
      confidentDesc: 'Assertive and strong',
      empathetic: 'Empathetic',
      empatheticDesc: 'Understanding and caring',
      flirty: 'Flirty',
      flirtyDesc: 'Playful and romantic',
      witty: 'Witty',
      wittyDesc: 'Clever and humorous'
    },
    
    // Goals
    goals: {
      date: 'Get a Date',
      dateDesc: 'Continue romantic conversation',
      resolve: 'Resolve Conflict',
      resolveDesc: 'Make peace and find common ground',
      network: 'Network Professionally',
      networkDesc: 'Build professional connections',
      friend: 'Make a Friend',
      friendDesc: 'Develop friendship',
      negotiate: 'Negotiate/Close Deal',
      negotiateDesc: 'Reach agreement or close sale',
      casual: 'Keep It Casual',
      casualDesc: 'Light, easy conversation'
    },
    
    // Results
    results: {
      title: 'Analysis Results',
      analysis: 'Analysis',
      suggestions: 'Suggested Responses',
      copy: 'Copy',
      copied: 'Copied!',
      copiedMessage: 'Suggestion copied to clipboard',
      newAnalysis: 'New Analysis',
      share: 'Share'
    },
    
    // History
    history: {
      title: 'History',
      subtitle: 'Your past analyses',
      empty: 'No analyses yet',
      emptySubtext: 'Start by analyzing your first conversation!'
    },
    
    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Manage your preferences',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      darkModeOn: 'Enabled',
      darkModeOff: 'Disabled',
      language: 'Language',
      languageDesc: 'App language',
      account: 'Account',
      profile: 'Profile',
      profileDesc: 'Manage your account',
      subscription: 'Subscription',
      subscriptionActive: 'Active subscription',
      subscriptionInactive: 'Get premium access',
      support: 'Support',
      help: 'Help & FAQ',
      helpDesc: 'Get answers to your questions',
      contact: 'Contact Support',
      contactDesc: 'We are here to help',
      about: 'About',
      privacy: 'Privacy Policy',
      privacyDesc: 'How we protect your data',
      terms: 'Terms of Service',
      termsDesc: 'Usage terms and conditions',
      aboutApp: 'About TalkTutor',
      version: 'Version 1.0.0',
      logout: 'Log Out'
    },
    
    // Subscription
    subscription: {
      title: 'Choose Your Plan',
      unlock: 'Unlock Premium Features',
      subtitle: 'Get unlimited AI-powered conversation coaching',
      monthly: 'Monthly',
      annual: 'Annual',
      save: 'Save 33%',
      whatYouGet: 'What you get:',
      subscribeNow: 'Subscribe Now',
      premium: 'Premium',
      disclaimer: 'By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime.',
      standard: {
        name: 'Standard',
        features: [
          'Unlimited conversation analysis',
          'Standard AI model',
          '3 suggestions per analysis',
          'Complete history access'
        ]
      },
      premiumPlan: {
        name: 'Premium',
        features: [
          'All Standard features',
          'Advanced AI analysis',
          '5 suggestions per analysis',
          'Enhanced emotional tone analysis',
          'Follow-up suggestions',
          'Priority support'
        ]
      },
      pro: {
        name: 'Pro',
        features: [
          'All Premium features',
          'Multi-language analysis',
          'PDF report exports',
          'Conversation pattern analysis',
          'API access'
        ]
      }
    },
    
    // Paywall
    paywall: {
      title: 'Premium Feature',
      description: 'Subscribe to unlock AI-powered conversation analysis and get unlimited suggestions',
      viewPlans: 'View Plans',
      maybeLater: 'Maybe Later'
    },
    
    // Errors
    errors: {
      noContent: 'No Content',
      noContentMessage: 'Please enter text or upload an image',
      missingInfo: 'Missing Information',
      missingInfoMessage: 'Please select both a tone and a goal',
      analysisError: 'Error',
      analysisErrorMessage: 'Failed to analyze. Please try again.',
      subscriptionRequired: 'Subscription Required',
      subscriptionRequiredMessage: 'You need an active subscription to use this feature',
      sessionExpired: 'Session Expired',
      sessionExpiredMessage: 'Please log in again'
    }
  },
  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    close: 'Cerrar',
    
    // Splash & Onboarding
    appName: 'TalkTutor',
    appSubtitle: 'Domina Cada Conversación',
    skip: 'Saltar',
    next: 'Siguiente',
    getStarted: 'Comenzar',
    
    onboarding: {
      step1: {
        title: 'Coaching con IA',
        description: 'Obtén retroalimentación instantánea en cualquier conversación con análisis avanzado de IA'
      },
      step2: {
        title: 'Alcanza tus Objetivos',
        description: 'Ya sea citas, networking o resolver conflictos - te tenemos cubierto'
      },
      step3: {
        title: 'Ajusta tu Estilo',
        description: 'Elige entre 6 tonos de comunicación para sonar exactamente como quieres'
      },
      step4: {
        title: 'Analiza Cualquier Cosa',
        description: 'Sube capturas, pega texto o comparte imágenes - te ayudaremos a responder'
      }
    },
    
    // Auth
    auth: {
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      logout: 'Cerrar Sesión',
      loginWithGoogle: 'Continuar con Google',
      loginWithApple: 'Continuar con Apple',
      loginWithEmail: 'Continuar con Email',
      or: 'o',
      enterEmail: 'Ingresa tu email',
      sendCode: 'Enviar Código',
      enterCode: 'Ingresa el código de verificación',
      verify: 'Verificar',
      welcomeBack: 'Bienvenido de Nuevo',
      getStartedFree: 'Comenzar',
      loginDescription: 'Inicia sesión para acceder a tu coach de comunicación personalizado'
    },
    
    // Home
    home: {
      title: 'TalkTutor',
      subtitle: 'Tu Coach de Comunicación con IA',
      whatToAnalyze: '¿Qué quieres analizar?',
      text: 'Texto',
      image: 'Imagen',
      pasteConversation: 'Pega tu conversación aquí...',
      imageSelected: 'Imagen seleccionada',
      changeImage: 'Cambiar Imagen',
      additionalContext: 'Contexto Adicional (Opcional)',
      contextPlaceholder: 'Agrega contexto sobre la conversación, la persona o tu situación...',
      howToSound: '¿Cómo quieres sonar?',
      selectTone: 'Seleccionar Tono',
      whatIsGoal: '¿Cuál es tu objetivo?',
      selectGoal: 'Seleccionar Objetivo',
      analyze: 'Analizar y Obtener Sugerencias',
      analyzing: 'Analizando...'
    },
    
    // Tones
    tones: {
      professional: 'Profesional',
      professionalDesc: 'Empresarial y formal',
      friendly: 'Amigable',
      friendlyDesc: 'Cálido y accesible',
      confident: 'Confiado',
      confidentDesc: 'Asertivo y fuerte',
      empathetic: 'Empático',
      empatheticDesc: 'Comprensivo y atento',
      flirty: 'Coqueto',
      flirtyDesc: 'Juguetón y romántico',
      witty: 'Ingenioso',
      wittyDesc: 'Inteligente y humorístico'
    },
    
    // Goals
    goals: {
      date: 'Conseguir una Cita',
      dateDesc: 'Continuar conversación romántica',
      resolve: 'Resolver Conflicto',
      resolveDesc: 'Hacer las paces y encontrar puntos en común',
      network: 'Networking Profesional',
      networkDesc: 'Construir conexiones profesionales',
      friend: 'Hacer un Amigo',
      friendDesc: 'Desarrollar amistad',
      negotiate: 'Negociar/Cerrar Trato',
      negotiateDesc: 'Alcanzar acuerdo o cerrar venta',
      casual: 'Mantenerlo Casual',
      casualDesc: 'Conversación ligera y fácil'
    },
    
    // Results
    results: {
      title: 'Resultados del Análisis',
      analysis: 'Análisis',
      suggestions: 'Respuestas Sugeridas',
      copy: 'Copiar',
      copied: '¡Copiado!',
      copiedMessage: 'Sugerencia copiada al portapapeles',
      newAnalysis: 'Nuevo Análisis',
      share: 'Compartir'
    },
    
    // History
    history: {
      title: 'Historial',
      subtitle: 'Tus análisis anteriores',
      empty: 'Aún no hay análisis',
      emptySubtext: '¡Comienza analizando tu primera conversación!'
    },
    
    // Settings
    settings: {
      title: 'Configuración',
      subtitle: 'Administra tus preferencias',
      appearance: 'Apariencia',
      darkMode: 'Modo Oscuro',
      darkModeOn: 'Activado',
      darkModeOff: 'Desactivado',
      language: 'Idioma',
      languageDesc: 'Idioma de la aplicación',
      account: 'Cuenta',
      profile: 'Perfil',
      profileDesc: 'Administra tu cuenta',
      subscription: 'Suscripción',
      subscriptionActive: 'Suscripción activa',
      subscriptionInactive: 'Obtener acceso premium',
      support: 'Soporte',
      help: 'Ayuda y FAQ',
      helpDesc: 'Obtén respuestas a tus preguntas',
      contact: 'Contactar Soporte',
      contactDesc: 'Estamos aquí para ayudar',
      about: 'Acerca de',
      privacy: 'Política de Privacidad',
      privacyDesc: 'Cómo protegemos tus datos',
      terms: 'Términos de Servicio',
      termsDesc: 'Términos y condiciones de uso',
      aboutApp: 'Acerca de TalkTutor',
      version: 'Versión 1.0.0',
      logout: 'Cerrar Sesión'
    },
    
    // Subscription
    subscription: {
      title: 'Elige tu Plan',
      unlock: 'Desbloquea Funciones Premium',
      subtitle: 'Obtén coaching de conversación ilimitado con IA',
      monthly: 'Mensual',
      annual: 'Anual',
      save: 'Ahorra 33%',
      whatYouGet: 'Lo que obtienes:',
      subscribeNow: 'Suscribirse Ahora',
      premium: 'Premium',
      disclaimer: 'Al suscribirte, aceptas nuestros Términos de Servicio y Política de Privacidad. Cancela en cualquier momento.',
      standard: {
        name: 'Estándar',
        features: [
          'Análisis de conversación ilimitado',
          'Modelo de IA estándar',
          '3 sugerencias por análisis',
          'Acceso completo al historial'
        ]
      },
      premiumPlan: {
        name: 'Premium',
        features: [
          'Todas las funciones Estándar',
          'Análisis avanzado de IA',
          '5 sugerencias por análisis',
          'Análisis de tono emocional mejorado',
          'Sugerencias de seguimiento',
          'Soporte prioritario'
        ]
      },
      pro: {
        name: 'Pro',
        features: [
          'Todas las funciones Premium',
          'Análisis multi-idioma',
          'Exportar reportes en PDF',
          'Análisis de patrones de conversación',
          'Acceso a API'
        ]
      }
    },
    
    // Paywall
    paywall: {
      title: 'Función Premium',
      description: 'Suscríbete para desbloquear el análisis de conversación con IA y obtener sugerencias ilimitadas',
      viewPlans: 'Ver Planes',
      maybeLater: 'Quizás Después'
    },
    
    // Errors
    errors: {
      noContent: 'Sin Contenido',
      noContentMessage: 'Por favor ingresa texto o sube una imagen',
      missingInfo: 'Información Faltante',
      missingInfoMessage: 'Por favor selecciona un tono y un objetivo',
      analysisError: 'Error',
      analysisErrorMessage: 'Error al analizar. Por favor intenta de nuevo.',
      subscriptionRequired: 'Suscripción Requerida',
      subscriptionRequiredMessage: 'Necesitas una suscripción activa para usar esta función',
      sessionExpired: 'Sesión Expirada',
      sessionExpiredMessage: 'Por favor inicia sesión nuevamente'
    }
  }
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
const deviceLocale = Localization.locale || Localization.locales?.[0] || 'en';
i18n.locale = deviceLocale.startsWith('es') ? 'es' : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
