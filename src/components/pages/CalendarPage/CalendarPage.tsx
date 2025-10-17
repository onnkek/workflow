import React, { MouseEvent, MouseEventHandler, useEffect, useMemo, useState } from "react"
import "./CalendarPage.sass"
import { useAppDispatch, useAppSelector } from "../../../models/Hook"
import { getSettings, IDate } from "../../../redux/SettingsSlice"
import { Status } from "../../../models/Status"
import CalendarWidget from "../../widgets/CalendarWidget/CalendarWidget"
type WorkDayInfo = {
  hours: number
  reason?: string
  type: "regular" | "holiday" | "short" | "transferFrom" | "transferTo" | "weekend";
}
const BASE_HOURS = {
  default: 8.25,
  friday: 7
}
const sameLocalDate = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const sameDateWithoutYear = (a: Date, b: Date) => {
  return (
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2); // последние 2 цифры года
  return `${day}.${month}.${year}`;
}
export const getWorkDayInfo = (date: Date, dateSettings: IDate): WorkDayInfo => {
  const day = date.getDay();
  let hours: number | undefined;
  const reasons: string[] = [];
  let type: WorkDayInfo["type"] = "regular";

  const holiday = dateSettings.holidays.find(h => sameDateWithoutYear(date, new Date(h.day)));
  if (holiday) {
    hours = 0;
    reasons.push(holiday.name);
    type = "holiday";
  }

  const transfer = dateSettings.transfers.find(t =>
    sameLocalDate(date, new Date(t.from)) ||
    sameLocalDate(date, new Date(t.to))
  );
  if (transfer) {
    if (sameLocalDate(date, new Date(transfer.from))) {
      const short = dateSettings.exceptions.find(s => sameDateWithoutYear(new Date(transfer.from), new Date(s.date)));
      if (hours === undefined) {
        hours = short ? short.time : (day === 5 ? BASE_HOURS.friday : BASE_HOURS.default);
      }
      reasons.push(transfer.name);
      type = type === "holiday" ? type : "transferFrom";
    }
    if (sameLocalDate(date, new Date(transfer.to))) {
      hours = 0;
      reasons.push(transfer.name);
      type = type === "holiday" ? type : "transferTo";
    }
  }

  const short = dateSettings.exceptions.find(e => sameDateWithoutYear(date, new Date(e.date)));
  if (short) {
    if (hours === undefined) {
      hours = short.time;
    }
    reasons.push(short.name);
    if (type === "regular") {
      type = "short";
    }
  }
  if (day === 0 || day === 6) {
    if (hours === undefined) {
      hours = 0;
    }
    if (!reasons.length) {
      reasons.push("Выходной день");
    }
    if (type === "regular") {
      type = "weekend";
    }
  }
  if (hours === undefined) {
    if (day === 5) {
      reasons.push("Рабочий день (Пятница)");
      hours = BASE_HOURS.friday;
    } else {
      reasons.push("Рабочий день");
      hours = BASE_HOURS.default;
    }
  }
  return {
    hours,
    reason: reasons.join(", "),
    type
  };
}
const CalendarPage = () => {
  const dispatch = useAppDispatch()
  const dateSettings = useAppSelector(state => state.settings.date)
  const [select, setSelect] = useState(new Date().getMonth() + 1);
  const [selectYear, setSelectYear] = useState(new Date().getFullYear());
  const status = useAppSelector(state => state.settings.status)
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  const getMonthFromObject = (date: { day: number, month: number, year: number }, fix: boolean) => {
    const months = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]
    const months2 = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

    return `${fix ? date.day : ""} ${fix ? months2[date.month] : months[date.month]} ${fix ? date.year : ""}`
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

  const weeks = getWeeksWithAdjacentDays(selectYear, select - 1);

  const contextMenuHandler = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setHoveredDay(null)
    setHoveredVacation(null)
    setSelect(-1);
  }
  const monthsContextMenuHandler = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setHoveredDay(null)
    setHoveredVacation(null)
    setSelectYear(-1);
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
      <div style={{ padding: "10px", cursor: "pointer" }} key={Math.random()}>
        <CalendarWidget
          date={`${selectYear + 1}-${month}-${1}`}
          className={`${month === new Date().getMonth() + 1 && selectYear === new Date().getFullYear() && "current-month"}`}
          id={Math.random()}
          onClick={() => setSelect(month)}
        />
      </div>

    )}
  </>
  const yearsContent = <>
    {Array.from({ length: new Date().getFullYear() + 5 - (new Date().getFullYear() - 5) + 1 }, (_, i) => new Date().getFullYear() - 5 + i).map(year =>
      <div
        key={year}
        className={`year${year === new Date().getFullYear() ? " current-year" : ""}`}
        onClick={() => setSelectYear(year)}
      >{year}</div>
    )}
  </>


  const colors = [

    "hsla(15, 90%, 60%, 0.5)",   // оранжевый
    "hsla(90, 90%, 60%, 0.5)",   // зеленый
    "hsla(120, 90%, 60%, 0.5)",  // ярко-зеленый
    "hsla(360, 90%, 60%, 0.5)",  // красно-розовый
    "hsla(210, 90%, 60%, 0.5)",  // синий
    "hsla(270, 90%, 60%, 0.5)",  // фиолетовый
    "hsla(45, 90%, 60%, 0.5)",   // желтый
    "hsla(150, 90%, 60%, 0.5)",  // бирюзовый
    "hsla(180, 90%, 60%, 0.5)",  // голубой
    "hsla(30, 90%, 60%, 0.5)",   // желто-оранжевый
    "hsla(0, 90%, 60%, 0.5)",    // красный
    "hsla(240, 90%, 60%, 0.5)",  // темно-синий
    "hsla(60, 90%, 60%, 0.5)",   // желто-зеленый
    "hsla(300, 90%, 60%, 0.5)",  // ярко-фиолетовый
    "hsla(330, 90%, 60%, 0.5)",  // розовый

    // ещё 30 цветов с равномерным распределением оттенков
    "hsla(12, 90%, 60%, 0.5)", "hsla(24, 90%, 60%, 0.5)", "hsla(36, 90%, 60%, 0.5)",
    "hsla(48, 90%, 60%, 0.5)", "hsla(72, 90%, 60%, 0.5)", "hsla(84, 90%, 60%, 0.5)",
    "hsla(96, 90%, 60%, 0.5)", "hsla(108, 90%, 60%, 0.5)", "hsla(132, 90%, 60%, 0.5)",
    "hsla(144, 90%, 60%, 0.5)", "hsla(156, 90%, 60%, 0.5)", "hsla(168, 90%, 60%, 0.5)",
    "hsla(192, 90%, 60%, 0.5)", "hsla(204, 90%, 60%, 0.5)", "hsla(216, 90%, 60%, 0.5)",
    "hsla(228, 90%, 60%, 0.5)", "hsla(252, 90%, 60%, 0.5)", "hsla(264, 90%, 60%, 0.5)",
    "hsla(276, 90%, 60%, 0.5)", "hsla(288, 90%, 60%, 0.5)", "hsla(312, 90%, 60%, 0.5)",
    "hsla(324, 90%, 60%, 0.5)", "hsla(336, 90%, 60%, 0.5)", "hsla(348, 90%, 60%, 0.5)",
    "hsla(6, 90%, 60%, 0.5)", "hsla(18, 90%, 60%, 0.5)", "hsla(42, 90%, 60%, 0.5)",
    "hsla(78, 90%, 60%, 0.5)", "hsla(114, 90%, 60%, 0.5)", "hsla(150, 90%, 60%, 0.5)",
    "hsla(186, 90%, 60%, 0.5)", "hsla(222, 90%, 60%, 0.5)", "hsla(258, 90%, 60%, 0.5)",
    "hsla(294, 90%, 60%, 0.5)", "hsla(330, 90%, 60%, 0.5)"
  ];
  const colorMap = new Map<string, string>();
  let colorIndex = 0;
  const getColorForName = (name: string) => {
    if (colorMap.has(name)) {
      return colorMap.get(name);
    }
    const color = colors[colorIndex % colors.length];
    colorMap.set(name, color);
    colorIndex++;
    return color;
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
  const [hoveredDay, setHoveredDay] = useState<null | {
    id: number
    x: number
    y: number
    date: { day: number, month: number, year: number }
    reason?: string
  }>(null);

  const nextMonthHandler = () => {
    if (select + 1 > 12) {
      setSelect(1);
      setSelectYear(selectYear + 1);
    } else {
      setSelect(select + 1);
    }
  }
  const prevMonthHandler = () => {
    if (select === 1) {
      setSelect(12);
      setSelectYear(selectYear - 1);
    } else {
      setSelect(select - 1);
    }
  }

  return (
    <div className="calendarPage">
      {selectYear == -1 && <div className="years-view">
        {yearsContent}
      </div>}
      {selectYear != -1 && select == -1 && <div style={{ fontSize: "30px", textAlign: "center", marginTop: "0px" }}>{selectYear}</div>}
      {selectYear != -1 && select != -1 && <div style={{ fontSize: "30px", textAlign: "center", marginTop: "0px" }}>{getMonthFromObject({ day: 1, month: select - 1, year: selectYear }, false)} {selectYear}</div >}
      {
        select == -1 && selectYear != -1 &&
        <div className="months-view" onContextMenu={monthsContextMenuHandler}>
          {calendarContent}
        </div>
      }
      <div className="calendar-body">
        {selectYear != -1 && select != -1 && <button className="calendar-btn" onClick={prevMonthHandler}>
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-chevron-compact-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M9.224 1.553a.5.5 0 0 1 .223.67L6.56 8l2.888 5.776a.5.5 0 1 1-.894.448l-3-6a.5.5 0 0 1 0-.448l3-6a.5.5 0 0 1 .67-.223" />
          </svg>
        </button>}
        <div className="month-view" onContextMenu={contextMenuHandler}>


          {select != -1 && selectYear != -1 && <>
            <div className="month-grid">
              {dayNames.map(n => (
                <div key={n}>{n}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {weeks.map((week, weekIndex) => {
                // вычисляем реальные даты начала и конца недели
                const firstVisibleDay = new Date(selectYear, select - 1 + week[0].monthOffset, week[0].day);
                const lastVisibleDay = new Date(selectYear, select - 1 + week[6].monthOffset, week[6].day);

                // фильтруем отпуска, которые хоть как-то пересекаются с неделей
                const weekVacations = dateSettings.vacations.filter(v => {
                  const start = new Date(v.start);
                  const end = new Date(v.end);
                  return start <= lastVisibleDay && end >= firstVisibleDay;
                });

                // распределяем их по строкам, чтобы не налегали
                const vacationRows = assignVacationRows(weekVacations, select - 1, selectYear);

                return (
                  <div key={weekIndex} className="week">
                    <div className="day-wrapper">
                      {week.map(({ day, monthOffset }, i) => {
                        const date = new Date(selectYear, select - 1 + monthOffset, day);
                        const isOtherMonth = monthOffset !== 0;
                        const isToday = date.toDateString() === new Date().toDateString();

                        const birthdaysToday = monthOffset === 0
                          ? dateSettings.birthdays.filter(b => {
                            const bd = new Date(b.day);
                            return bd.getMonth() === select - 1 && bd.getDate() === day;
                          })
                          : [];
                        const workHours = getWorkDayInfo(date, dateSettings);

                        const classNames = [
                          "day",
                          isToday && "today",
                          isOtherMonth && "other-month",
                          workHours.type
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <div
                            className={classNames}
                            key={i}
                            onMouseMove={(e) => {
                              setHoveredDay({
                                id: day,
                                x: e.clientX,
                                y: e.clientY,
                                date: { day: day, month: select - 1 + monthOffset, year: selectYear },
                                reason: workHours.reason,
                              });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          >
                            {birthdaysToday.map(b => (
                              <div key={b.id} className="birthday-name">
                                🍰 {b.name}
                              </div>
                            ))}
                            <div className="work-hours">
                              {workHours.hours > 0 ? formatHours(workHours.hours) : "00:00"}
                            </div>
                            <div className="day-number"
                            >{day}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Линии отпусков */}
                    {vacationRows.map((row, rowIndex) => (
                      <div
                        className="vacation-row"
                        key={rowIndex}
                        style={{ bottom: vacationRows.length < 5 ? `${rowIndex * 20}px` : `${rowIndex * 10}px` }}
                      >
                        {row.map(vac => {
                          const start = new Date(vac.start);
                          const end = new Date(vac.end);

                          const visibleStart = start < firstVisibleDay ? firstVisibleDay : start;
                          const visibleEnd = end > lastVisibleDay ? lastVisibleDay : end;

                          const startDayOfWeek = (visibleStart.getDay() + 6) % 7;
                          const endDayOfWeek = (visibleEnd.getDay() + 6) % 7;

                          const left = (startDayOfWeek / 7) * 100 + 0.2;
                          const width = ((endDayOfWeek - startDayOfWeek + 1) / 7) * 100 - 0.4;




                          return (
                            <div
                              key={vac.id}
                              className="vacation-bar"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                height: `${vacationRows.length < 5 ? "16px" : "7px"}`,
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
                              {vacationRows.length < 5 && <span className="vacation-name">{vac.name}</span>}
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
        {selectYear != -1 && select != -1 && <button className="calendar-btn" onClick={nextMonthHandler}>
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-chevron-compact-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671" />
          </svg>
        </button>}
      </div>
      {
        hoveredVacation && (
          <div
            className="vacation-popover"
            style={{
              position: "fixed",
              top: hoveredVacation.y + 12,
              left: hoveredVacation.x + 12,
              transform: "translate(0, 0)",
            }}
          >
            <div style={{ marginBottom: 10 }}><strong>{hoveredVacation.name}</strong></div>
            <div>{formatDateShort(hoveredVacation.start)} - {formatDateShort(hoveredVacation.end)}</div>
            {hoveredVacation.reason && <div>{hoveredVacation.reason}</div>}
          </div>
        )
      }
      {
        hoveredDay && (
          <div
            className="vacation-popover"
            style={{
              position: "fixed",
              top: hoveredDay.y + 12,
              left: hoveredDay.x + 12,
              transform: "translate(0, 0)",
            }}
          >
            <div style={{ marginBottom: 10 }}><strong>{getMonthFromObject(hoveredDay.date, true)}</strong></div>
            <div></div>
            {hoveredDay.reason && <div>{hoveredDay.reason}</div>}
          </div>
        )
      }
    </div>

  )
}
export default CalendarPage