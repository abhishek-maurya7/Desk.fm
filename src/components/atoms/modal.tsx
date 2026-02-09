"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  ReactNode,
  HTMLProps,
} from "react";

interface ModalProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;
  open: boolean; // Track modal visibility
  onClose: () => void; // Close handler
  classname: string
}

interface ModalRef {
  open: () => void;
  close: () => void;
}

export default function Modal({isOpen, className, children}) {
    if(!isOpen) return;
    return (
        <div className="w-full h-screen bg-black/40 fixed inset-0 flex justify-center items-center">
            <div className={className}>
                {children}
            </div>
        </div>
    )
}