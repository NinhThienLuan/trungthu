import {
  AlarmClock, Award, BadgeCheck, Ban, Banknote, BarChart3, Bell, BellRing, Bike, BookOpen, Briefcase, Brush, Building,
  Building2, Cake, Calculator, Calendar, CalendarCheck, Camera, CarFront, ChefHat, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, ChevronsUpDown, Circle, ClipboardCheck, ClipboardList, Clock, Clock3, CloudCog,
  CloudDownload, CloudUpload, Coffee, CookingPot, Crown, Download, Eye, Factory, FileCheck, FileDown, FileQuestion,
  FileBadge, FileText, FileUp, Flame, Gavel, Gem, Gift, Grid2x2, Headset, HeartPulse, Hourglass, IdCard, ImageOff, Info, KeyRound,
  Landmark, LayoutDashboard, Leaf, ListPlus, ListTodo, Loader2, Lock, LockOpen, Mail, MailCheck, MapPin, Medal,
  Microscope, Minus, Navigation, Network, NotebookPen, Package, Palette, Pen, Percent, PieChart, Plane, PlaneTakeoff,
  Phone, Plus, PlusCircle, Printer, Receipt, ReceiptText, RefreshCw, RotateCcw, Rows3, Save, Scale, ScrollText, Search,
  SearchX, Send, Shield, ShieldCheck, ShoppingBag, ShoppingCart, Siren, SlidersHorizontal, Snowflake, Soup, Sparkles,
  Star, StarHalf, Store, Sunrise, Table2, Tag, Thermometer, Timer, TrendingDown, TrendingUp, TriangleAlert,
  Truck, User, UserCheck, UtensilsCrossed, Wallet, Wine, X, XCircle, Zap, type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/format'

/**
 * Bản thiết kế Stitch dùng Material Symbols; SRS yêu cầu chỉ dùng lucide-react.
 * Bảng này đổi tên icon Material -> icon lucide tương đương.
 */
const MAP: Record<string, LucideIcon> = {
  ac_unit: Snowflake, account_balance: Landmark, account_balance_wallet: Wallet, add: Plus, add_a_photo: Camera,
  add_circle: PlusCircle, add_shopping_cart: ShoppingCart, add_task: ListPlus, alarm: AlarmClock, analytics: BarChart3,
  approval: BadgeCheck, apps: Grid2x2, arrow_drop_down: ChevronDown, arrow_forward: ChevronRight,
  assignment: ClipboardList, assignment_turned_in: ClipboardCheck, auto_awesome: Sparkles, auto_mode: RefreshCw,
  badge: IdCard, bakery_dining: Cake, biotech: Microscope, block: Ban, bolt: Zap, broken_image: ImageOff, brush: Brush,
  business_center: Briefcase, calculate: Calculator, call: Phone, cancel: XCircle, car_tag: CarFront,
  card_giftcard: Gift, check: Check, check_circle: CheckCircle2, chevron_left: ChevronLeft, chevron_right: ChevronRight,
  close: X, cloud_download: CloudDownload, cloud_sync: CloudCog, cloud_upload: CloudUpload, cooking: ChefHat,
  corporate_fare: Building2, crown: Crown, dashboard: LayoutDashboard, description: FileText,
  device_thermostat: Thermometer, diamond: Gem, domain: Building, done: Check, download: Download,
  download_for_offline: Download, draw: Pen, eco: Leaf, edit_note: NotebookPen, emergency_home: Siren, event: Calendar,
  event_available: CalendarCheck, expand_more: ChevronDown, fact_check: ClipboardCheck, file_download: FileDown,
  flight: Plane, gavel: Gavel, license: FileBadge, flight_takeoff: PlaneTakeoff, grid_view: Grid2x2, health_and_safety: HeartPulse,
  history_edu: ScrollText, history_toggle_off: Clock3, hourglass_top: Hourglass, hub: Network, info: Info,
  inventory_2: Package, key: KeyRound, label: Tag, liquor: Wine, local_cafe: Coffee,
  local_fire_department: Flame, local_police: Shield, local_shipping: Truck, location_on: MapPin, lock: Lock,
  lock_open: LockOpen, mail: Mail, mark_email_read: MailCheck, menu_book: BookOpen, military_tech: Medal,
  navigation: Navigation, nest_clock_farsight_analog: Clock, notification_important: BellRing, notifications: Bell,
  outdoor_grill: Flame, oven_gen: CookingPot, palette: Palette, payments: Banknote, pending: Clock3,
  pending_actions: ListTodo, percent: Percent, person: User, picture_as_pdf: FileText, pie_chart: PieChart,
  policy: FileCheck, precision_manufacturing: Factory, print: Printer, print_connect: Printer,
  progress_activity: Loader2, qr_code_2: Grid2x2, radio_button_unchecked: Circle, ramen_dining: Soup,
  receipt: Receipt, receipt_long: ReceiptText, remove: Minus, report_problem: TriangleAlert,
  request_quote: FileQuestion, restart_alt: RotateCcw, rule: Scale, save: Save, schedule: Clock,
  schedule_send: Send, search: Search, search_off: SearchX, security: ShieldCheck, send: Send,
  send_time_extension: Send, sensors: Network, severe_cold: Snowflake, shield: Shield, shopping_bag: ShoppingBag,
  shopping_cart: ShoppingCart, soup_kitchen: UtensilsCrossed, star: Star, star_border: Star, star_half: StarHalf,
  stars: Sparkles, store: Store, storefront: Store, support_agent: Headset, sync: RefreshCw, table_view: Table2,
  task_alt: CheckCircle2, thermostat: Thermometer, timer_10: Timer, token: Gem, trending_down: TrendingDown,
  trending_up: TrendingUp, tune: SlidersHorizontal, two_wheeler: Bike, unfold_more: ChevronsUpDown,
  upload_file: FileUp, verified: BadgeCheck, verified_user: UserCheck, view_agenda: Rows3, visibility: Eye,
  warning: TriangleAlert, wb_twilight: Sunrise, wine_bar: Wine, workspace_premium: Award,
}

interface Props {
  name: string
  className?: string
  /** Material "FILL 1" -> tô đặc (dùng cho sao đánh giá) */
  filled?: boolean
  'aria-hidden'?: boolean
}

/**
 * Giống Material Symbols: mặc định 24px; class cỡ chữ (text-[18px]...) đổi kích thước icon.
 * Kích thước khai báo ở .icon trong style.css (layer components) nên utility luôn ghi đè được.
 */
export function Icon({ name, className, filled, ...rest }: Props) {
  const Cmp = MAP[name] ?? Circle
  return (
    <Cmp
      className={cn('icon', className)}
      fill={filled ? 'currentColor' : 'none'}
      strokeWidth={1.75}
      {...rest}
    />
  )
}
