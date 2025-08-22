import { defaultSwerve } from "@/types/defaults"

export function roll(result: number) {
  return {
    ...defaultSwerve,
    result: result,
  }
}
