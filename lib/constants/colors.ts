export const colors = {
  // Primary colors
  primary: {
    50: "hsl(221.2, 83.2%, 95.3%)",
    100: "hsl(221.2, 83.2%, 90.3%)",
    200: "hsl(221.2, 83.2%, 80.3%)",
    300: "hsl(221.2, 83.2%, 70.3%)",
    400: "hsl(221.2, 83.2%, 60.3%)",
    500: "hsl(221.2, 83.2%, 53.3%)",
    600: "hsl(221.2, 83.2%, 46.3%)",
    700: "hsl(221.2, 83.2%, 36.3%)",
    800: "hsl(221.2, 83.2%, 26.3%)",
    900: "hsl(221.2, 83.2%, 16.3%)",
    950: "hsl(221.2, 83.2%, 11.3%)",
  },

  // Status colors
  status: {
    todo: {
      light: "hsl(210, 100%, 95%)",
      main: "hsl(210, 100%, 50%)",
      dark: "hsl(210, 100%, 30%)",
      text: "hsl(210, 100%, 20%)",
    },
    inProgress: {
      light: "hsl(40, 100%, 95%)",
      main: "hsl(40, 100%, 50%)",
      dark: "hsl(40, 100%, 30%)",
      text: "hsl(40, 100%, 20%)",
    },
    completed: {
      light: "hsl(120, 100%, 95%)",
      main: "hsl(120, 70%, 45%)",
      dark: "hsl(120, 70%, 30%)",
      text: "hsl(120, 70%, 20%)",
    },
  },

  // Priority colors
  priority: {
    low: {
      light: "hsl(0, 0%, 95%)",
      main: "hsl(0, 0%, 60%)",
      dark: "hsl(0, 0%, 40%)",
      text: "hsl(0, 0%, 30%)",
    },
    medium: {
      light: "hsl(30, 100%, 95%)",
      main: "hsl(30, 100%, 50%)",
      dark: "hsl(30, 100%, 35%)",
      text: "hsl(30, 100%, 25%)",
    },
    high: {
      light: "hsl(0, 100%, 95%)",
      main: "hsl(0, 100%, 60%)",
      dark: "hsl(0, 100%, 45%)",
      text: "hsl(0, 100%, 35%)",
    },
  },

  // Semantic colors
  semantic: {
    success: {
      light: "hsl(142, 76%, 95%)",
      main: "hsl(142, 76%, 36%)",
      dark: "hsl(142, 76%, 26%)",
    },
    warning: {
      light: "hsl(38, 92%, 95%)",
      main: "hsl(38, 92%, 50%)",
      dark: "hsl(38, 92%, 40%)",
    },
    error: {
      light: "hsl(0, 84%, 95%)",
      main: "hsl(0, 84%, 60%)",
      dark: "hsl(0, 84%, 50%)",
    },
    info: {
      light: "hsl(210, 100%, 95%)",
      main: "hsl(210, 100%, 50%)",
      dark: "hsl(210, 100%, 40%)",
    },
  },

  // Neutral colors
  neutral: {
    50: "hsl(0, 0%, 98%)",
    100: "hsl(0, 0%, 96%)",
    200: "hsl(0, 0%, 90%)",
    300: "hsl(0, 0%, 80%)",
    400: "hsl(0, 0%, 70%)",
    500: "hsl(0, 0%, 60%)",
    600: "hsl(0, 0%, 50%)",
    700: "hsl(0, 0%, 40%)",
    800: "hsl(0, 0%, 30%)",
    900: "hsl(0, 0%, 20%)",
    950: "hsl(0, 0%, 10%)",
  },
}

// Status color mapping
export const statusColorMap = {
  TODO: colors.status.todo,
  IN_PROGRESS: colors.status.inProgress,
  COMPLETED: colors.status.completed,
}

// Priority color mapping
export const priorityColorMap = {
  LOW: colors.priority.low,
  MEDIUM: colors.priority.medium,
  HIGH: colors.priority.high,
}
