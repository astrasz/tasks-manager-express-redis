import { differenceInMinutes, format, formatDistanceToNow, isSameDay, isSameYear, parseISO } from 'date-fns';



export const dateFormat = (date) => {
    const time = new Date(date);
    // const now = new Date();
    let newFormat;
    newFormat = formatDistanceToNow(time, { addSuffix: true });
    // switch (true) {
    //     case differenceInMinutes(now, time) < 60:
    //         console.log('timeee1', time)

    //         newFormat = formatDistanceToNow(new Date(time), { addSuffix: true });
    //         break;
    //     case isSameDay(time, now):
    //         console.log('timeee2', time)
    //         newFormat = format(time, 'HH:mm');
    //         break;
    //     case isSameYear(time, now):
    //         console.log('timeee3', time)

    //         newFormat = format(time, 'dd.MM HH:mm');
    //         break;
    //     default:
    //         newFormat = format(time, 'dd.mm.YY HH:mm');
    // }
    return newFormat;
}