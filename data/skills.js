/**
 * Technology universe. Each category becomes one orbit in the 3D scene
 * and one tile in the mobile bento grid. No proficiency percentages on purpose.
 */
export const skillCategories = [
  {
    id: 'backend',
    label: { en: 'Backend', ru: 'Backend', ky: 'Backend' },
    summary: {
      en: 'APIs, services and the logic that keeps products running.',
      ru: 'API, сервисы и логика, на которой держатся продукты.',
      ky: 'API, кызматтар жана продуктуларды иштеткен логика.',
    },
    items: ['Python', 'Django', 'Django REST Framework', 'FastAPI', 'REST API', 'JWT', 'WebSocket'],
  },
  {
    id: 'frontend',
    label: { en: 'Frontend', ru: 'Frontend', ky: 'Frontend' },
    summary: {
      en: 'Interfaces for the web and mobile that people actually use.',
      ru: 'Интерфейсы для веба и мобильных устройств, которыми удобно пользоваться.',
      ky: 'Колдонууга ыңгайлуу веб жана мобилдик интерфейстер.',
    },
    items: ['HTML5', 'CSS3', 'JavaScript', 'React', 'React Native', 'Responsive Design'],
  },
  {
    id: 'ai',
    label: {
      en: 'Artificial Intelligence',
      ru: 'Искусственный интеллект',
      ky: 'Жасалма интеллект',
    },
    summary: {
      en: 'Machine learning, computer vision and LLM-powered tools.',
      ru: 'Машинное обучение, компьютерное зрение и инструменты на базе LLM.',
      ky: 'Машиналык үйрөнүү, компьютердик көрүү жана LLM негизиндеги куралдар.',
    },
    items: [
      'Machine Learning',
      'LangChain',
      'PyTorch',
      'Scikit-learn',
      'OpenCV',
      'MediaPipe',
      'YOLO',
      'Pandas',
      'NumPy',
    ],
  },
  {
    id: 'databases',
    label: { en: 'Databases', ru: 'Базы данных', ky: 'Маалымат базалары' },
    summary: {
      en: 'Relational, document and in-memory storage.',
      ru: 'Реляционные, документные и in-memory хранилища.',
      ky: 'Реляциялык, документтик жана in-memory сактагычтар.',
    },
    items: ['PostgreSQL', 'SQLite', 'MongoDB', 'Redis'],
  },
  {
    id: 'devops',
    label: { en: 'DevOps', ru: 'DevOps', ky: 'DevOps' },
    summary: {
      en: 'Containers, servers and shipping code to the cloud.',
      ru: 'Контейнеры, серверы и доставка кода в облако.',
      ky: 'Контейнерлер, серверлер жана кодду булутка жеткирүү.',
    },
    items: ['Docker', 'Git', 'GitHub', 'Linux', 'AWS EC2', 'Nginx', 'Gunicorn'],
  },
  {
    id: 'dataviz',
    label: { en: 'Data Visualization', ru: 'Визуализация данных', ky: 'Маалыматты визуалдаштыруу' },
    summary: {
      en: 'Turning data into charts and small interactive apps.',
      ru: 'Превращение данных в графики и небольшие интерактивные приложения.',
      ky: 'Маалыматты графиктерге жана чакан интерактивдүү тиркемелерге айландыруу.',
    },
    items: ['Matplotlib', 'Seaborn', 'Streamlit'],
  },
];
