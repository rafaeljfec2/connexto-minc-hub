import { PlusIcon } from '@/components/icons'
import { MonthNavigator } from '@/components/ui/MonthNavigator'
import { GroupedSchedule } from '@/components/schedules/ScheduleGroupItem'
import type { Team, Ministry, Schedule } from '@minc-hub/shared/types'
import { SchedulesSearchBar } from './SchedulesSearchBar'
import { SchedulesMobileListContent } from './SchedulesMobileListContent'

interface SchedulesMobileViewProps {
  readonly groupedSchedules: GroupedSchedule[]
  readonly isLoading: boolean
  readonly teams: Team[]
  readonly ministries: Ministry[]
  readonly searchTerm: string
  readonly selectedMonth: number
  readonly selectedYear: number
  readonly onSearchChange: (value: string) => void
  readonly onMonthChange: (month: string, year: string) => void
  readonly onEdit: (schedule?: Schedule) => void
  readonly onDelete: (id: string) => void
}

export function SchedulesMobileView({
  groupedSchedules,
  isLoading,
  teams,
  ministries,
  searchTerm,
  selectedMonth,
  selectedYear,
  onSearchChange,
  onMonthChange,
  onEdit,
  onDelete,
}: SchedulesMobileViewProps) {
  return (
    <div className="lg:hidden fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-950">
      <div className="bg-white dark:bg-dark-950 flex-shrink-0 border-b border-dark-200 dark:border-dark-800">
        <SchedulesSearchBar value={searchTerm} onChange={onSearchChange} />

        {/* Header Section with Title and New Button */}
        <div className="px-4 py-3 border-t border-dark-200 dark:border-dark-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-900 dark:text-dark-50">Escalas</h2>
          <button
            onClick={() => onEdit()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Nova
          </button>
        </div>

        {/* Month Navigator - behaving like the filters in Teams view */}
        <div className="px-4 pb-3">
          <MonthNavigator
            month={selectedMonth.toString().padStart(2, '0')}
            year={selectedYear.toString()}
            onChange={onMonthChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-dark-50 dark:bg-dark-950 flex-1 overflow-y-auto px-4 py-4">
        <SchedulesMobileListContent
          groupedSchedules={groupedSchedules}
          isLoading={isLoading}
          teams={teams}
          ministries={ministries}
          onEdit={onEdit}
          onDelete={onDelete}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  )
}
