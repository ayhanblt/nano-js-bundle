import React from 'react';

// Import all SVG icons as React components
import SearchIcon from '../assets/icons/search.svg?react';
import ShoppingCartIcon from '../assets/icons/shopping_cart.svg?react';
import SmartToyIcon from '../assets/icons/smart_toy.svg?react';
import ExpandMoreIcon from '../assets/icons/keyboard_arrow_down.svg?react';
import CloseIcon from '../assets/icons/close.svg?react';
import ForumIcon from '../assets/icons/forum.svg?react';
import SendIcon from '../assets/icons/send.svg?react';
import SecurityIcon from '../assets/icons/security.svg?react';
import ChatBubbleIcon from '../assets/icons/chat_bubble.svg?react';
import CloudOffIcon from '../assets/icons/cloud_off.svg?react';
import RefreshIcon from '../assets/icons/refresh.svg?react';
import StarIcon from '../assets/icons/star.svg?react';
import StarHalfIcon from '../assets/icons/star_half.svg?react';
import VerifiedIcon from '../assets/icons/verified.svg?react';
import OpenInNewIcon from '../assets/icons/open_in_new.svg?react';
import ContentCopyIcon from '../assets/icons/content_copy.svg?react';
import QueryStatsIcon from '../assets/icons/query_stats.svg?react';
import InfoIcon from '../assets/icons/info.svg?react';
import DownloadIcon from '../assets/icons/download.svg?react';
import BoltIcon from '../assets/icons/bolt.svg?react';
import LocationOnIcon from '../assets/icons/location_on.svg?react';
import ArrowForwardIcon from '../assets/icons/arrow_forward.svg?react';
import NearMeIcon from '../assets/icons/near_me.svg?react';
import MicIcon from '../assets/icons/mic.svg?react';
import AutoAwesomeIcon from '../assets/icons/stars.svg?react';
import CheckCircleIcon from '../assets/icons/check_circle.svg?react';
import PsychologyIcon from '../assets/icons/psychology.svg?react';
import RadioButtonCheckedIcon from '../assets/icons/radio_button_checked.svg?react';
import ArrowBackIcon from '../assets/icons/arrow_back.svg?react';
import FavoriteIcon from '../assets/icons/favorite.svg?react';
import ChatIcon from '../assets/icons/chat.svg?react';
import HistoryIcon from '../assets/icons/history.svg?react';
import BookmarkIcon from '../assets/icons/bookmark.svg?react';
import SettingsIcon from '../assets/icons/settings.svg?react';
import PersonIcon from '../assets/icons/person.svg?react';
import AddCircleIcon from '../assets/icons/add_circle.svg?react';

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  search: SearchIcon,
  shopping_cart: ShoppingCartIcon,
  smart_toy: SmartToyIcon,
  expand_more: ExpandMoreIcon,
  close: CloseIcon,
  forum: ForumIcon,
  send: SendIcon,
  security: SecurityIcon,
  chat_bubble: ChatBubbleIcon,
  cloud_off: CloudOffIcon,
  refresh: RefreshIcon,
  star: StarIcon,
  star_half: StarHalfIcon,
  verified: VerifiedIcon,
  open_in_new: OpenInNewIcon,
  content_copy: ContentCopyIcon,
  query_stats: QueryStatsIcon,
  info: InfoIcon,
  download: DownloadIcon,
  bolt: BoltIcon,
  location_on: LocationOnIcon,
  arrow_forward: ArrowForwardIcon,
  near_me: NearMeIcon,
  mic: MicIcon,
  auto_awesome: AutoAwesomeIcon,
  check_circle: CheckCircleIcon,
  psychology: PsychologyIcon,
  radio_button_checked: RadioButtonCheckedIcon,
  arrow_back: ArrowBackIcon,
  favorite: FavoriteIcon,
  chat: ChatIcon,
  history: HistoryIcon,
  bookmark: BookmarkIcon,
  settings: SettingsIcon,
  person: PersonIcon,
  add_circle: AddCircleIcon,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '', ...props }) => {
  const Component = iconMap[name];
  if (!Component) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }
  return <Component className={`inline-block ${className}`} {...props} />;
};

export default Icon;
