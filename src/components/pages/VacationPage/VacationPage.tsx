import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import "./VacationPage.sass"
import Note from "../../Note/Note"
import { useAppDispatch, useAppSelector } from "../../../models/Hook"
import { getNotes } from "../../../redux/NotesSlice"
import { Status } from "../../../models/Status"
import IFolder from "../../../models/Folder"
import ContextMenu from "../../ContextMenu/ContextMenu"
import Finder from "../../Finder/Finder"
import ContentDivider from "../../ContentDivider/ContentDivider"
import { getSettings, getVacations, PersonVacation } from "../../../redux/SettingsSlice"
import { formatDateShort, getWorkDayInfo } from "../CalendarPage/CalendarPage"
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input, Label } from "reactstrap"
import { setSelect } from "../../../redux/WidgetsSlice"


export interface VacationPageType {
  year: number
}


function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

const isLeapYear = (y: number) => {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

const getDayOfYear = (date: Date, targetYear: number) => {
  const start = new Date(targetYear, 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const formatDate = (str: string) => {
  const d = new Date(str);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

const weekNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const VacationPage = ({ year }: VacationPageType) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollLeft = useRef<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const minZoom = 0.1;
  const maxZoom = 5;
  const baseCellWidth = 20;
  const ZOOM_SENSITIVITY = 0.004;
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const totalDays = (isLeapYear(year) ? 366 : 365) + (isLeapYear(year + 1) ? 366 : 365);
  const dispatch = useAppDispatch()
  const vacations = useAppSelector(state => state.settings.vacations)
  const dateSettings = useAppSelector(state => state.settings.date)
  const status = useAppSelector(state => state.settings.status)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set(["САСДУ"]));
  const [hoveredVacation, setHoveredVacation] = useState<null | {
    id: number
    x: number
    y: number
    name: string
    start: string
    end: string
    reason?: string
  }>(null);


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
    const dayOfYear = getDayOfYear(today, year);
    container.scrollLeft = dayOfYear * baseCellWidth * zoom - container.clientWidth / 2;

  }, [year])

  const today = new Date();
  const todayPos = today.getFullYear() === year ? getDayOfYear(today, year) * cellWidth : -1;

  const monthGrid = () => {
    const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

    const elems: JSX.Element[] = [];
    let dayIndex = 0;
    for (let m = 0; m < 24; m++) {
      let targetYear: number;
      if (m < 12) {
        targetYear = year;
      } else {
        targetYear = year + 1;
      }
      const daysInMonth = new Date(targetYear, m + 1, 0).getDate();
      elems.push(
        <div
          key={`month-${m}`}
          className="month-cell"
          style={{
            left: `${dayIndex * cellWidth}px`,
            width: `${daysInMonth * cellWidth}px`
          }}
        >
          <span>{months[m % 12]} {targetYear}</span>
          <div className="days-row">
            {zoom > 0.7 && Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(targetYear, m % 12, i + 1);

              return (
                <div
                  key={i}
                  className="day-cell"
                  style={{ width: `${cellWidth}px` }}
                >
                  {weekNames[date.getDay()]}
                </div>
              )
            })}
          </div>
          <div className="days-row">
            {zoom > 0.7 && Array.from({ length: daysInMonth }).map((_, i) => (
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
    "hsla(0, 70%, 40%, 0.7)",    // красный
    "hsla(15, 70%, 40%, 0.7)",   // оранжевый
    "hsla(30, 70%, 40%, 0.7)",   // желто-оранжевый
    "hsla(45, 70%, 40%, 0.7)",   // желтый
    "hsla(60, 70%, 40%, 0.7)",   // желто-зеленый
    "hsla(90, 70%, 40%, 0.7)",   // зеленый
    "hsla(120, 70%, 40%, 0.7)",  // ярко-зеленый
    "hsla(150, 70%, 40%, 0.7)",  // бирюзовый
    "hsla(180, 70%, 40%, 0.7)",  // голубой
    "hsla(210, 70%, 40%, 0.7)",  // синий
    "hsla(240, 70%, 40%, 0.7)",  // темно-синий
    "hsla(270, 70%, 40%, 0.7)",  // фиолетовый
    "hsla(300, 70%, 40%, 0.7)",  // ярко-фиолетовый
    "hsla(330, 70%, 40%, 0.7)",  // розовый
    "hsla(360, 70%, 40%, 0.7)",  // красно-розовый
    // ещё 30 цветов с равномерным распределением оттенков
    "hsla(12, 70%, 40%, 0.7)", "hsla(24, 70%, 40%, 0.7)", "hsla(36, 70%, 40%, 0.7)",
    "hsla(48, 70%, 40%, 0.7)", "hsla(72, 70%, 40%, 0.7)", "hsla(84, 70%, 40%, 0.7)",
    "hsla(96, 70%, 40%, 0.7)", "hsla(108, 70%, 40%, 0.7)", "hsla(132, 70%, 40%, 0.7)",
    "hsla(144, 70%, 40%, 0.7)", "hsla(156, 70%, 40%, 0.7)", "hsla(168, 70%, 40%, 0.7)",
    "hsla(192, 70%, 40%, 0.7)", "hsla(204, 70%, 40%, 0.7)", "hsla(216, 70%, 40%, 0.7)",
    "hsla(228, 70%, 40%, 0.7)", "hsla(252, 70%, 40%, 0.7)", "hsla(264, 70%, 40%, 0.7)",
    "hsla(276, 70%, 40%, 0.7)", "hsla(288, 70%, 40%, 0.7)", "hsla(312, 70%, 40%, 0.7)",
    "hsla(324, 70%, 40%, 0.7)", "hsla(336, 70%, 40%, 0.7)", "hsla(348, 70%, 40%, 0.7)",
    "hsla(6, 70%, 40%, 0.7)", "hsla(18, 70%, 40%, 0.7)", "hsla(42, 70%, 40%, 0.7)",
    "hsla(78, 70%, 40%, 0.7)", "hsla(114, 70%, 40%, 0.7)", "hsla(150, 70%, 40%, 0.7)",
    "hsla(186, 70%, 40%, 0.7)", "hsla(222, 70%, 40%, 0.7)", "hsla(258, 70%, 40%, 0.7)",
    "hsla(294, 70%, 40%, 0.7)", "hsla(330, 70%, 40%, 0.7)"
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
      dispatch(getVacations())
    }
  }, [status, dispatch])




  const onWheelNative = useCallback((rawEvent: Event) => {
    const e = rawEvent as WheelEvent;
    e.preventDefault();

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const prevScrollLeft = container.scrollLeft;
    const prevScale = zoom;

    const delta = e.deltaY;
    const factor = Math.exp(-delta * ZOOM_SENSITIVITY);
    const newScale = clamp(prevScale * factor, minZoom, maxZoom);

    if (Math.abs(newScale - prevScale) < 1e-6) {
      return prevScale;
    }

    const scaledPointerBefore = prevScrollLeft + cursorX;
    const newScrollLeft = scaledPointerBefore * (newScale / prevScale) - cursorX;
    pendingScrollLeft.current = newScrollLeft;
    setZoom(newScale);
    // requestAnimationFrame(() => {
    //   container.scrollLeft = newScrollLeft;
    // });
  }, [zoom]);

  const throttleWheel = throttle(onWheelNative, 20);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    if (pendingScrollLeft.current !== null) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const safeScroll = clamp(pendingScrollLeft.current, 0, maxScroll);
      container.scrollLeft = safeScroll;
      pendingScrollLeft.current = null;
    }
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("wheel", throttleWheel as EventListener, { passive: false });
    return () => {
      el.removeEventListener("wheel", throttleWheel as EventListener);
    }
  }, [throttleWheel])

  const groupedByService: Record<string, PersonVacation[]> = vacations.reduce(
    (acc, person) => {
      if (!acc[person.service]) {
        acc[person.service] = [];
      }
      acc[person.service].push(person);
      return acc;
    },
    {} as Record<string, PersonVacation[]>
  );

  const people = Object.entries(groupedByService).map(([service, people]) => ({
    service,
    people
  })).filter(x => selectedServices.has(x.service));
  console.log(people)

  const selectToggleHandler = (id: number) => {

    let newSelected;
    if (selected.find(x => x === id)) {
      const index = selected.indexOf(id);
      newSelected = [...selected.slice(0, index), ...selected.slice(index + 1)];
    } else {
      newSelected = [...selected];
      newSelected.push(id);
    }

    setSelected(newSelected);
  }


  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const mouseDownHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return;
    }
    isDragging.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
    containerRef.current!.style.cursor = "grabbing";

    window.addEventListener("mousemove", mouseMoveWindowHandler);
    window.addEventListener("mouseup", mouseUpWindowHandler);
  }
  const mouseMoveWindowHandler = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) {
      return;
    }
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1;
    containerRef.current.scrollLeft = scrollLeft.current - walk;

  }
  const mouseUpWindowHandler = (e: MouseEvent) => {
    if (!isDragging.current) {
      return;
    }
    isDragging.current = false;
    const container = containerRef.current;
    if (container) {
      container.style.cursor = "grab";
    }
    window.removeEventListener("mousemove", mouseMoveWindowHandler);
    window.removeEventListener("mouseup", mouseUpWindowHandler);
  }
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);



  const checkboxChangeHandler = (service: string) => {
    setSelected([]);
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(service)) {
        newSet.delete(service);
      } else {
        newSet.add(service);
      }
      return newSet;
    });
  }
  let peopleIndex = -1;
  let gridIndex = -1;


  return (
    <div className="vacationPage">
      <div
        style={{
          width: 180,
          flex: "0 0 180px",
          position: "sticky",
          left: 0,
          top: 0,
          zIndex: 5,
        }}
      >
        <div
          style={{
            height: "60px", //123
            // borderBottom: "1px solid green",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}
        >
          <Dropdown
            isOpen={dropdownOpen} toggle={toggle} direction="down"
          >
            <DropdownToggle caret>Settings</DropdownToggle>
            <DropdownMenu
            // {...args}
            >
              <div style={{ display: "flex", flexDirection: "column", padding: "10px 20px" }}>
                {Array.from(new Set(vacations.map(v => v.service))).map(service =>
                  <FormGroup
                    key={service}
                    check
                    inline
                  >
                    <Input type="checkbox" checked={selectedServices.has(service)} onChange={() => checkboxChangeHandler(service)} />
                    <Label check>
                      {service}
                    </Label>
                  </FormGroup>
                )}
              </div>
            </DropdownMenu>
          </Dropdown>
        </div>
        {people.map((service, i) => (
          <div key={i} style={{ marginBottom: "15px" }}>
            <div style={{ marginTop: "0px" }}>{service.service}</div>
            {
              service.people.map((p, pIdx) =>
                <div
                  key={p.id}
                  style={{
                    height: "26px",
                    lineHeight: "28px",
                    borderBottom: "1px solid #444",
                    paddingLeft: "8px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: `${selected.find(x => x === p.id) ? "#ffffff30" : ""}`,
                    cursor: "pointer",
                    // borderRadius: `${selected.find(x => x === p) ? "6px" : ""}`,
                  }}
                  onClick={() => selectToggleHandler(p.id)}
                >
                  {p.name}
                </div>
              )
            }
          </div>

        ))}

      </div>
      <div
        className="year-timeline"
        ref={containerRef}
      >
        <div
          className="timeline-content"
          style={{
            width: `${totalDays * cellWidth}px`
          }}
          onMouseDown={mouseDownHandler}
        >
          {monthGrid()}
          <div
            style={{
              position: "absolute",
              top: 24 + 59,
              left: 0,
              width: "100%",
              height: `calc(100% - 100px)`,
              pointerEvents: "none"
            }}
          >
            {Array.from({ length: totalDays }).map((_, i) => {
              const date = new Date(year, 0, 1);
              date.setDate(i + 1);
              const inMonthStart = date.getDate() === 1;
              // const dayOfWeek = (new Date(year, 1, 1).getDay() + i - 1) % 7;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const dayInfo = getWorkDayInfo(date, dateSettings);


              const classNames = [
                isWeekend && "weekend-vacation",
                dayInfo.type + "-vacation"
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={`v-${i}`}
                  className={classNames}
                  style={{
                    position: "absolute",
                    left: `${i * cellWidth}px`,
                    top: 0,
                    bottom: 0,
                    width: `${cellWidth}px`,
                    borderLeft: `1px solid ${inMonthStart ? "#444" : "#222"}`,
                  }}
                />
              )
            })}
            {people.map((service, sIdx) => {

              return service.people.map((_, idx) => {
                gridIndex++;
                return <div
                  key={`h-${idx}`}
                  style={{
                    position: "absolute",
                    top: `${sIdx * 39 + (gridIndex + 1) * 26}px`,
                    left: 0,
                    width: "100%",
                    borderTop: "1px solid #222"
                  }}
                />
              })
            })
            }

          </div>
          {
            people.map((service, sIdx) => {
              return service.people.map((p, pIdx) => {
                peopleIndex++;
                return p.vacations.map((v, i) => {
                  const startDate = new Date(v.start);
                  const endDate = new Date(startDate);

                  endDate.setDate(endDate.getDate() + v.length - 1);

                  const startIndex = getDayOfYear(startDate, year) - 1;
                  const endIndex = getDayOfYear(endDate, year) - 1;
                  const left = startIndex * cellWidth + 3;
                  const width = (endIndex - startIndex + 1) * cellWidth - 6;
                  const color = getColorForName(p.name);
                  return (
                    <div
                      key={i}
                      className="timelime-vacation"
                      style={{
                        left,
                        width,
                        top: 24 + (sIdx) * 39 + peopleIndex * 26 + 62,
                        background: color,
                        // boxShadow: `${!selected.find(x => x === v.name) ? "0px 0px 0px 0px transparent" : `0px 0px 2px 1px ${color}`}`,
                        opacity: `${selected.find(x => x === p.id) || selected.length === 0 ? "1" : "0.1"}`,
                        cursor: "default"
                      }}
                      // title={`${v.name}: ${formatDate(v.start)} - ${formatDate(v.end)}`}
                      onMouseMove={(e) => {
                        if (selected.find(p => p === p) || selected.length === 0) {
                          setHoveredVacation({
                            id: Math.random(),
                            x: e.clientX,
                            y: e.clientY,
                            name: p.name,
                            start: String(startDate),
                            end: String(endDate),
                            reason: "",
                          });
                        }
                      }}
                      onMouseLeave={(e) => {
                        setHoveredVacation(null);
                      }}
                    >
                      {p.name.length * 2 < width ? <span style={{ overflow: "hidden" }}>{p.name}</span> : <></>}
                    </div>
                  )
                });

              })


            })
          }

          {todayPos >= 0 && (
            <div
              className="today-line"
              style={{ left: todayPos }}
            // title="Сегодня"
            />
          )}
        </div>
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

      {/* <button style={{ width: "500px", height: "200px", position: "absolute", top: "120%", left: "50%" }}
        onClick={(e) => { alert("Проверяй") }}
      >ПОЛУЧИТЬ БАБЛО от Кирилла!</button> */}
      {/* <div style={{ position: "absolute", top: "130%", left: "5%", fontSize: "60px" }}>СЕЙЧАС: {new Date().getHours()}:{new Date().getMinutes()}:{new Date().getSeconds()}</div> */}
    </div >
  )
}
export default VacationPage