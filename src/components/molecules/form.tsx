"use client"
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function Form({ children, onSubmit, ...restProps }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(e);
  }

  return (
    <form onSubmit={handleSubmit} {...restProps}>
      {children}
    </form>
  )
}
