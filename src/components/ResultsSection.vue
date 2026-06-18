<template>
  <div class="space-y-4">
    <div class="schedule-summary">
      <div :class="['summary-status', totalAssigned >= totalNeeded ? 'summary-status-ok' : 'summary-status-warning']">
        {{ totalAssigned >= totalNeeded ? 'Zeit reicht aus' : 'Zeitmangel' }}
      </div>
      <div class="summary-stat">
        <span>Benoetigt</span>
        <strong>{{ (totalNeeded / 60).toFixed(2) }}h</strong>
      </div>
      <div class="summary-stat">
        <span>Geplant</span>
        <strong>{{ (totalPlanned / 60).toFixed(2) }}h</strong>
      </div>
      <div class="summary-free">
        <span class="summary-free-label">Freie Zeitfenster</span>
        <div class="summary-free-list">
          <span v-for="day in unusedDaysMap.slice(0, 4)" :key="day.date" class="free-slot-chip">
            <strong>{{ formatDateDE(day.date) }}</strong>
            <em>{{ (day.capacity / 60).toFixed(1) }}h frei</em>
          </span>
          <span v-if="unusedDaysMap.length === 0" class="free-slot-chip free-slot-empty">Keine</span>
        </div>
      </div>
    </div>

    <details class="compact-details">
      <summary>Aufgaben-Fortschritt anzeigen</summary>
      <div class="mt-3 space-y-2">
        <div v-for="task in tasks" :key="task.title">
          <div class="mb-1 flex justify-between gap-3 text-sm">
            <span class="truncate">{{ task.title }}</span>
            <span class="font-semibold">{{ (getTaskAssigned(task.title) / 60).toFixed(2) }} / {{ (task.minutes / 60).toFixed(2) }}h</span>
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
    </details>

    <div v-if="overdueItems.length > 0" class="compact-warning">
      <strong>Ueberfaellige Aufgaben:</strong>
      <ul>
        <li v-for="item in overdueItems" :key="item.title">
          {{ item.title }}: {{ (item.minutes / 60).toFixed(2) }}h nicht zugewiesen
        </li>
      </ul>
    </div>

    <div class="space-y-4">
      <h3 class="text-xl font-bold text-primary dark:text-white">Zeitplan</h3>
      <div v-for="monthCal in monthCalendars" :key="monthCal.monthKey" class="card">
        <h4 class="mb-4 text-center text-lg font-bold text-primary dark:text-white">{{ monthCal.monthName }}</h4>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="w-12 border border-gray-300 bg-gray-100 p-2 text-center font-semibold dark:border-gray-600 dark:bg-gray-700">KW</th>
                <th v-for="day in weekDaysShort" :key="day" class="border border-gray-300 bg-gray-100 p-2 text-center font-semibold dark:border-gray-600 dark:bg-gray-700">{{ day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="week in monthCal.weeks" :key="week.weekKey">
                <td class="border border-gray-300 bg-gray-50 p-2 text-center text-sm font-semibold dark:border-gray-600 dark:bg-gray-800">W{{ week.weekNum }}</td>
                <td v-for="day in week.days" :key="day.dateStr" :class="getCellClass(day)" class="relative border border-gray-300 p-3 align-top dark:border-gray-600" @dragover.prevent="onDragOver(day)" @drop="onDrop(day)">
                  <div v-if="day.dateStr" class="mb-2 text-lg font-bold">{{ day.dayNum }}</div>

                  <div v-if="day.exceptionName" class="mb-2 inline-block rounded bg-purple-200 px-2 py-1 text-xs text-purple-900 dark:bg-purple-700 dark:text-purple-100">
                    {{ day.exceptionName }}
                  </div>

                  <div v-if="day.deadlineTasks?.length > 0" class="mb-2 text-xs font-bold text-red-600 dark:text-red-400">
                    Deadline: {{ day.deadlineTasks.map(t => t.title).join(', ') }}
                  </div>

                  <div class="space-y-1">
                    <div
                      v-for="task in day.tasks"
                      :key="task.unitIds?.join('|') || `${task.title}-${day.dateStr}`"
                      :style="{ backgroundColor: getColorForPriority(task.importance) }"
                      class="truncate rounded p-1 text-xs text-white cursor-grab"
                      :title="`${task.title} ${(task.minutes / 60).toFixed(2)}h Prio ${task.importance}`"
                      draggable="true"
                      @click="toggleDone(task)"
                      @dragstart="onDragStart($event, task)"
                      @dragend="onDragEnd"
                    >
                      {{ task.title }} {{ (task.minutes / 60).toFixed(1) }}h {{ task.status === 'late-assigned' ? 'Verspaetet' : day.dateStr === task.deadline ? 'Deadline' : '' }}
                    </div>
                  </div>

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
import { computed, ref } from 'vue'

const props = defineProps({
  results: { type: Array, default: () => [] },
  tasks: { type: Array, default: () => [] },
  exceptions: { type: Array, default: () => [] },
  capacityByDate: { type: Object, default: () => ({}) },
  darkMode: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-done', 'move-item'])

const weekDaysShort = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const isScheduledResult = (item) => item.status === 'assigned' || item.status === 'late-assigned'
const draggedUnitIds = ref('')
const suppressToggleUntil = ref(0)

const toLocalISO = (date) => date.toLocaleDateString('sv-SE')
const formatDateDE = (ds) => ds.split('-').reverse().join('.')

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return [d.getUTCFullYear(), weekNo]
}

const totalNeeded = computed(() => props.tasks?.reduce((sum, t) => sum + t.minutes, 0) ?? 0)
const totalAssigned = computed(() =>
  props.results?.filter(r => r.status === 'assigned').reduce((sum, r) => sum + r.minutes, 0) ?? 0
)

const totalPlanned = computed(() =>
  props.results?.filter(isScheduledResult).reduce((sum, r) => sum + r.minutes, 0) ?? 0
)

const overdueItems = computed(() =>
  props.results?.filter(r => r.status === 'overdue') ?? []
)

const latestScheduledDate = computed(() => {
  const scheduledDates = props.results
    .filter(isScheduledResult)
    .map(item => item.date)
    .filter(Boolean)

  return scheduledDates.length > 0 ? scheduledDates.sort().at(-1) : null
})

const earliestTaskDate = computed(() => {
  const taskDates = props.tasks
    .map(task => task.createdAt)
    .filter(Boolean)

  return taskDates.length > 0 ? taskDates.sort()[0] : null
})

const dayStats = computed(() => {
  const stats = {}
  if (props.tasks.length === 0) return stats

  const startDate = earliestTaskDate.value ? new Date(earliestTaskDate.value) : new Date()
  startDate.setHours(0, 0, 0, 0)
  const taskDates = props.tasks.map(t => new Date(t.deadline))
  const maxDate = latestScheduledDate.value
    ? new Date(Math.max(...taskDates, new Date(latestScheduledDate.value)))
    : new Date(Math.max(...taskDates))

  for (let d = new Date(startDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateStr = toLocalISO(new Date(d))
    stats[dateStr] = { used: 0, capacity: props.capacityByDate[dateStr] || 0 }
  }

  props.results.filter(isScheduledResult).forEach(r => {
    if (stats[r.date]) {
      stats[r.date].used += r.minutes
    }
  })

  return stats
})

const unusedDaysMap = computed(() => {
  const unused = Object.entries(dayStats.value)
    .filter(([, stat]) => stat.capacity > 0 && stat.capacity - stat.used > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
  return unused.map(([date, stat]) => ({
    date,
    capacity: stat.capacity - stat.used
  }))
})

const dayPlans = computed(() => {
  const plans = {}
  props.results.forEach(r => {
    if (isScheduledResult(r)) {
      if (!plans[r.date]) plans[r.date] = []
      plans[r.date].push(r)
    }
  })
  return plans
})

const monthCalendars = computed(() => {
  if (props.tasks.length === 0) return []

  const startDate = earliestTaskDate.value ? new Date(earliestTaskDate.value) : new Date()
  startDate.setHours(0, 0, 0, 0)
  const taskDates = props.tasks.map(t => new Date(t.deadline))
  const maxDate = latestScheduledDate.value
    ? new Date(Math.max(...taskDates, new Date(latestScheduledDate.value)))
    : new Date(Math.max(...taskDates))

  const months = []
  for (let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1); current <= maxDate; current.setMonth(current.getMonth() + 1)) {
    const month = new Date(current)
    const monthName = month.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const firstDayRaw = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const firstDay = (firstDayRaw + 6) % 7

    const weeks = []
    let day = 1

    for (let week = 0; week < 6; week++) {
      const weekDays = []
      const firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1)
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (week * 7) - firstDay)

      const [, weekNum] = getWeekNumber(firstDayOfWeek)
      let hasMonthDay = false

      for (let wd = 0; wd < 7; wd++) {
        if ((week === 0 && wd < firstDay) || day > daysInMonth) {
          weekDays.push({
            dateStr: null,
            dayNum: null,
            tasks: [],
            used: 0,
            capacity: 0,
            exceptionName: '',
            deadlineTasks: []
          })
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
          hasMonthDay = true
          day++
        }
      }

      if (hasMonthDay) {
        weeks.push({
          weekKey: `${month.getFullYear()}-${month.getMonth()}-${week}`,
          weekNum,
          days: weekDays
        })
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

const getTaskAssigned = (title) => {
  return props.results
    .filter(r => isScheduledResult(r) && r.title === title)
    .reduce((sum, r) => sum + r.minutes, 0)
}

const getProgressColor = (title) => {
  const task = props.tasks.find(t => t.title === title)
  if (!task) return '#6b7280'
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
  if (!day.dateStr) return 'bg-white dark:bg-slate-900'

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

const toggleDone = (task) => {
  if (!task?.unitIds?.length) return
  if (Date.now() < suppressToggleUntil.value) return
  emit('toggle-done', { unitIds: task.unitIds.join('|') })
}

const onDragStart = (event, task) => {
  draggedUnitIds.value = task?.unitIds?.join('|') || ''
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', draggedUnitIds.value)
}

const onDragEnd = () => {
  draggedUnitIds.value = ''
  suppressToggleUntil.value = Date.now() + 250
}

const onDragOver = (day) => !!day?.dateStr

const onDrop = (day) => {
  if (!day?.dateStr || !draggedUnitIds.value) return
  emit('move-item', { unitIds: draggedUnitIds.value, newDate: day.dateStr })
  draggedUnitIds.value = ''
}
</script>
