import { BorderBottomOutlined } from "@ant-design/icons";
import type { ThemeConfig } from "antd";

export const cclogThemeColors = {
  primary: "#F59E0B",
  green: "#238636",
  red: "#DA3633",
  cyan: "#38BDF8",
  purple: "#8B5CF6",
  bg: "#0D1117",
  secondary: "#161B22",
  border: "#30363D",
  text: "#E6EDF3",
  textSecondary: "#8B949E",
};

const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: cclogThemeColors.primary,
    colorSuccess: cclogThemeColors.green,
    colorError: cclogThemeColors.red,
    colorInfo: cclogThemeColors.cyan,
    colorWarning: cclogThemeColors.primary,

    colorTextBase: cclogThemeColors.text,
    colorText: cclogThemeColors.text,
    colorTextSecondary: cclogThemeColors.textSecondary,

    colorBgBase: cclogThemeColors.bg,
    colorBgContainer: cclogThemeColors.secondary,

    colorBorder: cclogThemeColors.border,
    colorBorderSecondary: cclogThemeColors.border,

    colorBgElevated: cclogThemeColors.secondary,

    fontFamily: "Poppins, sans-serif",

    borderRadius: 8,

    colorFillQuaternary: "rgba(255, 255, 255, 0.04)",
    colorFillTertiary: "rgba(255, 255, 255, 0.06)",
    colorFillSecondary: "rgba(255, 255, 255, 0.08)",
  },

  components: {
    Button: {
      colorPrimaryHover: "#D97706",
    },

    Input: {
      colorBgContainer: cclogThemeColors.secondary,
      activeBorderColor: cclogThemeColors.primary,
      hoverBorderColor: cclogThemeColors.primary,
    },

    Card: {
      colorBgContainer: cclogThemeColors.secondary,
      headerBg: cclogThemeColors.secondary,
    },

    Modal: {
      colorBgElevated: cclogThemeColors.secondary,
    },

    Alert: {
      colorErrorBg: "rgba(218, 54, 51, 0.15)",
      colorErrorBorder: "rgba(218, 54, 51, 0.45)",

      colorWarningBg: "rgba(245, 158, 11, 0.14)",
      colorWarningBorder: "rgba(245, 158, 11, 0.4)",

      colorInfoBg: "rgba(56, 189, 248, 0.12)",
      colorInfoBorder: "rgba(56, 189, 248, 0.4)",

      colorSuccessBg: "rgba(35, 134, 54, 0.14)",
      colorSuccessBorder: "rgba(35, 134, 54, 0.45)",
    },

    Divider: {
      colorSplit: cclogThemeColors.border,
    },

    Switch: {
      colorPrimary: cclogThemeColors.green,
    },

    Select: {
      optionSelectedBg: cclogThemeColors.primary,
      optionSelectedColor: cclogThemeColors.bg,
      colorBgElevated: cclogThemeColors.secondary,
    },

    DatePicker: {
      cellActiveWithRangeBg: cclogThemeColors.bg,
      colorBgElevated: cclogThemeColors.secondary,
    },

    Table: {
      colorBgContainer: cclogThemeColors.secondary,
    },

    Empty: {
      colorText: cclogThemeColors.textSecondary,
    },

    
    Menu: {
      darkItemBg: '#0B1F33',
      darkItemHoverBg: '#243B53',
      darkItemSelectedBg: '#102A43',
      darkItemColor: '#FFFFFF',
      darkItemHoverColor: '#FFFFFF',
      darkItemSelectedColor: '#FFFFFF',
      darkSubMenuItemBg: '#0B1F33',
    },
    
  },
};

export default antdTheme;
