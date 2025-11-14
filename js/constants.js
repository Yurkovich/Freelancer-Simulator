export const GAME_CONSTANTS = {
  INITIAL_DAY: 1,
  INITIAL_TIME: 9,
  INITIAL_MONEY: 5000,
  INITIAL_ENERGY: 100,
  MAX_ENERGY: 100,
  INITIAL_HEALTH: 100,
  INITIAL_SATIETY: 100,
  HOURS_IN_DAY: 24,
  WORK_PROGRESS_STEP: 25,
  PROGRESS_COMPLETE: 100,
  INITIAL_SKILL_LEVEL: 0,
  INITIAL_SKILL_XP: 0,
  XP_FOR_FIRST_LEVEL: 150,
  XP_PER_LEVEL_MULTIPLIER: 100,
  XP_GAIN_DIVIDER: 500,
}

export const UI_SELECTORS = {
  STAT_DAY: "stat-day",
  STAT_TIME: "stat-time",
  STAT_ENERGY: "stat-energy",
  STAT_MONEY: "stat-money",
  PORTFOLIO_WINDOW: "portfolio-window",
  WZCODE_WINDOW: "wzcode-window",
  BROWSER_WINDOW: "browser-window",
  SKILLS_WINDOW: "skills-window",
  LEARNING_WINDOW: "learning-window",
  WZCODE_BODY: "wzcode-body",
  BROWSER_BODY: "browser-body",
  SKILLS_BODY: "skills-body",
  LEARNING_BODY: "learning-body",
}

export const MESSAGES = {
  NO_ENERGY: "Недостаточно энергии!",
  ORDER_COMPLETED: "Заказ выполнен!",
  ORDER_TAKEN: "принят! Открой WZ Code для работы.",
  ACTIVE_ORDER_EXISTS: "У вас уже есть активный заказ!",
  NO_ORDERS: "Все заказы разобраны. Приходи позже!",
  NO_ACTIVE_ORDER: "Нет активных заказов.",
  CHECK_KRORK: "Загляни в браузер на биржу Krork!",
  APP_IN_DEVELOPMENT: "Приложение в разработке",
  LEVEL_UP: "Уровень повышен!",
}

export const SKILL_NAMES = {
  LAYOUT: "layout",
  WORKPRESS: "workpress",
  FREELANCE: "freelance",
}

export const SKILL_LABELS = {
  [SKILL_NAMES.LAYOUT]: "Верстка",
  [SKILL_NAMES.WORKPRESS]: "Workpress",
  [SKILL_NAMES.FREELANCE]: "Фриланс",
}
