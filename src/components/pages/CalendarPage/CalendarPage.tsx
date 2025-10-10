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
  interface IVacation {
    id: number;
    start: string; // '2025-10-01'
    end: string;   // '2025-10-05'
    name: string;
  }

  const assignVacationRows = (vacations: IVacation[], month: number, year: number) => {
    type VacationWithDates = IVacation & { startDate: Date; endDate: Date };

    const monthVacations: VacationWithDates[] = vacations
      .map(v => ({
        ...v,
        startDate: new Date(v.start),
        endDate: new Date(v.end)
      }))
      .filter(v => (v.startDate.getMonth() <= month && v.endDate.getMonth() >= month));

    const rows: VacationWithDates[][] = [];

    monthVacations.forEach(vac => {
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        // проверяем пересечение отпусков
        if (!rows[i].some(r =>
          (vac.startDate <= r.endDate && vac.endDate >= r.startDate)
        )) {
          rows[i].push(vac);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([vac]);
    });

    return rows;
  };

  const weeks = getWeeksWithAdjacentDays(currentYear, select - 1);

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
  function formatDateShort(dateStr: string) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2); // последние 2 цифры года
    return `${day}.${month}.${year}`;
  }
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
  const colors = ["#4caf5055", "#2196f355", "#ff980055", "#e91e6355", "#9c27b055", "#ff572255"];
  function getColorForName(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  const [hoveredVacation, setHoveredVacation] = useState<null | {
    id: number
    x: number
    y: number
    name: string
    start: string
    end: string
    reason?: string
  }>(null);
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

          <div className="calendar-grid">
            {weeks.map((week, weekIndex) => {
              // вычисляем реальные даты начала и конца недели
              const firstVisibleDay = new Date(currentYear, select - 1 + week[0].monthOffset, week[0].day);
              const lastVisibleDay = new Date(currentYear, select - 1 + week[6].monthOffset, week[6].day);

              // фильтруем отпуска, которые хоть как-то пересекаются с неделей
              const weekVacations = dateSettings.vacations.filter(v => {
                const start = new Date(v.start);
                const end = new Date(v.end);
                return start <= lastVisibleDay && end >= firstVisibleDay;
              });

              // распределяем их по строкам, чтобы не налегали
              const vacationRows = assignVacationRows(weekVacations, select - 1, currentYear);

              return (
                <div key={weekIndex} className="week">
                  <div className="day-wrapper">
                    {week.map(({ day, monthOffset }, i) => {
                      const date = new Date(currentYear, select - 1 + monthOffset, day);
                      const isOtherMonth = monthOffset !== 0;
                      const isToday = date.toDateString() === new Date().toDateString();

                      const birthdaysToday = monthOffset === 0
                        ? dateSettings.birthdays.filter(b => {
                          const bd = new Date(b.day);
                          return bd.getMonth() === select - 1 && bd.getDate() === day;
                        })
                        : [];

                      const hasBirthday = birthdaysToday.length > 0;
                      const workHours = getWorkHoursForDate(date, workExceptions);

                      const classNames = [
                        "day",
                        isToday && "today",
                        isOtherMonth && "other-month",
                        hasBirthday && "birthday",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <div className={classNames} key={i}>
                          {birthdaysToday.map(b => (
                            <div key={b.id} className="birthday-name">
                              🍰 {b.name}
                            </div>
                          ))}
                          <div className="work-hours">
                            {workHours > 0 ? formatHours(workHours) : "00:00"}
                          </div>
                          <div className="day-number">{day}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Линии отпусков */}
                  {vacationRows.map((row, rowIndex) => (
                    <div
                      className="vacation-row"
                      key={rowIndex}
                      style={{ bottom: `${rowIndex * 20}px` }}
                    >
                      {row.map(vac => {
                        const start = new Date(vac.start);
                        const end = new Date(vac.end);

                        const visibleStart = start < firstVisibleDay ? firstVisibleDay : start;
                        const visibleEnd = end > lastVisibleDay ? lastVisibleDay : end;

                        const startDayOfWeek = (visibleStart.getDay() + 6) % 7;
                        const endDayOfWeek = (visibleEnd.getDay() + 6) % 7;

                        const left = (startDayOfWeek / 7) * 100;
                        const width = ((endDayOfWeek - startDayOfWeek + 1) / 7) * 100;


                        return (
                          <div
                            key={vac.id}
                            className="vacation-bar"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: getColorForName(vac.name),
                            }}
                            onMouseMove={(e) => {
                              setHoveredVacation({
                                id: vac.id,
                                x: e.clientX,
                                y: e.clientY,
                                name: vac.name,
                                start: vac.start,
                                end: vac.end,
                                reason: "",
                              });
                            }}
                            onMouseLeave={() => setHoveredVacation(null)}
                          >
                            <span className="vacation-name">{vac.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>}



      </div>
      {hoveredVacation && (
        <div
          className="vacation-popover"
          style={{
            position: "fixed",
            top: hoveredVacation.y + 12,  // чуть ниже курсора
            left: hoveredVacation.x + 12, // чуть правее курсора
            transform: "translate(0, 0)",
          }}
        >
          <div style={{ marginBottom: 10 }}><strong>{hoveredVacation.name}</strong></div>
          <div>{formatDateShort(hoveredVacation.start)} - {formatDateShort(hoveredVacation.end)}</div>
          {hoveredVacation.reason && <div>{hoveredVacation.reason}</div>}
        </div>
      )}
    </>

  )
}
export default CalendarPage