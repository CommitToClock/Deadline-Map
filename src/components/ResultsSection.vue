<template>
  <div class="space-y-8">
    <!-- Summary -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div :class="['card', totalAssigned >= totalNeeded ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900']">
        <h3 class="text-xl font-bold mb-2">{{ totalAssigned >= totalNeeded ? '✅ Zeit reicht aus!' : '⛔ Zeitmangel!' }}</h3>
        <p class="text-gray-600 dark:text-gray-300">
          Benötigt: <span class="font-semibold">{{ (totalNeeded/60).toFixed(2) }}h</span> | 
          Geplant: <span class="font-semibold">{{ (totalAssigned/60).toFixed(2) }}h</span>
        </p>
      </div>

      <div class="card">
        <h3 class="text-lg font-bold mb-4">Aufgaben Fortschritt</h3>
        <div class="space-y-2">
          <div v-for="task in tasks" :key="task.title">
            <div class="flex justify-between text-sm mb-1">
              <span>{{ task.title }}</span>
              <span class="font-semibold">{{ (getTaskAssigned(task.title)/60).toFixed(2) }} / {{ (task.minutes/60).toFixed(2) }}h</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: Math.min((getTaskAssigned(task.title) / task.minutes) * 100, 100) + '%',
                  backgroundColor: getProgressColor(task.title)
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overdue Tasks -->
    <div v-if="overdueItems.length > 0" class="card bg-red-50 dark:bg-red-900 border-l-4 border-red-600">
      <h3 class="text-lg font-bold mb-3 text-red-700 dark:text-red-300">Überfällige Aufgaben</h3>
      <ul class="space-y-2">
        <li v-for="item in overdueItems" :key="item.title" class="text-red-600 dark:text-red-300">
          {{ item.title }}: {{ (item.minutes/60).toFixed(2) }}h nicht zugewiesen
        </li>
      </ul>
    </div>

    <!-- Free Capacity Info -->
    <div class="card">
      <h3 class="text-lg font-bold mb-4">Nächste Freie Zeitfenster</h3>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div v-for="(capacity, date) in unusedDaysMap.slice(0, 5)" :key="date" class="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ formatDateDE(date) }}</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-300">{{ (capacity/60).toFixed(1) }}h</div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="space-y-6">
      <h3 class="text-2xl font-bold text-primary dark:text-white">Zeitplan</h3>
      <div v-for="monthCal in monthCalendars" :key="monthCal.monthKey" class="card">
        <h4 class="text-xl font-bold mb-6 text-center text-primary dark:text-white">{{ monthCal.monthName }}</h4>
        
        <!-- Calendar Grid -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 font-semibold text-center w-12">KW</th>
                <th v-for="day in weekDaysShort" :key="day" class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 font-semibold text-center">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="week in monthCal.weeks" :key="week.weekNum">
                <td class="border border-gray-300 dark:border-gray-600 p-2 text-center font-semibold bg-gray-50 dark:bg-gray-800 text-sm">W{{ week.weekNum }}</td>
                <td v-for="day in week.days" :key="day.dateStr" :class="getCellClass(day)" class="border border-gray-300 dark:border-gray-600 p-3 min-h-40 align-top relative">
                  <!-- Day number -->
                  <div v-if="day.dateStr" class="font-bold text-lg mb-2">{{ day.dayNum }}</div>
                  
                  <!-- Exception badge -->
                  <div v-if="day.exceptionName" class="text-xs bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-purple-100 px-2 py-1 rounded mb-2 inline-block">
                    {{ day.exceptionName }}
                  </div>
                  
                  <!-- Deadline flag -->
                  <div v-if="day.deadlineTasks.length > 0" class="text-xs font-bold text-red-600 dark:text-red-400 mb-2">
                    🏁 {{ day.deadlineTasks.map(t => t.title).join(', ') }}
                  </div>
                  
                  <!-- Task blocks -->
                  <div class="space-y-1">
                    <div 
                      v-for="task in day.tasks" 
                      :key="task.title" 
                      :style="{ backgroundColor: getColorForPriority(task.importance) }"
                      class="text-white text-xs p-1 rounded truncate"
                      :title="`${task.title} ${(task.minutes/60).toFixed(2)}h Prio ${task.importance}`"
                    >
                      {{ task.title }} {{ (task.minutes/60).toFixed(1) }}h {{ day.dateStr === task.deadline ? '🏁' : '' }}
                    </div>
                  </div>
                  
                  <!-- Capacity info -->
                  <div v-if="day.capacity > 0" class="absolute bottom-1 right-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ Math.round((day.used / day.capacity) * 100) }}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  results: Array,
  tasks: Array,
  exceptions: Array,
  darkMode: Boolean
})

const weekDaysShort = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

const toLocalISO = (date) => date.toLocaleDateString('sv-SE')
const formatDateDE = (ds) => ds.split('-').reverse().join('.')

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return [d.getUTCFullYear(), weekNo]
}

// Computed
const totalNeeded = computed(() => props.tasks?.reduce((sum, t) => sum + t.minutes, 0) ?? 0)
const totalAssigned = computed(() => 
  props.results?.filter(r => r.status === 'assigned').reduce((sum, r) => sum + r.minutes, 0) ?? 0
)

const overdueItems = computed(() => 
  props.results?.filter(r => r.status === 'overdue') ?? []
)

const dayStats = computed(() => {
  const stats = {}
  if (props.tasks.length === 0) return stats
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDates = props.tasks.map(t => new Date(t.deadline))
  const maxDate = new Date(Math.max(...taskDates))
  
  for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateStr = toLocalISO(new Date(d))
    stats[dateStr] = { used: 0, capacity: 0 }
  }
  
  props.results.filter(r => r.status === 'assigned').forEach(r => {
    if (stats[r.date]) {
      stats[r.date].used += r.minutes
    }
  })
  
  return stats
})

const unusedDaysMap = computed(() => {
  const unused = Object.entries(dayStats.value)
    .filter(([date, stat]) => stat.capacity > 0 && stat.capacity - stat.used > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
  return unused.map(([date]) => date)
})

const dayPlans = computed(() => {
  const plans = {}
  props.results.forEach(r => {
    if (r.status === 'assigned') {
      if (!plans[r.date]) plans[r.date] = []
      plans[r.date].push(r)
    }
  })
  return plans
})

const monthCalendars = computed(() => {
  if (props.tasks.length === 0) return []
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDates = props.tasks.map(t => new Date(t.deadline))
  const maxDate = new Date(Math.max(...taskDates))
  
  const months = []
  for (let current = new Date(today.getFullYear(), today.getMonth(), 1); current <= maxDate; current.setMonth(current.getMonth() + 1)) {
    const month = new Date(current)
    const monthName = month.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const firstDayRaw = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const firstDay = (firstDayRaw + 6) % 7
    
    const weeks = []
    let day = 1
    
    for (let week = 0; week < 6; week++) {
      const weekDays = []
      let firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1)
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (week * 7) - firstDay)
      
      const [, weekNum] = getWeekNumber(firstDayOfWeek)
      
      for (let wd = 0; wd < 7; wd++) {
        if ((week === 0 && wd < firstDay) || day > daysInMonth) {
          weekDays.push({ dateStr: null, dayNum: null })
        } else {
          const dateStr = toLocalISO(new Date(month.getFullYear(), month.getMonth(), day))
          const dayTasks = dayPlans.value[dateStr] || []
          const stat = dayStats.value[dateStr] || { used: 0, capacity: 0 }
          const exceptionName = props.exceptions.find(e => dateStr >= e.from && dateStr <= e.to)?.name || ''
          const deadlineTasks = props.tasks.filter(t => t.deadline === dateStr)
          
          weekDays.push({
            dateStr,
            dayNum: day,
            tasks: dayTasks,
            used: stat.used,
            capacity: stat.capacity,
            exceptionName,
            deadlineTasks
          })
          day++
        }
      }
      
      if (day <= daysInMonth) {
        weeks.push({ weekNum, days: weekDays })
      }
    }
    
    months.push({
      monthKey: `${month.getFullYear()}-${month.getMonth()}`,
      monthName,
      weeks
    })
  }
  
  return months
})

// Methods
const getTaskAssigned = (title) => {
  return props.results
    .filter(r => r.status === 'assigned' && r.title === title)
    .reduce((sum, r) => sum + r.minutes, 0)
}

const getProgressColor = (title) => {
  const task = props.tasks.find(t => t.title === title)
  if (!task) return '#gray'
  const assigned = getTaskAssigned(title)
  const percent = (assigned / task.minutes) * 100
  if (percent === 100) return '#16a34a'
  if (percent >= 50) return '#ea580c'
  return '#dc2626'
}

const getColorForPriority = (importance) => {
  const colors = {
    1: '#1e3a8a',
    2: '#2563eb',
    3: '#3b82f6',
    4: '#93c5fd',
    5: '#dbeafe'
  }
  return colors[importance] || colors[1]
}

const getCellClass = (day) => {
  if (!day.dateStr) return ''
  
  const utilization = day.capacity > 0 ? day.used / day.capacity : 0
  let heatClass = 'bg-white dark:bg-slate-800'
  
  if (utilization > 1) {
    heatClass = 'bg-red-100 dark:bg-red-900 border-l-4 border-red-600'
  } else if (utilization >= 0.8) {
    heatClass = 'bg-orange-50 dark:bg-orange-900'
  } else if (utilization >= 0.5) {
    heatClass = 'bg-yellow-50 dark:bg-yellow-900'
  } else if (day.capacity > 0) {
    heatClass = 'bg-green-50 dark:bg-green-900'
  }
  
  return heatClass
}
</script>

<style scoped>
</style>
