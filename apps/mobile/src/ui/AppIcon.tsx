import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export type IconLibrary =
  | "AntDesign"
  | "Entypo"
  | "Feather"
  | "FontAwesome"
  | "FontAwesome5"
  | "FontAwesome6"
  | "Ionicons"
  | "MaterialCommunityIcons";

interface AppIconProps {
  library: IconLibrary;
  name: string;
  color: string;
  size?: number;
}

const iconLibraries = {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
};

export function AppIcon({ library, name, color, size = 24 }: AppIconProps) {
  const IconComponent = iconLibraries[library];

  return <IconComponent name={name as never} size={size} color={color} />;
}
