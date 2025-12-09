import {
  Button as MuiButton,
  ButtonProps as MuiButtonProperties,
} from "@mui/material"

/**
 * Styled wrapper around Material-UI Button component.
 *
 * Provides a consistent button interface throughout the application while
 * allowing all standard MUI Button props to pass through.
 *
 * @param properties - All standard MUI ButtonProps
 * @returns A styled MUI Button component
 *
 * @example
 * ```tsx
 * <Button variant="contained" color="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * <Button variant="outlined" startIcon={<AddIcon />}>
 *   Add Character
 * </Button>
 * ```
 */
export function Button(properties: MuiButtonProperties) {
  return <MuiButton {...properties} />
}
