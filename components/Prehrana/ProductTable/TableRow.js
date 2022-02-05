const TableRow = ({ children, active }) => {
  return (
    <tr className={`border-b ${active && "bg-primary/10"}`}>{children}</tr>
  );
};

export default TableRow;
