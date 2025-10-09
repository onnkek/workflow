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
  // const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  // const [selectMonth, setSelectMonth] = useState(new Date(`${currentYear}-${currentMonth}-${1}`).getMonth() + 1)
  // const [selectYear, setSelectYear] = useState(new Date(`${currentYear}-${currentMonth}-${1}`).getFullYear())
  const dateSettings = useAppSelector(state => state.settings.date)
  // const edit = useAppSelector(state => state.widgets.edit)

  const [select, setSelect] = useState(new Date().getMonth() + 1);

  const status = useAppSelector(state => state.settings.status)

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  /////////////

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

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
  const weeks = useMemo(() => getWeekOfMonth(currentYear, select - 1), [currentYear, select]);
  const daysInMonth = new Date(currentYear, select - 1, 0).getDate();
  const monthStart = new Date(currentYear, select - 1, 1);
  const monthEnd = new Date(currentYear, select, 0, 23, 59, 59, 999);

  const bars = useMemo(() => {

    const weekBars: Record<number, any[]> = {};

    for (const v of dateSettings.vacations) {
      const start = new Date(v.start);
      const end = new Date(new Date(v.end).getFullYear(), new Date(v.end).getMonth(), new Date(v.end).getDate() - 1);

      if (end < monthStart || start > monthEnd) {
        continue;
      }

      const clampedStart = start < monthStart ? monthStart : start;
      const clampedEnd = end > monthEnd ? monthEnd : end;
      const startDay = clampedStart.getDate();
      const endDay = clampedEnd.getDate();
      weeks.forEach((week, weekIndex) => {
        const realDays = week.filter((d) => d != null) as number[];
        if (realDays.length === 0) {
          return;
        }
        const firstDayInWeek = realDays[0];
        const lastDayInWeek = realDays[realDays.length - 1];

        if (endDay < firstDayInWeek || startDay > lastDayInWeek) {
          return;
        }

        const s = Math.max(startDay, firstDayInWeek);
        const e = Math.min(endDay, lastDayInWeek);
        const startCol = week.findIndex((d) => d === s);
        const endCol = week.findIndex((d) => d === e);
        if (startCol === -1 || endCol === -1) {
          return;
        }

        const barsInWeek = weekBars[weekIndex] || [];
        let row = 0;
        while (
          barsInWeek.some(
            (b) =>
              b.row === row &&
              !(endCol < b.startCol || startCol > b.endCol)
          )
        ) {
          row++;
        }

        const bar = {
          id: v.id,
          weekIndex,
          startCol,
          endCol,
          name: v.name,
          row
        }

        barsInWeek.push(bar);
        weekBars[weekIndex] = barsInWeek;

      });


    }
    return Object.values(weekBars).flat();

  }, [select, weeks])

  /////////////


  const contextMenuHandler = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSelect(-1);
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

    <div className="month-view" onContextMenu={contextMenuHandler}>

      {select == -1 && calendarContent}
      {select != -1 && <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            fontWeight: "600",
            color: "white",
            marginBottom: 4
          }}
        >
          {dayNames.map(n => (
            <div key={n}>{n}</div>
          ))}
        </div>

        <div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} style={{ position: "relative", marginBottom: 6 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 2
              }}>
                {week.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      height: 70,
                      background: d ? "#fff" : "transparent",
                      color: d ? "#111" : "transparent",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                      padding: 6,
                      fontSize: 14
                    }}
                  >{d ?? ""}</div>
                ))}
              </div>
              {bars
                .filter((b) => b.weekIndex === weekIndex)
                .map((b) => {
                  const left = (b.startCol / 7) * 100;
                  const width = ((b.endCol - b.startCol + 1) / 7) * 100;
                  return (
                    <div
                      key={b.id}
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 46 + b.row * 22,
                        height: 16,
                        backgroundColor: "red",
                        paddingLeft: 6,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        color: "green",
                        zIndex: "10",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <span>{b.name}</span>
                    </div>)
                })}
            </div>




          ))}
        </div>
      </>}



    </div>
  )
}
export default CalendarPage