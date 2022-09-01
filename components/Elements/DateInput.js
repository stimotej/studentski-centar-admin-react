import { Button } from "@mui/material";
import { useState, useCallback, useEffect } from "react";
import Calendar from "./Calendar";
import dayjs from "dayjs";

const DateInput = ({ value, onChange, markedDays }) => {
  const [active, setActive] = useState(false);

  const calendarRef = useCallback((node) => {
    if (node) {
      if (
        node.scrollWidth > window.innerWidth - 40 &&
        window.innerWidth > 300
      ) {
        node.style.width = window.innerWidth - 40 + "px";
      }
      if (window.innerWidth > 300) {
        let offsetRight =
          window.innerWidth - node.getBoundingClientRect().right;
        console.log(offsetRight);
        let offsetBottom =
          window.innerHeight - node.getBoundingClientRect().bottom;

        if (offsetRight > 0) offsetRight = 0;
        else offsetRight -= 20;

        if (offsetBottom > 0) offsetBottom = 0;
        else offsetBottom -= 20;

        if (offsetRight < 0 || offsetBottom < 0)
          node.style.transform = `translate(${offsetRight}px, ${offsetBottom}px)`;
      }
    }
  }, []);

  return (
    <div className="relative w-fit">
      <Button
        variant="outlined"
        className="!py-1 px-4 !border-black/50 hover:!border-black hover:!bg-black/5 !text-black !text-[16px]"
        onClick={() => setActive(!active)}
      >
        {dayjs(value).format("DD.MM.YYYY")}
      </Button>
      {active && (
        <>
          <div
            className="fixed top-0 left-0 z-40 w-screen h-screen bg-transparent"
            onClick={() => setActive(false)}
          />
          <div
            ref={calendarRef}
            className="absolute left-0 top-full z-50 bg-white p-2 rounded-lg divide-y shadow-lg"
            style={{ width: "300%" }}
          >
            <Calendar
              selectedDayProp={new Date(value)}
              onDateSelected={(value) => {
                onChange(value);
                setActive(false);
              }}
              activeDays={markedDays}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DateInput;
