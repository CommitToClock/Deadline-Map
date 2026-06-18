<template>
  <div class="min-h-screen app-shell transition-colors">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="eyebrow">Lernplanung</p>
            <h1 class="page-title">Lernplan & Kapazitaets-Check</h1>
            <p class="page-subtitle">Plane Aufgaben gegen reale Wochenkapazitaeten und sieh sofort, wo es eng wird.</p>
          </div>
          <div class="action-bar">
            <button @click="saveData" class="btn-secondary btn-sm">Speichern</button>
            <button @click="loadData" class="btn-secondary btn-sm">Laden</button>
            <button @click="exportData" class="btn-secondary btn-sm">Export</button>
            <button @click="importData" class="btn-secondary btn-sm">Import</button>
            <button @click="toggleDarkMode" class="btn-secondary btn-sm">{{ darkMode ? 'Light' : 'Dark' }}</button>
          </div>
        </div>

        <div class="live-check">
          <div :class="['live-status', liveCanSchedule ? 'live-status-ok' : 'live-status-warning']">
            <span>{{ liveStatusText }}</span>
            <strong>{{ (liveTotalAssigned / 60).toFixed(2) }} / {{ (liveTotalNeeded / 60).toFixed(2) }}h bis zur Deadline</strong>
          </div>
          <div class="live-stat-card">
            <span>Benoetigt</span>
            <strong>{{ (liveTotalNeeded / 60).toFixed(2) }}h</strong>
          </div>
          <div class="live-stat-card">
            <span>Geplant</span>
            <strong>{{ (liveTotalPlanned / 60).toFixed(2) }}h</strong>
          </div>
          <div class="live-free-card">
            <span>Freie Zeitfenster</span>
            <div class="summary-free-list">
              <span v-for="day in liveUnusedDays.slice(0, 3)" :key="day.date" class="free-slot-chip">
                <strong>{{ formatDateDE(day.date) }}</strong>
                <em>{{ (day.capacity / 60).toFixed(1) }}h frei</em>
              </span>
              <span v-if="liveUnusedDays.length === 0" class="free-slot-chip free-slot-empty">Keine</span>
            </div>
          </div>
        </div>
        <details class="live-progress">
          <summary>Aufgaben-Fortschritt anzeigen</summary>
          <div v-if="liveProgressItems.length" class="mt-3 space-y-2">
            <div v-for="item in liveProgressItems" :key="item.title">
              <div class="mb-1 flex justify-between gap-3 text-sm">
                <span class="truncate">{{ item.title }}</span>
                <span class="font-semibold">{{ (item.assigned / 60).toFixed(2) }} / {{ (item.total / 60).toFixed(2) }}h</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: item.percent + '%', backgroundColor: item.color }"
                />
              </div>
            </div>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500 dark:text-slate-400">Noch keine vollstaendigen Aufgaben eingetragen.</p>
        </details>
      </header>

      <main class="layout-grid">
        <div class="space-y-6">
          <details class="panel step-details" open>
            <summary>
              <div>
                <p class="eyebrow">Schritt 1</p>
                <h2>Aufgaben</h2>
              </div>
            </summary>
        <div class="step-content">
              <div class="section-actions">
                <button @click="tasks.push(createEmptyTask())" class="btn-primary btn-sm">+ Aufgabe</button>
              </div>
              <div v-if="tasks.length" class="space-y-3">
                <div v-for="(task, idx) in tasks" :key="task._id || idx" class="form-card task-form">
                  <label class="field field-wide">
                    <span>Titel</span>
                    <input v-model="task.title" placeholder="z.B. Mathe Kapitel 4" class="input-field" />
                  </label>
                  <label class="field">
                    <span>Stunden</span>
                    <input v-model.number="task.hours" type="number" step="0.25" min="0" class="input-field" />
                  </label>
                  <label class="field">
                    <span>Deadline</span>
                    <input v-model="task.deadline" type="date" class="input-field" />
                  </label>
                  <label class="field field-small">
                    <span>Prio</span>
                    <input v-model.number="task.importance" type="number" min="1" max="5" class="input-field" />
                  </label>
                  <button @click="tasks.splice(idx, 1)" class="icon-danger" aria-label="Aufgabe entfernen">x</button>
                </div>
              </div>
              <p v-else class="empty-state">Noch keine Aufgaben. Fuege deine erste Deadline hinzu.</p>
            </div>
          </details>

          <details class="panel step-details" open>
            <summary>
              <div>
                <p class="eyebrow">Schritt 2</p>
                <h2>Woechentliche Zeitfenster</h2>
              </div>
            </summary>
            <div class="step-content">
              <div class="section-actions">
                <button @click="slots.push({ _id: Date.now(), day: 'Montag', hours: 0 })" class="btn-primary btn-sm">+ Slot</button>
              </div>
              <div v-if="slots.length" class="slot-grid">
                <div v-for="(slot, idx) in slots" :key="slot._id || idx" class="form-card slot-form">
                  <label class="field">
                    <span>Tag</span>
                    <select v-model="slot.day" class="input-field">
                      <option v-for="day in weekDays" :key="day" :value="day">{{ day }}</option>
                    </select>
                  </label>
                  <label class="field">
                    <span>Stunden</span>
                    <input v-model.number="slot.hours" type="number" step="0.25" min="0" class="input-field" />
                  </label>
                  <button @click="slots.splice(idx, 1)" class="icon-danger" aria-label="Slot entfernen">x</button>
                </div>
              </div>
              <p v-else class="empty-state">Lege fest, wann du normalerweise lernen kannst.</p>
            </div>
          </details>

          <details class="panel step-details">
            <summary>
              <div>
                <p class="eyebrow">Schritt 3</p>
                <h2>Ausnahmetage</h2>
              </div>
            </summary>
            <div class="step-content">
              <div class="section-actions">
                <button @click="exceptions.push({ _id: Date.now(), name: '', from: '', to: '' })" class="btn-primary btn-sm">+ Ausnahme</button>
              </div>
              <div v-if="exceptions.length" class="space-y-3">
                <div v-for="(exc, idx) in exceptions" :key="exc._id || idx" class="form-card exception-form">
                  <label class="field field-wide">
                    <span>Grund</span>
                    <input v-model="exc.name" placeholder="z.B. Urlaub" class="input-field" />
                  </label>
                  <label class="field">
                    <span>Von</span>
                    <input v-model="exc.from" type="date" class="input-field" />
                  </label>
                  <label class="field">
                    <span>Bis</span>
                    <input v-model="exc.to" type="date" class="input-field" />
                  </label>
                  <button @click="exceptions.splice(idx, 1)" class="icon-danger" aria-label="Ausnahme entfernen">x</button>
                </div>
              </div>
              <p v-else class="empty-state">Optional: Tage ohne Lernzeit eintragen.</p>
            </div>
          </details>
        </div>

        <aside class="space-y-6">
          <details class="panel step-details" open>
            <summary>
              <div>
                <p class="eyebrow">Schritt 4</p>
                <h2>Overrides</h2>
              </div>
            </summary>
            <div class="step-content">
              <div class="section-actions">
                <button @click="addOverride" class="btn-primary btn-sm">+ KW</button>
              </div>
              <div v-if="overrides.length" class="space-y-4">
                <div v-for="(override, idx) in overrides" :key="override._id || idx" class="override-card">
                  <div class="override-head">
                    <label class="field">
                      <span>Jahr</span>
                      <input v-model.number="override.year" type="number" class="input-field" />
                    </label>
                    <label class="field">
                      <span>KW</span>
                      <input v-model.number="override.week" type="number" min="1" max="53" class="input-field" />
                    </label>
                    <button @click="overrides.splice(idx, 1)" class="icon-danger" aria-label="Override entfernen">x</button>
                  </div>
                  <div class="override-days">
                    <label v-for="day in weekDays" :key="day" class="field compact-field">
                      <span>{{ day.slice(0, 2) }}</span>
                      <input v-model.number="override.slots[day]" type="number" step="0.25" min="0" class="input-field" />
                    </label>
                  </div>
                  <button @click="setAsStandard(idx)" class="btn-secondary w-full mt-3">Als Standard uebernehmen</button>
                </div>
              </div>
              <p v-else class="empty-state">Nutze Overrides fuer Pruefungswochen, Urlaub oder einmalig andere Kapazitaeten.</p>
            </div>
          </details>

          <section class="panel action-panel">
            <div class="step-content">
              <h2>Plan erstellen</h2>
              <p class="helper-text">Der Plan nutzt deine Kapazitaeten bis zur jeweiligen Deadline. Aufgaben werden nach Deadline sortiert.</p>
              <button @click="runSchedule" class="w-full btn-success text-base py-3 font-bold">Schedule erstellen</button>
            </div>
          </section>
        </aside>
      </main>

      <section v-if="results.length > 0" ref="resultsSection" class="mt-10 scroll-mt-6">
        <ResultsSection
          :results="results"
          :tasks="computedTasks"
          :exceptions="exceptions"
          :capacityByDate="capacityByDate"
          :darkMode="darkMode"
          @toggle-done="toggleResultDone"
          @move-item="moveResultItem"
        />
      </section>
    </div>

    <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import ResultsSection from './components/ResultsSection.vue'

const darkMode = ref(false)
const tasks = ref([])
const slots = ref([])
const exceptions = ref([])
const overrides = ref([])
const results = ref([])
const fileInput = ref(null)
const resultsSection = ref(null)
const completedTaskKeys = ref([])
const completedTaskItems = ref({})
const taskDateOverrides = ref({})
const planUnitMap = ref({})

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const formatDateDE = (ds) => ds.split('-').reverse().join('.')
const toLocalISO = (date) => date.toLocaleDateString('sv-SE')

const normalizeDateValue = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return toLocalISO(date)
}

const inferTaskCreatedAt = (task) => {
  const explicitDate = normalizeDateValue(task?.createdAt)
  if (explicitDate) return explicitDate

  const rawId = Number(task?._id)
  if (Number.isFinite(rawId) && rawId > 100000000000) {
    const inferredDate = normalizeDateValue(rawId)
    if (inferredDate) return inferredDate
  }

  return toLocalISO(new Date())
}

const ensureTaskMetadata = (task) => {
  if (!task) return task
  task.createdAt = inferTaskCreatedAt(task)
  return task
}

const normalizeTaskMetadata = (arr) => {
  if (!Array.isArray(arr)) return
  arr.forEach(task => ensureTaskMetadata(task))
}

const createEmptyTask = () => ({
  _id: Date.now(),
  title: '',
  hours: 0,
  deadline: '',
  importance: 1,
  createdAt: toLocalISO(new Date())
})

const normalizeTaskHours = (task) => {
  const directHours = Number(task?.hours)
  if (Number.isFinite(directHours)) return directHours

  const minutes = Number(task?.minutes)
  if (Number.isFinite(minutes)) return minutes / 60

  return 0
}

const normalizeImportedTasks = (rawTasks) =>
  (Array.isArray(rawTasks) ? rawTasks : []).map(task => ({
    _id: task?._id || Date.now() + Math.random(),
    title: task?.title || '',
    hours: normalizeTaskHours(task),
    deadline: task?.deadline || '',
    importance: Number(task?.importance) || 1,
    createdAt: inferTaskCreatedAt(task)
  }))

const normalizeImportedSlots = (data) => {
  const directSlots = Array.isArray(data?.slots) ? data.slots : []
  const fallbackSlots = directSlots.length > 0
    ? directSlots
    : [...(Array.isArray(data?.capacityVersions) ? data.capacityVersions : [])]
      .sort((a, b) => String(b?.validFrom || '').localeCompare(String(a?.validFrom || '')))[0]?.slots || []

  return fallbackSlots.map(slot => ({
    _id: slot?._id || Date.now() + Math.random(),
    day: slot?.day || 'Montag',
    hours: Number(slot?.hours) || 0
  }))
}

const normalizeImportedExceptions = (rawExceptions) =>
  (Array.isArray(rawExceptions) ? rawExceptions : []).map(exception => ({
    _id: exception?._id || Date.now() + Math.random(),
    name: exception?.name || '',
    from: exception?.from || '',
    to: exception?.to || ''
  }))

const normalizeImportedOverrides = (rawOverrides) =>
  (Array.isArray(rawOverrides) ? rawOverrides : []).map(override => ({
    _id: override?._id || Date.now() + Math.random(),
    year: Number(override?.year) || new Date().getFullYear(),
    week: Number(override?.week) || 1,
    slots: { ...(override?.slots || {}) }
  }))

const UNIT_MINUTES = 15
const buildUnitId = (taskKey, unitIndex) => `${taskKey}::${unitIndex}`
const parseUnitIds = (value) => String(value || '').split('|').filter(Boolean)
const getTaskKey = (task) => String(task?._id || `${task?.title || ''}|${task?.deadline || ''}|${task?.importance || 1}`)

const isUnitId = (value) => typeof value === 'string' && value.includes('::')

const sanitizeRuntimeState = (data = {}) => {
  const sanitizeEntries = (source) => Object.fromEntries(
    Object.entries(source && typeof source === 'object' ? source : {})
      .filter(([key, item]) => isUnitId(key) && isUnitId(item?.__originalKey))
  )

  return {
    completedTaskKeys: (Array.isArray(data.completedTaskKeys) ? data.completedTaskKeys : []).filter(isUnitId),
    completedTaskItems: sanitizeEntries(data.completedTaskItems),
    taskDateOverrides: Object.fromEntries(
      Object.entries(data.taskDateOverrides && typeof data.taskDateOverrides === 'object' ? data.taskDateOverrides : {})
        .filter(([key]) => isUnitId(key))
    )
  }
}

const buildTransferPayload = () => ({
  formatVersion: 2,
  exportedAt: new Date().toLocaleString('de-DE'),
  source: 'vue-app',
  tasks: tasks.value.map(task => ({
    _id: task._id,
    title: task.title || '',
    hours: Number(task.hours) || 0,
    minutes: Math.round((Number(task.hours) || 0) * 60),
    deadline: task.deadline || '',
    importance: Number(task.importance) || 1,
    createdAt: inferTaskCreatedAt(task)
  })),
  slots: slots.value.map(slot => ({
    _id: slot._id,
    day: slot.day,
    hours: Number(slot.hours) || 0
  })),
  exceptions: exceptions.value.map(exception => ({
    _id: exception._id,
    name: exception.name || '',
    from: exception.from || '',
    to: exception.to || ''
  })),
  overrides: overrides.value.map(override => ({
    _id: override._id,
    year: override.year,
    week: override.week,
    slots: { ...(override.slots || {}) }
  })),
  completedTaskKeys: [...completedTaskKeys.value],
  completedTaskItems: { ...completedTaskItems.value },
  taskDateOverrides: { ...taskDateOverrides.value },
  capacityVersions: [{
    validFrom: planningStartDate.value || toLocalISO(new Date()),
    slots: slots.value.map(slot => ({ day: slot.day, hours: Number(slot.hours) || 0 }))
  }]
})

const applyImportedData = (data) => {
  const runtimeState = sanitizeRuntimeState(data)
  tasks.value = normalizeImportedTasks(data?.tasks)
  normalizeTaskMetadata(tasks.value)
  slots.value = normalizeImportedSlots(data)
  exceptions.value = normalizeImportedExceptions(data?.exceptions)
  overrides.value = normalizeImportedOverrides(data?.overrides)
  completedTaskKeys.value = runtimeState.completedTaskKeys
  completedTaskItems.value = runtimeState.completedTaskItems
  taskDateOverrides.value = runtimeState.taskDateOverrides
  assignUniqueIds(tasks.value)
  assignUniqueIds(slots.value)
  assignUniqueIds(exceptions.value)
  assignUniqueIds(overrides.value)
}

const computedTasks = computed(() =>
  tasks.value
    .filter(t => t.title && t.deadline)
    .map(t => ({ ...t, createdAt: inferTaskCreatedAt(t), minutes: (Number(t.hours) || 0) * 60 }))
)

const slotMap = computed(() => {
  const map = {}
  slots.value.forEach(s => { map[s.day] = Math.round((Number(s.hours) || 0) * 60) })
  return map
})

const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return [d.getUTCFullYear(), weekNo]
}

const isException = (dateStr) =>
  exceptions.value.some(e => dateStr >= e.from && dateStr <= e.to)

const hasOverride = (dateStr) => {
  const [year, week] = getWeekNumber(new Date(dateStr))
  return overrides.value.some(o => o.year === year && o.week === week)
}

const getOverrideCapacity = (dateStr) => {
  const [year, week] = getWeekNumber(new Date(dateStr))
  const override = overrides.value.find(o => o.year === year && o.week === week)
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const dayName = dayNames[new Date(dateStr).getDay()]
  return override && override.slots[dayName] ? Math.round((Number(override.slots[dayName]) || 0) * 60) : 0
}

const getStandardCapacity = (dateStr) => {
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const dayName = dayNames[new Date(dateStr).getDay()]
  return slotMap.value[dayName] || 0
}

const getCapacityForDay = (dateStr) => {
  if (isException(dateStr)) return 0
  if (hasOverride(dateStr)) return getOverrideCapacity(dateStr)
  return getStandardCapacity(dateStr)
}

const isScheduledResult = (item) =>
  item.status === 'assigned' || item.status === 'late-assigned'

const planningStartDate = computed(() => {
  if (computedTasks.value.length === 0) return null

  return computedTasks.value
    .map(task => inferTaskCreatedAt(task))
    .sort()[0]
})

const capacityByDate = computed(() => {
  const capacities = {}
  if (computedTasks.value.length === 0 || !planningStartDate.value) return capacities

  const startDate = new Date(planningStartDate.value)
  startDate.setHours(0, 0, 0, 0)
  const maxDate = new Date(Math.max(...computedTasks.value.map(t => new Date(t.deadline))))

  for (let d = new Date(startDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateStr = toLocalISO(new Date(d))
    capacities[dateStr] = getCapacityForDay(dateStr)
  }

  return capacities
})

const completedTaskKeySet = computed(() => new Set(completedTaskKeys.value))

const createPlanUnit = (task, unitId, date, status, extra = {}) => ({
  title: task.title,
  minutes: UNIT_MINUTES,
  status,
  importance: task.importance,
  deadline: task.deadline,
  taskKey: getTaskKey(task),
  taskCreatedAt: inferTaskCreatedAt(task),
  date,
  __originalKey: unitId,
  unitIds: [unitId],
  originalDate: extra.originalDate || date,
  locked: !!extra.locked
})

const groupPlanUnits = (units) => {
  const grouped = new Map()

  units.forEach(unit => {
    const groupKey = [unit.date || '', unit.status, unit.taskKey, unit.deadline, unit.importance].join('|')
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        date: unit.date,
        title: unit.title,
        minutes: 0,
        status: unit.status,
        importance: unit.importance,
        deadline: unit.deadline,
        taskKey: unit.taskKey,
        taskCreatedAt: unit.taskCreatedAt,
        __originalKey: unit.__originalKey,
        originalDate: unit.originalDate || unit.date,
        unitIds: []
      })
    }

    const entry = grouped.get(groupKey)
    entry.minutes += unit.minutes
    entry.unitIds.push(unit.__originalKey)
  })

  return [...grouped.values()].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return Number(b.importance || 0) - Number(a.importance || 0)
  })
}

const schedule = (tasksToSchedule) => {
  const activeTasks = (tasksToSchedule || []).filter(task => task.title && task.deadline && Number(task.minutes || 0) > 0)
  if (!activeTasks.length) return { items: [], unitMap: {} }

  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const completedSet = completedTaskKeySet.value
  const overridesMap = taskDateOverrides.value || {}
  const sortedTasks = [...activeTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  const startDate = planningStartDate.value ? new Date(planningStartDate.value) : new Date()
  startDate.setHours(0, 0, 0, 0)
  const maxDL = new Date(Math.max(...activeTasks.map(t => new Date(t.deadline))))

  const reservedByDate = {}
  const assignedUnits = []
  const unitMap = {}
  const backlog = []

  const pushUnit = (unit) => {
    assignedUnits.push(unit)
    unitMap[unit.__originalKey] = unit
  }

  sortedTasks.forEach(task => {
    const taskKey = getTaskKey(task)
    const totalUnits = Math.round(Number(task.minutes || 0) / UNIT_MINUTES)
    for (let unitIndex = 0; unitIndex < totalUnits; unitIndex++) {
      const unitId = buildUnitId(taskKey, unitIndex)
      const override = overridesMap[unitId]

      if (completedSet.has(unitId)) {
        const frozen = completedTaskItems.value[unitId] || override?.item
        const date = frozen?.date || override?.date || inferTaskCreatedAt(task)
        reservedByDate[date] = (reservedByDate[date] || 0) + UNIT_MINUTES
        continue
      }

      if (override?.date) {
        reservedByDate[override.date] = (reservedByDate[override.date] || 0) + UNIT_MINUTES
        pushUnit(createPlanUnit(task, unitId, override.date, 'assigned', {
          originalDate: override.originalDate || override.date,
          locked: true
        }))
        continue
      }

      backlog.push({ task, unitId, taskCreatedAt: inferTaskCreatedAt(task) })
    }
  })

  const calendar = []
  for (let d = new Date(startDate); d <= maxDL; d.setDate(d.getDate() + 1)) {
    const dateStr = toLocalISO(d)
    const capacity = getCapacityForDay(dateStr)
    const reserved = Number(reservedByDate[dateStr] || 0)
    const available = Math.max(0, capacity - reserved)
    if (available > 0) {
      calendar.push({ date: dateStr, day: dayNames[d.getDay()], remaining: available })
    }
  }

  const unscheduled = []
  backlog.forEach(entry => {
    let assigned = false
    for (const day of calendar) {
      if (day.remaining < UNIT_MINUTES) continue
      if (day.date < entry.taskCreatedAt) continue
      if (new Date(day.date) >= new Date(entry.task.deadline)) continue

      day.remaining -= UNIT_MINUTES
      pushUnit(createPlanUnit(entry.task, entry.unitId, day.date, 'assigned'))
      assigned = true
      break
    }

    if (!assigned) unscheduled.push(entry)
  })

  unscheduled.forEach(entry => {
    const overdueUnit = createPlanUnit(entry.task, entry.unitId, '', 'overdue')
    delete overdueUnit.date
    pushUnit(overdueUnit)
  })

  return {
    items: groupPlanUnits(assignedUnits),
    unitMap
  }
}

const liveResults = computed(() => {
  if (computedTasks.value.length === 0) return []
  const scheduleResult = schedule(computedTasks.value)
  planUnitMap.value = scheduleResult.unitMap
  return scheduleResult.items
})

const liveTotalNeeded = computed(() =>
  computedTasks.value.reduce((sum, task) => sum + task.minutes, 0)
)

const liveTotalAssigned = computed(() =>
  liveResults.value
    .filter(item => item.status === 'assigned')
    .reduce((sum, item) => sum + item.minutes, 0)
)

const liveTotalPlanned = computed(() =>
  liveResults.value
    .filter(isScheduledResult)
    .reduce((sum, item) => sum + item.minutes, 0)
)

const liveCanSchedule = computed(() =>
  computedTasks.value.length > 0 && liveTotalAssigned.value >= liveTotalNeeded.value
)

const liveStatusText = computed(() => {
  if (computedTasks.value.length === 0) return 'Noch keine Aufgaben'
  return liveCanSchedule.value ? 'Zeit reicht aus' : 'Zeitmangel'
})

const liveProgressItems = computed(() =>
  computedTasks.value.map(task => {
    const assigned = liveResults.value
      .filter(item => isScheduledResult(item) && item.title === task.title)
      .reduce((sum, item) => sum + item.minutes, 0)
    const percentRaw = task.minutes > 0 ? (assigned / task.minutes) * 100 : 0
    const percent = Math.min(percentRaw, 100)
    const color = percent === 100 ? '#16a34a' : percent >= 50 ? '#ea580c' : '#dc2626'

    return {
      title: task.title,
      assigned,
      total: task.minutes,
      percent,
      color
    }
  })
)

const liveUnusedDays = computed(() => {
  if (computedTasks.value.length === 0) return []

  const usedByDate = {}
  liveResults.value
    .filter(isScheduledResult)
    .forEach(item => {
      usedByDate[item.date] = (usedByDate[item.date] || 0) + item.minutes
    })

  return Object.entries(capacityByDate.value)
    .map(([date, capacity]) => ({
      date,
      capacity: Math.max(capacity - (usedByDate[date] || 0), 0)
    }))
    .filter(day => day.capacity > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
})

const toggleResultDone = (payload) => {
  const unitIds = parseUnitIds(payload?.unitIds)
  if (unitIds.length === 0) return

  const completedSet = new Set(completedTaskKeys.value)
  const shouldMarkDone = !unitIds.every(unitId => completedSet.has(unitId))

  unitIds.forEach(unitId => {
    if (shouldMarkDone) {
      completedSet.add(unitId)
      const unitItem = planUnitMap.value[unitId]
      if (unitItem) {
        completedTaskItems.value = {
          ...completedTaskItems.value,
          [unitId]: { ...unitItem }
        }
      }
    } else {
      completedSet.delete(unitId)
      const nextCompletedItems = { ...completedTaskItems.value }
      delete nextCompletedItems[unitId]
      completedTaskItems.value = nextCompletedItems
    }
  })

  completedTaskKeys.value = [...completedSet]
  const scheduleResult = schedule(computedTasks.value)
  planUnitMap.value = scheduleResult.unitMap
  results.value = scheduleResult.items
}

const moveResultItem = ({ unitIds, newDate }) => {
  const parsedUnitIds = parseUnitIds(unitIds)
  if (parsedUnitIds.length === 0 || !newDate) return

  for (const unitId of parsedUnitIds) {
    const item = planUnitMap.value[unitId]
    if (!item) continue
    if (new Date(newDate) > new Date(item.deadline)) {
      alert(`Die Aufgabe "${item.title}" darf nicht nach ihrer Deadline (${formatDateDE(item.deadline)}) verschoben werden.`)
      return
    }
    if (item.taskCreatedAt && newDate < item.taskCreatedAt) {
      alert(`Die Aufgabe "${item.title}" darf nicht vor ihrem Startdatum (${formatDateDE(item.taskCreatedAt)}) verschoben werden.`)
      return
    }
  }

  const nextOverrides = { ...taskDateOverrides.value }
  parsedUnitIds.forEach(unitId => {
    const item = planUnitMap.value[unitId]
    if (!item) return
    const originalDate = nextOverrides[unitId]?.originalDate || item.originalDate || item.date
    if (newDate === originalDate) {
      delete nextOverrides[unitId]
    } else {
      nextOverrides[unitId] = {
        date: newDate,
        originalDate,
        item: { ...item }
      }
    }
  })

  taskDateOverrides.value = nextOverrides
  const scheduleResult = schedule(computedTasks.value)
  planUnitMap.value = scheduleResult.unitMap
  results.value = scheduleResult.items
}

const runSchedule = () => {
  if (computedTasks.value.length === 0) {
    alert('Bitte Aufgaben eingeben!')
    return
  }
  const scheduleResult = schedule(computedTasks.value)
  planUnitMap.value = scheduleResult.unitMap
  results.value = scheduleResult.items
  nextTick(() => {
    resultsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const saveData = () => {
  localStorage.setItem('lernplan_data', JSON.stringify(buildTransferPayload()))
  alert('Daten gespeichert!')
}

const assignUniqueIds = (arr) => {
  if (Array.isArray(arr)) {
    arr.forEach(item => {
      if (!item._id) {
        item._id = Date.now() + Math.random(); // Ensure uniqueness even if Date.now() is the same
      }
    });
  }
};
const loadData = () => {
  const saved = localStorage.getItem('lernplan_data')
  if (saved) {
    applyImportedData(JSON.parse(saved))
    alert('Daten geladen!')
  } else {
    alert('Keine gespeicherten Daten gefunden!')
  }
}

const exportData = () => {
  const json = JSON.stringify(buildTransferPayload(), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lernplan_' + new Date().toISOString().split('T')[0] + '.json'
  a.click()
  URL.revokeObjectURL(url)
  alert('Daten exportiert!')
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
      applyImportedData(JSON.parse(event.target.result))
      alert('Daten importiert!')
    } catch (error) {
      alert('Fehler beim Importieren: ' + error.message)
    }
  }
  reader.readAsText(file)
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
}

const setAsStandard = (idx) => {
  const override = overrides.value[idx]
  slots.value = weekDays.map(day => ({
    day,
    hours: override.slots[day] || 0
  }))
  overrides.value.splice(idx, 1)
  alert('Override als Standard gesetzt!')
}

const addOverride = () => {
  const currentYear = new Date().getFullYear()
  const currentWeek = getWeekNumber(new Date())[1]
  const slotsObj = {}
  weekDays.forEach(day => { slotsObj[day] = 0 })

  overrides.value.push({
    _id: Date.now(),
    year: currentYear,
    week: currentWeek,
    slots: slotsObj
  })
}

onMounted(() => {
  const saved = localStorage.getItem('lernplan_data')
  if (saved) {
    const loadQuestion = confirm('Gespeicherte Daten gefunden! Moechtest du sie laden?')
    if (loadQuestion) {
      applyImportedData(JSON.parse(saved))
    }
  }
})
</script>
