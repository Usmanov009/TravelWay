"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { IconPlaceholder } from "@/admin/dashboard/icon-placeholder"
import type { Booking } from "@/types"

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

export const schema = z.object({
  id: z.number(),
  bookingId: z.string(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

type AdminTableRow = z.infer<typeof schema>

const columnHelper = createColumnHelper<typeof features, AdminTableRow>()

const BOOKING_STATUSES = [
  "Jarayonda",
  "Tasdiqlangan",
  "Vaucher tayyor",
  "Bekor qilingan",
]

function isDoneStatus(status: string) {
  return status === "Tasdiqlangan" || status === "Vaucher tayyor"
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <IconPlaceholder lucide="GripVerticalIcon" className="size-3 text-muted-foreground" />
      <span className="sr-only">Tartibni o‘zgartirish</span>
    </Button>
  )
}

const createColumns = ({
  onCancelBooking,
  onStatusChange,
}: {
  onCancelBooking?: (bookingId: string) => void
  onStatusChange?: (bookingId: string, status: string) => void
}) =>
  columnHelper.columns([
    columnHelper.display({
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    }),
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected()
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Barchasini tanlash"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Qatorni tanlash"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("header", {
      header: "Buyurtma",
      cell: ({ row }) => (
        <TableCellViewer item={row.original} onStatusChange={onStatusChange} />
      ),
      enableHiding: false,
    }),
    columnHelper.accessor("type", {
      header: "Turi",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.type}
          </Badge>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Holat",
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {isDoneStatus(row.original.status) ? (
            <IconPlaceholder
              lucide="CircleCheckIcon"
              className="fill-green-500 dark:fill-green-400"
            />
          ) : (
            <IconPlaceholder lucide="LoaderIcon" />
          )}
          {row.original.status}
        </Badge>
      ),
    }),
    columnHelper.accessor("target", {
      header: () => <div className="w-full text-right">Narx</div>,
      cell: ({ row }) => (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `${row.original.header} saqlanmoqda`,
              success: "Saqlandi",
              error: "Xatolik",
            })
          }}
        >
          <Label htmlFor={`${row.original.id}-target`} className="sr-only">
            Narx
          </Label>
          <Input
            className="h-8 w-20 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
            defaultValue={row.original.target}
            id={`${row.original.id}-target`}
          />
        </form>
      ),
    }),
    columnHelper.accessor("limit", {
      header: () => <div className="w-full text-right">Mehmon</div>,
      cell: ({ row }) => (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `${row.original.header} saqlanmoqda`,
              success: "Saqlandi",
              error: "Xatolik",
            })
          }}
        >
          <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
            Mehmonlar soni
          </Label>
          <Input
            className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
            defaultValue={row.original.limit}
            id={`${row.original.id}-limit`}
          />
        </form>
      ),
    }),
    columnHelper.accessor("reviewer", {
      header: "Mijoz",
      cell: ({ row }) => {
        return row.original.reviewer
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-open:bg-muted"
                size="icon"
              />
            }
          >
            <IconPlaceholder lucide="EllipsisVerticalIcon" />
            <span className="sr-only">Menyuni ochish</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Taxrirlash</DropdownMenuItem>
            <DropdownMenuItem>Nusxa olish</DropdownMenuItem>
            <DropdownMenuItem>Sevimlilarga</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onCancelBooking?.(row.original.bookingId)}
            >
              Bekor qilish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ])

function DraggableRow({ row }: { row: Row<typeof features, AdminTableRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}
export function DataTable({
  data: initialData,
  onCancelBooking,
  onUpdateBookingStatus,
}: {
  data: AdminTableRow[]
  onCancelBooking?: (bookingId: string) => void
  onUpdateBookingStatus?: (bookingId: string, status: string) => void
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Bookings are loaded asynchronously from the API, so keep rows in sync.
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const columns = React.useMemo(
    () =>
      createColumns({
        onCancelBooking,
        onStatusChange: onUpdateBookingStatus,
      }),
    [onCancelBooking, onUpdateBookingStatus]
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )
  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((current) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(current, oldIndex, newIndex)
      })
    }
  }

  const cancelledCount = data.filter(
    (row) => row.status === "Bekor qilingan"
  ).length
  const reviewersCount = new Set(data.map((row) => row.reviewer)).size

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          Ko‘rinish
        </Label>
        <Select
          defaultValue="outline"
          items={[
            { label: "Jadval", value: "outline" },
            { label: "O‘tgan davr", value: "past-performance" },
            { label: "Mas’ul xodimlar", value: "key-personnel" },
            { label: "Hujjatlar", value: "focus-documents" },
          ]}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Ko‘rinishni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="outline">Jadval</SelectItem>
              <SelectItem value="past-performance">O‘tgan davr</SelectItem>
              <SelectItem value="key-personnel">Mas’ul xodimlar</SelectItem>
              <SelectItem value="focus-documents">Hujjatlar</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Jadval</TabsTrigger>
          <TabsTrigger value="past-performance">
            O‘tgan davr <Badge variant="secondary">{cancelledCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Mas’ul xodimlar <Badge variant="secondary">{reviewersCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Hujjatlar</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <IconPlaceholder lucide="Columns3Icon" data-icon="inline-start" />
              Ustunlar
              <IconPlaceholder lucide="ChevronDownIcon" data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlaceholder lucide="PlusIcon" />
            <span className="hidden lg:inline">Bo‘lim qo‘shish</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Natija topilmadi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} /{" "}
            {table.getFilteredRowModel().rows.length} qator tanlandi.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Qatorlar soni
              </Label>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
                items={[10, 20, 30, 40, 50].map((pageSize) => ({
                  label: `${pageSize}`,
                  value: `${pageSize}`,
                }))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Sahifa {table.state.pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Birinchi sahifa</span>
                <IconPlaceholder lucide="ChevronsLeftIcon" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Oldingi sahifa</span>
                <IconPlaceholder lucide="ChevronLeftIcon" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Keyingi sahifa</span>
                <IconPlaceholder lucide="ChevronRightIcon" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Oxirgi sahifa</span>
                <IconPlaceholder lucide="ChevronsRightIcon" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "Yanvar", desktop: 186, mobile: 80 },
  { month: "Fevral", desktop: 305, mobile: 200 },
  { month: "Mart", desktop: 237, mobile: 120 },
  { month: "Aprel", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Iyun", desktop: 214, mobile: 140 },
]

const drawerChartConfig = {
  desktop: {
    label: "Bronlar",
    color: "var(--primary)",
  },
  mobile: {
    label: "Yo‘lovchilar",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({
  item,
  onStatusChange,
}: {
  item: AdminTableRow
  onStatusChange?: (bookingId: string, status: string) => void
}) {
  const isMobile = useIsMobile()
  const [status, setStatus] = React.useState(item.status)

  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
          />
        }
      >
        {item.header}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            Oxirgi 6 oy uchun jami bron ma’lumotlari
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={drawerChartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ left: 0, right: 10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Bu oy 5.2% o‘sish{" "}
                  <IconPlaceholder lucide="TrendingUpIcon" className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Bu bron bo‘yicha umumiy dinamika. Batafsil ma’lumotlar
                  buyurtmalar bo‘limida saqlanadi.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              onStatusChange?.(item.bookingId, status)
              toast.success(`${item.header} holati yangilandi`)
            }}
          >
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Buyurtma</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Turi</Label>
                <Select
                  defaultValue={item.type}
                  items={[
                    { label: "Turpaket", value: "Turpaket" },
                    { label: "Combo tur", value: "Combo tur" },
                    { label: "Aviachipta", value: "Aviachipta" },
                    { label: "Mehmonxona", value: "Mehmonxona" },
                  ]}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Turni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Turpaket">Turpaket</SelectItem>
                      <SelectItem value="Combo tur">Combo tur</SelectItem>
                      <SelectItem value="Aviachipta">Aviachipta</SelectItem>
                      <SelectItem value="Mehmonxona">Mehmonxona</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Holat</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value !== null) setStatus(value)
                  }}
                  items={BOOKING_STATUSES.map((value) => ({
                    label: value,
                    value,
                  }))}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Holatni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {BOOKING_STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Narx</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Mehmonlar</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">Mijoz</Label>
              <Input id="reviewer" defaultValue={item.reviewer} readOnly />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button
            type="button"
            onClick={() => {
              onStatusChange?.(item.bookingId, status)
              toast.success(`${item.header} holati yangilandi`)
            }}
          >
            Saqlash
          </Button>
          <DrawerClose render={<Button variant="outline" />}>
            Yopish
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
