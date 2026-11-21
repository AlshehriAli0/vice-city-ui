import {
  OTPInput as OTPInputRoot,
  OTPInputGroup as OTPInputGroupRoot,
  OTPInputSeparator as OTPInputSeparatorRoot,
  OTPInputSlot as OTPInputSlotRoot,
} from "@ui-sdk/react/otp-input"
import { styled } from "./cx"
import "./ui.css"
import "./otp-input.css"

const OTPInput = styled(OTPInputRoot, "vc-otp")
const OTPInputGroup = styled(OTPInputGroupRoot, "vc-otp__group")
const OTPInputSlot = styled(OTPInputSlotRoot, "vc-otp__slot")
const OTPInputSeparator = styled(OTPInputSeparatorRoot, "vc-otp__sep")

export { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot }
