import { format, formatDistanceToNow } from 'date-fns';



export const dateFormat = (date) => {
    const time = new Date(date);
    const newFormat = formatDistanceToNow(time, { addSuffix: true });
    return newFormat;
}

export const getDayFromDate = (date) => {
    const time = new Date(date);
    const day = format(time, 'dd');
    return day
}

export const getMonthFromDate = (date) => {
    const time = new Date(date);
    const month = format(time, 'MMM');
    return month;
}