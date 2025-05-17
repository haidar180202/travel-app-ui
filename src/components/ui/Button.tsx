import type { ButtonHTMLAttributes } from "react";

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button = ({ className, variant = "primary", ...props }: Props) => {
  const base = "rounded px-4 py-2 font-semibold transition";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return <button className={cn(base, variants[variant], className)} {...props} />;
};
