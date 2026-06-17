'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isToday(d: Date) {
  return isSameDay(d, new Date())
}

function isPast(d: Date) {
  return startOfDay(d) < startOfDay(new Date())
}

function formatRange(start: Date | null, end: Date | null): string {
  if (!start) return ''
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const s = start.toLocaleDateString('fr-FR', opts)
  if (!end) return s
  const e = end.toLocaleDateString('fr-FR', opts)
  return `${s} – ${e}`
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  // Monday-first: getDay() returns 0=Sun, shift so Mon=0
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (start: Date | null, end: Date | null) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = 'Dates de séjour',
  className,
}: DateRangePickerProps) {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [hovered, setHovered] = useState<Date | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  function handleDayClick(day: Date) {
    if (isPast(day)) return
    if (!startDate || (startDate && endDate)) {
      // Start fresh selection
      onChange(day, null)
    } else {
      // startDate set, no endDate yet
      if (day < startDate) {
        onChange(day, null)
      } else if (isSameDay(day, startDate)) {
        onChange(null, null)
      } else {
        onChange(startDate, day)
        setOpen(false)
      }
    }
  }

  // Range highlight: between start and (end or hovered)
  function isInRange(day: Date): boolean {
    if (!startDate) return false
    const rangeEnd = endDate ?? hovered
    if (!rangeEnd) return false
    const lo = startDate < rangeEnd ? startDate : rangeEnd
    const hi = startDate < rangeEnd ? rangeEnd : startDate
    return day > lo && day < hi
  }

  function isRangeStart(day: Date) {
    return startDate ? isSameDay(day, startDate) : false
  }

  function isRangeEnd(day: Date) {
    return endDate ? isSameDay(day, endDate) : false
  }

  const displayValue = formatRange(startDate, endDate)
  const days = getCalendarDays(viewYear, viewMonth)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger input */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full h-11 rounded-xl border bg-coconut px-3 text-sm text-left flex items-center gap-2 transition-colors',
          open ? 'border-deep-green ring-2 ring-deep-green/15' : 'border-mist',
          displayValue ? 'text-charcoal' : 'text-stone',
        )}
      >
        <CalendarDays size={14} className="text-deep-green flex-none" />
        <span className="flex-1 truncate">{displayValue || placeholder}</span>
        {displayValue && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null, null) }}
            className="text-stone hover:text-charcoal transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-surface rounded-2xl border border-mist shadow-elevated p-4 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-mist transition-colors text-stone hover:text-charcoal"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-charcoal capitalize">
              {MONTHS_FR[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-mist transition-colors text-stone hover:text-charcoal"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_FR.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-stone py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />

              const past = isPast(day)
              const today_ = isToday(day)
              const rangeStart = isRangeStart(day)
              const rangeEnd = isRangeEnd(day)
              const inRange = isInRange(day)
              const selected = rangeStart || rangeEnd

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={past}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    'relative h-9 w-full text-xs font-medium transition-colors',
                    past ? 'text-mist cursor-not-allowed' : 'cursor-pointer',
                    // Range background (strip)
                    inRange && 'bg-deep-green/10',
                    // Round left edge on start
                    rangeStart && endDate && 'rounded-l-full',
                    // Round right edge on end
                    rangeEnd && 'rounded-r-full',
                    // No range → full round
                    !endDate && rangeStart && 'rounded-full',
                  )}
                >
                  <span
                    className={cn(
                      'relative z-10 w-8 h-8 rounded-full flex items-center justify-center mx-auto',
                      selected && 'bg-deep-green text-white',
                      !selected && today_ && 'border border-deep-green text-deep-green',
                      !selected && !today_ && !past && 'hover:bg-mist text-charcoal',
                    )}
                  >
                    {day.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Footer hint */}
          <p className="text-[10px] text-stone text-center mt-3">
            {!startDate
              ? 'Sélectionnez une date d\'arrivée'
              : !endDate
              ? 'Sélectionnez une date de départ'
              : `${Math.round((endDate.getTime() - startDate.getTime()) / 86400000)} nuit${Math.round((endDate.getTime() - startDate.getTime()) / 86400000) > 1 ? 's' : ''}`
            }
          </p>
        </div>
      )}
    </div>
  )
}
