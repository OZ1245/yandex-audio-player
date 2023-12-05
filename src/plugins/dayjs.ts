import dayjs from "dayjs"
import localizedFormat from 'dayjs/plugin/localizedFormat'
require(`dayjs/locale/ru`)
import duration from 'dayjs/plugin/duration'

const language = localStorage.getItem('language')
const locale = language ? language : 'en'

if (locale === 'ru') {
  dayjs.locale('ru')
}
  
dayjs.extend(localizedFormat)
dayjs.extend(duration)

export default {
  install: (app: any) => {
    const globalDayjs = dayjs
    console.log('dayjs:', dayjs)

    // This is what you want:
    app.config.globalProperties.$dayjs = globalDayjs

    // But this is the recommended approach:
    app.provide('dayjs', globalDayjs)

    // feel free to use both at once though
  }
}