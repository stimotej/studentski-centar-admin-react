import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import { visuallyHidden } from "@mui/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-solid-svg-icons";
import { useEffect } from "react";
import clsx from "clsx";
import { Collapse } from "@mui/material";
import { LoadingButton } from "@mui/lab";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const {
    headCells,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    enableRowSelect,
    enableSelectAll,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {enableRowSelect ? (
          enableSelectAll ? (
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{
                  "aria-label": "Odaberi sve",
                }}
              />
            </TableCell>
          ) : (
            <TableCell></TableCell>
          )
        ) : null}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sort ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "Sortirano silazno"
                      : "Sortirano uzlazno"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected, tableTitle, titleComponent, selectedAction } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
      className="rounded-t-lg"
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} odabrano
        </Typography>
      ) : titleComponent ? (
        <div className="flex-1">{titleComponent}</div>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {tableTitle}
        </Typography>
      )}

      {numSelected > 0 ? (
        selectedAction && selectedAction(numSelected)
      ) : (
        // <Tooltip title="Filtriraj" arrow>
        //   <IconButton>
        //     <FontAwesomeIcon icon={faBarsFilter} />
        //   </IconButton>
        // </Tooltip>
        <></>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function MyTable({
  headCells,
  rows,
  rowCells,
  defaultOrder,
  defaultOrderBy,
  title,
  titleComponent,
  selectedAction,
  containerClassName,
  onSelectionChange,
  enableRowSelect = true,
  enableSelectAll = true,
  displayToolbar = true,
  rowsPerPage = 10,
  totalNumberOfItems,
  customSort,
  onChangeSort,
  onChangePage,
  noDataText,
  loading,
  error,
  errorMessage,
  onRowClick,
  nowrap = true,
  enableRowExpand = false,
  expandOnRowClick = false,
  expandContent,
}) {
  const [order, setOrder] = React.useState(defaultOrder || "asc");
  const [orderBy, setOrderBy] = React.useState(defaultOrderBy);
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [opened, setOpened] = React.useState(null);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    onChangeSort && onChangeSort(property, isAsc ? "desc" : "asc");
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  useEffect(() => {
    onSelectionChange && onSelectionChange(selected);
  }, [selected]);

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // If "totalNumberOfItems" prop exists, manually handle pagination
  useEffect(() => {
    if ((page + 1) * rowsPerPage > rows?.length && !totalNumberOfItems) {
      setPage(Math.max(0, Math.ceil(rows?.length / rowsPerPage) - 1));
    }
  }, [rows]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    onChangePage && onChangePage(newPage);
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

  const handleRowClick = (row) => {
    expandOnRowClick && toggleOpened(row.id);
    onRowClick && onRowClick(row);
  };

  const toggleOpened = (rowId) => {
    if (opened === rowId) {
      setOpened(null);
      return;
    }

    setOpened(rowId);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = totalNumberOfItems
    ? page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - totalNumberOfItems)
      : 0
    : page > 0
    ? Math.max(0, (1 + page) * rowsPerPage - rows?.length)
    : 0;

  return (
    <Box sx={{ width: "100%" }} className={containerClassName}>
      <Paper
        sx={{ width: "100%", mb: 2 }}
        className={clsx("!rounded-lg !shadow", nowrap && "whitespace-nowrap")}
      >
        {displayToolbar && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            tableTitle={title}
            selectedAction={selectedAction}
            titleComponent={titleComponent}
          />
        )}
        <TableContainer>
          <Table
            // sx={{ minWidth: 200 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              headCells={headCells}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={+totalNumberOfItems || rows?.length}
              enableRowSelect={enableRowSelect}
              enableSelectAll={enableSelectAll}
            />
            <TableBody>
              {loading ? (
                <TableRow
                  style={{
                    height: 53,
                  }}
                >
                  <TableCell
                    colSpan={
                      enableRowSelect ? headCells.length + 1 : headCells.length
                    }
                    className="!text-black-80"
                  >
                    Dohvaćanje podataka...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow
                  style={{
                    height: 53,
                  }}
                >
                  <TableCell
                    colSpan={
                      enableRowSelect ? headCells.length + 1 : headCells.length
                    }
                    className="!text-error"
                  >
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : (totalNumberOfItems || rows?.length) <= 0 && !!noDataText ? (
                <TableRow
                  style={{
                    height: 53,
                  }}
                >
                  <TableCell
                    colSpan={
                      enableRowSelect ? headCells.length + 1 : headCells.length
                    }
                    className="!text-black-80"
                  >
                    {noDataText}
                  </TableCell>
                </TableRow>
              ) : (
                (customSort
                  ? rows
                  : stableSort(rows, getComparator(order, orderBy)).slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                ).map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        hover
                        onClick={
                          enableRowSelect
                            ? (event) => handleClick(event, row.id)
                            : onRowClick || expandOnRowClick
                            ? () => handleRowClick(row)
                            : undefined
                        }
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={index}
                        selected={isItemSelected}
                      >
                        {enableRowSelect && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": labelId,
                              }}
                            />
                          </TableCell>
                        )}

                        {rowCells(row)}
                        {enableRowExpand && (
                          <TableCell>
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => toggleOpened(row.id)}
                            >
                              {opened === row.id ? (
                                <FontAwesomeIcon icon={faChevronUp} />
                              ) : (
                                <FontAwesomeIcon icon={faChevronDown} />
                              )}
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                      {expandContent && (
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={
                              enableRowSelect
                                ? headCells.length + 1
                                : headCells.length
                            }
                          >
                            <Collapse
                              in={opened === row.id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 1 }}>{expandContent(row)}</Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell
                    colSpan={
                      enableRowSelect ? headCells.length + 1 : headCells.length
                    }
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          // rowsPerPageOptions={[5, 10, 25]}
          rowsPerPageOptions={[rowsPerPage]}
          component="div"
          count={+totalNumberOfItems || rows?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          // onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
