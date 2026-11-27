/**
 * Project data. Descriptions are editable drafts — keep them factual.
 *
 * status:  'personal' | 'in-progress' | 'completed' | 'live'
 * links:   set github / live to a real URL to show the button; null hides it.
 * visual:  key of the procedural artwork in components/ui/ProjectVisual.jsx
 * image:   optional path to a real screenshot in /public/images (overrides the artwork).
 */
export const projects = [
  {
    slug: 'online-shop',
    number: '01',
    title: 'Online Shop',
    visual: 'commerce',
    image: null,
    status: 'personal',
    category: {
      en: 'E-commerce / Full-Stack',
      ru: 'E-commerce / Full-Stack',
      ky: 'E-commerce / Full-Stack',
    },
    tech: ['Python', 'Django REST Framework', 'PostgreSQL', 'Docker', 'Nginx', 'AWS EC2'],
    description: {
      en: 'An e-commerce project built around REST APIs, database management, containerization, and backend infrastructure.',
      ru: 'E-commerce проект, построенный вокруг REST API, работы с базой данных, контейнеризации и backend-инфраструктуры.',
      ky: 'REST API, маалымат базасын башкаруу, контейнерлөө жана backend инфраструктурасынын тегерегинде курулган e-commerce долбоору.',
    },
    focus: {
      en: [
        'REST API design',
        'Relational data modelling',
        'Containerized services',
        'Reverse proxy & cloud hosting',
      ],
      ru: [
        'Проектирование REST API',
        'Реляционная модель данных',
        'Контейнеризация сервисов',
        'Reverse proxy и облачный хостинг',
      ],
      ky: [
        'REST API долбоорлоо',
        'Реляциялык маалымат модели',
        'Кызматтарды контейнерлөө',
        'Reverse proxy жана булут хостинги',
      ],
    },
    links: { github: null, live: null },
  },
  {
    slug: 'otp-service',
    number: '02',
    title: 'OTP Service',
    visual: 'otp',
    image: null,
    status: 'personal',
    category: {
      en: 'Backend / Security',
      ru: 'Backend / Безопасность',
      ky: 'Backend / Коопсуздук',
    },
    tech: ['Python', 'FastAPI', 'HMAC', 'Redis / SQLite', 'REST API'],
    description: {
      en: 'A one-time password service designed around expiration, rate limiting, secure verification, and single-use authentication.',
      ru: 'Сервис одноразовых паролей, спроектированный вокруг срока действия, ограничения запросов, безопасной проверки и одноразовой аутентификации.',
      ky: 'Мөөнөтү, суроо-талаптарды чектөө, коопсуз текшерүү жана бир жолку аутентификация негизинде иштелип чыккан бир жолку сырсөз кызматы.',
    },
    focus: {
      en: ['Code expiration', 'Rate limiting', 'HMAC verification', 'Single-use tokens'],
      ru: ['Срок действия кодов', 'Rate limiting', 'Проверка через HMAC', 'Одноразовые токены'],
      ky: ['Коддордун мөөнөтү', 'Rate limiting', 'HMAC аркылуу текшерүү', 'Бир жолку токендер'],
    },
    links: { github: null, live: null },
  },
  {
    slug: 'instacopy',
    number: '03',
    title: 'InstaCopy',
    visual: 'social',
    image: null,
    status: 'personal',
    category: {
      en: 'Full-Stack / Social Platform',
      ru: 'Full-Stack / Социальная платформа',
      ky: 'Full-Stack / Социалдык платформа',
    },
    tech: ['Django', 'REST API', 'Redis', 'WebSocket'],
    description: {
      en: 'A social platform project exploring real-time communication and modern backend architecture.',
      ru: 'Проект социальной платформы, исследующий коммуникацию в реальном времени и современную backend-архитектуру.',
      ky: 'Реалдуу убакыттагы байланышты жана заманбап backend архитектурасын изилдеген социалдык платформа долбоору.',
    },
    focus: {
      en: ['Real-time messaging', 'WebSocket channels', 'Caching with Redis', 'API-first backend'],
      ru: [
        'Сообщения в реальном времени',
        'WebSocket-каналы',
        'Кеширование в Redis',
        'API-first backend',
      ],
      ky: [
        'Реалдуу убакыттагы билдирүүлөр',
        'WebSocket каналдары',
        'Redis менен кэштөө',
        'API-first backend',
      ],
    },
    links: { github: null, live: null },
  },
  {
    slug: 'delivery-app',
    number: '04',
    title: 'Delivery Application',
    visual: 'delivery',
    image: null,
    status: 'personal',
    category: {
      en: 'Full-Stack / Delivery',
      ru: 'Full-Stack / Доставка',
      ky: 'Full-Stack / Жеткирүү',
    },
    tech: [],
    description: {
      en: 'A digital delivery service project exploring product catalogs, order management, and user interaction.',
      ru: 'Проект цифрового сервиса доставки, исследующий каталоги товаров, управление заказами и взаимодействие с пользователем.',
      ky: 'Товар каталогдорун, буйрутмаларды башкарууну жана колдонуучу менен өз ара аракетти изилдеген санариптик жеткирүү кызматынын долбоору.',
    },
    focus: {
      en: ['Product catalog', 'Order management', 'User flows'],
      ru: ['Каталог товаров', 'Управление заказами', 'Пользовательские сценарии'],
      ky: ['Товар каталогу', 'Буйрутмаларды башкаруу', 'Колдонуучу сценарийлери'],
    },
    links: { github: null, live: null },
  },
  {
    slug: 'culture-kgz',
    number: '05',
    title: 'Culture KGZ',
    visual: 'culture',
    image: null,
    status: 'personal',
    category: {
      en: 'Web Development / Culture',
      ru: 'Веб-разработка / Культура',
      ky: 'Веб-иштеп чыгуу / Маданият',
    },
    tech: ['Python', 'Django', 'HTML', 'CSS', 'JavaScript'],
    description: {
      en: 'A web project dedicated to Kyrgyz culture and digital presentation.',
      ru: 'Веб-проект, посвящённый кыргызской культуре и её цифровой презентации.',
      ky: 'Кыргыз маданиятына жана анын санариптик презентациясына арналган веб-долбоор.',
    },
    focus: {
      en: ['Cultural content structure', 'Server-rendered pages', 'Responsive layout'],
      ru: ['Структура культурного контента', 'Серверный рендеринг страниц', 'Адаптивная вёрстка'],
      ky: ['Маданий мазмундун түзүмү', 'Серверде түзүлгөн барактар', 'Ыңгайлашкан макет'],
    },
    links: { github: null, live: null },
  },
  {
    slug: 'ai-experiments',
    number: '06',
    title: 'AI Experiments',
    visual: 'ai',
    image: null,
    status: 'personal',
    category: {
      en: 'Artificial Intelligence',
      ru: 'Искусственный интеллект',
      ky: 'Жасалма интеллект',
    },
    tech: ['Python', 'LangChain', 'OpenCV', 'YOLO', 'PyTorch', 'Machine Learning'],
    description: {
      en: 'A collection of experiments and learning projects involving artificial intelligence, computer vision, and intelligent applications.',
      ru: 'Коллекция экспериментов и учебных проектов в области искусственного интеллекта, компьютерного зрения и интеллектуальных приложений.',
      ky: 'Жасалма интеллект, компьютердик көрүү жана акылдуу тиркемелер боюнча эксперименттер менен окуу долбоорлорунун жыйнагы.',
    },
    focus: {
      en: ['Computer vision', 'Object detection', 'LLM tooling', 'Model training'],
      ru: ['Компьютерное зрение', 'Детекция объектов', 'Инструменты для LLM', 'Обучение моделей'],
      ky: ['Компьютердик көрүү', 'Объекттерди аныктоо', 'LLM куралдары', 'Моделдерди окутуу'],
    },
    links: { github: null, live: null },
  },
];

export function getProject(slug) {
  return projects.find((project) => project.slug === slug) ?? null;
}

export function getAdjacentProject(slug) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}
