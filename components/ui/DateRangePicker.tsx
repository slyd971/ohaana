'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (start: Date | null, end: Date | null) => void
  placeholder?: string
  className?: string
  upward?: boolean
}

// Shared calendar grid used by both mobile and desktop layouts
function CalendarGrid({
  startDate,
  endDate,
  viewMonth,
  viewYear,
  hovered,
  setHovered,
  onDayClick,
  prevMonth,
  nextMonth,
}: {
  startDate: Date | null
  endDate: Date | null
  viewMonth: number
  viewYear: number
  hovered: Date | null
  setHovered: (d: Date | null) => void
  onDayClick: (d: Date) => void
  prevMonth: () => void
  nextMonth: () => void
}) {
  const days = getCalendarDays(viewYear, viewMonth)

  function isInRange(day: Date): boolean {
    if (!startDate) return false
    const rangeEnd = endDate ?? hovered
    if (!rangeEnd) return false
    const lo = startDate < rangeEnd ? startDate : rangeEnd
    const hi = startDate < rangeEnd ? rangeEnd : startDate
    return day > lo && day < hi
  }

  const nightCount = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / 86400000)
    : 0

  return (
    <div>
      {/* Month navigation */}
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
          <div key={i} className="text-center text-[10px] font-medium text-stone py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const past = isPast(day)
          const today_ = isToday(day)
          const rangeStart = startDate ? isSameDay(day, startDate) : false
          const rangeEnd = endDate ? isSameDay(day, endDate) : false
          const inRange = isInRange(day)
          const selected = rangeStart || rangeEnd

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={past}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => setHovered(day)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'relative h-10 w-full text-xs font-medium transition-colors',
                past ? 'text-mist cursor-not-allowed' : 'cursor-pointer',
                inRange && 'bg-deep-green/10',
                rangeStart && endDate && 'rounded-l-full',
                rangeEnd && 'rounded-r-full',
                !endDate && rangeStart && 'rounded-full',
              )}
            >
              <span
                className={cn(
                  'relative z-10 w-9 h-9 rounded-full flex items-center justify-center mx-auto',
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

      {/* Status hint */}
      <p className="text-[11px] text-stone text-center mt-3">
        {!startDate
          ? 'Sélectionnez une date d\'arrivée'
          : !endDate
          ? 'Sélectionnez une date de départ'
          : `${nightCount} nuit${nightCount > 1 ? 's' : ''}`
        }
      </p>
    </div>
  )
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
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!open || isMobile) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, isMobile])

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isMobile, open])

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
      onChange(day, null)
    } else {
      if (day < startDate) {
        onChange(day, null)
      } else if (isSameDay(day, startDate)) {
        onChange(null, null)
      } else {
        onChange(startDate, day)
        if (!isMobile) setOpen(false)
      }
    }
  }

  function handleConfirm() {
    setOpen(false)
  }

  function handleClear() {
    onChange(null, null)
  }

  const displayValue = formatRange(startDate, endDate)

  const trigger = (
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
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onChange(null, null) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(null, null) } }}
          className="text-stone hover:text-charcoal transition-colors"
        >
          <X size={13} />
        </span>
      )}
    </button>
  )

  // Mobile: full-screen bottom sheet via portal
  const mobileOverlay = mounted && isMobile && open ? createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[199] bg-black/50"
        onClick={() => setOpen(false)}
      />
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[200] bg-surface rounded-t-3xl shadow-elevated overflow-hidden"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-mist" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-mist">
          <h2 className="font-semibold text-charcoal text-base">Sélectionnez vos dates</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-mist transition-colors text-stone"
          >
            <X size={18} />
          </button>
        </div>

        {/* Calendar */}
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 160px)' }}>
          <CalendarGrid
            startDate={startDate}
            endDate={endDate}
            viewMonth={viewMonth}
            viewYear={viewYear}
            hovered={hovered}
            setHovered={setHovered}
            onDayClick={handleDayClick}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
          />
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-mist flex gap-3 bg-surface">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 h-12 rounded-xl border border-mist text-charcoal text-sm font-medium hover:border-deep-green/40 transition-colors"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-12 rounded-xl bg-deep-green text-coconut text-sm font-semibold hover:bg-deep-green/90 transition-colors"
          >
            {startDate && endDate ? 'Confirmer' : 'Fermer'}
          </button>
        </div>
      </div>
    </>,
    document.body
  ) : null

  // Desktop: standard floating dropdown
  const desktopDropdown = !isMobile && open ? (
    <div className="absolute top-full left-0 mt-2 z-50 bg-surface rounded-2xl border border-mist shadow-elevated p-4 w-72">
      <CalendarGrid
        startDate={startDate}
        endDate={endDate}
        viewMonth={viewMonth}
        viewYear={viewYear}
        hovered={hovered}
        setHovered={setHovered}
        onDayClick={handleDayClick}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />
    </div>
  ) : null

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {trigger}
      {mobileOverlay}
      {desktopDropdown}
    </div>
  )
}
