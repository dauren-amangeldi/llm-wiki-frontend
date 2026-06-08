/** Demo advisor responses — hardcoded for prototype, will be replaced by real AI */

export interface InsightPoint {
  heading: string;
  body: string;
  metric?: string;
  tag?: string;
}

export interface AdvisorResponse {
  title: string;
  summary: string;
  points: InsightPoint[];
  source: string;
  caseCount: number;
}

export const DEMO_RESPONSES: Record<string, Record<string, AdvisorResponse>> = {
  ru: {
    adv_employee_apply: {
      title: "Практическое применение",
      summary: "На основе анализа 12 кейсов выделены 3 конкретных действия, которые можно внедрить уже на этой неделе без дополнительных ресурсов.",
      points: [
        { heading: "Ежедневные 15-минутные ретроспективы", body: "Внедрите формат «что получилось / что нет / что изменим» каждый день в 17:45. Команда проекта ЖК «Асыл» начала использовать этот формат в январе 2024 — скорость обучения выросла на 30%, количество повторных ошибок снизилось на 22%.", metric: "+30% обучаемость", tag: "Быстрый старт" },
        { heading: "Шаблон «5 почему» для анализа проблем", body: "При возникновении любой проблемы на объекте — не останавливайтесь на первой причине. Задайте «почему?» пять раз подряд. BI Group применяет эту методику на всех объектах с 2023 года. На ЖК «Горизонт» это помогло найти корневую причину задержки поставок, которую не видели 3 месяца.", metric: "-45% повторных дефектов", tag: "Лучшая практика" },
        { heading: "Персональный чеклист ключевых выводов", body: "Создайте документ из 3-5 самых важных выводов из каждого кейса. Проверяйте его каждый понедельник утром. По данным HR-аналитики, сотрудники с таким подходом на 40% быстрее проходят аттестацию и на 18% чаще получают повышение.", metric: "+40% к аттестации", tag: "Карьерный рост" },
      ],
      source: "Кейсы: управление проектами (5), lean-строительство (4), контроль качества (3)",
      caseCount: 12,
    },
    adv_employee_explain: {
      title: "Ключевые концепции простым языком",
      summary: "Разбираем три основные методологии, которые BI Group активно внедряет на своих проектах. Без терминов, с реальными примерами.",
      points: [
        { heading: "Lean-строительство", body: "Представьте, что вы готовите ужин. Lean — это когда все ингредиенты и инструменты уже на столе в нужном порядке, а не когда вы бегаете по кухне. В строительстве это означает: материалы приезжают точно в срок, бригады не простаивают, каждое действие приносит результат. На ЖК «Премиум» это сократило сроки этапа на 15%.", metric: "-15% сроки", tag: "Методология" },
        { heading: "BIM-моделирование", body: "Это 3D-чертёж здания, в котором видно ВСЁ: трубы, провода, стены, перегородки — ещё до первого кирпича. Если архитектор провёл трубу через несущую балку — BIM покажет ошибку на экране, а не на стройплощадке. Экономия на одном проекте BI Group составила 8,5 млн тенге за счёт предотвращённых коллизий.", metric: "8.5 млн ₸ экономия", tag: "Технология" },
        { heading: "Agile в строительстве", body: "Вместо того чтобы планировать весь проект на 2 года вперёд и надеяться, что всё пойдёт по плану — разбиваем на 2-недельные спринты. Каждые 2 недели: планируем → делаем → проверяем → корректируем. На пилотном проекте количество «сюрпризов» на стройке снизилось на 35%.", metric: "-35% внеплановых ситуаций", tag: "Процесс" },
      ],
      source: "Внутренние обучающие материалы, программа адаптации 2024-2025",
      caseCount: 8,
    },
    adv_employee_growth: {
      title: "Карта развития навыков",
      summary: "Анализ трендов рынка и внутренних потребностей BI Group показывает три приоритетных направления для роста в ближайшие 12 месяцев.",
      points: [
        { heading: "BIM-компетенции (Revit, Navisworks)", body: "Рынок Казахстана испытывает острый дефицит BIM-специалистов. По данным HeadHunter, количество вакансий выросло на 180% за 2024 год, средняя зарплата — на 25%. BI Group запускает внутреннюю программу сертификации: первые 50 сотрудников получат оплачиваемое обучение.", metric: "+25% зарплата", tag: "Высокий спрос" },
        { heading: "Управление рисками (FMEA-анализ)", body: "FMEA (анализ видов и последствий отказов) становится стандартом для всех новых проектов BI Group с Q2 2025. Умение проводить FMEA будет обязательным для позиций PM и выше. Сейчас этим владеют только 12% менеджеров — окно возможностей открыто.", metric: "12% владеют навыком", tag: "Конкурентное преимущество" },
        { heading: "Data-driven решения (SQL + Power BI)", body: "Базовый SQL + Power BI позволяют видеть проект в реальном времени: бюджет, сроки, загрузку бригад. Вместо Excel-файлов на 10 вкладок — один дашборд с автообновлением. Менеджеры с этими навыками принимают решения в 3 раза быстрее.", metric: "3x скорость решений", tag: "Must-have 2025" },
      ],
      source: "HR-аналитика, данные рынка, стратегия развития персонала BI Group 2025",
      caseCount: 8,
    },
    adv_employee_team: {
      title: "Повестка для стендапа команды",
      summary: "Три актуальных кейса, которые стоит обсудить с командой на ближайшем собрании. Каждый включает конкретные действия.",
      points: [
        { heading: "Оптимизация логистики на ЖК «Бирюза»", body: "Команда логистики перешла на систему just-in-time поставок с GPS-трекингом. Результат: склад на площадке уменьшился на 60%, потери от порчи материалов — на 80%. Бюджет этапа сократился на 15%. Обсудите: можно ли перенять подход для вашего объекта?", metric: "-15% бюджет этапа", tag: "Горячий кейс" },
        { heading: "Новый регламент контроля бетонных работ", body: "С апреля 2025 вступает обязательный регламент: фотофиксация каждого этапа бетонирования, чек-лист из 12 пунктов, цифровая подпись прораба. Штрафы за несоблюдение — до 500 000 ₸. Важно: каждый член команды должен знать свою зону ответственности.", metric: "Дедлайн: апрель 2025", tag: "Обязательно" },
        { heading: "Пилот цифровой приёмки работ", body: "На 3 объектах BI Group тестируется приложение для приёмки работ с планшета. Бумажная работа сократилась на 40%, время приёмки одного этажа — с 4 часов до 45 минут. Фидбэк от бригадиров: «Наконец-то нормально». Запуск для всех — Q3 2025.", metric: "-40% бумажной работы", tag: "Пилот" },
      ],
      source: "Дайджест кейсов за март 2025, внутренний портал BI Group",
      caseCount: 6,
    },
    adv_employee_kpi: {
      title: "Влияние на ваши KPI",
      summary: "Прямая связь между кейсами базы знаний и тремя ключевыми показателями эффективности. Каждый пункт — измеримый результат.",
      points: [
        { heading: "KPI «Качество» → Чек-листы контроля", body: "Внедрение цифровых чек-листов из кейса по контролю качества на ЖК «Премиум» показало: процент брака снижается с 12% до 4.8% за первые 3 месяца. Ключевой фактор — фотофиксация на каждом этапе и автоматическое уведомление прораба при отклонении.", metric: "-18% брака", tag: "Качество" },
        { heading: "KPI «Сроки» → Lean-планирование", body: "Lean-методы из кейса ЖК «Горизонт»: визуальное планирование (канбан-доска на объекте), ежедневные 10-минутные координации бригад, предварительная комплектация материалов за 48 часов. Сроки каждого этапа сокращаются в среднем на 12%.", metric: "-12% сроки этапа", tag: "Сроки" },
        { heading: "KPI «Стоимость» → BIM-модель", body: "На проекте с BIM-моделью количество коллизий (трубы через стены, пересечения коммуникаций) снижается на 60%. Каждая предотвращённая коллизия экономит от 200 000 до 1 500 000 ₸. На объекте в 120 квартир это ~8.5 млн ₸ экономии на этапе строительства.", metric: "-60% коллизий", tag: "Стоимость" },
      ],
      source: "KPI-дашборд BI Group, корреляция по 15 проектам за 2024 год",
      caseCount: 15,
    },
    adv_pm_partner_risks: {
      title: "Снижение рисков при работе с бизнес-партнерами",
      summary: "Анализ 18 кейсов BI Group по работе с субподрядчиками и поставщиками выявил три системных подхода, которые снижают финансовые и операционные риски на 35-60%.",
      points: [
        { heading: "Скоринг-модель партнёра перед заключением договора", body: "На проекте ЖК «Алтын» в 2023 году BI Group внедрила балльную оценку подрядчиков по 12 критериям: финансовая устойчивость, история судебных споров, загрузка портфеля, отзывы от предыдущих заказчиков. Из 40 претендентов отсеяли 15 с высоким риском. Результат: ни одного срыва поставок за 9 месяцев, тогда как на аналогичном проекте без скоринга было 6 срывов за тот же период. Экономия — 42 млн тенге на штрафных санкциях и замене подрядчиков.", metric: "0 срывов за 9 мес.", tag: "Проверенный метод" },
        { heading: "Эскроу-механизм поэтапной оплаты", body: "После инцидента на ЖК «Нурлы» в 2022 году, когда субподрядчик получил аванс 80% и прекратил работу, BI Group перешла на эскроу-систему. Деньги переводятся на спецсчёт, подрядчик получает оплату только после подписания акта каждого этапа. Это исключило случаи «взял деньги и пропал» полностью. Юридическая служба подготовила типовой договор с эскроу-клаузой — он уже используется на 80% новых проектов.", metric: "-100% неотработанных авансов", tag: "Финансовая защита" },
        { heading: "Реестр инцидентов и «чёрный список» с автоматическим оповещением", body: "BI Group ведёт единый реестр инцидентов с партнёрами с 2021 года. Каждый случай: просрочка, брак, невыполнение ТБ — фиксируется с привязкой к ИИН/БИН партнёра. При повторном обращении этого партнёра на любой другой проект системно приходит предупреждение менеджеру. За 2024 год это предотвратило 11 повторных контрактов с ненадёжными подрядчиками. Общая экономия по оценке фин. департамента — 180 млн тенге.", metric: "180 млн ₸ экономия", tag: "Системный подход" },
      ],
      source: "Кейсы: управление подрядчиками (8), закупки (5), юридические споры (3), финансовый контроль (2)",
      caseCount: 18,
    },
  },
  en: {
    adv_employee_apply: {
      title: "Practical Application",
      summary: "Based on analysis of 12 cases, here are 3 specific actions you can implement this week without additional resources.",
      points: [
        { heading: "Daily 15-Minute Retrospectives", body: "Implement a 'what worked / what didn't / what we'll change' format every day at 5:45 PM. The Asyl residential project team started this in January 2024 — learning speed increased by 30%, repeat errors dropped by 22%.", metric: "+30% learning speed", tag: "Quick start" },
        { heading: "5 Whys Template for Problem Analysis", body: "When any issue arises on-site, don't stop at the first cause. Ask 'why?' five times in a row. BI Group has applied this across all sites since 2023. At Horizont complex, it uncovered a root cause of supply delays hidden for 3 months.", metric: "-45% repeat defects", tag: "Best practice" },
        { heading: "Personal Key Takeaways Checklist", body: "Create a document with 3-5 most important insights from each case. Review it every Monday morning. According to HR analytics, employees with this approach pass certification 40% faster and are 18% more likely to get promoted.", metric: "+40% certification", tag: "Career growth" },
      ],
      source: "Cases: project management (5), lean construction (4), quality control (3)",
      caseCount: 12,
    },
    adv_employee_explain: {
      title: "Key Concepts Explained Simply",
      summary: "Breaking down three core methodologies BI Group actively implements. No jargon, real examples.",
      points: [
        { heading: "Lean Construction", body: "Imagine cooking dinner with all ingredients pre-sorted vs. running around the kitchen. In construction: materials arrive just in time, crews never idle, every action produces results. At Premium complex this cut stage time by 15%.", metric: "-15% timelines", tag: "Methodology" },
        { heading: "BIM Modeling", body: "A 3D blueprint showing EVERYTHING — pipes, wires, walls — before the first brick. If an architect routes a pipe through a load-bearing beam, BIM catches it on screen, not on-site. Savings on one BI Group project: 8.5M tenge.", metric: "8.5M ₸ saved", tag: "Technology" },
        { heading: "Agile in Construction", body: "Instead of planning 2 years ahead and hoping, break into 2-week sprints. Plan → Do → Check → Adjust. On the pilot project, unexpected on-site issues dropped by 35%.", metric: "-35% surprises", tag: "Process" },
      ],
      source: "Internal training materials, onboarding program 2024-2025",
      caseCount: 8,
    },
    adv_employee_growth: {
      title: "Skills Development Roadmap",
      summary: "Market trends and BI Group's internal needs point to three priority growth areas for the next 12 months.",
      points: [
        { heading: "BIM Skills (Revit, Navisworks)", body: "Kazakhstan faces an acute BIM specialist shortage. Job postings up 180% in 2024, average salary up 25%. BI Group is launching an internal certification program — first 50 employees get paid training.", metric: "+25% salary", tag: "High demand" },
        { heading: "Risk Management (FMEA Analysis)", body: "FMEA becomes standard for all new BI Group projects from Q2 2025. Required for PM positions and above. Currently only 12% of managers have the skill — the window of opportunity is open.", metric: "12% have this skill", tag: "Competitive edge" },
        { heading: "Data-Driven Decisions (SQL + Power BI)", body: "Basic SQL + Power BI lets you see your project in real time: budget, timelines, crew utilization. One dashboard instead of 10-tab Excel files. Managers with these skills make decisions 3x faster.", metric: "3x faster decisions", tag: "Must-have 2025" },
      ],
      source: "HR analytics, market data, BI Group talent strategy 2025",
      caseCount: 8,
    },
    adv_employee_team: {
      title: "Team Standup Agenda",
      summary: "Three relevant cases to discuss with your team at the next meeting. Each includes specific action items.",
      points: [
        { heading: "Biruza Logistics Optimization", body: "Logistics team switched to JIT deliveries with GPS tracking. On-site storage down 60%, material waste down 80%. Stage budget cut by 15%. Discuss: can your site adopt this approach?", metric: "-15% stage budget", tag: "Hot case" },
        { heading: "New Concrete QC Regulation", body: "From April 2025: photo documentation of every concrete stage, 12-point checklist, digital foreman signature. Fines up to 500,000 ₸. Every team member must know their responsibility.", metric: "Deadline: April 2025", tag: "Mandatory" },
        { heading: "Digital Acceptance Pilot", body: "3 BI Group sites testing tablet-based work acceptance. Paperwork down 40%, floor acceptance time: from 4 hours to 45 minutes. Foreman feedback: 'Finally, it works.' Full rollout Q3 2025.", metric: "-40% paperwork", tag: "Pilot" },
      ],
      source: "March 2025 case digest, BI Group internal portal",
      caseCount: 6,
    },
    adv_employee_kpi: {
      title: "Impact on Your KPIs",
      summary: "Direct links between knowledge base cases and three key performance indicators. Each point shows measurable results.",
      points: [
        { heading: "Quality KPI → Control Checklists", body: "Digital checklists from the Premium QC case: defect rate drops from 12% to 4.8% in 3 months. Key factor — photo documentation at every stage with automatic alerts on deviations.", metric: "-18% defect rate", tag: "Quality" },
        { heading: "Timeline KPI → Lean Planning", body: "Lean methods from Horizont: visual planning (kanban boards on-site), daily 10-min crew coordination, 48-hour material pre-staging. Average stage duration reduction: 12%.", metric: "-12% stage time", tag: "Timeline" },
        { heading: "Cost KPI → BIM Model", body: "BIM projects see 60% fewer clashes (pipes through walls, utility crossings). Each prevented clash saves 200K-1.5M ₸. For a 120-apartment building, that's ~8.5M ₸ saved during construction.", metric: "-60% clashes", tag: "Cost" },
      ],
      source: "BI Group KPI dashboard, 15 project correlation, 2024",
      caseCount: 15,
    },
    adv_pm_partner_risks: {
      title: "Reducing risks when working with business partners",
      summary: "Analysis of 18 BI Group cases on subcontractors and suppliers revealed three systemic approaches that reduce financial and operational risks by 35-60%.",
      points: [
        { heading: "Partner scoring model before signing contracts", body: "On the Altyn residential project in 2023, BI Group implemented a 12-criteria partner scoring system: financial stability, litigation history, portfolio workload, previous client reviews. Out of 40 applicants, 15 high-risk ones were filtered out. Result: zero delivery failures in 9 months, while a similar project without scoring had 6 failures in the same period. Savings: 42M tenge on penalties and contractor replacements.", metric: "0 failures in 9 months", tag: "Proven method" },
        { heading: "Escrow mechanism for milestone-based payments", body: "After an incident at Nurly complex in 2022, where a subcontractor received 80% advance and stopped work, BI Group switched to an escrow system. Funds go to a special account; the contractor receives payment only after signing off on each milestone. This completely eliminated 'took the money and disappeared' cases. Legal prepared a standard escrow clause contract — now used on 80% of new projects.", metric: "-100% unworked advances", tag: "Financial protection" },
        { heading: "Incident registry and blacklist with automatic alerts", body: "BI Group has maintained a unified partner incident registry since 2021. Every case — delays, defects, safety violations — is logged with the partner's tax ID. When the same partner applies to any other project, the manager receives an automatic warning. In 2024 this prevented 11 repeat contracts with unreliable subcontractors. Total savings estimated by finance department: 180M tenge.", metric: "180M ₸ saved", tag: "Systemic approach" },
      ],
      source: "Cases: contractor management (8), procurement (5), legal disputes (3), financial control (2)",
      caseCount: 18,
    },
  },
  kk: {
    adv_employee_apply: {
      title: "Тәжірибелік қолдану",
      summary: "12 кейсті талдау негізінде осы аптада қосымша ресурстарсыз енгізуге болатын 3 нақты әрекет.",
      points: [
        { heading: "Күнделікті 15 минуттық ретроспективалар", body: "«Не болды / не болмады / нені өзгертеміз» форматын күн сайын 17:45-те енгізіңіз. «Асыл» ТК жобасының командасы 2024 жылдың қаңтарында бастады — оқу жылдамдығы 30%-ға, қайталанатын қателер 22%-ға азайды.", metric: "+30% оқу", tag: "Тез бастау" },
        { heading: "«5 неліктен» үлгісі", body: "Нысанда кез келген мәселе туындағанда — бірінші себебінде тоқтамаңыз. «Неліктен?» деп бес рет сұраңыз. BI Group 2023 жылдан бері барлық нысандарда қолданады.", metric: "-45% қайталанатын ақаулар", tag: "Үздік тәжірибе" },
        { heading: "Жеке тексеру тізімі", body: "Әр кейстен 3-5 маңызды тұжырым жасаңыз. Әр дүйсенбі таңертең тексеріңіз. HR-талдау бойынша мұндай тәсілмен аттестацияны 40% тезірек өтесіз.", metric: "+40% аттестация", tag: "Мансаптық өсу" },
      ],
      source: "Кейстер: жоба басқару (5), lean-құрылыс (4), сапа бақылау (3)",
      caseCount: 12,
    },
    adv_employee_explain: {
      title: "Негізгі тұжырымдамалар",
      summary: "BI Group белсенді енгізетін үш негізгі әдістемені қарапайым тілмен түсіндіреміз.",
      points: [
        { heading: "Lean-құрылыс", body: "Барлық ингредиенттер дайын тұрғанда ас пісіру сияқты. Құрылыста: материалдар уақытында келеді, бригадалар бос тұрмайды. «Премиум» ТК-де мерзім 15%-ға қысқарды.", metric: "-15% мерзім", tag: "Әдістеме" },
        { heading: "BIM-модельдеу", body: "Құрылыс басталмай тұрып барлық құбырлар, сымдар мен қабырғалар көрінетін 3D-сызба. Бір жобада 8,5 млн ₸ үнемдеді.", metric: "8.5 млн ₸ үнем", tag: "Технология" },
        { heading: "Құрылыстағы Agile", body: "Жобаны 2 апталық спринттерге бөліп, нәтижені үнемі тексеру. Пилотта күтпеген жағдайлар 35%-ға азайды.", metric: "-35% күтпеген жағдайлар", tag: "Процесс" },
      ],
      source: "Ішкі оқу материалдары, бейімдеу бағдарламасы 2024-2025",
      caseCount: 8,
    },
    adv_employee_growth: {
      title: "Дағдыларды дамыту картасы",
      summary: "Нарық трендтері мен BI Group ішкі қажеттіліктері келесі 12 ай ішіндегі 3 басым бағытты көрсетеді.",
      points: [
        { heading: "BIM-дағдылар (Revit, Navisworks)", body: "Қазақстанда BIM мамандарына сұраныс 180%-ға өсті, орташа жалақы 25%-ға көтерілді. BI Group ішкі сертификаттау бағдарламасын бастайды.", metric: "+25% жалақы", tag: "Жоғары сұраныс" },
        { heading: "Тәуекелдерді басқару (FMEA)", body: "FMEA 2025 жылдың Q2-ден барлық жаңа жобалар үшін стандарт болады. PM+ лауазымдары үшін міндетті. Қазір менеджерлердің 12%-ы ғана меңгерген.", metric: "12% ғана меңгерген", tag: "Бәсекелік артықшылық" },
        { heading: "Деректерге негізделген шешімдер", body: "SQL + Power BI жобаны нақты уақытта көруге мүмкіндік береді. Осы дағдылары бар менеджерлер шешімді 3 есе тез қабылдайды.", metric: "3x тез шешімдер", tag: "Must-have 2025" },
      ],
      source: "HR-талдау, нарық деректері, BI Group дамыту стратегиясы 2025",
      caseCount: 8,
    },
    adv_employee_team: {
      title: "Команда жиналысына күн тәртібі",
      summary: "Командамен жақын арадағы жиналыста талқылауға тұрарлық үш өзекті кейс.",
      points: [
        { heading: "«Бирюза» логистикасын оңтайландыру", body: "JIT жеткізу + GPS-трекинг. Қоймалау 60%-ға, материал ысырабы 80%-ға азайды. Бюджет 15%-ға қысқарды.", metric: "-15% бюджет", tag: "Ыстық кейс" },
        { heading: "Бетон жұмыстарының жаңа регламенті", body: "2025 сәуірден: әр бетондау кезеңін фото тіркеу, 12 пунктті тексеру тізімі. Сақтамағаны үшін 500 000 ₸ дейін айыппұл.", metric: "Мерзім: сәуір 2025", tag: "Міндетті" },
        { heading: "Цифрлық қабылдау пилоты", body: "3 нысанда планшетпен жұмыс қабылдау сыналуда. Қағаз жұмыс 40%-ға, бір қабатты қабылдау уақыты 4 сағаттан 45 минутқа дейін қысқарды.", metric: "-40% қағаз жұмыс", tag: "Пилот" },
      ],
      source: "2025 наурыз кейс дайджесті, BI Group ішкі порталы",
      caseCount: 6,
    },
    adv_employee_kpi: {
      title: "Сіздің KPI-ға әсері",
      summary: "Білім базасы кейстері мен үш негізгі тиімділік көрсеткіші арасындағы тікелей байланыс.",
      points: [
        { heading: "«Сапа» KPI → Тексеру тізімдері", body: "«Премиум» ТК сапа бақылау кейсінен цифрлық тексеру тізімдері: ақау пайызы 3 айда 12%-дан 4.8%-ға дейін төмендейді.", metric: "-18% ақау", tag: "Сапа" },
        { heading: "«Мерзім» KPI → Lean-жоспарлау", body: "Lean-әдістер: нысанда канбан-тақта, бригадалардың күнделікті 10 минуттық координациясы. Кезең мерзімі орта есеппен 12%-ға қысқарады.", metric: "-12% мерзім", tag: "Мерзім" },
        { heading: "«Құн» KPI → BIM-модель", body: "BIM жобаларда коллизиялар 60%-ға азаяды. 120 пәтерлік нысанда ~8.5 млн ₸ үнемдеу.", metric: "-60% коллизиялар", tag: "Құн" },
      ],
      source: "BI Group KPI-дашборд, 15 жоба бойынша корреляция, 2024",
      caseCount: 15,
    },
    adv_pm_partner_risks: {
      title: "Бизнес-серіктестермен жұмыс тәуекелдерін азайту",
      summary: "BI Group субмердігерлер мен жеткізушілермен жұмыс бойынша 18 кейсті талдау қаржылық және операциялық тәуекелдерді 35-60%-ға азайтатын үш жүйелік тәсілді анықтады.",
      points: [
        { heading: "Шарт жасар алдында серіктесті скоринг-модельмен бағалау", body: "2023 жылы «Алтын» ТК жобасында BI Group мердігерлерді 12 критерий бойынша балдық бағалауды енгізді: қаржылық тұрақтылық, сот дауларының тарихы, портфель жүктемесі. 40 үміткерден 15 жоғары тәуекелді сүзгіден өткізді. Нәтиже: 9 ай ішінде жеткізу бұзушылығы нөл.", metric: "9 ай ішінде 0 бұзушылық", tag: "Дәлелденген әдіс" },
        { heading: "Кезеңдік төлемнің эскроу-механизмі", body: "2022 жылы «Нұрлы» ТК-де субмердігер 80% аванс алып, жұмысты тоқтатқаннан кейін BI Group эскроу-жүйеге көшті. Ақша арнайы шотқа аударылады, мердігер төлемді тек кезең актісіне қол қойғаннан кейін алады.", metric: "-100% өтелмеген аванстар", tag: "Қаржылық қорғау" },
        { heading: "Оқиғалар тізілімі мен автоматты ескерту", body: "BI Group 2021 жылдан бері серіктестермен оқиғалардың бірыңғай тізілімін жүргізеді. 2024 жылы бұл сенімсіз мердігерлермен 11 қайталанатын шартты болдырмады. Жалпы үнемдеу — 180 млн теңге.", metric: "180 млн ₸ үнем", tag: "Жүйелік тәсіл" },
      ],
      source: "Кейстер: мердігерлерді басқару (8), сатып алу (5), заңды даулар (3), қаржылық бақылау (2)",
      caseCount: 18,
    },
  },
};

export function getDemoResponse(key: string, lang: string): AdvisorResponse | null {
  const langData = DEMO_RESPONSES[lang] || DEMO_RESPONSES.ru;
  return langData[key] || null;
}
