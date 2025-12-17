import { useState, useCallback, useMemo } from "react"

/**
 * Password validation requirements matching backend:
 * - At least 8 characters
 * - Must contain at least one letter
 * - Must contain at least one number
 */

export interface PasswordStrength {
  score: number
  message: string
  color: "error" | "warning" | "success"
}

export interface PasswordValidationState {
  isValid: boolean
  errors: string[]
  strength: PasswordStrength
}

export interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
}

/**
 * Password requirements matching backend validation
 */
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "letters",
    label: "Contains letters",
    test: (password: string) => /[a-zA-Z]/.test(password),
  },
  {
    id: "numbers",
    label: "Contains numbers",
    test: (password: string) => /[0-9]/.test(password),
  },
]

/**
 * Calculate password strength based on requirements and additional complexity
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return { score: 0, message: "", color: "error" }
  }

  let score = 0
  const failedRequirements: string[] = []

  // Base requirements (each worth 25 points)
  if (password.length >= 8) {
    score += 25
  } else {
    failedRequirements.push("at least 8 characters")
  }

  if (/[a-zA-Z]/.test(password)) {
    score += 25
  } else {
    failedRequirements.push("letters")
  }

  if (/[0-9]/.test(password)) {
    score += 25
  } else {
    failedRequirements.push("numbers")
  }

  // Bonus points for additional complexity
  if (password.length >= 12) score += 10
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) score += 15

  // Determine message and color
  let message = ""
  let color: "error" | "warning" | "success"

  if (score < 50) {
    message =
      failedRequirements.length > 0
        ? `Password must contain ${failedRequirements.join(", ")}`
        : "Password is too weak"
    color = "error"
  } else if (score < 75) {
    message = "Password strength: Good"
    color = "warning"
  } else {
    message = "Password strength: Strong"
    color = "success"
  }

  return { score: Math.min(score, 100), message, color }
}

/**
 * Validate password against all requirements
 * Returns array of error messages for failed requirements
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return errors
}

/**
 * Hook for password validation with real-time feedback
 *
 * @example
 * ```tsx
 * const { validation, checkRequirements, validateField } = usePasswordValidation()
 *
 * // In onChange handler
 * const handlePasswordChange = (password: string) => {
 *   setPassword(password)
 *   validateField(password)
 * }
 *
 * // Render requirements checklist
 * {checkRequirements(password).map(req => (
 *   <ChecklistItem key={req.id} passed={req.passed} label={req.label} />
 * ))}
 * ```
 */
export function usePasswordValidation() {
  const [validation, setValidation] = useState<PasswordValidationState>({
    isValid: false,
    errors: [],
    strength: { score: 0, message: "", color: "error" },
  })

  /**
   * Validate password and update state
   */
  const validateField = useCallback((password: string) => {
    const errors = validatePassword(password)
    const strength = calculatePasswordStrength(password)

    setValidation({
      isValid: errors.length === 0 && password.length > 0,
      errors,
      strength,
    })

    return errors.length === 0 && password.length > 0
  }, [])

  /**
   * Check each requirement and return status for rendering
   * Returns undefined for passed when password is empty (not yet started)
   */
  const checkRequirements = useCallback(
    (
      password: string
    ): (PasswordRequirement & { passed: boolean | undefined })[] => {
      if (password.length === 0) {
        return PASSWORD_REQUIREMENTS.map(req => ({
          ...req,
          passed: undefined,
        }))
      }

      return PASSWORD_REQUIREMENTS.map(req => ({
        ...req,
        passed: req.test(password),
      }))
    },
    []
  )

  /**
   * Validate password confirmation matches
   */
  const validateConfirmation = useCallback(
    (password: string, confirmation: string): string | null => {
      if (confirmation && password !== confirmation) {
        return "Passwords do not match"
      }
      return null
    },
    []
  )

  /**
   * First error message (for single error display)
   */
  const firstError = useMemo(() => {
    return validation.errors.length > 0 ? validation.errors[0] : null
  }, [validation.errors])

  return {
    validation,
    validateField,
    checkRequirements,
    validateConfirmation,
    firstError,
  }
}
