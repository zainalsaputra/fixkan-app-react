import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { fetchUsers } from 'src/utils/user-services';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';


// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();

  const [users, setUsers] = useState<UserProps[]>([]);
  const [filterName, setFilterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const TTL = 180 * 1000;

  useEffect(() => {

    const getUsers = async () => {
      try {
        setIsLoading(true);

        const cachedUsers = localStorage.getItem('users');
        const cachedTime = localStorage.getItem('users_timestamp');
        const now = Date.now();
        const isExpired = !cachedTime || now - Number(cachedTime) > TTL;

        if (cachedUsers && !isExpired) {
          setUsers(JSON.parse(cachedUsers));
          return;
        }

        const data = await fetchUsers();
        setUsers(data);
        localStorage.setItem('users', JSON.stringify(data));
        localStorage.setItem('users_timestamp', now.toString());
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      localStorage.setItem('users', JSON.stringify(data));
      localStorage.setItem('users_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to refresh users:', error);
    } finally {
      setIsLoading(false);
    }
  };  

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearProgress
          sx={{
            width: 1,
            maxWidth: 320,
            bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
            [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
          }}
        />
      </Box>
    )
  }

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">Users</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
            startIcon={<Iconify icon="solar:restart-bold" />}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New user
          </Button>
        </Box>
      </Box>


      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                onSort={table.onSort}
                rowCount={users.length}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'province', label: 'Province' },
                  { id: 'district', label: 'District' },
                  { id: 'subdistrict', label: 'Subdistrict' },
                  { id: 'village', label: 'Village' },
                  { id: '' }, // kolom kosong buat tombol aksi (misal edit/delete)
                ]}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    users.map((user) => user.id)
                  )
                }
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
