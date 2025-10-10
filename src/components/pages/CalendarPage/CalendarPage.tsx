import React, { MouseEvent, MouseEventHandler, useEffect, useMemo, useState } from "react"
import "./CalendarPage.sass"
import { useAppDispatch, useAppSelector } from "../../../models/Hook"
import { getSettings, IDate } from "../../../redux/SettingsSlice"
import { Status } from "../../../models/Status"
import CalendarWidget from "../../widgets/CalendarWidget/CalendarWidget"
import { getCalendarClasses, getDaysInMonth, getNumberOfEmpty } from "../../../utils/date"

const CalendarPage = () => {
  const dispatch = useAppDispatch()
  const [settings, setSettings] = useState(false)
  const currentYear = new Date().getFullYear()
  const dateSettings = useAppSelector(state => state.settings.date)
  const [select, setSelect] = useState(new Date().getMonth() + 1);
  const status = useAppSelector(state => state.settings.status)
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  /////////////

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
  const workExceptions = [
    { date: "2025-01-01", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-01-02", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-01-03", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-01-04", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-01-05", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-01-06", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-01-08", hours: 0, reason: "Новогодние каникулы" },
    { date: "2025-02-23", hours: 0, reason: "День защитника отечества" },
    { date: "2025-03-08", hours: 0, reason: "Международный женский день" },
    { date: "2025-05-01", hours: 0, reason: "Праздник Весны и Труда" },
    { date: "2025-05-09", hours: 0, reason: "День Победы" },
    { date: "2025-06-12", hours: 0, reason: "День России" },
    { date: "2025-11-04", hours: 0, reason: "День народного единства" },

    { date: "2025-03-07", hours: 6, reason: "Предпраздничный день" },
    { date: "2025-11-01", hours: 7.25, reason: "Предпраздничный день" },
    { date: "2025-04-30", hours: 7, reason: "Для соблюдения баланса" },
    { date: "2025-06-11", hours: 7, reason: "Для соблюдения баланса" },
    { date: "2025-12-30", hours: 7, reason: "Для соблюдения баланса" },

    { date: "2026-01-01", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-02", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-03", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-04", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-05", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-06", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-07", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-08", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-01-09", hours: 0, reason: "Новогодние каникулы" },
    { date: "2026-02-23", hours: 0, reason: "День защитника отечества" },
    { date: "2026-03-08", hours: 0, reason: "Международный женский день" },
    { date: "2026-05-01", hours: 0, reason: "Праздник Весны и Труда" },
    { date: "2026-05-09", hours: 0, reason: "День Победы" },
    { date: "2026-06-12", hours: 0, reason: "День России" },
    { date: "2026-11-04", hours: 0, reason: "День народного единства" },

    { date: "2026-03-07", hours: 6, reason: "Предпраздничный день" },
    { date: "2026-11-01", hours: 7.25, reason: "Предпраздничный день" },
    { date: "2026-04-30", hours: 7, reason: "Для соблюдения баланса" },
    { date: "2026-06-11", hours: 7, reason: "Для соблюдения баланса" },
    { date: "2026-12-30", hours: 7, reason: "Для соблюдения баланса" },
  ];
  const getWeekOfMonth = (year: number, month: number) => {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekDay = (first.getDay() + 6) % 7; // 0 = Пн

    const weeks: (number | null)[][] = [];
    let day = 1 - startWeekDay;
    while (day <= daysInMonth) {
      const week = Array.from({ length: 7 }, (_, i) => {
        const d = day + i;
        return d >= 1 && d <= daysInMonth ? d : null;
      });
      weeks.push(week);
      day += 7;
    }
    return weeks;
  }
  const getWeeksWithAdjacentDays = (year: number, month: number) => {
    const result: { day: number, monthOffset: number }[][] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekDay = (firstDay.getDay() + 6) % 7; // 0 = Пн
    const daysInMonth = lastDay.getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startWeekDay + daysInMonth) / 7) * 7;
    const days: { day: number, monthOffset: number }[] = [];

    for (let i = 0; i < totalCells; i++) {
      const dateNum = i - startWeekDay + 1;
      if (dateNum <= 0) {
        days.push({ day: prevMonthDays + dateNum, monthOffset: -1 });
      } else if (dateNum > daysInMonth) {
        days.push({ day: dateNum - daysInMonth, monthOffset: 1 });
      } else {
        days.push({ day: dateNum, monthOffset: 0 });
      }
    }
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }


  const weeks = getWeeksWithAdjacentDays(currentYear, select - 1);
  const daysInMonth = new Date(currentYear, select - 1, 0).getDate();
  const monthStart = new Date(currentYear, select - 1, 1);
  const monthEnd = new Date(currentYear, select, 0, 23, 59, 59, 999);
  const cellWidth = 100 / 7;
  const cellHeight = 100 / weeks.length;

  const bars = dateSettings.vacations.map((v, i) => {
    const start = new Date(v.start);
    const end = new Date(v.end);

    let startCell: { row: number, col: number } | null = null;
    let endCell: { row: number, col: number } | null = null;

    weeks.forEach((week, row) => {
      week.forEach((d, col) => {
        const cellDate = new Date(currentYear, select - 1 + d.monthOffset, d.day);
        if (!startCell && cellDate >= start && cellDate <= end) {
          startCell = { row, col };
        }
        if (cellDate >= start && cellDate <= end) {
          endCell = { row, col };
        }
      });
    });
    if (!startCell || !endCell) {
      return null;
    }

    const { row: startRow, col: startCol } = startCell;
    const { row: endRow, col: endCol } = endCell;

    const top = startRow * cellHeight + cellHeight * 0.4;
    const left = startCol * cellWidth;

    const rowSpan = (endRow - startRow) * 7 + (endCol - startCol + 1);
    const width = rowSpan * cellWidth;

    return (
      <div
        key={i}
        className={`vacation-bar color-${i % 5}`}
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: `${width}%`
        }}
      >

      </div>
    )


  });


  // const renderVacationBars = (weeks: { day: number, monthOffset: number }[][]) => {
  //   const bars: JSX.Element[] = [];



  //   dateSettings.vacations.forEach((v, i) => {
  //     const start = new Date(v.start);
  //     const end = new Date(v.end);

  //     let startCell: { row: number, col: number } | null = null;
  //     let endCell: { row: number, col: number } | null = null;

  //     weeks.forEach((week, weekIndex) => {
  //       week.forEach((d, di) => {
  //         const cellDate = new Date(currentYear, select - 1 + d.monthOffset, d.day);
  //         if (!startCell && cellDate >= start && cellDate <= end) {
  //           startCell = { row: weekIndex, col: di };
  //         }
  //         if (cellDate >= start && cellDate <= end) {
  //           endCell = { row: weekIndex, col: di };
  //         }
  //       });
  //       if (!startCell || !endCell) {
  //         return;
  //       }
  //       const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

  //       const top = startCell.row * cellHeight + cellHeight * 0.4;
  //       const left = startCell.col * cellWidth;

  //       const rowSpan = endCell.row - startCell.row;
  //       const baseWidth = (rowSpan * 7 + (endCell.col - startCell.col + 1)) * cellWidth;

  //       bars.push(
  //         <div
  //           key={i}
  //           className={`vacation-bar color-${i % 5}`}
  //           style={{
  //             top: `${top}%`,
  //             left: `${left}%`,
  //             width: `${baseWidth}%`
  //           }}
  //         >

  //         </div>
  //       )
  //     });
  //   });
  //   return bars;
  // }


  // const bars = useMemo(() => {

  //   const weekBars: Record<number, any[]> = {};

  //   for (const v of dateSettings.vacations) {
  //     const start = new Date(v.start);
  //     const end = new Date(new Date(v.end).getFullYear(), new Date(v.end).getMonth(), new Date(v.end).getDate());

  //     if (end < monthStart || start > monthEnd) {
  //       continue;
  //     }

  //     const clampedStart = start < monthStart ? monthStart : start;
  //     const clampedEnd = end > monthEnd ? monthEnd : end;
  //     const startDay = clampedStart.getDate();
  //     const endDay = clampedEnd.getDate();
  //     weeks.forEach((week, weekIndex) => {
  //       // const realDays = week.filter((d) => d.day != null) as number[];
  //       // if (realDays.length === 0) {
  //       //   return;
  //       // }
  //       const daysInVacation = week
  //         .map((d, i) => {
  //           const cellDate = new Date(currentYear, select - 1 + mont)
  //         });
  //       const firstDayInWeek = realDays[0];
  //       const lastDayInWeek = realDays[realDays.length - 1];

  //       if (endDay < firstDayInWeek || startDay > lastDayInWeek) {
  //         return;
  //       }

  //       const s = Math.max(startDay, firstDayInWeek);
  //       const e = Math.min(endDay, lastDayInWeek);
  //       const startCol = week.findIndex((d) => d === s);
  //       const endCol = week.findIndex((d) => d === e);
  //       if (startCol === -1 || endCol === -1) {
  //         return;
  //       }

  //       const barsInWeek = weekBars[weekIndex] || [];
  //       let row = 0;
  //       while (
  //         barsInWeek.some(
  //           (b) =>
  //             b.row === row &&
  //             !(endCol < b.startCol || startCol > b.endCol)
  //         )
  //       ) {
  //         row++;
  //       }

  //       const bar = {
  //         id: v.id,
  //         weekIndex,
  //         startCol,
  //         endCol,
  //         name: v.name,
  //         row
  //       }

  //       barsInWeek.push(bar);
  //       weekBars[weekIndex] = barsInWeek;

  //     });


  //   }
  //   return Object.values(weekBars).flat();

  // }, [select, weeks, monthStart, monthEnd])

  /////////////

  const getColorsForId = (id: string) => {
    let hash = 0;
    const idStr = String(Number(id) * 10000);
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsla(${hue}, 85%, 35%, 50%)`;
  }

  const contextMenuHandler = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSelect(-1);
  }

  const getWorkHoursForDate = (date: Date, exceptions: { date: string, hours: number }[]) => {
    const exception = exceptions.find((e) => new Date(e.date).toDateString() === date.toDateString());
    if (exception) {
      return exception.hours;
    }
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return 0;
    }
    if (day === 5) {
      return 7;
    }
    return 8.25;
  }

  const formatHours = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (status === Status.Idle) {
      dispatch(getSettings())
    }
  }, [status, dispatch])

  const calendarContent = <>
    {months.map(month =>
      <CalendarWidget
        date={`${currentYear + 1}-${month}-${1}`}
        key={Math.random()}
        id={Math.random()}
        onClick={() => setSelect(month)}
      />
    )}
  </>


  return (
    <>
      <div className="months-view">
        {select == -1 && calendarContent}
      </div>
      <div className="month-view" onContextMenu={contextMenuHandler}>


        {select != -1 && <>
          <div className="month-grid">
            {dayNames.map(n => (
              <div key={n}>{n}</div>
            ))}
          </div>

          <div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="week">
                <div className="day-wrapper">
                  {week.map(({ day, monthOffset }, i) => {
                    const date = new Date(currentYear, select - 1, day);
                    const isOtherMonth = monthOffset !== 0;
                    const isToday = date.toDateString() === new Date().toDateString();

                    const birthdaysToday = dateSettings.birthdays.filter(b => {
                      const bd = new Date(b.day);
                      return bd.getMonth() === select - 1 && bd.getDate() === day;
                    })

                    const hasBirthday = birthdaysToday.length > 0;
                    const workHours = getWorkHoursForDate(new Date(currentYear, select - 1, day!), workExceptions);
                    const classNames = [
                      "day",
                      isToday && "today",
                      hasBirthday && "birthday"
                    ].filter(Boolean).join(" ");

                    return (
                      <div className={classNames} key={i}>
                        {day && (
                          <>

                            {birthdaysToday.map(b => (
                              <div key={b.id} className="birthday-name">
                                🍰 {b.name}
                              </div>
                            ))}
                            <div className="work-hours">{workHours > 0 ? `${formatHours(workHours)}` : "00:00"}</div>
                            <div className="day-number">{day}</div>

                          </>
                        )}
                      </div>
                    )
                  }
                  )}
                </div>
                {bars}
              </div>




            ))}
          </div>
        </>}



      </div>
    </>

  )
}
export default CalendarPage