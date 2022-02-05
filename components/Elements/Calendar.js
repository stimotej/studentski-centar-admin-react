import { useState, useRef, useEffect } from "react";
import { MdExpandMore, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { compareDates, monthNamesHrv } from "../../lib/dates";

const Calendar = ({ selectedDayProp, onDateSelected, activeDays }) => {
  const dayNames = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
  const years = [...Array(200).keys()].map((i) => 2008 + i);

  const tableRef = useRef(null);
  const selectedYearRef = useRef(null);

  const [year, setYear] = useState(selectedDayProp?.getFullYear());
  const [month, setMonth] = useState(selectedDayProp?.getMonth());

  const [selectYear, setSelectYear] = useState(false);

  const [selectedDate, setSelectedDate] = useState(selectedDayProp);

  const today = new Date();

  const getFirstDayOfMonth = () => {
    return new Date(year, month, 1).getDay();
  };

  const handleSelectDate = (date) => {
    setSelectedDate(new Date(year, month, date));
    onDateSelected &&
      onDateSelected(
        new Date(year, month, date + 1).toISOString().split("T")[0]
      );
  };

  const handleMonthBack = () => {
    if (month + 1 <= 1) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const handleMonthForward = () => {
    if (month + 1 >= 12) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const handleSelectYear = (selectedYear) => {
    setYear(selectedYear);
    setSelectYear(false);
  };

  useEffect(() => {
    selectedYearRef.current &&
      selectedYearRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [selectYear]);

  const monthTableBody = () => {
    let dates = [];
    let row = [];
    let date = new Date();
    let firstDayOfMonth = getFirstDayOfMonth();

    let props = {
      today: false,
      selected: false,
      active: false,
      otherMonth: false,
    };

    [...Array(42).keys()].forEach((i) => {
      date = new Date(year, month, i + 1 - firstDayOfMonth + 1);

      props = {
        today: compareDates(date, today),
        selected: compareDates(date, selectedDate),
        active:
          activeDays &&
          activeDays.filter((day) => compareDates(new Date(day), date)).length
            ? true
            : false,
        otherMonth: date.getMonth() !== month,
      };

      row.push(
        <td className="text-center align-middle" key={date.getTime()}>
          <button
            className={`relative text-sm w-full h-full p-2 rounded-lg ${
              props.selected
                ? "text-white"
                : props.otherMonth
                ? "text-black/50"
                : "text-black"
            } ${
              props.selected
                ? "bg-primary"
                : props.today
                ? "bg-secondary"
                : "bg-transparent hover:bg-secondary/50"
            }`}
            onClick={() => handleSelectDate(i + 1 - firstDayOfMonth + 1)}
          >
            {date.getDate()}
            {props.active && (
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border ${
                  props.selected ? "border-white" : "border-black"
                }`}
              />
            )}
          </button>
        </td>
      );

      if ((i + 1) % 7 === 0) {
        dates.push(<tr key={date.getTime()}>{row}</tr>);
        row = [];
      }
    }, this);

    return dates;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          className="flex items-center bg-transparent cursor-pointer p-2 rounded-lg hover:bg-secondary"
          onClick={() => setSelectYear(!selectYear)}
        >
          <div>
            {monthNamesHrv[month]}, {year}.
          </div>
          <MdExpandMore
            className={`transform transition-transform ${
              selectYear && "rotate-180"
            }`}
          />
        </button>
        {!selectYear && (
          <div className="flex">
            <div
              className="bg-transparent cursor-pointer p-2 rounded-full hover:bg-secondary mr-2"
              onClick={handleMonthBack}
            >
              <MdNavigateBefore />
            </div>
            <button
              className="bg-transparent cursor-pointer p-2 rounded-full hover:bg-secondary"
              onClick={handleMonthForward}
            >
              <MdNavigateNext />
            </button>
          </div>
        )}
      </div>
      <div ref={tableRef}>
        {selectYear ? (
          <div
            className="flex justify-center flex-wrap w-full overflow-y-auto"
            style={{ maxHeight: tableRef.current.offsetHeight + "px" }}
          >
            {years.map((yearItem) => (
              <div className="p-3" key={yearItem}>
                <button
                  className={`py-2 px-4 rounded-lg hover:bg-secondary/50 ${
                    yearItem === year && "bg-secondary"
                  }`}
                  ref={yearItem === year ? selectedYearRef : null}
                  selected={yearItem === year}
                  onClick={() => handleSelectYear(yearItem)}
                >
                  {yearItem}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <table className="table-fixed w-full mt-2">
            <thead>
              <tr>
                {dayNames.map((dayName) => (
                  <th
                    className="p-2 text-xs font-semibold text-black/50 uppercase whitespace-nowrap"
                    key={dayName}
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{monthTableBody()}</tbody>
          </table>
        )}
      </div>
    </>
  );
};

// const DateButton = styled.button<{
//   today: boolean;
//   selected: boolean;
//   active: boolean;
//   otherMonth: boolean;
// }>`
//   font-size: 0.875rem;
//   font-weight: 400;
//   position: relative;
//   width: 100%;
//   height: 100%;
//   padding: 10px;
//   border: none;
//   cursor: pointer;
//   border-radius: 10px;
//   color: ${({ theme, selected, otherMonth }) =>
//     selected ? theme.accentText : otherMonth ? theme.textLight : theme.text};
//   background-color: ${({ theme, selected, today }) =>
//     selected ? theme.accent : today ? theme.main : theme.background};

//   &:hover {
//     background-color: ${({ theme, selected }) =>
//       selected ? theme.accent : theme.main};
//   }

//   & div {
//     display: ${({ active }) => (active ? "block" : "none")};
//     border: 2px solid
//       ${({ theme, selected }) => (selected ? theme.accentText : theme.accent)};
//   }
// `;

export default Calendar;
