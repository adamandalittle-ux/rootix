import logo from "@/assets/rootix-logo.png";

interface Props {
  size?: number;
  className?: string;
}

export function RootixLogo({ size = 36, className = "" }: Props) {
  return (
    <img
      src={logo}
      alt="ROOTIX"
      width={size}
      height={size}
      className={`object-contain rounded-xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default RootixLogo;
