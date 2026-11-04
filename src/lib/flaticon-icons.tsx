import React from 'react';

type FlaticonIconProps = React.ComponentPropsWithoutRef<'i'> & {
  size?: number | string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
};

const iconNames = {
  AlertCircle: 'exclamation',
  AlertTriangle: 'triangle-warning',
  ArrowDownIcon: 'arrow-down',
  ArrowLeft: 'arrow-left',
  ArrowRight: 'arrow-right',
  ArrowRightLeft: 'arrows-split-right-and-left',
  Baby: 'child',
  BedDouble: 'bed',
  Bell: 'bell',
  Briefcase: 'briefcase',
  BriefcaseBusiness: 'briefcase',
  Building2: 'building',
  Bus: 'bus',
  Calendar: 'calendar',
  CalendarDays: 'calendar-days',
  Check: 'check',
  CheckCircle2: 'check-circle',
  CheckIcon: 'check',
  ChevronDown: 'angle-small-down',
  ChevronDownIcon: 'angle-small-down',
  ChevronLeftIcon: 'angle-small-left',
  ChevronRight: 'angle-small-right',
  ChevronRightIcon: 'angle-small-right',
  ChevronUpIcon: 'angle-small-up',
  CircleCheckIcon: 'check-circle',
  CircleDollarSign: 'dollar',
  ClipboardList: 'clipboard-list',
  Clock: 'clock',
  Clock3: 'clock',
  Compass: 'compass-alt',
  Copy: 'copy',
  CreditCard: 'credit-card',
  Crown: 'crown',
  DollarSign: 'dollar',
  DoorOpen: 'door-open',
  Download: 'download',
  ExternalLink: 'arrow-up-right-from-square',
  Eye: 'eye',
  EyeOff: 'eye-crossed',
  FileText: 'file',
  Flame: 'flame',
  GalleryVerticalEnd: 'gallery',
  Gem: 'gem',
  Gift: 'gift',
  Globe: 'globe',
  Globe2: 'globe',
  Headphones: 'headphones',
  Heart: 'heart',
  HeartHandshake: 'handshake',
  Hotel: 'hotel',
  Info: 'info',
  InfoIcon: 'info',
  KeyRound: 'key',
  Landmark: 'landmark-alt',
  Layers: 'layers',
  LayoutDashboard: 'dashboard',
  Lightbulb: 'lightbulb-on',
  Loader2Icon: 'spinner',
  Lock: 'lock',
  LockKeyhole: 'lock',
  LogOut: 'exit',
  Luggage: 'luggage-rolling',
  Mail: 'envelope',
  Map: 'map',
  MapIcon: 'map',
  MapPin: 'map-marker',
  MapPinned: 'map-marker',
  MessageCircle: 'comment-alt',
  MessageSquare: 'comment-alt',
  MinusIcon: 'minus',
  Moon: 'moon',
  MoreHorizontalIcon: 'menu-dots',
  OctagonXIcon: 'octagon-xmark',
  Package: 'box',
  Palmtree: 'tree',
  PanelLeftIcon: 'sidebar',
  PartyPopper: 'confetti',
  Pencil: 'pencil',
  Percent: 'percentage',
  Phone: 'phone-call',
  Pin: 'map-marker',
  Plane: 'plane',
  PlaneLanding: 'plane-arrival',
  PlaneTakeoff: 'plane-departure',
  Plus: 'add',
  QrCode: 'qrcode',
  Receipt: 'receipt',
  RefreshCw: 'rotate-right',
  RotateCw: 'rotate-right',
  Satellite: 'satellite',
  Search: 'search',
  SearchIcon: 'search',
  Send: 'paper-plane',
  Settings: 'settings',
  Shield: 'shield',
  ShieldCheck: 'badge-check',
  Sliders: 'settings-sliders',
  Smartphone: 'smartphone',
  Sparkles: 'sparkles',
  Star: 'star',
  Sun: 'sun',
  Tag: 'tags',
  Ticket: 'ticket',
  Trash2: 'trash',
  TrendingDown: 'arrow-trend-down',
  TrendingUp: 'arrow-trend-up',
  TriangleAlertIcon: 'triangle-warning',
  User: 'user',
  UserRound: 'user',
  Users: 'users',
  UsersRound: 'users',
  Utensils: 'utensils',
  Waves: 'water',
  X: 'cross',
  XCircle: 'circle-xmark',
  XIcon: 'cross',
  Zap: 'bolt',
  Mountain: 'mountain',
} as const;

const createIcon = (name: keyof typeof iconNames) =>
  React.forwardRef<HTMLElement, FlaticonIconProps>(function FlaticonIcon(
    { size, className, style, strokeWidth: _strokeWidth, absoluteStrokeWidth: _absoluteStrokeWidth, ...props },
    ref
  ) {
    const spacingTokens = [...(className ?? '').matchAll(/(?:^|\s)(?:size|w|h)-(\d+(?:\.\d+)?)(?:\s|$)/g)]
      .map((match) => Number(match[1]))
      .filter(Number.isFinite);
    const iconSize = size ?? (spacingTokens.length ? `${Math.max(...spacingTokens) * 0.25}rem` : undefined);

    return (
      <i
        ref={ref}
        aria-hidden="true"
        className={`fi fi-rr-${iconNames[name]} ${className ?? ''}`}
        style={{ fontSize: iconSize, lineHeight: 1, ...style }}
        {...props}
      />
    );
  });

export const AlertCircle = createIcon('AlertCircle');
export const AlertTriangle = createIcon('AlertTriangle');
export const ArrowDownIcon = createIcon('ArrowDownIcon');
export const ArrowLeft = createIcon('ArrowLeft');
export const ArrowRight = createIcon('ArrowRight');
export const ArrowRightLeft = createIcon('ArrowRightLeft');
export const Baby = createIcon('Baby');
export const BedDouble = createIcon('BedDouble');
export const Bell = createIcon('Bell');
export const Briefcase = createIcon('Briefcase');
export const BriefcaseBusiness = createIcon('BriefcaseBusiness');
export const Building2 = createIcon('Building2');
export const Bus = createIcon('Bus');
export const Calendar = createIcon('Calendar');
export const CalendarDays = createIcon('CalendarDays');
export const Check = createIcon('Check');
export const CheckCircle2 = createIcon('CheckCircle2');
export const CheckIcon = createIcon('CheckIcon');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronDownIcon = createIcon('ChevronDownIcon');
export const ChevronLeftIcon = createIcon('ChevronLeftIcon');
export const ChevronRight = createIcon('ChevronRight');
export const ChevronRightIcon = createIcon('ChevronRightIcon');
export const ChevronUpIcon = createIcon('ChevronUpIcon');
export const CircleCheckIcon = createIcon('CircleCheckIcon');
export const CircleDollarSign = createIcon('CircleDollarSign');
export const ClipboardList = createIcon('ClipboardList');
export const Clock = createIcon('Clock');
export const Clock3 = createIcon('Clock3');
export const Compass = createIcon('Compass');
export const Copy = createIcon('Copy');
export const CreditCard = createIcon('CreditCard');
export const Crown = createIcon('Crown');
export const DollarSign = createIcon('DollarSign');
export const DoorOpen = createIcon('DoorOpen');
export const Download = createIcon('Download');
export const ExternalLink = createIcon('ExternalLink');
export const Eye = createIcon('Eye');
export const EyeOff = createIcon('EyeOff');
export const FileText = createIcon('FileText');
export const Flame = createIcon('Flame');
export const GalleryVerticalEnd = createIcon('GalleryVerticalEnd');
export const Gem = createIcon('Gem');
export const Gift = createIcon('Gift');
export const Globe = createIcon('Globe');
export const Globe2 = createIcon('Globe2');
export const Headphones = createIcon('Headphones');
export const Heart = createIcon('Heart');
export const HeartHandshake = createIcon('HeartHandshake');
export const Hotel = createIcon('Hotel');
export const Info = createIcon('Info');
export const InfoIcon = createIcon('InfoIcon');
export const KeyRound = createIcon('KeyRound');
export const Landmark = createIcon('Landmark');
export const Layers = createIcon('Layers');
export const LayoutDashboard = createIcon('LayoutDashboard');
export const Lightbulb = createIcon('Lightbulb');
export const Loader2Icon = createIcon('Loader2Icon');
export const Lock = createIcon('Lock');
export const LockKeyhole = createIcon('LockKeyhole');
export const LogOut = createIcon('LogOut');
export const Luggage = createIcon('Luggage');
export const Mail = createIcon('Mail');
export const Map = createIcon('Map');
export const MapIcon = createIcon('MapIcon');
export const MapPin = createIcon('MapPin');
export const MapPinned = createIcon('MapPinned');
export const MessageCircle = createIcon('MessageCircle');
export const MessageSquare = createIcon('MessageSquare');
export const MinusIcon = createIcon('MinusIcon');
export const Moon = createIcon('Moon');
export const MoreHorizontalIcon = createIcon('MoreHorizontalIcon');
export const OctagonXIcon = createIcon('OctagonXIcon');
export const Package = createIcon('Package');
export const Palmtree = createIcon('Palmtree');
export const PanelLeftIcon = createIcon('PanelLeftIcon');
export const PartyPopper = createIcon('PartyPopper');
export const Pencil = createIcon('Pencil');
export const Percent = createIcon('Percent');
export const Phone = createIcon('Phone');
export const Pin = createIcon('Pin');
export const Plane = createIcon('Plane');
export const PlaneLanding = createIcon('PlaneLanding');
export const PlaneTakeoff = createIcon('PlaneTakeoff');
export const Plus = createIcon('Plus');
export const QrCode = createIcon('QrCode');
export const Receipt = createIcon('Receipt');
export const RefreshCw = createIcon('RefreshCw');
export const RotateCw = createIcon('RotateCw');
export const Satellite = createIcon('Satellite');
export const Search = createIcon('Search');
export const SearchIcon = createIcon('SearchIcon');
export const Send = createIcon('Send');
export const Settings = createIcon('Settings');
export const Shield = createIcon('Shield');
export const ShieldCheck = createIcon('ShieldCheck');
export const Sliders = createIcon('Sliders');
export const Smartphone = createIcon('Smartphone');
export const Sparkles = createIcon('Sparkles');
export const Star = createIcon('Star');
export const Sun = createIcon('Sun');
export const Tag = createIcon('Tag');
export const Ticket = createIcon('Ticket');
export const Trash2 = createIcon('Trash2');
export const TrendingDown = createIcon('TrendingDown');
export const TrendingUp = createIcon('TrendingUp');
export const TriangleAlertIcon = createIcon('TriangleAlertIcon');
export const User = createIcon('User');
export const UserRound = createIcon('UserRound');
export const Users = createIcon('Users');
export const UsersRound = createIcon('UsersRound');
export const Utensils = createIcon('Utensils');
export const Waves = createIcon('Waves');
export const X = createIcon('X');
export const XCircle = createIcon('XCircle');
export const XIcon = createIcon('XIcon');
export const Zap = createIcon('Zap');
export const Mountain = createIcon('Mountain');
