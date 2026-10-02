import { Modal } from "@react95/core";
import type { ComponentType, ReactNode } from "react";

// react95's Modal is typed as a (props, ref) function, which React 19's JSX
// types reject. Re-type it once here with its real props instead of `any`.
type ModalProps = Parameters<typeof Modal>[0] & { children?: ReactNode };

export const Win95Modal = Object.assign(Modal as unknown as ComponentType<ModalProps>, {
  Content: Modal.Content,
  Minimize: Modal.Minimize,
});
