<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-primary dark:text-white">Lernplan & Kapazitäts-Check</h1>
        <div class="flex gap-2">
          <button @click="saveData" class="btn-primary btn-sm">💾 Speichern</button>
          <button @click="loadData" class="btn-primary btn-sm">📂 Laden</button>
          <button @click="exportData" class="btn-primary btn-sm">📥 Exportieren</button>
          <button @click="importData" class="btn-primary btn-sm">📤 Importieren</button>
          <button @click="toggleDarkMode" class="btn-primary btn-sm">{{ darkMode ? '☀️ Light' : '🌙 Dark' }}</button>
        </div>
      </div>

      <!-- Tasks Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-primary dark:text-white mb-4">1. Aufgaben (Deadlines)</h2>
        <div class="space-y-3 mb-4">
          <div v-for="(task, idx) in tasks" :key="idx" class="card flex gap-4 items-center">
            <input v-model="task.title" placeholder="Aufgabe" class="input-field flex-1" />
            <input v-model.number="task.hours" type="number" step="0.25" placeholder="Stunden" class="input-field w-24" />
            <span class="text-sm font-semibold">Deadline:</span>
            <input v-model="task.deadline" type="date" class="input-field w-32" />
            <span class="text-sm font-semibold">Prio</span>
            <input v-model.number="task.importance" type="number" min="1" max="5" class="input-field w-16" />
            <button @click="tasks.splice(idx, 1)" class="btn-danger btn-sm">✕</button>
          </div>
        </div>
        <button @click="tasks.push({ title: '', hours: 0, deadline: '', importance: 1 })" class="btn-primary">+ Aufgabe hinzufügen</button>
      </section>

      <!-- Slots Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-primary dark:text-white mb-4">2. Wöchentliche Zeitfenster</h2>
        <div class="space-y-3 mb-4">
          <div v-for="(slot, idx) in slots" :key="idx" class="card flex gap-4 items-center">
            <select v-model="slot.day" class="input-field flex-1">
              <option v-for="day in weekDays" :key="day" :value="day">{{ day }}</option>
            </select>
            <input v-model.number="slot.hours" type="number" step="0.25" placeholder="Stunden" class="input-field w-24" />
            <span class="text-sm">Stunden/Tag</span>
            <button @click="slots.splice(idx, 1)" class="btn-danger btn-sm">✕</button>
          </div>
        </div>
        <button @click="slots.push({ day: 'Montag', hours: 0 })" class="btn-primary">+ Slot hinzufügen</button>
      </section>

      <!-- Exceptions Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-primary dark:text-white mb-4">3. Ausnahmetage (Keine Lernzeit)</h2>
        <div class="space-y-3 mb-4">
          <div v-for="(exc, idx) in exceptions" :key="idx" class="card flex gap-4 items-center">
            <input v-model="exc.name" placeholder="Grund" class="input-field flex-1" />
            <input v-model="exc.from" type="date" class="input-field w-32" />
            <span>bis</span>
            <input v-model="exc.to" type="date" class="input-field w-32" />
            <button @click="exceptions.splice(idx, 1)" class="btn-danger btn-sm">✕</button>
          </div>
        </div>
        <button @click="exceptions.push({ name: '', from: '', to: '' })" class="btn-primary">+ Ausnahmetag hinzufügen</button>
      </section>

      <!-- Overrides Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-primary dark:text-white mb-4">4. Wöchentliche Overrides</h2>
        <div class="space-y-4 mb-4">
          <div v-for="(override, idx) in overrides" :key="idx" class="card">
            <div class="flex gap-4 items-center mb-4">
              <input v-model.number="override.year" type="number" placeholder="Jahr" class="input-field w-20" />
              <span>KW</span>
              <input v-model.number="override.week" type="number" min="1" max="53" class="input-field w-20" />
              <button @click="setAsStandard(idx)" class="btn-success btn-sm flex-1">Als Standard</button>
              <button @click="overrides.splice(idx, 1)" class="btn-danger btn-sm">✕</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-for="day in weekDays" :key="day" class="flex flex-col">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">{{ day }}</label>
                <input 
                  v-model.number="override.slots[day]" 
                  type="number" 
                  step="0.25" 
                  class="input-field" 
                />
              </div>
            </div>
          </div>
        </div>
        <button @click="addOverride" class="btn-primary">+ Override hinzufügen</button>
      </section>

      <!-- Schedule Button -->
      <button @click="runSchedule" class="w-full btn-success text-lg py-4 font-bold">📅 Schedule erstellen</button>

      <!-- Results Section -->
      <div v-if="results.length > 0" class="mt-12">
        <ResultsSection 
          :results="results" 
          :tasks="computedTasks"
          :exceptions="exceptions"
          :capacityByDate="capacityByDate"
          :darkMode="darkMode"
        />
      </div>
    </div>

    <!-- File Input for Import -->
    <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import ResultsSection from './components/ResultsSection.vue'

// Reactive State
const darkMode = ref(false)
const tasks = ref([])
const slots = ref([])
const exceptions = ref([])
const overrides = ref([])
const results = ref([])
const fileInput = ref(null)

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

// Computed Properties
const computedTasks = computed(() => 
  tasks.value
    .filter(t => t.title && t.deadline)
    .map(t => ({ ...t, minutes: t.hours * 60 }))
)

const slotMap = computed(() => {
  const map = {}
  slots.value.forEach(s => { map[s.day] = Math.round(s.hours * 60) })
  return map
})

// Helper Functions
const toLocalISO = (date) => date.toLocaleDateString('sv-SE')
const formatDateDE = (ds) => ds.split('-').reverse().join('.')

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return [d.getUTCFullYear(), weekNo]
}

const isException = (dateStr) => 
  exceptions.value.some(e => dateStr >= e.from && dateStr <= e.to)

const getExceptionName = (dateStr) => {
  const exception = exceptions.value.find(e => dateStr >= e.from && dateStr <= e.to)
  return exception ? exception.name : ''
}

const hasOverride = (dateStr) => {
  const [year, week] = getWeekNumber(new Date(dateStr))
  return overrides.value.some(o => o.year === year && o.week === week)
}

const getOverrideCapacity = (dateStr) => {
  const [year, week] = getWeekNumber(new Date(dateStr))
  const override = overrides.value.find(o => o.year === year && o.week === week)
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const d = new Date(dateStr)
  const dayName = dayNames[d.getDay()]
  return override && override.slots[dayName] ? Math.round(override.slots[dayName] * 60) : 0
}

const getStandardCapacity = (dateStr) => {
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const d = new Date(dateStr)
  const dayName = dayNames[d.getDay()]
  return slotMap.value[dayName] || 0
}

const getCapacityForDay = (dateStr) => {
  if (isException(dateStr)) return 0
  if (hasOverride(dateStr)) return getOverrideCapacity(dateStr)
  return getStandardCapacity(dateStr)
}

const capacityByDate = computed(() => {
  const capacities = {}
  if (computedTasks.value.length === 0) return capacities

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(Math.max(...computedTasks.value.map(t => new Date(t.deadline))))

  for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateStr = toLocalISO(new Date(d))
    capacities[dateStr] = getCapacityForDay(dateStr)
  }

  return capacities
})

// Main Schedule Function
const schedule = (tasksToSchedule) => {
  const plan = []
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  
  const sortedTasks = [...tasksToSchedule].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const maxDL = new Date(Math.max(...tasksToSchedule.map(t => new Date(t.deadline))))
  
  const calendar = []
  for (let d = new Date(today); d <= maxDL; d.setDate(d.getDate() + 1)) {
    const dStr = toLocalISO(d)
    const dName = dayNames[d.getDay()]
    const capacity = getCapacityForDay(dStr)
    
    if (capacity > 0) {
      calendar.push({ date: dStr, day: dName, remaining: capacity })
    }
  }
  
  sortedTasks.forEach(task => {
    let needed = task.minutes
    for (let day of calendar) {
      if (needed <= 0) break
      if (day.remaining <= 0) continue
      if (new Date(day.date) >= new Date(task.deadline)) continue
      
      const alloc = Math.min(needed, day.remaining)
      plan.push({
        date: day.date,
        dayName: day.day,
        title: task.title,
        minutes: alloc,
        importance: task.importance,
        deadline: task.deadline,
        status: 'assigned'
      })
      day.remaining -= alloc
      needed -= alloc
    }
    if (needed > 0) {
      plan.push({ title: task.title, minutes: needed, status: 'overdue' })
    }
  })
  
  return plan.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    if (a.date !== b.date) {
      return a.date > b.date ? 1 : -1
    }
    return parseInt(b.importance) - parseInt(a.importance)
  })
}

// Methods
const runSchedule = () => {
  if (computedTasks.value.length === 0) {
    alert('Bitte Aufgaben eingeben!')
    return
  }
  results.value = schedule(computedTasks.value)
}

const saveData = () => {
  const data = {
    tasks: tasks.value,
    slots: slots.value,
    exceptions: exceptions.value,
    overrides: overrides.value
  }
  localStorage.setItem('lernplan_data', JSON.stringify(data))
  alert('✅ Daten gespeichert!')
}

const loadData = () => {
  const saved = localStorage.getItem('lernplan_data')
  if (saved) {
    const data = JSON.parse(saved)
    tasks.value = data.tasks || []
    slots.value = data.slots || []
    exceptions.value = data.exceptions || []
    overrides.value = data.overrides || []
    alert('✅ Daten geladen!')
  } else {
    alert('❌ Keine gespeicherten Daten gefunden!')
  }
}

const exportData = () => {
  const data = {
    tasks: tasks.value,
    slots: slots.value,
    exceptions: exceptions.value,
    overrides: overrides.value,
    exportedAt: new Date().toLocaleString('de-DE')
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lernplan_' + new Date().toISOString().split('T')[0] + '.json'
  a.click()
  URL.revokeObjectURL(url)
  alert('✅ Daten exportiert!')
}

const importData = () => {
  fileInput.value?.click()
}

const handleImport = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)
      tasks.value = data.tasks || []
      slots.value = data.slots || []
      exceptions.value = data.exceptions || []
      overrides.value = data.overrides || []
      alert('✅ Daten importiert!')
    } catch (error) {
      alert('❌ Fehler beim Importieren: ' + error.message)
    }
  }
  reader.readAsText(file)
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const setAsStandard = (idx) => {
  const override = overrides.value[idx]
  const newSlots = []
  weekDays.forEach(day => {
    newSlots.push({
      day,
      hours: override.slots[day] || 0
    })
  })
  slots.value = newSlots
  overrides.value.splice(idx, 1)
  alert('✅ Override als Standard gesetzt!')
}

const addOverride = () => {
  const currentYear = new Date().getFullYear()
  const currentWeek = getWeekNumber(new Date())[1]
  const slotsObj = {}
  weekDays.forEach(day => { slotsObj[day] = 0 })
  
  overrides.value.push({
    year: currentYear,
    week: currentWeek,
    slots: slotsObj
  })
}

// Load data on mount
import { onMounted } from 'vue'
onMounted(() => {
  const saved = localStorage.getItem('lernplan_data')
  if (saved) {
    const loadQuestion = confirm('Gespeicherte Daten gefunden! Möchtest du sie laden?')
    if (loadQuestion) {
      const data = JSON.parse(saved)
      tasks.value = data.tasks || []
      slots.value = data.slots || []
      exceptions.value = data.exceptions || []
      overrides.value = data.overrides || []
    }
  }
})
</script>

<style scoped>
</style>
