import { Modal } from "@react95/core";
import { createElement, type ComponentType, type ReactNode, type Ref } from "react";

// react95's Modal is typed as a (props, ref) function, which React 19's JSX
// types reject. Re-type it once here with its real props instead of `any`.
type ModalProps = Parameters<typeof Modal>[0] & { children?: ReactNode; ref?: Ref<HTMLDivElement> };
const RawModal = Modal as unknown as ComponentType<ModalProps>;

/**
 * neodrag (react95's window dragging) swallows "the click that ends a drag"
 * with a one-time listener on the page. A mouse release always produces
 * that click, but a finger drag never does, so the trap would eat the
 * visitor's next tap anywhere. If no real click shows up, fire a harmless one
 * to spring it.
 */
function releaseClickTrap() {
  let clicked = false;
  const seen = () => {
    clicked = true;
  };
  window.addEventListener("click", seen, { capture: true, once: true });
  setTimeout(() => {
    window.removeEventListener("click", seen, { capture: true });
    if (!clicked) document.documentElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, 60);
}

function DraggableModal(props: ModalProps) {
  const { dragOptions } = props;
  return createElement(RawModal, {
    ...props,
    dragOptions: {
      ...dragOptions,
      onDragEnd: (data: Parameters<NonNullable<NonNullable<ModalProps["dragOptions"]>["onDragEnd"]>>[0]) => {
        releaseClickTrap();
        dragOptions?.onDragEnd?.(data);
      },
    },
  });
}

export const Win95Modal = Object.assign(DraggableModal, {
  Content: Modal.Content,
  Minimize: Modal.Minimize,
});
