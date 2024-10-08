import { format, isToday } from 'date-fns'

import { isYesterday } from 'date-fns'

export const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) {
        return 'Today'
    } else if (isYesterday(date)) {
        return 'Yesterday'
    } else {
        return format(date, 'EEEE, MMMM d')
    }
}
