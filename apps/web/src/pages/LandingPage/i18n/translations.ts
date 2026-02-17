export type Language = 'pt-BR' | 'en'

type TranslationValue = string | readonly string[]

interface NestedTranslation {
  readonly [key: string]: TranslationValue | NestedTranslation
}

export interface Translations {
  readonly [key: string]: NestedTranslation
}

const translations: Record<Language, Translations> = {
  'pt-BR': {
    nav: {
      features: { value: 'Funcionalidades' },
      howItWorks: { value: 'Como Funciona' },
      pricing: { value: 'Planos' },
      faq: { value: 'FAQ' },
      cta: { value: 'Acessar Plataforma' },
    },
    hero: {
      title: { value: 'Gestão inteligente para' },
      titleHighlight: { value: 'equipes voluntárias' },
      subtitle: {
        value:
          'Organize escalas, gerencie voluntários e potencialize o engajamento da sua igreja com uma plataforma moderna e intuitiva.',
      },
      cta: { value: 'Teste Grátis por 15 Dias' },
      ctaSecondary: { value: 'Veja Como Funciona' },
    },
    stats: {
      churches: { value: 'Igrejas Ativas' },
      volunteers: { value: 'Voluntários Gerenciados' },
      schedules: { value: 'Escalas Criadas' },
      services: { value: 'Cultos Organizados' },
    },
    features: {
      title: { value: 'Tudo que sua equipe precisa' },
      subtitle: {
        value:
          'Ferramentas poderosas para simplificar a gestão de voluntários e escalas da sua igreja.',
      },
      teams: {
        title: { value: 'Gestão de Times' },
        description: {
          value: 'Organize voluntários em equipes com papéis e responsabilidades definidos.',
        },
      },
      schedules: {
        title: { value: 'Escalas Inteligentes' },
        description: {
          value:
            'Crie e gerencie escalas automaticamente, respeitando disponibilidades e rotações.',
        },
      },
      communication: {
        title: { value: 'Comunicação Integrada' },
        description: {
          value: 'Chat em tempo real e notificações para manter todos alinhados.',
        },
      },
      checkin: {
        title: { value: 'Check-in por QR Code' },
        description: {
          value: 'Confirme presença de voluntários com leitura rápida de QR Code.',
        },
      },
      multiChurch: {
        title: { value: 'Multi-Igreja' },
        description: {
          value: 'Gerencie múltiplas unidades e ministérios em uma única plataforma.',
        },
      },
      analytics: {
        title: { value: 'Relatórios e Métricas' },
        description: {
          value: 'Acompanhe engajamento, frequência e produtividade com dashboards visuais.',
        },
      },
    },
    howItWorks: {
      title: { value: 'Simples de começar' },
      subtitle: { value: 'Em três passos você já está operando.' },
      step1: {
        title: { value: 'Crie sua conta' },
        description: { value: 'Cadastre sua igreja e convide seus líderes em poucos minutos.' },
      },
      step2: {
        title: { value: 'Configure suas equipes' },
        description: {
          value: 'Adicione voluntários, defina ministérios e configure escalas de serviço.',
        },
      },
      step3: {
        title: { value: 'Gerencie tudo em um só lugar' },
        description: {
          value: 'Acompanhe escalas, comunique-se com a equipe e monitore métricas em tempo real.',
        },
      },
    },
    screenshots: {
      title: { value: 'Projetado para produtividade' },
      subtitle: {
        value: 'Interface moderna e intuitiva que sua equipe vai adorar usar.',
      },
      badge: { value: 'Preview da Plataforma' },
    },
    testimonials: {
      title: { value: 'Quem usa, recomenda' },
      subtitle: { value: 'Veja o que líderes de igrejas dizem sobre o MINC Teams.' },
      items: {
        t1: {
          quote: {
            value:
              'O MINC Teams transformou a forma como gerenciamos nossos 200+ voluntários. Antes era tudo em planilhas, agora é tudo automatizado.',
          },
          name: { value: 'Pastor Marcos Silva' },
          role: { value: 'Igreja Comunidade Viva' },
        },
        t2: {
          quote: {
            value:
              'A funcionalidade de escalas inteligentes economiza horas do nosso trabalho semanal. Simplesmente indispensável.',
          },
          name: { value: 'Líder Ana Beatriz' },
          role: { value: 'Ministério de Louvor' },
        },
        t3: {
          quote: {
            value:
              'O check-in por QR Code e o chat integrado facilitaram muito a comunicação com a equipe nos dias de culto.',
          },
          name: { value: 'Diácono Roberto Mendes' },
          role: { value: 'Equipe de Recepção' },
        },
      },
    },
    pricing: {
      title: { value: 'Planos para cada fase' },
      subtitle: {
        value:
          'Teste grátis por 15 dias. Escolha o plano ideal e escale conforme sua igreja cresce.',
      },
      monthly: { value: '/mês' },
      free: {
        name: { value: 'Básico' },
        price: { value: 'R$ 49' },
        description: { value: 'Para igrejas começando a se organizar.' },
        features: {
          value: [
            'Até 50 voluntários',
            '1 igreja',
            'Escalas básicas',
            'Chat integrado',
            'Check-in QR Code',
          ],
        },
        cta: { value: 'Testar Grátis 15 Dias' },
      },
      pro: {
        name: { value: 'Pro' },
        price: { value: 'R$ 89' },
        description: { value: 'Para igrejas em crescimento.' },
        badge: { value: 'Mais Popular' },
        features: {
          value: [
            'Voluntários ilimitados',
            'Até 5 igrejas',
            'Escalas inteligentes',
            'Relatórios avançados',
            'Suporte prioritário',
            'Notificações push',
          ],
        },
        cta: { value: 'Assinar Pro' },
      },
      enterprise: {
        name: { value: 'Enterprise' },
        price: { value: 'Sob consulta' },
        description: { value: 'Para redes de igrejas e grandes ministérios.' },
        features: {
          value: [
            'Tudo do Pro',
            'Igrejas ilimitadas',
            'API personalizada',
            'SSO e segurança avançada',
            'Gerente de conta dedicado',
            'SLA garantido',
          ],
        },
        cta: { value: 'Falar com Vendas' },
      },
    },
    faq: {
      title: { value: 'Perguntas Frequentes' },
      subtitle: { value: 'Tire suas dúvidas sobre o MINC Teams.' },
      items: {
        q1: {
          question: { value: 'Preciso instalar algum aplicativo?' },
          answer: {
            value:
              'Não! O MINC Teams é um PWA (Progressive Web App). Basta acessar pelo navegador e, se quiser, adicionar à tela inicial do seu celular para uma experiência de app nativo.',
          },
        },
        q2: {
          question: { value: 'Posso migrar dados de planilhas existentes?' },
          answer: {
            value:
              'Sim. Oferecemos importação via CSV para voluntários e equipes, facilitando a migração de dados de planilhas do Google Sheets ou Excel.',
          },
        },
        q3: {
          question: { value: 'É seguro para dados da minha igreja?' },
          answer: {
            value:
              'Totalmente. Utilizamos criptografia em trânsito e em repouso, com infraestrutura hospedada na nuvem com alta disponibilidade e backups automáticos.',
          },
        },
        q4: {
          question: { value: 'Posso cancelar a qualquer momento?' },
          answer: {
            value:
              'Sim. Não há fidelidade. Você pode fazer upgrade, downgrade ou cancelar seu plano quando quiser, sem multas ou burocracia.',
          },
        },
        q5: {
          question: { value: 'Funciona para igrejas pequenas?' },
          answer: {
            value:
              'Com certeza! O plano gratuito é perfeito para igrejas menores. Você pode crescer organicamente e fazer upgrade apenas quando precisar.',
          },
        },
      },
    },
    cta: {
      title: { value: 'Pronto para transformar a gestão da sua igreja?' },
      subtitle: {
        value: 'Junte-se a centenas de igrejas que já simplificaram sua operação com MINC Teams.',
      },
      button: { value: 'Teste Grátis por 15 Dias' },
    },
    footer: {
      description: {
        value: 'Plataforma inteligente de gestão de equipes voluntárias para igrejas.',
      },
      product: { value: 'Produto' },
      resources: { value: 'Recursos' },
      company: { value: 'Empresa' },
      features: { value: 'Funcionalidades' },
      pricing: { value: 'Planos' },
      docs: { value: 'Documentação' },
      support: { value: 'Suporte' },
      blog: { value: 'Blog' },
      about: { value: 'Sobre Nós' },
      contact: { value: 'Contato' },
      privacy: { value: 'Privacidade' },
      terms: { value: 'Termos de Uso' },
      rights: { value: 'Todos os direitos reservados.' },
      madeBy: { value: 'Feito com' },
      byCompany: { value: 'por Connexto Tecnologia' },
    },
  },
  en: {
    nav: {
      features: { value: 'Features' },
      howItWorks: { value: 'How It Works' },
      pricing: { value: 'Pricing' },
      faq: { value: 'FAQ' },
      cta: { value: 'Access Platform' },
    },
    hero: {
      title: { value: 'Smart management for' },
      titleHighlight: { value: 'volunteer teams' },
      subtitle: {
        value:
          'Organize schedules, manage volunteers, and boost engagement at your church with a modern and intuitive platform.',
      },
      cta: { value: 'Try Free for 15 Days' },
      ctaSecondary: { value: 'See How It Works' },
    },
    stats: {
      churches: { value: 'Active Churches' },
      volunteers: { value: 'Volunteers Managed' },
      schedules: { value: 'Schedules Created' },
      services: { value: 'Services Organized' },
    },
    features: {
      title: { value: 'Everything your team needs' },
      subtitle: {
        value: 'Powerful tools to simplify volunteer and schedule management at your church.',
      },
      teams: {
        title: { value: 'Team Management' },
        description: {
          value: 'Organize volunteers into teams with defined roles and responsibilities.',
        },
      },
      schedules: {
        title: { value: 'Smart Scheduling' },
        description: {
          value:
            'Create and manage schedules automatically, respecting availability and rotations.',
        },
      },
      communication: {
        title: { value: 'Integrated Communication' },
        description: {
          value: 'Real-time chat and notifications to keep everyone aligned.',
        },
      },
      checkin: {
        title: { value: 'QR Code Check-in' },
        description: {
          value: 'Confirm volunteer attendance with quick QR Code scanning.',
        },
      },
      multiChurch: {
        title: { value: 'Multi-Church' },
        description: {
          value: 'Manage multiple locations and ministries on a single platform.',
        },
      },
      analytics: {
        title: { value: 'Reports & Analytics' },
        description: {
          value: 'Track engagement, attendance, and productivity with visual dashboards.',
        },
      },
    },
    howItWorks: {
      title: { value: 'Simple to get started' },
      subtitle: { value: 'Three steps and you are up and running.' },
      step1: {
        title: { value: 'Create your account' },
        description: { value: 'Register your church and invite your leaders in minutes.' },
      },
      step2: {
        title: { value: 'Set up your teams' },
        description: {
          value: 'Add volunteers, define ministries, and configure service schedules.',
        },
      },
      step3: {
        title: { value: 'Manage everything in one place' },
        description: {
          value: 'Track schedules, communicate with your team, and monitor metrics in real time.',
        },
      },
    },
    screenshots: {
      title: { value: 'Designed for productivity' },
      subtitle: {
        value: 'A modern and intuitive interface your team will love to use.',
      },
      badge: { value: 'Platform Preview' },
    },
    testimonials: {
      title: { value: 'Loved by leaders' },
      subtitle: { value: 'See what church leaders say about MINC Teams.' },
      items: {
        t1: {
          quote: {
            value:
              'MINC Teams transformed how we manage our 200+ volunteers. Everything was in spreadsheets before, now it is all automated.',
          },
          name: { value: 'Pastor Marcos Silva' },
          role: { value: 'Comunidade Viva Church' },
        },
        t2: {
          quote: {
            value:
              'The smart scheduling feature saves hours of our weekly work. Simply indispensable.',
          },
          name: { value: 'Leader Ana Beatriz' },
          role: { value: 'Worship Ministry' },
        },
        t3: {
          quote: {
            value:
              'QR Code check-in and integrated chat made communication with the team on service days so much easier.',
          },
          name: { value: 'Deacon Roberto Mendes' },
          role: { value: 'Welcome Team' },
        },
      },
    },
    pricing: {
      title: { value: 'Plans for every stage' },
      subtitle: {
        value: 'Try free for 15 days. Pick the right plan and scale as your church grows.',
      },
      monthly: { value: '/month' },
      free: {
        name: { value: 'Basic' },
        price: { value: '$9' },
        description: { value: 'For churches just getting organized.' },
        features: {
          value: [
            'Up to 50 volunteers',
            '1 church',
            'Basic schedules',
            'Integrated chat',
            'QR Code check-in',
          ],
        },
        cta: { value: 'Try Free 15 Days' },
      },
      pro: {
        name: { value: 'Pro' },
        price: { value: '$17' },
        description: { value: 'For growing churches.' },
        badge: { value: 'Most Popular' },
        features: {
          value: [
            'Unlimited volunteers',
            'Up to 5 churches',
            'Smart scheduling',
            'Advanced reports',
            'Priority support',
            'Push notifications',
          ],
        },
        cta: { value: 'Subscribe Pro' },
      },
      enterprise: {
        name: { value: 'Enterprise' },
        price: { value: 'Custom' },
        description: { value: 'For church networks and large ministries.' },
        features: {
          value: [
            'Everything in Pro',
            'Unlimited churches',
            'Custom API',
            'SSO & advanced security',
            'Dedicated account manager',
            'Guaranteed SLA',
          ],
        },
        cta: { value: 'Contact Sales' },
      },
    },
    faq: {
      title: { value: 'Frequently Asked Questions' },
      subtitle: { value: 'Get answers about MINC Teams.' },
      items: {
        q1: {
          question: { value: 'Do I need to install an app?' },
          answer: {
            value:
              'No! MINC Teams is a PWA (Progressive Web App). Just access it from your browser and, if you want, add it to your home screen for a native app experience.',
          },
        },
        q2: {
          question: { value: 'Can I migrate data from existing spreadsheets?' },
          answer: {
            value:
              'Yes. We offer CSV import for volunteers and teams, making it easy to migrate data from Google Sheets or Excel.',
          },
        },
        q3: {
          question: { value: 'Is my church data secure?' },
          answer: {
            value:
              'Absolutely. We use encryption in transit and at rest, with cloud infrastructure featuring high availability and automatic backups.',
          },
        },
        q4: {
          question: { value: 'Can I cancel anytime?' },
          answer: {
            value:
              'Yes. No contracts. You can upgrade, downgrade, or cancel your plan whenever you want, with no fees or hassle.',
          },
        },
        q5: {
          question: { value: 'Does it work for small churches?' },
          answer: {
            value:
              'Absolutely! The free plan is perfect for smaller churches. You can grow organically and upgrade only when you need to.',
          },
        },
      },
    },
    cta: {
      title: { value: 'Ready to transform your church management?' },
      subtitle: {
        value:
          'Join hundreds of churches that have already simplified their operations with MINC Teams.',
      },
      button: { value: 'Try Free for 15 Days' },
    },
    footer: {
      description: {
        value: 'Smart volunteer team management platform for churches.',
      },
      product: { value: 'Product' },
      resources: { value: 'Resources' },
      company: { value: 'Company' },
      features: { value: 'Features' },
      pricing: { value: 'Pricing' },
      docs: { value: 'Documentation' },
      support: { value: 'Support' },
      blog: { value: 'Blog' },
      about: { value: 'About Us' },
      contact: { value: 'Contact' },
      privacy: { value: 'Privacy' },
      terms: { value: 'Terms of Service' },
      rights: { value: 'All rights reserved.' },
      madeBy: { value: 'Made with' },
      byCompany: { value: 'by Connexto Tecnologia' },
    },
  },
}

export function getTranslation(lang: Language, path: string): string | readonly string[] {
  const keys = path.split('.')
  let current: NestedTranslation | TranslationValue = translations[lang]

  for (const key of keys) {
    if (typeof current === 'string' || Array.isArray(current)) return path
    const nested = current as NestedTranslation
    const next: NestedTranslation[string] = nested[key]
    if (next === undefined) return path
    current = next
  }

  if (typeof current === 'object' && !Array.isArray(current) && 'value' in current) {
    const val = current.value
    if (typeof val === 'string' || Array.isArray(val)) return val
    return path
  }

  return typeof current === 'string' || Array.isArray(current) ? current : path
}
