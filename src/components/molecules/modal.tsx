import {
  ReactNode,
  HTMLProps,
} from "react";

interface ModalProps extends HTMLProps<HTMLDivElement> {
  isOpen: boolean;
  classname: string
  children: ReactNode;
}

export default function Modal({isOpen, className, children}: ModalProps) {
    if(!isOpen) return;
    return (
        <div className="w-full h-screen bg-black/40 fixed inset-0 flex justify-center items-center">
            <div className={className}>
                {children}
            </div>
        </div>
    )
}