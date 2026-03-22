export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-step motion-reduce:animate-none min-h-[40vh]">{children}</div>
  );
}
