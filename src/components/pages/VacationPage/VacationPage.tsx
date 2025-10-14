import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import "./VacationPage.sass"
import Note from "../../Note/Note"
import { useAppDispatch, useAppSelector } from "../../../models/Hook"
import { getNotes } from "../../../redux/NotesSlice"
import { Status } from "../../../models/Status"
import IFolder from "../../../models/Folder"
import ContextMenu from "../../ContextMenu/ContextMenu"
import Finder from "../../Finder/Finder"
import ContentDivider from "../../ContentDivider/ContentDivider"
import { getSettings } from "../../../redux/SettingsSlice"

export interface VacationPageType {
  year: number
}

const isLeapYear = (y: number) => {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

const getDayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const formatDate = (str: string) => {
  const d = new Date(str);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}


const VacationPage = ({ year }: VacationPageType) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const minZoom = 0.3;
  const maxZoom = 5;
  const baseCellWidth = 20;
  const totalDays = isLeapYear(year) ? 366 : 365;
  const dispatch = useAppDispatch()
  const dateSettings = useAppSelector(state => state.settings.date)
  const status = useAppSelector(state => state.settings.status)

  const cellWidth = baseCellWidth * zoom;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const today = new Date();
    if (today.getFullYear() !== year) {
      return;
    }
    const dayOfYear = getDayOfYear(today);
    container.scrollLeft = dayOfYear * baseCellWidth * zoom - container.clientWidth / 2;

  }, [year])

  const today = new Date();
  const todayPos = today.getFullYear() === year ? getDayOfYear(today) * cellWidth : -1;

  const monthGrid = () => {
    const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

    const elems: JSX.Element[] = [];
    let dayIndex = 0;
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      elems.push(
        <div
          key={`month-${m}`}
          className="month-cell"
          style={{
            left: `${dayIndex * cellWidth}px`,
            width: `${daysInMonth * cellWidth}px`
          }}
        >
          <span>{months[m]}</span>
          <div className="days-row">
            {Array.from({ length: daysInMonth }).map((_, i) => (
              <div
                key={i}
                className="day-cell"
                style={{ width: `${cellWidth}px` }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      );
      dayIndex += daysInMonth;
    }
    return elems;
  }
  const colors = [
    "#3b82f655", "#10b98155", "#f59e0b55", "#ef444455", "#8b5cf655",
    "#06b6d455", "#ec489955", "#84cc1655", "#fb923c55", "#dc262655",
    "#4338ca55", "#34d39955", "#a855d755", "#eab30855", "#14b8a655"
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
  useEffect(() => {
    if (status === Status.Idle) {
      dispatch(getSettings())
    }
  }, [status, dispatch])


  const handleWheel = (e: React.WheelEvent) => {
    // e.preventDefault();
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;



    const oldScrollLeft = container.scrollLeft;
    const contentX = oldScrollLeft + mouseX;

    // const ratio = (scrollLeftBefore + mouseX) / (totalDays * cellWidth);

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => {
      const newZoom = Math.min(maxZoom, Math.max(minZoom, prev + delta));
      const oldCellWidth = baseCellWidth * zoom;
      const newCellWidth = baseCellWidth * newZoom;
      const newTotalWidth = totalDays * newCellWidth;
      let newScrollLeft = (contentX / oldCellWidth) * newCellWidth - mouseX;
      newScrollLeft = Math.max(0, Math.min(newScrollLeft, newTotalWidth - container.clientWidth));

      queueMicrotask(() => {
        if (container) {
          container.scrollLeft = newScrollLeft;
        }
      });
      return newZoom;
    });

  };


  return (
    <div className="vacationPage">

      <div
        className="year-timeline"
        ref={containerRef}
        onWheel={handleWheel}
      >
        <div
          className="timeline-content"
          style={{
            width: `${totalDays * cellWidth}px`
          }}
        >
          {monthGrid()}

          {dateSettings.vacations.map((v, i) => {
            const startDate = new Date(v.start);
            const endDate = new Date(v.end);
            const startIndex = getDayOfYear(startDate) - 1;
            const endIndex = getDayOfYear(endDate) - 1;
            const left = startIndex * cellWidth;
            const width = (endIndex - startIndex + 1) * cellWidth;
            const color = getColorForName(v.name);
            return (
              <div
                key={i}
                className="timelime-vacation"
                style={{
                  left,
                  width,
                  top: i * 26 + 50,
                  background: color
                }}
                title={`${v.name}: ${formatDate(v.start)} - ${formatDate(v.end)}`}
              >
                <span>{v.name}</span>
              </div>
            )
          })}

          {todayPos >= 0 && (
            <div
              className="today-line"
              style={{ left: todayPos }}
              title="Сегодня"
            />
          )}
        </div>
      </div>
    </div >
  )
}
export default VacationPage