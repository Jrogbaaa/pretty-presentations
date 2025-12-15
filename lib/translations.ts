/**
 * Language Translation System
 * Supports English and Spanish with easy switching
 */

export type Language = "en" | "es";

export interface Translations {
  // Navigation & Actions
  nav: {
    home: string;
    back: string;
    edit: string;
    save: string;
    cancel: string;
    copy: string;
    copied: string;
    exportPdf: string;
    exporting: string;
    reset: string;
    generateResponse: string;
    generating: string;
    clear: string;
  };
  // Hero Section
  hero: {
    title: string;
    subtitleRegular: string;
    subtitleGradient: string;
    description: string;
    cta: string;
  };
  // Features Section
  features: {
    title: string;
    subtitle: string;
    smartMatching: {
      title: string;
      description: string;
    };
    superFast: {
      title: string;
      description: string;
    };
    professionalQuality: {
      title: string;
      description: string;
    };
  };
  // How It Works
  howItWorks: {
    title: string;
    subtitle: string;
    step1: {
      title: string;
      description: string;
    };
    step2: {
      title: string;
      description: string;
    };
    step3: {
      title: string;
      description: string;
    };
  };
  // Brief Section
  brief: {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadDescription: string;
    pasteTitle: string;
    pasteDescription: string;
    analyzeBrief: string;
    analyzingBrief: string;
    randomSample: string;
    briefAnalysis: string;
    clientInfo: string;
    budget: string;
    targetAudience: string;
    timeline: string;
    complete: string;
    tip: string;
    tipText: string;
    randomTip: string;
    randomTipText: string;
    successTitle: string;
    successDescription: string;
    uploadDifferent: string;
  };
  // Form
  form: {
    title: string;
    subtitle: string;
    clientName: string;
    clientNamePlaceholder: string;
    campaignGoals: string;
    campaignGoalsPlaceholder: string;
    budget: string;
    budgetPlaceholder: string;
    budgetRequired: string;
    budgetRequiredText: string;
    influencerRequirements: string;
    totalInfluencers: string;
    totalInfluencersPlaceholder: string;
    specialRequirements: string;
    specialRequirementsPlaceholder: string;
    targetDemographics: string;
    ageRange: string;
    ageRangePlaceholder: string;
    gender: string;
    genderPlaceholder: string;
    locations: string;
    locationsPlaceholder: string;
    interests: string;
    interestsPlaceholder: string;
    platformPreferences: string;
    brandRequirements: string;
    brandRequirementsPlaceholder: string;
    contentThemes: string;
    contentThemesPlaceholder: string;
    manualInfluencers: string;
    manualInfluencersDescription: string;
    manualInfluencersPlaceholder: string;
    timelinePlaceholder: string;
    additionalNotes: string;
    additionalNotesPlaceholder: string;
    additionalContext: string;
    additionalContextDescription: string;
    uploadFiles: string;
    pasteContext: string;
    attachedContext: string;
    contextTip: string;
    add: string;
  };
  // Response Page
  response: {
    title: string;
    editingMode: string;
    editingDescription: string;
    unsavedChanges: string;
    generatedOn: string;
    influencersMatched: string;
    notFound: string;
    notFoundDescription: string;
    returnHome: string;
    loading: string;
    discardChanges: string;
  };
  // Errors
  errors: {
    rateLimitTitle: string;
    rateLimitText: string;
    tryAgainIn: string;
    error: string;
    budgetRequired: string;
    offline: string;
    offlineWarning: string;
    analysisError: string;
    pdfError: string;
    enterBrief: string;
  };
  // Footer
  footer: {
    company: string;
    tagline: string;
    poweredBy: string;
    copyright: string;
  };
  // PDF Export
  pdf: {
    brandName: string;
    influencerRecommendations: string;
    generatedOn: string;
    confidential: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      back: "Back",
      edit: "Edit",
      save: "Save Changes",
      cancel: "Cancel",
      copy: "Copy",
      copied: "Copied!",
      exportPdf: "Export PDF",
      exporting: "Exporting...",
      reset: "Reset",
      generateResponse: "Generate Brief Response",
      generating: "Generating...",
      clear: "Clear",
    },
    hero: {
      title: "AI Brief Responder",
      subtitleRegular: "Transform briefs into ",
      subtitleGradient: "strategic recommendations",
      description: "Our intelligent platform analyzes your client briefs and generates comprehensive influencer recommendations with detailed strategy, budget breakdowns, and performance projections.",
      cta: "Respond to Brief",
    },
    features: {
      title: "Why Choose Our Brief Responder?",
      subtitle: "Everything you need to create professional influencer recommendations",
      smartMatching: {
        title: "Smart Matching",
        description: "AI analyzes thousands of influencers to find the perfect fit for your campaign goals and target audience",
      },
      superFast: {
        title: "Super Fast",
        description: "Generate complete client-ready brief responses in minutes instead of spending hours on manual work",
      },
      professionalQuality: {
        title: "Professional Quality",
        description: "Agency-level recommendations with detailed strategy, budgets, and KPI projections that impress clients",
      },
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Three simple steps to respond to your client brief",
      step1: {
        title: "1. Upload Brief",
        description: "Paste your client brief or fill out our simple form with campaign details",
      },
      step2: {
        title: "2. AI Analysis",
        description: "Our AI analyzes your brief and matches the perfect influencers automatically",
      },
      step3: {
        title: "3. Get Response",
        description: "Receive your detailed brief response with influencer recommendations and strategy",
      },
    },
    brief: {
      title: "Respond to Your Brief",
      subtitle: "Upload your brief or fill out the form below to generate your influencer recommendations",
      uploadTitle: "Paste Your Brief",
      uploadDescription: "Paste your client brief below. Works with English, Spanish or mixed language briefs.",
      pasteTitle: "Brief Text",
      pasteDescription: "Paste your brief here... (e.g., client briefs in Spanish or English)",
      analyzeBrief: "Analyze Brief & Auto-Fill Form",
      analyzingBrief: "Analyzing with AI...",
      randomSample: "Random Sample",
      briefAnalysis: "Brief Analysis",
      clientInfo: "Client Info",
      budget: "Budget",
      targetAudience: "Target Audience",
      timeline: "Timeline",
      complete: "Complete",
      tip: "💡 Tip:",
      tipText: "Our AI can analyze briefs in any format. Just paste the text and we'll extract: client name, budget, target demographics, campaign goals, timeline and more.",
      randomTip: "🎲 Random Sample:",
      randomTipText: "Each click generates a unique brief from our database of 218 Spanish and international brands across 15+ industries!",
      successTitle: "Brief Successfully Analyzed!",
      successDescription: "We've extracted all the information from your brief and pre-filled the form below. Review the details and make any necessary adjustments before generating your response.",
      uploadDifferent: "Upload a different brief",
    },
    form: {
      title: "Client Brief",
      subtitle: "Fill in the campaign details to generate your influencer recommendations",
      clientName: "Client Name",
      clientNamePlaceholder: "e.g., Starbucks, Nike, Red Bull",
      campaignGoals: "Campaign Goals",
      campaignGoalsPlaceholder: "e.g., Increase brand awareness, Drive product sales",
      budget: "Budget (€)",
      budgetPlaceholder: "e.g., 50000",
      budgetRequired: "Budget Required",
      budgetRequiredText: "No budget found in your brief. Please enter a campaign budget below to generate influencer recommendations.",
      influencerRequirements: "Influencer Requirements",
      totalInfluencers: "Total Influencers Needed",
      totalInfluencersPlaceholder: "e.g., 8 (leave empty for automatic selection)",
      specialRequirements: "Special Requirements",
      specialRequirementsPlaceholder: "e.g., 50% macro, 50% micro",
      targetDemographics: "Target Demographics",
      ageRange: "Age Range",
      ageRangePlaceholder: "e.g., 18-35",
      gender: "Gender",
      genderPlaceholder: "e.g., All genders, 60% Female",
      locations: "Locations",
      locationsPlaceholder: "e.g., Spain, Madrid, Barcelona",
      interests: "Interests",
      interestsPlaceholder: "e.g., Fashion, Technology, Sports",
      platformPreferences: "Platform Preferences",
      brandRequirements: "Brand Requirements",
      brandRequirementsPlaceholder: "e.g., No alcohol mentions, Family-friendly content",
      contentThemes: "Content Themes",
      contentThemesPlaceholder: "e.g., Authenticity, Sustainability, Innovation",
      manualInfluencers: "Manually Requested Influencers",
      manualInfluencersDescription: "Add specific influencer names or Instagram handles you want to include. Formats: \"name\", \"@handle\", or \"name (@handle)\"",
      manualInfluencersPlaceholder: "e.g., Maria Garcia, @maria_garcia, or Maria Garcia (@maria_garcia)",
      timelinePlaceholder: "e.g., Q1 2025, March-May 2025, 8 weeks",
      additionalNotes: "Additional Notes",
      additionalNotesPlaceholder: "Any additional information or special requirements...",
      additionalContext: "Additional Context",
      additionalContextDescription: "Upload PDFs, presentations, or add text with extra campaign details",
      uploadFiles: "Click to upload or drag and drop",
      pasteContext: "Or paste additional context text",
      attachedContext: "Attached Context",
      contextTip: "💡 Tip: Upload client presentations, brand guidelines, or previous campaign reports. Our AI will use this extra context to provide better-tailored recommendations.",
      add: "Add",
    },
    response: {
      title: "Influencer Recommendations",
      editingMode: "Editing Mode Active",
      editingDescription: "Click on any section below to edit it directly. Changes are highlighted with a purple border.",
      unsavedChanges: "Unsaved changes",
      generatedOn: "Generated on",
      influencersMatched: "influencer(s) matched",
      notFound: "Response Not Found",
      notFoundDescription: "The response you're looking for doesn't exist or has been removed.",
      returnHome: "Return Home",
      loading: "Loading response...",
      discardChanges: "You have unsaved changes. Are you sure you want to discard them?",
    },
    errors: {
      rateLimitTitle: "Rate Limit Reached",
      rateLimitText: "To prevent abuse, we limit requests to 5 per minute. Your limit will reset soon.",
      tryAgainIn: "Try again in",
      error: "Error",
      budgetRequired: "Please enter a campaign budget before generating your brief response.",
      offline: "You are offline. Please check your internet connection and try again.",
      offlineWarning: "You are currently offline. Features that require internet will not work.",
      analysisError: "Analysis Error",
      pdfError: "There was an issue generating the PDF. Please try again or use the copy function to copy the content.",
      enterBrief: "Please enter or paste a brief first",
    },
    footer: {
      company: "Look After You",
      tagline: "AI-powered influencer talent agency",
      poweredBy: "Powered by OpenAI",
      copyright: "© 2025 Brief Responder. All rights reserved.",
    },
    pdf: {
      brandName: "BRIEF CONVERTER",
      influencerRecommendations: "Influencer Recommendations",
      generatedOn: "Generated on",
      confidential: "Confidential - For Client Use Only",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      back: "Volver",
      edit: "Editar",
      save: "Guardar Cambios",
      cancel: "Cancelar",
      copy: "Copiar",
      copied: "¡Copiado!",
      exportPdf: "Exportar PDF",
      exporting: "Exportando...",
      reset: "Reiniciar",
      generateResponse: "Generar Respuesta al Brief",
      generating: "Generando...",
      clear: "Limpiar",
    },
    hero: {
      title: "Respondedor de Briefs con IA",
      subtitleRegular: "Transforma briefs en ",
      subtitleGradient: "recomendaciones estratégicas",
      description: "Nuestra plataforma inteligente analiza tus briefs de clientes y genera recomendaciones completas de influencers con estrategia detallada, desglose de presupuesto y proyecciones de rendimiento.",
      cta: "Responder al Brief",
    },
    features: {
      title: "¿Por Qué Elegir Nuestro Respondedor de Briefs?",
      subtitle: "Todo lo que necesitas para crear recomendaciones profesionales de influencers",
      smartMatching: {
        title: "Matching Inteligente",
        description: "La IA analiza miles de influencers para encontrar el ajuste perfecto para tus objetivos de campaña y audiencia objetivo",
      },
      superFast: {
        title: "Súper Rápido",
        description: "Genera respuestas completas listas para el cliente en minutos en lugar de pasar horas en trabajo manual",
      },
      professionalQuality: {
        title: "Calidad Profesional",
        description: "Recomendaciones de nivel agencia con estrategia detallada, presupuestos y proyecciones de KPI que impresionan a los clientes",
      },
    },
    howItWorks: {
      title: "Cómo Funciona",
      subtitle: "Tres simples pasos para responder a tu brief de cliente",
      step1: {
        title: "1. Sube el Brief",
        description: "Pega tu brief de cliente o completa nuestro simple formulario con los detalles de la campaña",
      },
      step2: {
        title: "2. Análisis de IA",
        description: "Nuestra IA analiza tu brief y encuentra automáticamente los influencers perfectos",
      },
      step3: {
        title: "3. Obtén la Respuesta",
        description: "Recibe tu respuesta detallada al brief con recomendaciones de influencers y estrategia",
      },
    },
    brief: {
      title: "Responde a Tu Brief",
      subtitle: "Sube tu brief o completa el formulario para generar tus recomendaciones de influencers",
      uploadTitle: "Pega Tu Brief",
      uploadDescription: "Pega tu brief de cliente abajo. Funciona con briefs en inglés, español o mixtos.",
      pasteTitle: "Texto del Brief",
      pasteDescription: "Pega tu brief aquí... (ej., briefs de cliente en español o inglés)",
      analyzeBrief: "Analizar Brief y Auto-Completar",
      analyzingBrief: "Analizando con IA...",
      randomSample: "Muestra Aleatoria",
      briefAnalysis: "Análisis del Brief",
      clientInfo: "Info del Cliente",
      budget: "Presupuesto",
      targetAudience: "Audiencia Objetivo",
      timeline: "Cronograma",
      complete: "Completo",
      tip: "💡 Consejo:",
      tipText: "Nuestra IA puede analizar briefs en cualquier formato. Solo pega el texto y extraeremos: nombre del cliente, presupuesto, demografía objetivo, objetivos de campaña, cronograma y más.",
      randomTip: "🎲 Muestra Aleatoria:",
      randomTipText: "¡Cada clic genera un brief único de nuestra base de datos de 218 marcas españolas e internacionales en más de 15 industrias!",
      successTitle: "¡Brief Analizado con Éxito!",
      successDescription: "Hemos extraído toda la información de tu brief y pre-completado el formulario. Revisa los detalles y haz los ajustes necesarios antes de generar tu respuesta.",
      uploadDifferent: "Subir un brief diferente",
    },
    form: {
      title: "Brief del Cliente",
      subtitle: "Completa los detalles de la campaña para generar tus recomendaciones de influencers",
      clientName: "Nombre del Cliente",
      clientNamePlaceholder: "ej., Starbucks, Nike, Red Bull",
      campaignGoals: "Objetivos de la Campaña",
      campaignGoalsPlaceholder: "ej., Aumentar conocimiento de marca, Impulsar ventas",
      budget: "Presupuesto (€)",
      budgetPlaceholder: "ej., 50000",
      budgetRequired: "Presupuesto Requerido",
      budgetRequiredText: "No se encontró presupuesto en tu brief. Por favor ingresa un presupuesto de campaña para generar recomendaciones de influencers.",
      influencerRequirements: "Requisitos de Influencers",
      totalInfluencers: "Total de Influencers Necesarios",
      totalInfluencersPlaceholder: "ej., 8 (dejar vacío para selección automática)",
      specialRequirements: "Requisitos Especiales",
      specialRequirementsPlaceholder: "ej., 50% macro, 50% micro",
      targetDemographics: "Demografía Objetivo",
      ageRange: "Rango de Edad",
      ageRangePlaceholder: "ej., 18-35",
      gender: "Género",
      genderPlaceholder: "ej., Todos los géneros, 60% Mujeres",
      locations: "Ubicaciones",
      locationsPlaceholder: "ej., España, Madrid, Barcelona",
      interests: "Intereses",
      interestsPlaceholder: "ej., Moda, Tecnología, Deportes",
      platformPreferences: "Preferencias de Plataforma",
      brandRequirements: "Requisitos de Marca",
      brandRequirementsPlaceholder: "ej., Sin menciones de alcohol, Contenido familiar",
      contentThemes: "Temas de Contenido",
      contentThemesPlaceholder: "ej., Autenticidad, Sostenibilidad, Innovación",
      manualInfluencers: "Influencers Solicitados Manualmente",
      manualInfluencersDescription: "Añade nombres específicos de influencers o handles de Instagram que quieras incluir. Formatos: \"nombre\", \"@handle\", o \"nombre (@handle)\"",
      manualInfluencersPlaceholder: "ej., María García, @maria_garcia, o María García (@maria_garcia)",
      timelinePlaceholder: "ej., Q1 2025, Marzo-Mayo 2025, 8 semanas",
      additionalNotes: "Notas Adicionales",
      additionalNotesPlaceholder: "Cualquier información adicional o requisitos especiales...",
      additionalContext: "Contexto Adicional",
      additionalContextDescription: "Sube PDFs, presentaciones, o añade texto con detalles extra de la campaña",
      uploadFiles: "Haz clic para subir o arrastra y suelta",
      pasteContext: "O pega texto de contexto adicional",
      attachedContext: "Contexto Adjunto",
      contextTip: "💡 Consejo: Sube presentaciones de clientes, guías de marca, o informes de campañas anteriores. Nuestra IA usará este contexto extra para proporcionar recomendaciones mejor adaptadas.",
      add: "Añadir",
    },
    response: {
      title: "Recomendaciones de Influencers",
      editingMode: "Modo de Edición Activo",
      editingDescription: "Haz clic en cualquier sección para editarla directamente. Los cambios se resaltan con un borde púrpura.",
      unsavedChanges: "Cambios sin guardar",
      generatedOn: "Generado el",
      influencersMatched: "influencer(s) coincidentes",
      notFound: "Respuesta No Encontrada",
      notFoundDescription: "La respuesta que buscas no existe o ha sido eliminada.",
      returnHome: "Volver al Inicio",
      loading: "Cargando respuesta...",
      discardChanges: "Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?",
    },
    errors: {
      rateLimitTitle: "Límite de Solicitudes Alcanzado",
      rateLimitText: "Para prevenir abusos, limitamos las solicitudes a 5 por minuto. Tu límite se reiniciará pronto.",
      tryAgainIn: "Intenta de nuevo en",
      error: "Error",
      budgetRequired: "Por favor ingresa un presupuesto de campaña antes de generar tu respuesta al brief.",
      offline: "Estás sin conexión. Por favor verifica tu conexión a internet e intenta de nuevo.",
      offlineWarning: "Actualmente estás sin conexión. Las funciones que requieren internet no funcionarán.",
      analysisError: "Error de Análisis",
      pdfError: "Hubo un problema al generar el PDF. Por favor intenta de nuevo o usa la función de copiar para copiar el contenido.",
      enterBrief: "Por favor ingresa o pega un brief primero",
    },
    footer: {
      company: "Look After You",
      tagline: "Agencia de talento de influencers impulsada por IA",
      poweredBy: "Impulsado por OpenAI",
      copyright: "© 2025 Brief Responder. Todos los derechos reservados.",
    },
    pdf: {
      brandName: "BRIEF CONVERTER",
      influencerRecommendations: "Recomendaciones de Influencers",
      generatedOn: "Generado el",
      confidential: "Confidencial - Solo para Uso del Cliente",
    },
  },
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang];
};

