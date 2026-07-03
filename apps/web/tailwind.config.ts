import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        raised: "var(--color-surface-raised)",
        elevated: "var(--color-elevated)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          pressed: "var(--color-primary-pressed)",
          strong: "var(--color-primary-strong)",
          soft: "var(--color-primary-soft)"
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          soft: "var(--color-accent-soft)"
        },
        field: {
          DEFAULT: "var(--color-field)",
          soft: "var(--color-field-soft)"
        },
        marker: {
          DEFAULT: "var(--color-marker)",
          soft: "var(--color-marker-soft)"
        },
        success: {
          DEFAULT: "var(--color-success)",
          soft: "var(--color-success-soft)"
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-soft)"
        },
        error: {
          DEFAULT: "var(--color-error)",
          soft: "var(--color-error-soft)"
        },
        info: {
          DEFAULT: "var(--color-info)",
          soft: "var(--color-info-soft)"
        }
      },
      boxShadow: {
        glow: "0 18px 48px rgba(8, 145, 143, 0.16)",
        line: "var(--shadow-sm)",
        panel: "var(--shadow-md)"
      },
      fontFamily: {
        sans: ["var(--font-family-base)"]
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        sheet: "var(--bottom-sheet-radius)"
      },
      minHeight: {
        touch: "var(--touch-target-min)",
        nav: "var(--nav-height)"
      },
      fontSize: {
        caption: ["var(--font-size-caption)", "16px"],
        score: ["var(--font-size-score)", "36px"]
      }
    }
  },
  plugins: []
} satisfies Config;
