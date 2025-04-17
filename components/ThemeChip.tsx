import {
  HeartIcon as HeartIconSolid,
  SunIcon,
  GiftIcon,
  HandRaisedIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ScaleIcon,
  SparklesIcon,
  CheckIcon,
  ArrowDownIcon,
  LockClosedIcon,
  UserGroupIcon,
  UsersIcon,
  StarIcon,
  ArrowPathIcon,
  ClockIcon,
  BookOpenIcon,
  PlusIcon as CrossIcon,
  ChatBubbleLeftRightIcon as DoveIcon,
  HandRaisedIcon as HeartshakeIcon,
} from "@heroicons/react/24/solid";

type ThemeConfig = {
  bg: string;
  text: string;
  icon: React.ElementType;
};

const themeColors: { [key: string]: ThemeConfig } = {
  faith: { bg: "bg-blue-600/20", text: "text-blue-400", icon: CrossIcon },
  love: { bg: "bg-pink-600/20", text: "text-pink-400", icon: HeartIconSolid },
  hope: { bg: "bg-green-600/20", text: "text-green-400", icon: SunIcon },
  grace: { bg: "bg-purple-600/20", text: "text-purple-400", icon: GiftIcon },
  mercy: { bg: "bg-pink-600/20", text: "text-pink-400", icon: HandRaisedIcon },
  peace: { bg: "bg-green-600/20", text: "text-green-400", icon: DoveIcon },
  wisdom: {
    bg: "bg-indigo-600/20",
    text: "text-indigo-400",
    icon: LightBulbIcon,
  },
  truth: { bg: "bg-teal-600/20", text: "text-teal-400", icon: CheckCircleIcon },
  salvation: {
    bg: "bg-orange-600/20",
    text: "text-orange-400",
    icon: ShieldCheckIcon,
  },
  righteousness: {
    bg: "bg-amber-600/20",
    text: "text-amber-400",
    icon: ScaleIcon,
  },
  joy: { bg: "bg-yellow-600/20", text: "text-yellow-400", icon: SparklesIcon },
  forgiveness: {
    bg: "bg-pink-600/20",
    text: "text-pink-400",
    icon: HeartshakeIcon,
  },
  obedience: { bg: "bg-blue-600/20", text: "text-blue-400", icon: CheckIcon },
  humility: {
    bg: "bg-indigo-600/20",
    text: "text-indigo-400",
    icon: ArrowDownIcon,
  },
  trust: { bg: "bg-teal-600/20", text: "text-teal-400", icon: LockClosedIcon },
  prayer: { bg: "bg-purple-600/20", text: "text-purple-400", icon: DoveIcon },
  service: { bg: "bg-green-600/20", text: "text-green-400", icon: UsersIcon },
  holiness: { bg: "bg-amber-600/20", text: "text-amber-400", icon: StarIcon },
  redemption: {
    bg: "bg-orange-600/20",
    text: "text-orange-400",
    icon: ArrowPathIcon,
  },
  eternity: { bg: "bg-cyan-600/20", text: "text-cyan-400", icon: ClockIcon },
  teaching: {
    bg: "bg-violet-600/20",
    text: "text-violet-400",
    icon: BookOpenIcon,
  },
  accountability: {
    bg: "bg-rose-600/20",
    text: "text-rose-400",
    icon: UserGroupIcon,
  },
  default: { bg: "bg-gray-600/20", text: "text-gray-400", icon: StarIcon },
};

export function ThemeChip({ theme }: { theme: string }) {
  const themeKey = (theme || "").toLowerCase();
  const themeConfig = themeColors[themeKey] || themeColors.default;
  const Icon = themeConfig.icon;

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-gray-200 flex items-center gap-1 hover:scale-105 transition font-['Poppins']`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {theme || "Theme"}
    </span>
  );
}
