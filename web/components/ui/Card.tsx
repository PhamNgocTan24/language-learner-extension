interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 md:p-5 ${className}`}>
      {children}
    </div>
  );
}
