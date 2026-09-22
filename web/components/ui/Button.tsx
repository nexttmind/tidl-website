import styles from "./Button.module.css";

type ButtonStyle = "Primary" | "Secondary" | "Tertiary" | "Ghost";

type ButtonProps = {
  children: React.ReactNode;
  styleVariant?: ButtonStyle;
  type?: "button" | "submit";
  href?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  tabIndex?: number;
};

export function Button({
  children,
  styleVariant = "Primary",
  type = "button",
  href,
  className,
  disabled,
  onClick,
  tabIndex,
}: ButtonProps) {
  const classNames = [
    styles.root,
    styles[styleVariant.toLowerCase()],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
    return (
      <a className={classNames} href={href} tabIndex={tabIndex}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={classNames}
      type={type}
      disabled={disabled}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {children}
    </button>
  );
}
