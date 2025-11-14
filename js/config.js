import { SKILL_NAMES } from "./constants.js"

export const ORDERS = [
  {
    id: 1,
    title: "Лендинг для кафе",
    description: "Простая одностраничка с меню и контактами",
    reward: 3000,
    timeRequired: 4,
    energyCost: 40,
    skill: SKILL_NAMES.LAYOUT,
  },
  {
    id: 2,
    title: "Сайт на Workpress",
    description: "Блог с готовой темой и настройками",
    reward: 5000,
    timeRequired: 6,
    energyCost: 55,
    skill: SKILL_NAMES.WORKPRESS,
  },
  {
    id: 3,
    title: "Консультация клиента",
    description: "Помочь определиться с требованиями к проекту",
    reward: 2000,
    timeRequired: 3,
    energyCost: 30,
    skill: SKILL_NAMES.FREELANCE,
  },
]
